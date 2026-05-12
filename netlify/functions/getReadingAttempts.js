// netlify/functions/getReadingAttempts.js

const { getStore, connectLambda } = require("@netlify/blobs");

function normalizeSetParam(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "mini") return "mini1";
  if (v === "full" || v === "mini1" || v === "mini2" || v === "benchmark") return v;
  return "";
}

function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function getRawOwnerEmail(data) {
  return normalizeEmail(
    data.ownerEmail ||
      data.teacherEmail ||
      data.owner ||
      (data.sessionInfo && data.sessionInfo.ownerEmail) ||
      (data.sessionInfo && data.sessionInfo.teacherEmail) ||
      (data.sessionInfo && data.sessionInfo.owner) ||
      ""
  );
}

function getRawSharedEmails(data) {
  const shared = Array.isArray(data.sharedWithEmails)
    ? data.sharedWithEmails
    : Array.isArray(data.sharedWith)
    ? data.sharedWith
    : Array.isArray(data.sessionInfo && data.sessionInfo.sharedWithEmails)
    ? data.sessionInfo.sharedWithEmails
    : Array.isArray(data.sessionInfo && data.sessionInfo.sharedWith)
    ? data.sessionInfo.sharedWith
    : [];

  return shared.map((email) => normalizeEmail(email)).filter(Boolean);
}

function attemptMatchesScope(attempt, rawViewerEmail, rawOwnerEmail) {
  const viewerEmail = normalizeEmail(rawViewerEmail);
  const ownerEmailParam = normalizeEmail(rawOwnerEmail);

  const attemptOwner = normalizeEmail(attempt.ownerEmail);
  const sharedWith = Array.isArray(attempt.sharedWithEmails)
    ? attempt.sharedWithEmails.map((email) => normalizeEmail(email)).filter(Boolean)
    : [];

  if (viewerEmail) {
    if (!attemptOwner && !sharedWith.length) return false;
    return attemptOwner === viewerEmail || sharedWith.includes(viewerEmail);
  }

  if (ownerEmailParam) {
    return attemptOwner === ownerEmailParam;
  }

  return true;
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;

  async function run() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) break;
      results[idx] = await worker(items[idx], idx);
    }
  }

  const runners = Array.from({ length: Math.min(limit, items.length) }, run);
  await Promise.all(runners);
  return results;
}

