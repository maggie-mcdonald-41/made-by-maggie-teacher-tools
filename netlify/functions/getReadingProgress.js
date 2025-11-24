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
      body: "Method Not Allowed",
    };
  }

  try {
    const qs = event.queryStringParameters || {};
    const sessionCodeRaw = qs.sessionCode || "";
    const studentKeyRaw = qs.studentKey || "";

    const sessionCode = sessionCodeRaw.trim();
    if (!sessionCode) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "sessionCode is required",
        }),
      };
    }

    // Connect blobs + store
    connectLambda(event);
    const store = getStore("reading-progress");

    const safeSession = sanitizeFragment(sessionCode);

    // ---------- SINGLE STUDENT MODE ----------
    if (studentKeyRaw && studentKeyRaw.trim()) {
      const safeStudentKey = sanitizeFragment(studentKeyRaw);
      const key = `session/${safeSession}/${safeStudentKey}.json`;

      // ✅ use get(..., { type: "json" }) instead of getJSON
      const doc = await store.get(key, { type: "json" });

      if (!doc) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: "No progress found for that student in this session",
          }),
        };
      }

      // For single-student lookups, just return the document itself
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      };
    }

    // ---------- WHOLE SESSION MODE (used by Live Monitor) ----------
    const list = await store.list({ prefix: `session/${safeSession}/` });
    const entries = (list && (list.blobs || list)) || [];

    const allProgress = [];
    for (const item of entries) {
      if (!item.key || !item.key.endsWith(".json")) continue;

      // ✅ use get(..., { type: "json" })
      const doc = await store.get(item.key, { type: "json" });
      if (!doc) continue;

      // ✅ PUSH THE DOC ITSELF, not { key, progress: doc }
      allProgress.push(doc);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        mode: "session",
        sessionCode,
        progress: allProgress, // array of docs with studentName, classCode, questionResults, etc.
      }),
    };
  } catch (err) {
    console.error("[getReadingProgress] Error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: err.message || "Failed to load progress",
      }),
    };
  }
};
