// netlify/functions/logReadingAttempt.js

const { getStore, connectLambda } = require("@netlify/blobs");

function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
}

function normalizeSetParam(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "mini") return "mini1"; // legacy support
  if (v === "full" || v === "mini1" || v === "mini2" || v === "benchmark") return v;
  return "full";
}

function normalizeGradeLevel(raw) {
  const match = String(raw || "").trim().match(/\d+/);
  return match ? match[0] : "";
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

    // NEW: teacher ownership (more robust)
    const ownerEmail = (
      body.ownerEmail ||
      body.teacherEmail ||
      (body.user && body.user.email) ||
      ""
    ).trim().toLowerCase();

    // NEW: optional co-teacher sharing
    let sharedWithEmails = [];
    if (Array.isArray(body.sharedWithEmails)) {
      sharedWithEmails = body.sharedWithEmails
        .map((email) => String(email).trim().toLowerCase())
        .filter(Boolean);
    }

    // NEW: assessment metadata
    const assessmentName = (body.assessmentName || "").trim();
    const assessmentType = (
      body.assessmentType ||
      (
        body.practiceSet === "benchmark" ||
        body.set === "benchmark" ||
        body.practiceLevel === "benchmark" ||
        body.level === "benchmark"
          ? "benchmark"
          : ""
      )
    ).trim();
    const gradeLevel = normalizeGradeLevel(body.gradeLevel || body.grade) || "6";

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
      sessionCode,

      // === Ownership ===
      ownerEmail: ownerEmail || "",
      sharedWithEmails,

      // === Assessment Metadata ===
      assessmentName,
      assessmentType,
      gradeLevel,
      grade: gradeLevel,

            // === Practice metadata ===
      practiceSet: normalizeSetParam(body.practiceSet || body.set || "full"),
      practiceLevel: String(body.practiceLevel || body.level || "on").toLowerCase(),

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

    // Store full attempt JSON.
    // This is used by getReadingAttemptDetail.js when the teacher clicks a row.
    await store.setJSON(key, attempt);

    // Store lightweight dashboard/search index entries.
    // This prevents getReadingAttempts.js from having to scan every session blob
    // just to discover this teacher's sessions.
    const indexEmails = new Set();

    if (ownerEmail) {
      indexEmails.add(ownerEmail.toLowerCase());
    }

    sharedWithEmails.forEach((email) => {
      const clean = String(email || "").trim().toLowerCase();
      if (clean) indexEmails.add(clean);
    });

    const attemptSummary = {
      key,
      attemptId: key,
      storedAttemptId: attemptId,
      studentName,
      sessionCode,

      ownerEmail: ownerEmail || "",
      sharedWithEmails,

      assessmentName,
      assessmentType,
      gradeLevel,
      grade: gradeLevel,
      benchmarkKey: body.benchmarkKey || body.benchmark || "",
      benchmarkId: body.benchmarkId || body.assessmentId || "",

      practiceSet: attempt.practiceSet,
      practiceLevel: attempt.practiceLevel,
      set: attempt.practiceSet,
      level: attempt.practiceLevel,

      numCorrect,
      totalQuestions,
      answeredCount,
      isComplete,

      bySkill: attempt.bySkill,
      byType: attempt.byType,

      startedAt: attempt.startedAt,
      finishedAt: attempt.finishedAt,

      questionResultsCount: questionResultsArray.length,
    };

    await Promise.all(
      Array.from(indexEmails).map((email) => {
        const safeEmail = sanitizeFragment(email);
        const indexKey = `index/by-viewer/${safeEmail}/${attemptId}.json`;
        return store.setJSON(indexKey, attemptSummary);
      })
    );

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
