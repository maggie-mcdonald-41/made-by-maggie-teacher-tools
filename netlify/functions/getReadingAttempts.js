// netlify/functions/getReadingAttempts.js

const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // Required for Netlify Blobs in Functions v1
    connectLambda(event);
    const store = getStore("reading-attempts");

    const params = event.queryStringParameters || {};
    const rawSession = (params.sessionCode || "").trim();
    const rawClass = (params.classCode || "").trim();

    // --- Sanitize for folder prefixes ---
    const sanitizeFragment = (value) =>
      String(value || "")
        .trim()
        .replace(/[^\w\-]+/g, "_")
        .slice(0, 64);

    let attemptsRaw = [];

    // --- If session filter present, read only prefixed folder ---
    if (rawSession) {
      const safeSession = sanitizeFragment(rawSession);

      const list = await store.list({ prefix: `session/${safeSession}/` });
      const entries = list.blobs || list || [];

      for (const item of entries) {
        if (!item.key.endsWith(".json")) continue;

        const data = await store.get(item.key, { type: "json" });
        if (data) {
          attemptsRaw.push({ key: item.key, data });
        }
      }
    } else {
      // No session filter → load all attempts (small scale = ok)
      const list = await store.list();
      const entries = list.blobs || list || [];

      for (const item of entries) {
        if (!item.key.endsWith(".json")) continue;

        const data = await store.get(item.key, { type: "json" });
        if (data) {
          attemptsRaw.push({ key: item.key, data });
        }
      }
    }

    // ---------- Normalize for Teacher Dashboard ----------
    let attempts = attemptsRaw.map(({ key, data }) => {
      const totalQuestions = Number(
        data.totalQuestions ?? data.numQuestions ?? 0
      );

      const numCorrect = Number(data.numCorrect ?? 0);
      const numIncorrect = Number(
        data.numIncorrect ?? (totalQuestions ? totalQuestions - numCorrect : 0)
      );

      const accuracy =
        totalQuestions > 0
          ? Math.round((numCorrect / totalQuestions) * 100)
          : 0;

      const bySkill = data.bySkill || data.perSkill || {};
      const byType = data.byType || data.perType || {};

      const sessionCode =
        data.sessionCode ||
        rawSession ||
        (data.sessionInfo && data.sessionInfo.sessionCode) ||
        "";

      const classCode =
        data.classCode ||
        (data.sessionInfo && data.sessionInfo.classCode) ||
        "";

      const studentName =
        data.studentName ||
        (data.student && data.student.name) ||
        "";

      const startedAt =
        data.startedAt ||
        (data.sessionInfo && data.sessionInfo.startedAt) ||
        null;

      const finishedAt =
        data.finishedAt ||
        data.storedAt ||
        (data.sessionInfo && data.sessionInfo.finishedAt) ||
        null;

      // NEW: normalize assessment metadata
      const assessmentName =
        data.assessmentName ||
        (data.sessionInfo && data.sessionInfo.assessmentName) ||
        "";

      const assessmentType =
        data.assessmentType ||
        (data.sessionInfo && data.sessionInfo.assessmentType) ||
        "";

      return {
        attemptId: data.attemptId || key,
        studentName,
        classCode,
        sessionCode,
        startedAt,
        finishedAt,
        totalQuestions,
        numCorrect,
        numIncorrect,
        accuracy,
        bySkill,
        byType,
        // NEW fields returned to the dashboard:
        assessmentName,
        assessmentType,
      };
    });

    // Filter by class if requested
    if (rawClass) {
      const classUpper = rawClass.toUpperCase();
      attempts = attempts.filter(
        (a) => (a.classCode || "").toUpperCase() === classUpper
      );
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
      body: JSON.stringify({
        success: false,
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
