// netlify/functions/saveReadingProgress.js

const { getStore, connectLambda } = require("@netlify/blobs");

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
      : answeredCount;

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
    classCode: payload.classCode || "",
    sessionCode,

    // Ownership
    ownerEmail,
    sharedWithEmails,

    // Assessment metadata
    assessmentName: payload.assessmentName || "",
    assessmentType: payload.assessmentType || "",

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
      classCode: payload.classCode || "",

      startedAt: payload.startedAt || null,
      lastSavedAt: payload.lastSavedAt || new Date().toISOString(),

      currentQuestionIndex:
        typeof payload.currentQuestionIndex === "number"
          ? payload.currentQuestionIndex
          : null,

      questionResults: Array.isArray(payload.questionResults)
        ? payload.questionResults
        : [],

      // Optional Google auth info
      user: payload.user || null,
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

      const totalQuestions =
        typeof payload.totalQuestions === "number" && payload.totalQuestions > 0
          ? payload.totalQuestions
          : answeredCount;

      // Only write a partial attempt if the student has started
      // but has NOT finished the full set. Completed attempts are
      // logged separately via logReadingAttempt/sendFinalReport.
      if (answeredCount > 0 && answeredCount < totalQuestions) {
        const partialAttempt = buildPartialAttemptFromProgress(
          sessionCode,
          safeSession,
          safeStudentKey,
          payload
        );
        const attemptKey = `session/${safeSession}/${partialAttempt.attemptId}.json`;
        console.log(
          "[saveReadingProgress] Upserting partial attempt:",
          attemptKey
        );
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
