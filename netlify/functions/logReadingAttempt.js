// netlify/functions/logReadingAttempt.js

const { getStore } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const summary = JSON.parse(event.body || "{}");

    const attemptId =
      summary.attemptId ||
      (typeof crypto !== "undefined" &&
        crypto.randomUUID &&
        crypto.randomUUID()) ||
      String(Date.now());

    const finishedAt = summary.finishedAt || new Date().toISOString();
    const sessionCode = (summary.sessionCode || "").trim();
    const classCode = (summary.classCode || "").trim();
    const studentName = (summary.studentName || "").trim();

    console.log("[logReadingAttempt] New attempt:", {
      attemptId,
      studentName,
      classCode,
      sessionCode,
      numCorrect: summary.numCorrect,
      numIncorrect: summary.numIncorrect,
      totalQuestions: summary.totalQuestions
    });

    // FIXED: require instead of dynamic import
    const store = getStore("reading-attempts");

    const key = `attempt-${sessionCode || "no-session"}-${attemptId}`;

    await store.setJSON(key, {
      ...summary,
      attemptId,
      finishedAt,
      sessionCode,
      classCode,
      studentName,
      storedAt: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("[logReadingAttempt] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Failed to store attempt" })
    };
  }
};
