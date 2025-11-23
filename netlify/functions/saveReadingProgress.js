// netlify/functions/saveReadingProgress.js

const { getStore } = require("@netlify/blobs");

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
    const payload = JSON.parse(event.body || "{}");

    const sessionCode = (payload.sessionCode || "").trim();
    const studentKey = (payload.studentKey || "").trim();

    if (!sessionCode || !studentKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "sessionCode and studentKey are required"
        })
      };
    }

    const safeSession = sanitizeFragment(sessionCode);
    const safeStudentKey = sanitizeFragment(studentKey);

    const key = `session/${safeSession}/${safeStudentKey}.json`;
    const store = getStore("reading-progress");

    const dataToStore = {
      studentKey: safeStudentKey,
      sessionCode,

      studentName: payload.studentName || "",
      classCode: payload.classCode || "",

      startedAt: payload.startedAt || null,
      lastSavedAt: payload.lastSavedAt || new Date().toISOString(),

      currentQuestionIndex:
        typeof payload.currentQuestionIndex === "number"
          ? payload.currentQuestionIndex
          : null,

      questionResults: Array.isArray(payload.questionResults)
        ? payload.questionResults
        : [],

      // Optional Google auth info
      user: payload.user || null
    };

    await store.setJSON(key, dataToStore);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("[saveReadingProgress] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Failed to save progress"
      })
    };
  }
};
