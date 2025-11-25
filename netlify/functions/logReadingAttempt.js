// netlify/functions/logReadingAttempt.js

const { getStore, connectLambda } = require("@netlify/blobs");

function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const sessionCode = (body.sessionCode || "").trim();
    const studentName = (body.studentName || "").trim();
    const classCode = (body.classCode || "").trim();

    // NEW: assessment metadata from the front end
    const assessmentName = (body.assessmentName || "").trim();
    const assessmentType = (body.assessmentType || "").trim(); // e.g. "Reading Practice"

    if (!sessionCode || !studentName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "sessionCode and studentName are required"
        })
      };
    }

    const safeSession = sanitizeFragment(sessionCode);
    const now = Date.now();

    const attemptId = `${safeSession}_${now}`;
    const key = `session/${safeSession}/${attemptId}.json`;

    // Required for Netlify Blobs in Functions v1
    connectLambda(event);
    const store = getStore("reading-attempts");

    // Normalize shape to what teacher-dashboard.js expects
    const attempt = {
      attemptId,
      studentName,
      classCode,
      sessionCode,

      // NEW: stored on every attempt
      assessmentName,
      assessmentType,

      numCorrect: Number(body.numCorrect || 0),
      totalQuestions: Number(body.totalQuestions || 0),

      // Per-skill + per-type breakdowns (support both naming styles just in case)
      bySkill: body.perSkill || body.bySkill || {},
      byType: body.perType || body.byType || {},

      // Timestamps
      startedAt: body.startedAt || null,
      finishedAt: body.finishedAt || new Date().toISOString(),

      // Optional detailed results (perfect for future question-by-question view)
      questionResults: Array.isArray(body.questionResults)
        ? body.questionResults
        : []
    };

    await store.setJSON(key, attempt);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, attemptId })
    };
  } catch (err) {
    console.error("[logReadingAttempt] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Failed to store attempt"
      })
    };
  }
};
