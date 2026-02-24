// netlify/functions/getReadingProgress.js

const { getStore, connectLambda } = require("@netlify/blobs");

function normalizeSetParam(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "mini") return "mini1"; // legacy support
  if (v === "full" || v === "mini1" || v === "mini2") return v;
  return "";
}

function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
}

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const qs = event.queryStringParameters || {};

    const sessionCode = (qs.sessionCode || "").trim();
    const studentKeyRaw = (qs.studentKey || "").trim();

    const ownerEmailRaw = (qs.ownerEmail || qs.owner || "").trim();
    const viewerEmailRaw = (qs.viewerEmail || "").trim();
    const setRaw = (qs.set || "").trim().toLowerCase();

    if (!sessionCode) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: "sessionCode is required" }),
      };
    }

    connectLambda(event);
    const store = getStore("reading-progress");

    const safeSession = sanitizeFragment(sessionCode);

    // ---------- SINGLE STUDENT MODE ----------
    if (studentKeyRaw) {
      const safeStudentKey = sanitizeFragment(studentKeyRaw);
      const key = `session/${safeSession}/${safeStudentKey}.json`;

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

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      };
    }

    // ---------- WHOLE SESSION MODE (Live Monitor) ----------
    const list = await store.list({ prefix: `session/${safeSession}/` });
    const entries = (list && (list.blobs || list)) || [];

    const allProgress = [];
    for (const item of entries) {
      if (!item.key || !item.key.endsWith(".json")) continue;
      const doc = await store.get(item.key, { type: "json" });
      if (doc) allProgress.push(doc);
    }

    // ---------- FILTERS ----------
    let filtered = allProgress;


    // set filter
    const setParam = normalizeSetParam(setRaw);
    if (setParam) {
      filtered = filtered.filter(
        (d) => normalizeSetParam(d.practiceSet || d.set) === setParam
      );
    }

    // owner/viewer scoping
    if (viewerEmailRaw) {
      const viewerLower = viewerEmailRaw.toLowerCase();
      filtered = filtered.filter((d) => {
        const ownerLower = String(d.ownerEmail || "").toLowerCase();
        const shared = Array.isArray(d.sharedWithEmails)
          ? d.sharedWithEmails.map((e) => String(e).toLowerCase())
          : [];

        // secure default: hide docs with no ownership info
        if (!ownerLower && shared.length === 0) return false;

        return ownerLower === viewerLower || shared.includes(viewerLower);
      });
    } else if (ownerEmailRaw) {
      const ownerLower = ownerEmailRaw.toLowerCase();
      filtered = filtered.filter(
        (d) => String(d.ownerEmail || "").toLowerCase() === ownerLower
      );
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, progress: filtered }),
    };
  } catch (err) {
    console.error("[getReadingProgress] Fatal error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
