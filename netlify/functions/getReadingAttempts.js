// netlify/functions/getReadingAttempts.js

const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = async function (event, context) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // Required for Netlify Blobs in Functions v1
    connectLambda(event);
    const store = getStore("reading-attempts");

    const params = event.queryStringParameters || {};
    const rawSession = (params.sessionCode || "").trim();
    const rawClass = (params.classCode || "").trim();

    // Respect explicit owner fields coming from the dashboard / co-teacher links
    const rawOwnerEmail =
      (params.ownerEmail || params.teacherEmail || params.owner || "").trim();

    // viewerEmail = "show me attempts I own OR that are shared with me"
    const rawViewerEmail = (params.viewerEmail || "").trim();

    // --- Sanitize for folder prefixes ---
    const sanitizeFragment = (value) =>
      String(value || "")
        .trim()
        .replace(/[^\w\-]+/g, "_")
        .slice(0, 64);

    let attemptsRaw = [];

    // --- If session filter present, read only prefixed folder ---
    if (rawSession) {
      const safeSession = sanitizeFragment(rawSession);

      const list = await store.list({ prefix: `session/${safeSession}/` });
      const entries = list.blobs || list || [];

      for (const item of entries) {
        if (!item.key.endsWith(".json")) continue;

        const data = await store.get(item.key, { type: "json" });
        if (data) {
          attemptsRaw.push({ key: item.key, data });
        }
      }
    } else {
      // No session filter → load all attempts (small scale = ok)
      const list = await store.list();
      const entries = list.blobs || list || [];

      for (const item of entries) {
        if (!item.key.endsWith(".json")) continue;

        const data = await store.get(item.key, { type: "json" });
        if (data) {
          attemptsRaw.push({ key: item.key, data });
        }
      }
    }

    // ---------- Normalize for Teacher Dashboard ----------
    let attempts = attemptsRaw.map(({ key, data }) => {
      // ✅ Pull array evidence if present (heals old “24 of 25” issues)
      const questionResultsLen = Array.isArray(data.questionResults)
        ? data.questionResults.length
        : Array.isArray(data.questions)
        ? data.questions.length
        : 0;

      // ✅ Answered = strongest evidence we have
      const answeredCount = Number(
        Math.max(
          Number(data.answeredCount ?? 0),
          questionResultsLen,
          Number(data.totalQuestions ?? 0), // legacy fallback if older data stored only total
          Number(data.numQuestions ?? 0),
          0
        )
      );

      // ✅ Total questions = prefer explicit total, but never below array length
      let totalQuestions = Number(
        Math.max(
          Number(data.totalQuestions ?? 0),
          Number(data.numQuestions ?? 0),
          questionResultsLen,
          0
        )
      );

      // If still missing, fall back so older data still looks sane
      if (!totalQuestions && answeredCount) {
        totalQuestions = answeredCount;
      }

      const numCorrect = Number(data.numCorrect ?? 0);

      // incorrect and accuracy are based on ANSWERED questions
      const numIncorrect = Math.max(0, answeredCount - numCorrect);

      const accuracy =
        answeredCount > 0
          ? Math.round((numCorrect / answeredCount) * 100)
          : 0;

      // mark complete vs partial
      const isComplete =
        totalQuestions > 0 && answeredCount >= totalQuestions;

      const bySkill = data.bySkill || data.perSkill || {};
      const byType = data.byType || data.perType || {};

      const sessionCode =
        data.sessionCode ||
        rawSession ||
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

      // Normalize assessment metadata
      const assessmentName =
        data.assessmentName ||
        (data.sessionInfo && data.sessionInfo.assessmentName) ||
        "";

      const assessmentType =
        data.assessmentType ||
        (data.sessionInfo && data.sessionInfo.assessmentType) ||
        "";

      // Normalize owner / teacher email
      const ownerEmail =
        data.ownerEmail ||
        data.teacherEmail ||
        (data.sessionInfo && data.sessionInfo.ownerEmail) ||
        (data.sessionInfo && data.sessionInfo.teacherEmail) ||
        "";

      // Normalize shared-with list (for co-teachers)
      const sharedWithEmails = Array.isArray(data.sharedWithEmails)
        ? data.sharedWithEmails
        : Array.isArray(data.sessionInfo && data.sessionInfo.sharedWithEmails)
        ? data.sessionInfo.sharedWithEmails
        : [];

      return {
        attemptId: data.attemptId || key,
        studentName,
        classCode,
        sessionCode,
        startedAt,
        finishedAt,

        // core stats
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

        // ownership
        ownerEmail,
        sharedWithEmails,
      };
    });

    // ---------- Filtering ----------

    // viewerEmail takes priority and includes:
    //  - attempts where viewer is the owner
    //  - attempts where viewer is in sharedWithEmails
    if (rawViewerEmail) {
      const viewerLower = rawViewerEmail.toLowerCase();

      attempts = attempts.filter((a) => {
        const ownerLower = (a.ownerEmail || "").toLowerCase();
        const shared = Array.isArray(a.sharedWithEmails)
          ? a.sharedWithEmails.map((e) => String(e).toLowerCase())
          : [];

        const hasOwnershipInfo = !!ownerLower || shared.length > 0;

        // Secure behavior:
        // If there is NO ownership info, do NOT show the attempt.
        if (!hasOwnershipInfo) {
          return false;
        }

        // Allow if viewer is owner
        if (ownerLower === viewerLower) return true;

        // Allow if viewer is a co-teacher
        return shared.includes(viewerLower);
      });
    } else if (rawOwnerEmail) {
      // Fallback: explicit owner-only filter (e.g., co-teacher dashboard)
      const ownerLower = rawOwnerEmail.toLowerCase();
      attempts = attempts.filter(
        (a) => (a.ownerEmail || "").toLowerCase() === ownerLower
      );
    }

    // Filter by class if requested
    if (rawClass) {
      const classUpper = rawClass.toUpperCase();
      attempts = attempts.filter(
        (a) => (a.classCode || "").toUpperCase() === classUpper
      );
    }

    // Sort newest → oldest
    attempts.sort((a, b) => {
      const aTime = (a.finishedAt || a.startedAt || "").toString();
      const bTime = (b.finishedAt || b.startedAt || "").toString();
      return bTime.localeCompare(aTime);
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, attempts }),
    };
  } catch (err) {
    console.error("[getReadingAttempts] Fatal error:", err);
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
