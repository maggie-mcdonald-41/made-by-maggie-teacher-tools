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
      const questionResultsArray = Array.isArray(data.questionResults)
        ? data.questionResults
        : [];

      const answeredCount = Number(
        data.answeredCount ??
          (questionResultsArray.length || 0) ??
          data.totalQuestions ??
          data.numQuestions ??
          0
      );

      let totalQuestions = Number(
        data.totalQuestions ?? data.numQuestions ?? 0
      );
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

      // Small helper to pick the first non-null/undefined value
      const coalesce = (...vals) => {
        for (const v of vals) {
          if (v !== undefined && v !== null) return v;
        }
        return null;
      };

      // ----- Question-level normalization -----
      // Prefer a baked-in "questions" array if it exists;
      // otherwise fall back to questionResults (which is how the trainer logs now).
      const rawQuestions =
        Array.isArray(data.questions) && data.questions.length
          ? data.questions
          : questionResultsArray;

      const questions = rawQuestions.map((q, idx) => {
        // Newer attempts: q.raw contains the payload we sent from logQuestionResult
        // Older attempts: the data might be on q itself.
        const raw = q.raw || q.rawPayload || q || {};

        const questionId = coalesce(
          q.questionId,
          q.id,
          q.question_id,
          raw.questionId,
          raw.id
        );

        const questionNumber = coalesce(
          q.questionNumber,
          q.number,
          q.qNumber,
          q.index,
          raw.questionNumber,
          raw.index,
          idx + 1
        );

        const type = coalesce(
          q.type,
          raw.questionType,
          raw.type
        );

        const typeLabel = coalesce(
          q.typeLabel,
          raw.typeLabel,
          type
        );

        const skillsArray = Array.isArray(q.skills)
          ? q.skills
          : Array.isArray(raw.skills)
          ? raw.skills
          : q.skill
          ? [q.skill]
          : [];

        const skillTagPrimary = coalesce(
          q.skillTagPrimary,
          q.skillPrimary,
          raw.skillTagPrimary,
          skillsArray.length ? skillsArray[0] : null
        );

        const linkedPassage = coalesce(
          q.linkedPassage,
          raw.linkedPassage,
          q.passage,
          raw.passage
        );

        const questionText =
          coalesce(
            q.questionText,
            raw.questionText,
            raw.questionStem,
            raw.stem,
            q.stem,
            q.prompt
          ) || "Question text not available for this attempt.";

        // We'll fill these differently by type if possible
        let studentAnswerText = coalesce(
          q.studentAnswerText,
          raw.studentAnswerText,
          raw.responseText,
          q.studentAnswer,
          q.response,
          q.selected
        );

        let correctAnswerText = coalesce(
          q.correctAnswerText,
          raw.correctAnswerText,
          q.correctAnswer,
          q.correct
        );

        const isCorrect =
          typeof q.isCorrect === "boolean"
            ? q.isCorrect
            : typeof q.correct === "boolean"
            ? q.correct
            : typeof raw.isCorrect === "boolean"
            ? raw.isCorrect
            : null;

        // ---- Type-specific detail block ----
        const detail = {};

        // Safe option getter
        const getOpt = (opts, idx) =>
          Array.isArray(opts) &&
          typeof idx === "number" &&
          idx >= 0 &&
          idx < opts.length
            ? opts[idx]
            : null;

        switch (type) {
          // ===== Single-choice style (MCQ, dropdown, revise) =====
          case "mcq":
          case "dropdown":
          case "revise": {
            const options =
              raw.options ||
              q.options ||
              [];

            const studentIdx = coalesce(
              raw.studentChoiceIndex,
              raw.selectedIndex,
              q.selectedIndex
            );

            const correctIdx = coalesce(
              raw.correctChoiceIndex,
              raw.correctIndex,
              q.correctIndex,
              raw.correctIndex
            );

            detail.options = Array.isArray(options) ? options.slice() : [];
            detail.studentChoiceIndex =
              typeof studentIdx === "number" ? studentIdx : null;
            detail.correctChoiceIndex =
              typeof correctIdx === "number" ? correctIdx : null;

            detail.studentChoiceText = getOpt(detail.options, detail.studentChoiceIndex);
            detail.correctChoiceText = getOpt(detail.options, detail.correctChoiceIndex);

            if (studentAnswerText == null) {
              studentAnswerText = detail.studentChoiceText;
            }
            if (correctAnswerText == null) {
              correctAnswerText = detail.correctChoiceText;
            }
            break;
          }

          // ===== Multi-select (Select all that apply) =====
          case "multi": {
            const options =
              raw.options ||
              q.options ||
              [];

            const selectedIndices = Array.isArray(raw.selectedIndices)
              ? raw.selectedIndices
              : Array.isArray(q.selectedIndices)
              ? q.selectedIndices
              : [];

            const correctIndices = Array.isArray(raw.correctIndices)
              ? raw.correctIndices
              : Array.isArray(q.correctIndices)
              ? q.correctIndices
              : [];

            detail.options = Array.isArray(options) ? options.slice() : [];
            detail.selectedIndices = selectedIndices.slice();
            detail.correctIndices = correctIndices.slice();

            detail.selectedTexts = detail.selectedIndices.map((i) =>
              getOpt(detail.options, i)
            );
            detail.correctTexts = detail.correctIndices.map((i) =>
              getOpt(detail.options, i)
            );

            if (!studentAnswerText && detail.selectedTexts.length) {
              studentAnswerText = detail.selectedTexts.join(" | ");
            }
            if (!correctAnswerText && detail.correctTexts.length) {
              correctAnswerText = detail.correctTexts.join(" | ");
            }
            break;
          }

          // ===== Order / sequencing =====
          case "order": {
            const items = Array.isArray(raw.items)
              ? raw.items
              : Array.isArray(q.items)
              ? q.items
              : [];

            const currentOrder = Array.isArray(raw.currentOrder)
              ? raw.currentOrder
              : Array.isArray(q.currentOrder)
              ? q.currentOrder
              : [];

            const correctOrder = Array.isArray(raw.correctOrder)
              ? raw.correctOrder
              : Array.isArray(q.correctOrder)
              ? q.correctOrder
              : [];

            detail.items = items.map((it) => ({
              id: it.id,
              text: it.text,
            }));
            detail.currentOrder = currentOrder.slice();
            detail.correctOrder = correctOrder.slice();
            break;
          }

          // ===== Matching =====
          case "match": {
            const left = Array.isArray(raw.left)
              ? raw.left
              : Array.isArray(q.left)
              ? q.left
              : [];

            const right = Array.isArray(raw.right)
              ? raw.right
              : Array.isArray(q.right)
              ? q.right
              : [];

            const pairs = raw.pairs || q.pairs || null;

            detail.left = left.map((it) => ({
              id: it.id,
              text: it.text,
            }));
            detail.right = right.map((it) => ({
              id: it.id,
              text: it.text,
            }));
            detail.pairs = pairs;
            break;
          }

          // ===== Classification (table sorting) =====
          case "classify": {
            const items = Array.isArray(raw.items)
              ? raw.items
              : Array.isArray(q.items)
              ? q.items
              : [];

            const categories = Array.isArray(raw.categories)
              ? raw.categories
              : Array.isArray(q.categories)
              ? q.categories
              : [];

            const placements = raw.placements || q.placements || null;
            const correctMap = raw.correctMap || q.correctMap || null;

            detail.items = items.map((it) => ({
              id: it.id,
              text: it.text,
              correctCategoryId: it.categoryId,
            }));

            detail.categories = categories.map((cat) => ({
              id: cat.id,
              label: cat.label,
            }));

            detail.placements = placements;
            detail.correctMap = correctMap;
            break;
          }

          // ===== Highlight sentences =====
          case "highlight": {
            const sentences = Array.isArray(raw.sentences)
              ? raw.sentences
              : Array.isArray(q.sentences)
              ? q.sentences
              : [];

            const selectedSentenceIds = Array.isArray(raw.selectedSentenceIds)
              ? raw.selectedSentenceIds
              : Array.isArray(q.selectedSentenceIds)
              ? q.selectedSentenceIds
              : [];

            const normSentences = sentences.map((s) => ({
              id: s.id,
              text: s.text,
              correct: !!s.correct,
            }));
            detail.sentences = normSentences;

            detail.selectedSentenceIds = selectedSentenceIds.slice();
            detail.selectedSentenceTexts = normSentences
              .filter((s) => detail.selectedSentenceIds.includes(s.id))
              .map((s) => s.text);

            detail.correctSentenceIds = normSentences
              .filter((s) => s.correct)
              .map((s) => s.id);
            detail.correctSentenceTexts = normSentences
              .filter((s) => s.correct)
              .map((s) => s.text);

            if (!studentAnswerText && detail.selectedSentenceTexts.length) {
              studentAnswerText = detail.selectedSentenceTexts.join(" ");
            }
            if (!correctAnswerText && detail.correctSentenceTexts.length) {
              correctAnswerText = detail.correctSentenceTexts.join(" ");
            }
            break;
          }

          // ===== Part A / Part B =====
          case "partAB": {
            const partA = raw.partA || q.partA || null;
            const partB = raw.partB || q.partB || null;

            const partDetail = {};

            if (partA) {
              const optsA = Array.isArray(partA.options)
                ? partA.options.slice()
                : Array.isArray(q.partA && q.partA.options)
                ? q.partA.options.slice()
                : [];

              const selA = coalesce(
                partA.selectedIndex,
                raw.selectedA,
                q.selectedA
              );
              const corA = coalesce(
                partA.correctIndex,
                q.partA && q.partA.correctIndex
              );

              partDetail.partA = {
                stem: partA.stem || (q.partA && q.partA.stem) || "",
                options: optsA,
                selectedIndex:
                  typeof selA === "number" ? selA : null,
                correctIndex:
                  typeof corA === "number" ? corA : null,
                selectedText: getOpt(optsA, selA),
                correctText: getOpt(optsA, corA),
              };
            }

            if (partB) {
              const optsB = Array.isArray(partB.options)
                ? partB.options.slice()
                : Array.isArray(q.partB && q.partB.options)
                ? q.partB.options.slice()
                : [];

              const selB = coalesce(
                partB.selectedIndex,
                raw.selectedB,
                q.selectedB
              );
              const corB = coalesce(
                partB.correctIndex,
                q.partB && q.partB.correctIndex
              );

              partDetail.partB = {
                stem: partB.stem || (q.partB && q.partB.stem) || "",
                options: optsB,
                selectedIndex:
                  typeof selB === "number" ? selB : null,
                correctIndex:
                  typeof corB === "number" ? corB : null,
                selectedText: getOpt(optsB, selB),
                correctText: getOpt(optsB, corB),
              };
            }

            partDetail.aCorrect = !!coalesce(
              raw.aCorrect,
              q.aCorrect
            );
            partDetail.bCorrect = !!coalesce(
              raw.bCorrect,
              q.bCorrect
            );

            detail.partAB = partDetail;

            // Friendly summary string if we don't have one yet
            if (!studentAnswerText && partDetail.partA && partDetail.partB) {
              studentAnswerText = `A: ${partDetail.partA.selectedText || "—"} | B: ${
                partDetail.partB.selectedText || "—"
              }`;
            }
            if (!correctAnswerText && partDetail.partA && partDetail.partB) {
              correctAnswerText = `A: ${partDetail.partA.correctText || "—"} | B: ${
                partDetail.partB.correctText || "—"
              }`;
            }

            break;
          }

          default:
            // For unknown types just keep whatever we already have
            break;
        }

        return {
          questionId,
          questionNumber,
          questionText,
          studentAnswerText,
          correctAnswerText,
          isCorrect,
          typeLabel,
          type,
          skillTagPrimary,
          skills: skillsArray,
          linkedPassage,
          detail,
          // Expose raw payload so the dashboard can reconstruct
          // any other per-type structures if needed.
          rawPayload: raw,
        };
      });

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
