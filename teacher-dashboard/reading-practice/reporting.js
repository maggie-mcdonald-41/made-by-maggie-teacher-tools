// reporting.js
// Lightweight reporting helper for Reading Trainer
// Exposes: window.RP_REPORT.setSessionInfo, recordQuestionResult, sendFinalReport

(function () {
  const state = {
    sessionInfo: {
      studentName: "",
      classCode: "",
      sessionCode: "",
      assessmentName: "",
      ownerEmail: "",
      practiceLevel: "", // "below" | "on" | "above"
      practiceSet: "",   // "full" | "mini1" | "mini2"
      levelBand: "",   // legacy
      setType: "",     // legacy
      setId: ""        // legacy/stable key (optional)
    },
    startedAt: null,
    // Each entry: { questionId, type, linkedPassage, skills[], isCorrect, raw }
    questionResults: [],
    attemptSent: false
  };

  // ---------- Helpers ----------

  function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  
  function normalizeSetParam(raw) {
    const v = cleanString(raw).toLowerCase();
    if (!v) return "full";
    if (v === "mini") return "mini1";
    if (["full", "mini1", "mini2"].includes(v)) return v;
    return "full";
  }

  function normalizeLevelParam(raw) {
    const v = cleanString(raw).toLowerCase();
    if (["below", "on", "above"].includes(v)) return v;
    return "on";
  }

function findResultIndex(questionId) {
    return state.questionResults.findIndex((r) => r.questionId === questionId);
  }

  // Build summary stats for this attempt
function buildSummary() {
  // How many questions did the student actually answer (i.e., we have a first attempt logged)?
  const answeredCount = Array.isArray(state.questionResults)
    ? state.questionResults.length
    : 0;

  // Try to get the total number of questions in the set from a global or state,
  // and fall back to answeredCount if we truly don't know.
  let totalQuestions = 0;

  if (typeof window !== "undefined" && window.RP_TOTAL_QUESTIONS != null) {
    totalQuestions = Number(window.RP_TOTAL_QUESTIONS) || 0;
  } else if (typeof state.totalQuestions === "number") {
    totalQuestions = state.totalQuestions;
  } else {
    // Fallback: if nothing else is available, treat the answered count as total.
    totalQuestions = answeredCount;
  }

  let numCorrect = 0;

  const perType = {};   // { mcq: { correct, total }, multi: {...}, ... }
  const perSkill = {};  // { "main-idea": { correct, total }, ... }

  // Walk through first-attempt results for each answered question
  state.questionResults.forEach((r) => {
    if (r.isCorrect) numCorrect++;

    // Per-type stats
    const t = r.type || "unknown";
    if (!perType[t]) {
      perType[t] = { correct: 0, total: 0 };
    }
    perType[t].total++;
    if (r.isCorrect) perType[t].correct++;

    // Per-skill stats
    if (Array.isArray(r.skills)) {
      r.skills.forEach((skill) => {
        const key = String(skill);
        if (!perSkill[key]) {
          perSkill[key] = { correct: 0, total: 0 };
        }
        perSkill[key].total++;
        if (r.isCorrect) perSkill[key].correct++;
      });
    }
  });

  // Incorrect is based on answered questions, not totalQuestions
  const numIncorrect = Math.max(0, answeredCount - numCorrect);

  // Accuracy is "of the questions they actually answered"
  const accuracy = answeredCount > 0 ? numCorrect / answeredCount : 0;

  return {
    totalQuestions,  // how many were in the set (when known)
    answeredCount,   // how many they actually attempted
    numCorrect,
    numIncorrect,
    accuracy,        // 0–1, you can format as % on the teacher side
    perType,
    perSkill,
  };
}


  // ---------- Public API ----------

  /**
   * Called from script.js when the student hits "Start Practice".
   * Example payload:
   *   {
   *     studentName: "Ava",
   *     classCode: "3rd Period",
   *     sessionCode: "ABC123",
   *     assessmentName: "Start Times Article",
   *     // NEW:
   *     teacherEmail / ownerEmail / teacher: "teacher@school.org"
   *   }
   */
  function setSessionInfo(info = {}) {
    const ownerEmail = cleanString(
      info.ownerEmail ||
      info.teacherEmail ||
      info.teacher ||                  // if you pass it under "teacher"
      (info.user && info.user.email) || // just in case you wire a user object later
      ""
    );

    state.sessionInfo = {
      studentName: cleanString(info.studentName),
      classCode: cleanString(info.classCode),
      sessionCode: cleanString(info.sessionCode),
      assessmentName: cleanString(info.assessmentName),
      ownerEmail,

      // ✅ NEW: backend-supported fields
      practiceLevel: normalizeLevelParam(info.practiceLevel || info.level || info.levelBand),
      practiceSet: normalizeSetParam(info.practiceSet || info.set || info.setType || info.practiceType),

      // ✅ Also include the exact keys the Netlify function reads (either form is accepted)
      level: normalizeLevelParam(info.practiceLevel || info.level || info.levelBand),
      set: normalizeSetParam(info.practiceSet || info.set || info.setType || info.practiceType),

      // Legacy fields (safe to keep for any UI/debug tooling)
      levelBand: cleanString(info.levelBand || info.level || ""),
      setType: cleanString(info.setType || info.practiceType || ""),
      setId: cleanString(info.setId || info.practiceSetKey || "")
    };

    if (!state.startedAt) {
      state.startedAt = new Date().toISOString();
    }
    console.log("[RP_REPORT] Session info set:", state.sessionInfo);
  }

  /**
   * Called from script.js whenever a question is checked.
   * q  = the question object (id, type, skills, etc.)
   * payload = { isCorrect, ...otherData } built by each renderer.
   */
  function recordQuestionResult(q, payload = {}) {
    if (!q || typeof q.id === "undefined") return;

    const isCorrect = !!payload.isCorrect;
    const entry = {
      questionId: q.id,
      type: q.type || "unknown",
      linkedPassage:
        typeof q.linkedPassage === "number" ? q.linkedPassage : null,
      skills: Array.isArray(q.skills) ? q.skills.slice() : [],
      isCorrect,
      raw: payload
    };

  const idx = findResultIndex(q.id);
  if (idx === -1) {
    // ✅ First time this question has been checked – record it
    state.questionResults.push(entry);
  } else {
    // ✅ Already have a result for this question – keep the original
    console.log(
      "[RP_REPORT] Question already has a recorded first attempt; ignoring later checks.",
      entry
    );
  }


    console.log("[RP_REPORT] Recorded result:", entry);

    // 🔁 Trigger autosave (if the main script has provided a handler)
    if (typeof window !== "undefined" && typeof window.RP_AUTOSAVE_PROGRESS === "function") {
      window.RP_AUTOSAVE_PROGRESS();
    }
  }

  /**
   * Called at the end of the question set (from script.js).
   * Builds a summary + sends it to the Netlify function.
   */
async function sendFinalReport() {
  // 🔒 Only log the first full attempt for this session
  if (state.attemptSent) {
    console.log("[RP_REPORT] Final report already sent once; skipping.");
    return;
  }

  const summary = buildSummary();
  const finishedAt = new Date().toISOString();

  const payload = {
    ...state.sessionInfo,  // includes ownerEmail
    ...summary,
    startedAt: state.startedAt || null,
    finishedAt,
    questionResults: state.questionResults
  };

  console.log("[RP_REPORT] Final attempt summary:", payload);

  if (typeof fetch !== "function") {
    console.warn("[RP_REPORT] fetch() not available; skipping network send.");
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/logReadingAttempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let json = null;
    try {
      json = await res.json();
    } catch (_) {}

    if (!res.ok) {
      console.error(
        "[RP_REPORT] Netlify function returned error:",
        res.status,
        json
      );
    } else {
      console.log(
        "[RP_REPORT] Report successfully sent to Netlify:",
        res.status,
        json
      );
      // ✅ Lock it
      state.attemptSent = true;
    }
  } catch (err) {
    console.error("[RP_REPORT] Error sending final report:", err);
  }
}


  // Optional: quick dev helper so you can inspect in the console
  function _debugGetState() {
    return JSON.parse(JSON.stringify(state));
  }

  // Attach to window so script.js can use it
  window.RP_REPORT = {
    setSessionInfo,
    recordQuestionResult,
    sendFinalReport,
      //  Back-compat alias (script.js may still call this)
    finalizeAndSend: sendFinalReport,
    _debugGetState
  };
})();
