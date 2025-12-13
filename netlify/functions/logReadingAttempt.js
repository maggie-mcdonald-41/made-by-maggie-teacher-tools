// netlify/functions/logReadingAttempt.js

const { getStore, connectLambda } = require("@netlify/blobs");

function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const sessionCode = (body.sessionCode || "").trim();
    const studentName = (body.studentName || "").trim();
    const classCode = (body.classCode || "").trim();

    // NEW: teacher ownership (more robust)
    const ownerEmail = (
      body.ownerEmail ||
      body.teacherEmail ||
      (body.user && body.user.email) ||
      ""
    ).trim();

    // NEW: optional co-teacher sharing
    let sharedWithEmails = [];
    if (Array.isArray(body.sharedWithEmails)) {
      sharedWithEmails = body.sharedWithEmails
        .map((email) => String(email).trim())
        .filter(Boolean);
    }

    // NEW: assessment metadata
    const assessmentName = (body.assessmentName || "").trim();
    const assessmentType = (body.assessmentType || "").trim();

    if (!sessionCode || !studentName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "sessionCode and studentName are required",
        }),
      };
    }

    const safeSession = sanitizeFragment(sessionCode);
    const now = Date.now();

    // Unique attempt ID
    const attemptId = `${safeSession}_${now}`;
    const key = `session/${safeSession}/${attemptId}.json`;

    // Required for Netlify Blobs v1
    connectLambda(event);
    const store = getStore("reading-attempts");

    // ------------- Normalize questionResults + answeredCount -------------
    const questionResultsArray = Array.isArray(body.questionResults)
      ? body.questionResults
      : [];

    const totalQuestionsFromBody = Number(body.totalQuestions || 0);

    const answeredFromBody =
      typeof body.answeredCount === "number" ? Number(body.answeredCount) : 0;

    const answeredFromArray = questionResultsArray.length || 0;

    // ✅ Always trust the strongest evidence we have
    const answeredCount = Math.max(answeredFromBody, answeredFromArray, 0);

    // ✅ If totalQuestions is missing (or zero), infer it from the array length
    // (We do NOT override a valid totalQuestionsFromBody—only fill gaps.)
    const totalQuestions =
      totalQuestionsFromBody > 0 ? totalQuestionsFromBody : answeredFromArray;

    const numCorrect = Number(body.numCorrect || 0);

    const isComplete =
      answeredCount > 0 && totalQuestions > 0 && answeredCount >= totalQuestions;

    // --------- BUILD ATTEMPT OBJECT (dashboard-ready) ----------
    const attempt = {
      attemptId,
      studentName,
      classCode,
      sessionCode,

      // === Ownership ===
      ownerEmail: ownerEmail || "",
      sharedWithEmails,

      // === Assessment Metadata ===
      assessmentName,
      assessmentType,

      // Main stats
      numCorrect,
      totalQuestions,
      answeredCount,
      isComplete,

      // Per-skill & per-type breakdowns
      bySkill: body.perSkill || body.bySkill || {},
      byType: body.perType || body.byType || {},

      // Timestamps
      startedAt: body.startedAt || null,
      finishedAt: body.finishedAt || new Date().toISOString(),

      // Detailed item-level results
      questionResults: questionResultsArray,
    };

    // Store JSON
    await store.setJSON(key, attempt);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, attemptId }),
    };
  } catch (err) {
    console.error("[logReadingAttempt] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "Failed to store attempt",
      }),
    };
  }
};
