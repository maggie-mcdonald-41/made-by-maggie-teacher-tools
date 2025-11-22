// netlify/functions/logReadingAttempt.js

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const summary = JSON.parse(event.body || "{}");

    // Safety: make sure some core fields exist
    const attemptId =
      summary.attemptId ||
      (typeof crypto !== "undefined" &&
        crypto.randomUUID &&
        crypto.randomUUID()) ||
      String(Date.now());

    const finishedAt =
      summary.finishedAt || new Date().toISOString();

    const sessionCode = (summary.sessionCode || "").trim();
    const classCode = (summary.classCode || "").trim();
    const studentName = (summary.studentName || "").trim();

    // Log to Netlify function logs (nice for debugging)
    console.log("[logReadingAttempt] New attempt:", {
      attemptId,
      studentName,
      classCode,
      sessionCode,
      numCorrect: summary.numCorrect,
      numIncorrect: summary.numIncorrect,
      totalQuestions: summary.totalQuestions
    });

    // ✅ NEW: Persist to Netlify Blobs
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("reading-attempts"); // your blob "bucket"

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
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Invalid JSON" })
    };
  }
};
