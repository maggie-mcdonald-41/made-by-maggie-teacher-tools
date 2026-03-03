// netlify/functions/getReadingAttempts.js

const { getStore, connectLambda } = require("@netlify/blobs");

function normalizeSetParam(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "mini") return "mini1"; // legacy support
  if (v === "full" || v === "mini1" || v === "mini2") return v;
  return "";
}

function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
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

    let attemptsRaw = [];

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
    } else {
      const list = await store.list();
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
    }

    // ---------- Normalize for Teacher Dashboard ----------
    let attempts = attemptsRaw.map(({ key, data }) => {
      const questionResultsLen = Array.isArray(data.questionResults)
        ? data.questionResults.length
        : Array.isArray(data.questions)
        ? data.questions.length
        : 0;

      const answeredCount = Number(
        Math.max(
          Number(data.answeredCount ?? 0),
          questionResultsLen,
          Number(data.totalQuestions ?? 0),
          Number(data.numQuestions ?? 0),
          0
        )
      );

      let totalQuestions = Number(
        Math.max(
          Number(data.totalQuestions ?? 0),
          Number(data.numQuestions ?? 0),
          questionResultsLen,
          0
        )
      );

      if (!totalQuestions && answeredCount) totalQuestions = answeredCount;

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

    // ✅ Backfill defaults so older attempts still match filters
const practiceSet = normalizeSetParam(data.practiceSet || data.set || "full");
const practiceLevel = String(data.practiceLevel || data.level || "on").toLowerCase();

      return {
        key,
        attemptId: data.attemptId || key,
        studentId,
        studentName,
        sessionCode,
        assessmentName,
        assessmentType,
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
        questionResults: Array.isArray(data.questionResults) ? data.questionResults : [],
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
      body: JSON.stringify({ success: true, attempts }),
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
