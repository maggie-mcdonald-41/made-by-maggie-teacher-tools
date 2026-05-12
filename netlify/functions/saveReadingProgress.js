// netlify/functions/saveReadingProgress.js

const { getStore, connectLambda } = require("@netlify/blobs");
function normalizeSetParam(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "mini") return "mini1";
  if (v === "full" || v === "mini1" || v === "mini2" || v === "benchmark") return v;
  return "full";
}


function sanitizeFragment(value) {
  return String(value || "")
    .trim()
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 64);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function getIndexEmailsFromAttempt(attempt) {
  const indexEmails = new Set();

  const ownerEmail = normalizeEmail(
    attempt.ownerEmail ||
      attempt.teacherEmail ||
      (attempt.sessionInfo && attempt.sessionInfo.ownerEmail) ||
      (attempt.sessionInfo && attempt.sessionInfo.teacherEmail) ||
      ""
  );

  if (ownerEmail) {
    indexEmails.add(ownerEmail);
  }

  const sharedWithEmails = Array.isArray(attempt.sharedWithEmails)
    ? attempt.sharedWithEmails
    : Array.isArray(attempt.sessionInfo && attempt.sessionInfo.sharedWithEmails)
    ? attempt.sessionInfo.sharedWithEmails
    : [];

  sharedWithEmails.forEach((email) => {
    const clean = normalizeEmail(email);
    if (clean) indexEmails.add(clean);
  });

  return indexEmails;
}

function buildAttemptSummaryForIndex(attemptKey, attempt) {
  const practiceSet = normalizeSetParam(attempt.practiceSet || attempt.set || "full");
  const practiceLevel = String(attempt.practiceLevel || attempt.level || "on").toLowerCase();

  const assessmentType =
    attempt.assessmentType ||
    (practiceSet === "benchmark" || practiceLevel === "benchmark" ? "benchmark" : "");

  return {
    key: attemptKey,

    // IMPORTANT: dashboard detail loading needs the full blob key here
    attemptId: attemptKey,
    storedAttemptId: attempt.attemptId || "",

    studentName: attempt.studentName || "",
    studentId: attempt.studentId || "",
    sessionCode: attempt.sessionCode || "",

    ownerEmail: normalizeEmail(attempt.ownerEmail || attempt.teacherEmail || ""),
    sharedWithEmails: Array.isArray(attempt.sharedWithEmails)
      ? attempt.sharedWithEmails.map((email) => normalizeEmail(email)).filter(Boolean)
      : [],

    assessmentName: attempt.assessmentName || "",
    assessmentType,

    practiceSet,
    practiceLevel,
    set: practiceSet,
    level: practiceLevel,

    numCorrect: Number(attempt.numCorrect || 0),
    totalQuestions: Number(attempt.totalQuestions || 0),
    answeredCount: Number(attempt.answeredCount || 0),
    isComplete: !!attempt.isComplete,

    bySkill: attempt.bySkill || attempt.perSkill || {},
    byType: attempt.byType || attempt.perType || {},

    startedAt: attempt.startedAt || null,
    finishedAt: attempt.finishedAt || attempt.lastSavedAt || new Date().toISOString(),

    questionResultsCount: Array.isArray(attempt.questionResults)
      ? attempt.questionResults.length
      : 0,
  };
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

        // Also write/update the lightweight dashboard/search index.
        // Without this, live monitoring works, but session history and student search
        // cannot see partial/in-progress attempts.
        const indexEmails = getIndexEmailsFromAttempt(partialAttempt);
        const attemptSummary = buildAttemptSummaryForIndex(attemptKey, partialAttempt);

        await Promise.all(
          Array.from(indexEmails).map((email) => {
            const safeEmail = sanitizeFragment(email);
            const indexKey = `index/by-viewer/${safeEmail}/${partialAttempt.attemptId}.json`;
            return attemptsStore.setJSON(indexKey, attemptSummary);
          })
        );
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
