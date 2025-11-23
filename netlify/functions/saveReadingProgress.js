// netlify/functions/saveReadingProgress.js

const { getStore } = require("@netlify/blobs");

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
        body: JSON.stringify({ success: false, error: "Missing sessionCode or studentKey" })
      };
    }

    // FIXED: require instead of dynamic import
    const store = getStore("reading-progress");

    const key = `progress-${sessionCode}-${studentKey}`;

    const dataToStore = {
      sessionCode,
      studentKey,
      studentName: payload.studentName || "",
      classCode: payload.classCode || "",
      startedAt: payload.startedAt || null,
      lastSavedAt: new Date().toISOString(),
      currentQuestionIndex: payload.currentQuestionIndex ?? null,
      questionResults: Array.isArray(payload.questionResults) ? payload.questionResults : [],
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
      body: JSON.stringify({ success: false, error: "Failed to save progress" })
    };
  }
};
