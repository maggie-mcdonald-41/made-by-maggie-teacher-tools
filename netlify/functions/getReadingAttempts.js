// netlify/functions/getReadingAttempts.js

const { getStore, connectLambda } = require("@netlify/blobs");

function normalizeSetParam(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "mini") return "mini1"; // legacy support
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
      (data.sessionInfo && data.sessionInfo.ownerEmail) ||
      (data.sessionInfo && data.sessionInfo.teacherEmail) ||
      ""
  );
}

function getRawSharedEmails(data) {
  const shared = Array.isArray(data.sharedWithEmails)
    ? data.sharedWithEmails
    : Array.isArray(data.sessionInfo && data.sessionInfo.sharedWithEmails)
    ? data.sessionInfo.sharedWithEmails
    : [];

  return shared.map((email) => normalizeEmail(email)).filter(Boolean);
}

function rawAttemptMatchesScope(data, rawViewerEmail, rawOwnerEmail) {
  const viewerEmail = normalizeEmail(rawViewerEmail);
  const ownerEmailParam = normalizeEmail(rawOwnerEmail);

  const attemptOwner = getRawOwnerEmail(data);
  const sharedWith = getRawSharedEmails(data);

  if (viewerEmail) {
    if (!attemptOwner && sharedWith.length === 0) return false;
    return attemptOwner === viewerEmail || sharedWith.includes(viewerEmail);
  }

  if (ownerEmailParam) {
    return attemptOwner === ownerEmailParam;
  }

  return true;
}

