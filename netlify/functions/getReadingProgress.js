// netlify/functions/getReadingProgress.js

const { getStore } = require("@netlify/blobs");

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
    const store = getStore("reading-progress");

    if (studentKey) {
      // Single student in a session
      const safeStudentKey = sanitizeFragment(studentKey);
      const key = `session/${safeSession}/${safeStudentKey}.json`;
      const data = await store.getJSON(key);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          found: !!data,
          progress: data || null
        })
      };
    } else {
      // All students in this session
      const list = await store.list({ prefix: `session/${safeSession}/` });
      const entries = list.blobs || list || [];

      const all = [];
      for (const item of entries) {
        const data = await store.getJSON(item.key);
        if (data) all.push(data);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          found: all.length > 0,
          progress: all
        })
      };
    }
  } catch (err) {
    console.error("[getReadingProgress] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Failed to load progress"
      })
    };
  }
};
