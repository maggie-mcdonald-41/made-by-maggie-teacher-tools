// netlify/functions/getReadingProgress.js

const { getStore } = require("@netlify/blobs");

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

    if (!sessionCode || !studentKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "Missing sessionCode or studentKey" })
      };
    }

    const store = getStore("reading-progress");

    const key = `progress-${sessionCode}-${studentKey}`;
    const data = await store.getJSON(key);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        found: !!data,
        progress: data || null
      })
    };
  } catch (err) {
    console.error("[getReadingProgress] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Failed to load progress" })
    };
  }
};