// ✅ NEW: small concurrency helper to speed up loading blobs
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

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    connectLambda(event);
    const store = getStore("reading-attempts");

    const params = event.queryStringParameters || {};

    const rawSession = (params.sessionCode || "").trim();

    const rawOwnerEmail = (params.ownerEmail || params.teacherEmail || params.owner || "").trim();
    const rawViewerEmail = (params.viewerEmail || "").trim();

    const rawSet = (params.set || "").trim().toLowerCase();
    const rawLevel = (params.level || "").trim().toLowerCase();

    const setParam = normalizeSetParam(rawSet);

    // Keep summary responses small enough for Netlify.
    // The dashboard can request multiple pages when it needs a full history/search cache.
    const limitRaw = Number(params.limit || 100);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(Math.floor(limitRaw), 1), 250)
      : 100;

    const cursor = (params.cursor || "").trim() || undefined;

    let attemptsRaw = [];
    let nextCursor = null;

    // --- Load attempts (session-scoped if provided) ---
    if (rawSession) {
      const safeSession = sanitizeFragment(rawSession);
      const list = await store.list({ prefix: `session/${safeSession}/` });
      const entries = list.blobs || list || [];

      // ✅ Load JSON concurrently (faster)
      const CONCURRENCY = 10;
      const loaded = await mapWithConcurrency(entries, CONCURRENCY, async (item) => {
        if (!item || !item.key || !item.key.endsWith(".json")) return null;
        const data = await store.get(item.key, { type: "json" });
        return data ? { key: item.key, data } : null;
      });

      for (const row of loaded) {
        if (row) attemptsRaw.push(row);
      }
    } else if (rawViewerEmail || rawOwnerEmail) {
      // Dashboard history/search view:
      // Use the lightweight per-teacher index created by logReadingAttempt.js.
      // This avoids scanning the entire attempt store and keeps history/search reliable.
      const indexEmail = String(rawViewerEmail || rawOwnerEmail || "")
        .trim()
        .toLowerCase();

      const safeEmail = sanitizeFragment(indexEmail);
      const indexPrefix = `index/by-viewer/${safeEmail}/`;

      const listOptions = {
        prefix: indexPrefix,
        paginate: true,
        limit,
      };

      if (cursor) {
        listOptions.cursor = cursor;
      }

      const list = await store.list(listOptions);
      const entries = list.blobs || [];
      nextCursor = list.cursor || null;

      const CONCURRENCY = 10;
      const loaded = await mapWithConcurrency(entries, CONCURRENCY, async (item) => {
        if (!item || !item.key || !item.key.endsWith(".json")) return null;

        const data = await store.get(item.key, { type: "json" });
        if (!data) return null;

        return { key: item.key, data };
      });

      for (const row of loaded) {
        if (row) attemptsRaw.push(row);
      }
    } else {
      // Safety fallback only.
      // Do not scan index/ blobs as attempts.
      const listOptions = {
        prefix: "session/",
        paginate: true,
        limit,
      };

      if (cursor) {
        listOptions.cursor = cursor;
      }

      const list = await store.list(listOptions);
      const entries = list.blobs || [];
      nextCursor = list.cursor || null;

      const CONCURRENCY = 10;
      const loaded = await mapWithConcurrency(entries, CONCURRENCY, async (item) => {
        if (!item || !item.key || !item.key.endsWith(".json")) return null;

        const data = await store.get(item.key, { type: "json" });
        if (!data) return null;

        return { key: item.key, data };
      });

      for (const row of loaded) {
        if (row) attemptsRaw.push(row);
      }
    }

    // ---------- Normalize for Teacher Dashboard ----------
    let attempts = attemptsRaw.map(({ key, data }) => {
      const questionResultsLen = Array.isArray(data.questionResults)
        ? data.questionResults.length
        : Array.isArray(data.questions)
        ? data.questions.length
        : 0;

// answeredCount should reflect how many questions the student actually answered
const answeredCountRaw =
  data.answeredCount != null ? Number(data.answeredCount) : questionResultsLen;

const answeredCount = Number.isFinite(answeredCountRaw)
  ? Math.max(0, answeredCountRaw)
  : 0;

// totalQuestions should reflect how many questions exist in the set (can be > answeredCount)
const totalQuestionsRaw =
  data.totalQuestions != null
    ? Number(data.totalQuestions)
    : data.numQuestions != null
    ? Number(data.numQuestions)
    : 0;

let totalQuestions = Number.isFinite(totalQuestionsRaw)
  ? Math.max(0, totalQuestionsRaw)
  : 0;

// If totalQuestions is missing (older data), fall back to what we can infer
if (!totalQuestions && questionResultsLen) totalQuestions = questionResultsLen;
      const numCorrect = Number(data.numCorrect ?? 0);
      const numIncorrect = Math.max(0, answeredCount - numCorrect);

      const accuracy =
        answeredCount > 0 ? Math.round((numCorrect / answeredCount) * 100) : 0;

      const isComplete = totalQuestions > 0 && answeredCount >= totalQuestions;

      const bySkill = data.bySkill || data.perSkill || {};
      const byType = data.byType || data.perType || {};

      const sessionCode =
        data.sessionCode ||
        rawSession ||
        (data.sessionInfo && data.sessionInfo.sessionCode) ||
        "";


      const studentName = data.studentName || (data.student && data.student.name) || "";

      const studentId =
        data.studentId ||
        (data.student && data.student.id) ||
        (data.sessionInfo && data.sessionInfo.studentId) ||
        (data.sessionInfo && data.sessionInfo.studentKey) ||
        "";

      const startedAt =
        data.startedAt || (data.sessionInfo && data.sessionInfo.startedAt) || null;

      const finishedAt =
        data.finishedAt ||
        data.storedAt ||
        (data.sessionInfo && data.sessionInfo.finishedAt) ||
        null;

      const assessmentName =
        data.assessmentName ||
        (data.sessionInfo && data.sessionInfo.assessmentName) ||
        "";

      const assessmentType =
        data.assessmentType ||
        (data.sessionInfo && data.sessionInfo.assessmentType) ||
        "";

      const ownerEmail =
        data.ownerEmail ||
        data.teacherEmail ||
        (data.sessionInfo && data.sessionInfo.ownerEmail) ||
        (data.sessionInfo && data.sessionInfo.teacherEmail) ||
        "";

      const sharedWithEmails = Array.isArray(data.sharedWithEmails)
        ? data.sharedWithEmails
        : Array.isArray(data.sessionInfo && data.sessionInfo.sharedWithEmails)
        ? data.sessionInfo.sharedWithEmails
        : [];

      // Backfill defaults so older attempts still match filters.
      // Preserve benchmark metadata from either full attempts or index summaries.
      const rawPracticeSet =
        data.practiceSet ||
        data.set ||
        data.setType ||
        (data.sessionInfo && (data.sessionInfo.practiceSet || data.sessionInfo.set || data.sessionInfo.setType)) ||
        "full";

      const rawPracticeLevel =
        data.practiceLevel ||
        data.level ||
        data.levelBand ||
        (data.sessionInfo && (data.sessionInfo.practiceLevel || data.sessionInfo.level || data.sessionInfo.levelBand)) ||
        "on";

      const practiceSet = normalizeSetParam(rawPracticeSet);
      const practiceLevel = String(rawPracticeLevel || "on").toLowerCase();
      return {
        key,
        // If this row came from the teacher index, data.attemptId should already be
        // the full attempt blob key, such as session/IA4-STUDY-GUIDE/attempt.json.
        // Fall back to data.key or key for older/non-indexed rows.
        attemptId: data.attemptId || data.key || key,
        storedAttemptId: data.storedAttemptId || "",
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
        numCorrect,
        numIncorrect,
        answeredCount,
        totalQuestions,
        accuracy,
        isComplete,
        bySkill,
        byType,
                // Do NOT include full question-by-question results in the list endpoint.
        // Full details are loaded on demand by getReadingAttemptDetail.js.
        // This keeps Netlify from rejecting the response as too large.
        questionResultsCount: Array.isArray(data.questionResults) ? data.questionResults.length : 0,
        startedAt,
        finishedAt,
      };
    });

    // ---------- Scoping ----------
    if (rawViewerEmail) {
      const viewerLower = rawViewerEmail.toLowerCase();
      attempts = attempts.filter((a) => {
        const ownerLower = (a.ownerEmail || "").toLowerCase();
        const shared = Array.isArray(a.sharedWithEmails)
          ? a.sharedWithEmails.map((e) => String(e).toLowerCase())
          : [];

        if (!ownerLower && shared.length === 0) return false;
        return ownerLower === viewerLower || shared.includes(viewerLower);
      });
    } else if (rawOwnerEmail) {
      const ownerLower = rawOwnerEmail.toLowerCase();
      attempts = attempts.filter((a) => (a.ownerEmail || "").toLowerCase() === ownerLower);
    }

    // ---------- Filters ----------

    if (setParam) {
      attempts = attempts.filter((a) => normalizeSetParam(a.practiceSet) === setParam);
    }

    if (rawLevel) {
      attempts = attempts.filter((a) => String(a.practiceLevel || "").toLowerCase() === rawLevel);
    }

    // Sort newest → oldest
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
      body: JSON.stringify({ success: false, error: err.message, stack: err.stack }),
    };
  }
};
