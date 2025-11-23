// netlify/functions/getReadingAttempts.js
// GET /.netlify/functions/getReadingAttempts?sessionCode=...&classCode=...

exports.handler = async function (event, context) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const qs = event.queryStringParameters || {};
    const rawSession = (qs.sessionCode || "").trim();
    const rawClass = (qs.classCode || "").trim();

    if (!rawSession) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "Missing sessionCode"
        })
      };
    }

    const sessionCode = rawSession.toUpperCase();
    const classCode = rawClass.toUpperCase();

    // ✅ ESM-friendly dynamic import (same pattern as your other functions)
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("reading-attempts");

    // Match whatever key pattern you're using in logReadingAttempt.js
    const prefix = classCode
      ? `attempt-${sessionCode}-${classCode}-`
      : `attempt-${sessionCode}-`;

    const { blobs } = await store.list({
      limit: 500,
      prefix
    });

    const attempts = [];
    for (const blob of blobs) {
      const data = await store.getJSON(blob.key);
      if (!data) continue;
      attempts.push({
        attemptId: data.attemptId,
        studentName: data.studentName || "Unknown",
        classCode: data.classCode || "",
        sessionCode: data.sessionCode || "",
        finishedAt: data.finishedAt || data.storedAt || null,
        numCorrect: data.numCorrect ?? null,
        numIncorrect: data.numIncorrect ?? null,
        totalQuestions: data.totalQuestions ?? null,
        raw: data
      });
    }

    // Sort newest first
    attempts.sort((a, b) => {
      const ta = a.finishedAt ? Date.parse(a.finishedAt) : 0;
      const tb = b.finishedAt ? Date.parse(b.finishedAt) : 0;
      return tb - ta;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        attempts
      })
    };
  } catch (err) {
    console.error("[getReadingAttempts] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Failed to load attempts"
      })
    };
  }
};
