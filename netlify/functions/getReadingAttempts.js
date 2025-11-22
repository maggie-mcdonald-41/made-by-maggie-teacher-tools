// netlify/functions/getReadingAttempts.js
// Returns reading practice attempts for a given session / class
// in a format the teacher dashboard can use.
const { getStore } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const qs = event.queryStringParameters || {};
    const sessionCodeRaw = (qs.sessionCode || "").trim();
    const classCodeRaw = (qs.classCode || "").trim();

    const store = getStore("reading-attempts");

    // List all attempts; optionally narrow by session prefix.
    // Keys look like: attempt-{sessionCode||"no-session"}-{attemptId}
    let prefix = "attempt-";
    if (sessionCodeRaw) {
      prefix = `attempt-${sessionCodeRaw}-`;
    }

    const listResult = await store.list({ prefix });
    const blobs = listResult.blobs || [];

    const attempts = [];

    for (const blob of blobs) {
      // Each blob is the full summary from reporting.js + extra fields
      const data = await store.getJSON(blob.key);
      if (!data) continue;

      const sessionCode = (data.sessionCode || "").trim();
      const classCode = (data.classCode || "").trim();

      // Session filter (case-insensitive)
      if (sessionCodeRaw) {
        if (sessionCode.toUpperCase() !== sessionCodeRaw.toUpperCase()) continue;
      }

      // Class filter (optional, case-insensitive)
      if (classCodeRaw) {
        if (classCode.toUpperCase() !== classCodeRaw.toUpperCase()) continue;
      }

      const totalQuestions =
        typeof data.totalQuestions === "number"
          ? data.totalQuestions
          : Array.isArray(data.questionResults)
          ? data.questionResults.length
          : 0;

      const numCorrect =
        typeof data.numCorrect === "number" ? data.numCorrect : 0;

      const numIncorrect =
        typeof data.numIncorrect === "number"
          ? data.numIncorrect
          : Math.max(0, totalQuestions - numCorrect);

      const overallAccuracy = totalQuestions ? numCorrect / totalQuestions : 0;

      // Map perType/perSkill from reporting.js to byType/bySkill for dashboard
      const byType = data.perType || {};
      const bySkill = data.perSkill || {};

      attempts.push({
        // identity fields
        attemptId: data.attemptId || blob.key,
        timestamp: data.timestamp || null,
        studentName: data.studentName || "Unknown Student",
        sessionCode,
        classCode,

        // scoring summary
        totalQuestions,
        numCorrect,
        numIncorrect,
        overallAccuracy,

        // more detailed breakdowns for charts
        byType,
        bySkill,

        // keep raw questionResults if dashboard wants to drill in later
        questionResults: data.questionResults || [],
      });
    }

    // Sort newest first
    attempts.sort((a, b) => {
      const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
      const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
      return tb - ta;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ attempts }),
    };
  } catch (err) {
    console.error("[getReadingAttempts] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to load attempts.",
      }),
    };
  }
};