function normalizeAttempt({ key, data, rawSession }) {
  const questionResultsLen = Array.isArray(data.questionResults)
    ? data.questionResults.length
    : Array.isArray(data.questions)
    ? data.questions.length
    : 0;

  const answeredCountRaw =
    data.answeredCount != null ? Number(data.answeredCount) : questionResultsLen;

  const answeredCount = Number.isFinite(answeredCountRaw)
    ? Math.max(0, answeredCountRaw)
    : 0;

  const totalQuestionsRaw =
    data.totalQuestions != null
      ? Number(data.totalQuestions)
      : data.numQuestions != null
      ? Number(data.numQuestions)
      : 0;

  let totalQuestions = Number.isFinite(totalQuestionsRaw)
    ? Math.max(0, totalQuestionsRaw)
    : 0;

  if (!totalQuestions && questionResultsLen) {
    totalQuestions = questionResultsLen;
  }

  const numCorrect = Number(data.numCorrect ?? 0);
  const numIncorrect = Math.max(0, answeredCount - numCorrect);

  const accuracy =
    answeredCount > 0 ? Math.round((numCorrect / answeredCount) * 100) : 0;

  const isComplete =
    totalQuestions > 0 && answeredCount >= totalQuestions;

  const sessionCode =
    data.sessionCode ||
    rawSession ||
    (data.sessionInfo && data.sessionInfo.sessionCode) ||
    "";

  const studentName =
    data.studentName ||
    (data.student && data.student.name) ||
    "";

  const studentId =
    data.studentId ||
    (data.student && data.student.id) ||
    (data.sessionInfo && data.sessionInfo.studentId) ||
    (data.sessionInfo && data.sessionInfo.studentKey) ||
    "";

  const startedAt =
    data.startedAt ||
    (data.sessionInfo && data.sessionInfo.startedAt) ||
    null;

  const finishedAt =
    data.finishedAt ||
    data.storedAt ||
    data.lastSavedAt ||
    (data.sessionInfo && data.sessionInfo.finishedAt) ||
    null;

  const assessmentName =
    data.assessmentName ||
    (data.sessionInfo && data.sessionInfo.assessmentName) ||
    "";

  const rawPracticeSet =
    data.practiceSet ||
    data.set ||
    data.setType ||
    (data.sessionInfo &&
      (data.sessionInfo.practiceSet ||
        data.sessionInfo.set ||
        data.sessionInfo.setType)) ||
    "full";

  const rawPracticeLevel =
    data.practiceLevel ||
    data.level ||
    data.levelBand ||
    (data.sessionInfo &&
      (data.sessionInfo.practiceLevel ||
        data.sessionInfo.level ||
        data.sessionInfo.levelBand)) ||
    "on";

  const practiceSet = normalizeSetParam(rawPracticeSet) || "full";
  const practiceLevel = String(rawPracticeLevel || "on").toLowerCase();

  const assessmentType =
    data.assessmentType ||
    (data.sessionInfo && data.sessionInfo.assessmentType) ||
    (practiceSet === "benchmark" || practiceLevel === "benchmark" ? "benchmark" : "");

  const ownerEmail = getRawOwnerEmail(data);
  const sharedWithEmails = getRawSharedEmails(data);

  const bySkill = data.bySkill || data.perSkill || {};
  const byType = data.byType || data.perType || {};

  return {
    key,

    // This must be the real blob key so getReadingAttemptDetail.js can load details.
    attemptId: key,
    storedAttemptId:
      data.storedAttemptId ||
      data.attemptId ||
      key.split("/").pop()?.replace(/\.json$/i, "") ||
      "",

    studentId,
    studentName,
    sessionCode,

    assessmentName,
    assessmentType,
    benchmarkKey: data.benchmarkKey || data.benchmark || "",
    benchmarkId: data.benchmarkId || data.assessmentId || "",

    ownerEmail,
    sharedWithEmails,

    practiceSet,
    practiceLevel,
    set: practiceSet,
    level: practiceLevel,

    numCorrect,
    numIncorrect,
    answeredCount,
    totalQuestions,
    accuracy,
    isComplete,

    bySkill,
    byType,

    // Do not include full questionResults here.
    // The detail endpoint loads those only when a teacher opens an attempt.
    questionResultsCount: questionResultsLen,

    startedAt,
    finishedAt,
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    connectLambda(event);
    const store = getStore("reading-attempts");

    const params = event.queryStringParameters || {};

    const rawSession = (params.sessionCode || "").trim();

    const rawOwnerEmail = (
      params.ownerEmail ||
      params.teacherEmail ||
      params.owner ||
      ""
    ).trim();

    const rawViewerEmail = (params.viewerEmail || "").trim();

    const rawSet = (params.set || "").trim().toLowerCase();
    const rawLevel = (params.level || "").trim().toLowerCase();

    const setParam = normalizeSetParam(rawSet);

    // Keep each response small. The dashboard will request additional pages.
    const limitRaw = Number(params.limit || 100);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(Math.floor(limitRaw), 1), 250)
      : 100;

    // Cross-session history/search is loaded as one summary response.
    // Full question details are not included here, so this avoids the old response-size cap.

    let nextCursor = null;
    let entries = [];

    if (rawSession) {
      const safeSession = sanitizeFragment(rawSession);

      // Session-specific loads stay scoped to the selected session.
      const list = await store.list({
        prefix: `session/${safeSession}/`,
      });

      entries = list.blobs || list || [];
    } else {
      // Cross-session dashboard history/search:
      // Use the same broad listing behavior as the prior working version.
      // The response-size cap is protected because we no longer return full questionResults.
      const list = await store.list();

      entries = (list.blobs || list || []).filter((item) => {
        return item && item.key && item.key.startsWith("session/");
      });

      // We intentionally do not paginate here because the prior working version
      // depended on getting the full available session history in one summary response.
      nextCursor = null;
    }

    const CONCURRENCY = 10;

    const loaded = await mapWithConcurrency(entries, CONCURRENCY, async (item) => {
      if (!item || !item.key || !item.key.endsWith(".json")) return null;

      // Ignore any accidental non-session blobs.
      if (!item.key.startsWith("session/")) return null;

      const data = await store.get(item.key, { type: "json" });
      if (!data) return null;

      return {
        key: item.key,
        data,
      };
    });

    let attempts = loaded
      .filter(Boolean)
      .map((row) =>
        normalizeAttempt({
          key: row.key,
          data: row.data,
          rawSession,
        })
      );

    // Scope after normalization.
    if (rawViewerEmail || rawOwnerEmail) {
      attempts = attempts.filter((attempt) =>
        attemptMatchesScope(attempt, rawViewerEmail, rawOwnerEmail)
      );
    }

    if (setParam) {
      attempts = attempts.filter(
        (attempt) => normalizeSetParam(attempt.practiceSet) === setParam
      );
    }

    if (rawLevel) {
      attempts = attempts.filter(
        (attempt) =>
          String(attempt.practiceLevel || "").toLowerCase() === rawLevel
      );
    }

    attempts.sort((a, b) => {
      const aTime = (a.finishedAt || a.startedAt || "").toString();
      const bTime = (b.finishedAt || b.startedAt || "").toString();
      return bTime.localeCompare(aTime);
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        attempts,
        nextCursor,
      }),
    };
  } catch (err) {
    console.error("[getReadingAttempts] Fatal error:", err);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};