// netlify/functions/getReadingProgress.js

const { getStore, connectLambda } = require("@netlify/blobs");

function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const qs = event.queryStringParameters || {};
    const sessionCode = (qs.sessionCode || "").trim();
    const studentKey = (qs.studentKey || "").trim();

    if (!sessionCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "sessionCode is required"
        })
      };
    }

    const safeSession = sanitizeFragment(sessionCode);

    // Initialize Netlify Blobs for Functions v1
    connectLambda(event);
    const store = getStore("reading-progress");

    if (studentKey) {
      // Single student in a session
      const safeStudentKey = sanitizeFragment(studentKey);
      const key = `session/${safeSession}/${safeStudentKey}.json`;
      const data = await store.getJSON(key);

      if (!data) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            success: false,
            error: "No progress found for that student/session"
          })
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          mode: "single",
          sessionCode,
          studentKey: safeStudentKey,
          progress: data
        })
      };
    }

    // All students in a session
    const list = await store.list({ prefix: `session/${safeSession}/` });
    const entries = list.blobs || list || [];

    const allProgress = [];

    for (const item of entries) {
      if (!item.key.endsWith(".json")) continue;
      const data = await store.getJSON(item.key);
      if (!data) continue;

      allProgress.push({
        key: item.key,
        progress: data
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        mode: "session",
        sessionCode,
        progress: allProgress
      })
    };
  } catch (err) {
    console.error("[getReadingProgress] Fatal error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message,
        stack: err.stack
      })
    };
  }
};
