// netlify/functions/getReadingAttemptDetail.js

const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  // CORS preflight if you ever need it
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: JSON.stringify({ ok: true }),
    };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Method Not Allowed" }),
    };
  }

  try {
    connectLambda(event);
    const store = getStore("reading-attempts");

    const params = event.queryStringParameters || {};
    const rawAttemptId = (params.attemptId || "").trim();

    // Same scoping parameters as getReadingAttempts
    const rawOwnerEmail =
      (params.ownerEmail || params.teacherEmail || params.owner || "").trim();
    const rawViewerEmail = (params.viewerEmail || "").trim();

    if (!rawAttemptId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "Missing required query parameter: attemptId",
        }),
      };
    }

    // Helper: normalize one attempt the same way as getReadingAttempts,
    // but ALSO include questions in a dashboard-friendly shape.
    function normalizeAttemptFromBlob(key, data) {
      const answeredCount = Number(
        data.answeredCount ??
          data.totalQuestions ?? // legacy fallback
          data.numQuestions ??
          0
      );

      let totalQuestions = Number(data.totalQuestions ?? data.numQuestions ?? 0);
      if (!totalQuestions && answeredCount) {
        totalQuestions = answeredCount;
      }

      const numCorrect = Number(data.numCorrect ?? 0);
      const numIncorrect = Math.max(0, answeredCount - numCorrect);
      const accuracy =
        answeredCount > 0
          ? Math.round((numCorrect / answeredCount) * 100)
          : 0;

      const isComplete =
        totalQuestions > 0 && answeredCount >= totalQuestions;

      const bySkill = data.bySkill || data.perSkill || {};
      const byType = data.byType || data.perType || {};

      const sessionCode =
        data.sessionCode ||
        (data.sessionInfo && data.sessionInfo.sessionCode) ||
        "";

      const classCode =
        data.classCode ||
        (data.sessionInfo && data.sessionInfo.classCode) ||
        "";

      const studentName =
        data.studentName || (data.student && data.student.name) || "";

      const startedAt =
        data.startedAt ||
        (data.sessionInfo && data.sessionInfo.startedAt) ||
        null;

      const finishedAt =
        data.finishedAt ||
        data.storedAt ||
        (data.sessionInfo && data.sessionInfo.finishedAt) ||
        null;

      const assessmentName =
        data.assessmentName ||
        (data.sessionInfo && data.sessionInfo.assessmentName) ||
        "";

      const assessmentType =
        data.assessmentType ||
        (data.sessionInfo && data.sessionInfo.assessmentType) ||
        "";

      const ownerEmail =
        data.ownerEmail ||
        data.teacherEmail ||
        (data.sessionInfo && data.sessionInfo.ownerEmail) ||
        (data.sessionInfo && data.sessionInfo.teacherEmail) ||
        "";

      const sharedWithEmails = Array.isArray(data.sharedWithEmails)
        ? data.sharedWithEmails
        : Array.isArray(
            data.sessionInfo && data.sessionInfo.sharedWithEmails
          )
        ? data.sessionInfo.sharedWithEmails
        : [];

      // ----- Question-level normalization -----
      const rawQuestions = Array.isArray(data.questions)
        ? data.questions
        : [];

      const questions = rawQuestions.map((q) => ({
        questionId: q.questionId ?? q.id ?? q.question_id ?? null,
        questionNumber:
          q.questionNumber ?? q.number ?? q.qNumber ?? q.index ?? null,
        questionText:
          q.questionText ??
          q.stem ??
          q.prompt ??
          "Question text not available for this attempt.",
        studentAnswerText:
          q.studentAnswerText ??
          q.studentAnswer ??
          q.response ??
          q.selected ??
          null,
        correctAnswerText:
          q.correctAnswerText ??
          q.correctAnswer ??
          q.correct ??
          null,
        isCorrect:
          typeof q.isCorrect === "boolean"
            ? q.isCorrect
            : typeof q.correct === "boolean"
            ? q.correct
            : null,
        typeLabel: q.typeLabel ?? q.type ?? null,
        type: q.type ?? null,
        skillTagPrimary:
          q.skillTagPrimary ??
          q.skillPrimary ??
          (Array.isArray(q.skills) ? q.skills[0] : q.skill) ??
          null,
        skills: Array.isArray(q.skills)
          ? q.skills
          : q.skill
          ? [q.skill]
          : [],
        linkedPassage: q.linkedPassage ?? q.passage ?? null,
      }));

      return {
        attemptId: data.attemptId || key,
        studentName,
        classCode,
        sessionCode,
        startedAt,
        finishedAt,

        totalQuestions,
        answeredCount,
        numCorrect,
        numIncorrect,
        accuracy,
        isComplete,

        bySkill,
        byType,
        assessmentName,
        assessmentType,

        ownerEmail,
        sharedWithEmails,

        questions,
      };
    }

    // ---------- Step 1: try direct blob get (if attemptId is actually the key) ----------
    let foundKey = null;
    let foundData = null;

    try {
      const directData = await store.get(rawAttemptId, { type: "json" });
      if (directData) {
        foundKey = rawAttemptId;
        foundData = directData;
      }
    } catch (e) {
      // ignore; we'll fall back to scanning
      console.warn(
        "[getReadingAttemptDetail] Direct get by key failed:",
        e.message
      );
    }

    // ---------- Step 2: if not found by key, scan all blobs for data.attemptId match ----------
    if (!foundData) {
      const list = await store.list();
      const entries = list.blobs || list || [];

      for (const item of entries) {
        if (!item.key.endsWith(".json")) continue;

        const data = await store.get(item.key, { type: "json" });
        if (!data) continue;

        const attemptIdFromData = (data.attemptId || "").trim();
        if (attemptIdFromData && attemptIdFromData === rawAttemptId) {
          foundKey = item.key;
          foundData = data;
          break;
        }
      }
    }

    if (!foundData) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "Attempt not found.",
        }),
      };
    }

    // Normalize using the same logic as getReadingAttempts
    const attempt = normalizeAttemptFromBlob(foundKey, foundData);

    // ---------- Access control (mirror getReadingAttempts) ----------

    if (rawViewerEmail) {
      const viewerLower = rawViewerEmail.toLowerCase();
      const ownerLower = (attempt.ownerEmail || "").toLowerCase();
      const shared = Array.isArray(attempt.sharedWithEmails)
        ? attempt.sharedWithEmails.map((e) => String(e).toLowerCase())
        : [];

      const hasOwnershipInfo = !!ownerLower || shared.length > 0;

      if (!hasOwnershipInfo) {
        // If there's no ownership info, don't expose it at all.
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: "Attempt not found or not accessible.",
          }),
        };
      }

      const isOwner = ownerLower === viewerLower;
      const isShared = shared.includes(viewerLower);

      if (!isOwner && !isShared) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: "Attempt not found or not accessible.",
          }),
        };
      }
    } else if (rawOwnerEmail) {
      const ownerLower = rawOwnerEmail.toLowerCase();
      if ((attempt.ownerEmail || "").toLowerCase() !== ownerLower) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: "Attempt not found or not accessible.",
          }),
        };
      }
    }

    // ---------- Success ----------
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        attempt,
      }),
    };
  } catch (err) {
    console.error("[getReadingAttemptDetail] Fatal error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
