// netlify/functions/saveReadingProgress.js

const { getStore, connectLambda } = require("@netlify/blobs");
function normalizeSetParam(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "mini") return "mini1";
  if (v === "full" || v === "mini1" || v === "mini2") return v;
  return "full";
}


function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
}

function buildPartialAttemptFromProgress(
  sessionCode,
  safeSession,
  safeStudentKey,
  payload
) {
  const questionResults = Array.isArray(payload.questionResults)
    ? payload.questionResults
    : [];

  const answeredCount = Array.isArray(questionResults)
    ? questionResults.length
    : 0;

  let numCorrect = 0;
  const bySkill = {};
  const byType = {};

  for (const r of questionResults) {
    if (!r) continue;
    if (r.isCorrect) numCorrect += 1;

    const skills = Array.isArray(r.skills) ? r.skills : [];
    for (const skill of skills) {
      if (!skill) continue;
      if (!bySkill[skill]) {
        bySkill[skill] = { correct: 0, total: 0 };
      }
      bySkill[skill].total += 1;
      if (r.isCorrect) {
        bySkill[skill].correct += 1;
      }
    }

    const qType = r.type || r.questionType || null;
    if (qType) {
      if (!byType[qType]) {
        byType[qType] = { correct: 0, total: 0 };
      }
      byType[qType].total += 1;
      if (r.isCorrect) {
        byType[qType].correct += 1;
      }
    }
  }

const totalQuestions =
  typeof payload.totalQuestions === "number" && payload.totalQuestions > 0
    ? payload.totalQuestions
    : null;

  const attemptId = `${safeSession}_${safeStudentKey}`;

  // 🔐 NEW: robust ownership for partial attempts
  const ownerEmail = (
    payload.ownerEmail ||
    payload.teacherEmail ||
    (payload.user && payload.user.email) ||
    ""
  ).trim();

  const sharedWithEmails = Array.isArray(payload.sharedWithEmails)
    ? payload.sharedWithEmails
        .map((e) => String(e).trim())
        .filter(Boolean)
    : [];

  return {
    attemptId,
    studentName: payload.studentName || "",
    sessionCode,

    // Ownership
    ownerEmail,
    sharedWithEmails,

    // Assessment metadata
    assessmentName: payload.assessmentName || "",
    assessmentType: payload.assessmentType || "",

    practiceSet: normalizeSetParam(payload.practiceSet || payload.set || "full"),
    practiceLevel: String(payload.practiceLevel || payload.level || "on").toLowerCase(),

    numCorrect,
    totalQuestions,
    answeredCount,
    bySkill,
    byType,
    startedAt: payload.startedAt || null,
    finishedAt: payload.lastSavedAt || new Date().toISOString(),
    questionResults,
  };
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");

    const sessionCode = (payload.sessionCode || "").trim();
    const studentKey = (payload.studentKey || "").trim();

    if (!sessionCode || !studentKey) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "sessionCode and studentKey are required",
        }),
      };
    }

    const safeSession = sanitizeFragment(sessionCode);
    const safeStudentKey = sanitizeFragment(studentKey);

    const key = `session/${safeSession}/${safeStudentKey}.json`;

    connectLambda(event);
    const store = getStore("reading-progress");

    const dataToStore = {
      studentKey: safeStudentKey,
      sessionCode,

      studentName: payload.studentName || "",

      startedAt: payload.startedAt || null,
      lastSavedAt: payload.lastSavedAt || new Date().toISOString(),

      practiceSet: normalizeSetParam(payload.practiceSet || payload.set || "full"),
      practiceLevel: String(payload.practiceLevel || payload.level || "on").toLowerCase(),

      currentQuestionIndex:
        typeof payload.currentQuestionIndex === "number"
          ? payload.currentQuestionIndex
          : null,

questionResults: Array.isArray(payload.questionResults)
  ? payload.questionResults
  : [],

user: payload.user || null,

ownerEmail: (
  payload.ownerEmail ||
  payload.teacherEmail ||
  (payload.user && payload.user.email) ||
  ""
).trim(),

sharedWithEmails: Array.isArray(payload.sharedWithEmails)
  ? payload.sharedWithEmails.map((e) => String(e).trim()).filter(Boolean)
  : [],

assessmentName: payload.assessmentName || "",
assessmentType: payload.assessmentType || "",

    };
    
    console.log("[saveReadingProgress] Writing key:", key);

    await store.setJSON(key, dataToStore);

    console.log("[saveReadingProgress] Saved OK:", key);

    // Also upsert a partial attempt into the reading-attempts store
    try {
      const attemptsStore = getStore("reading-attempts");

      const answeredCount =
        typeof payload.answeredCount === "number"
          ? payload.answeredCount
          : Array.isArray(payload.questionResults)
          ? payload.questionResults.length
          : 0;

const hasTotalQuestions =
  typeof payload.totalQuestions === "number" && payload.totalQuestions > 0;

const totalQuestions = hasTotalQuestions ? payload.totalQuestions : null;

// Only write a partial attempt if the student has started AND
// either:
//  - we know totalQuestions and they're not done yet, OR
//  - we don't know totalQuestions (still treat as in-progress snapshot)
let shouldWritePartial = false;

if (answeredCount > 0) {
  if (!hasTotalQuestions) {
    shouldWritePartial = true; // started but total unknown → treat as in-progress snapshot
  } else {
    shouldWritePartial = answeredCount < totalQuestions;
  }
}
if (shouldWritePartial) {
  const partialAttempt = buildPartialAttemptFromProgress(
    sessionCode,
    safeSession,
    safeStudentKey,
    payload
  );
  const attemptKey = `session/${safeSession}/${partialAttempt.attemptId}.json`;
  console.log("[saveReadingProgress] Upserting partial attempt:", attemptKey);
  await attemptsStore.setJSON(attemptKey, partialAttempt);
} else {
  console.log(
    "[saveReadingProgress] Skipping partial attempt upsert (answeredCount:",
    answeredCount,
    "totalQuestions:",
    totalQuestions,
    ")"
  );
}
    } catch (attemptErr) {
      console.warn(
        "[saveReadingProgress] Failed to upsert partial attempt:",
        attemptErr
      );
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error("[saveReadingProgress] Error details:", {
      message: err.message,
      stack: err.stack,
    });

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: err.message || "Failed to save progress",
      }),
    };
  }
};
