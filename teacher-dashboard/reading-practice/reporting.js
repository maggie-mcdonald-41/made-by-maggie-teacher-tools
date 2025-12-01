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
      // NEW: who owns this assessment (dashboard owner)
      ownerEmail: ""
    },
    startedAt: null,
    // Each entry: { questionId, type, linkedPassage, skills[], isCorrect, raw }
    questionResults: []
  };

  // ---------- Helpers ----------

  function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function findResultIndex(questionId) {
    return state.questionResults.findIndex((r) => r.questionId === questionId);
  }

  // Build summary stats for this attempt
  function buildSummary() {
    const totalQuestions = state.questionResults.length;
    let numCorrect = 0;

    const perType = {};   // { mcq: { correct, total }, multi: {...}, ... }
    const perSkill = {};  // { "main-idea": { correct, total }, ... }

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

    const numIncorrect = Math.max(0, totalQuestions - numCorrect);
    const accuracy = totalQuestions > 0 ? numCorrect / totalQuestions : 0;

    return {
      totalQuestions,
      numCorrect,
      numIncorrect,
      accuracy,   // 0–1, you can format as % on the teacher side
      perType,
      perSkill
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
      ownerEmail
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
      state.questionResults.push(entry);
    } else {
      // Just in case, overwrite if the same question is logged again
      state.questionResults[idx] = entry;
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
    const summary = buildSummary();
    const finishedAt = new Date().toISOString();

    const payload = {
      ...state.sessionInfo,   // includes ownerEmail now 🎯
      ...summary,
      startedAt: state.startedAt || null,
      finishedAt,
      questionResults: state.questionResults
    };

    console.log("[RP_REPORT] Final attempt summary:", payload);

    // Graceful no-op if fetch is not available (very old browsers)
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
      } catch (_) {
        // ignore if no JSON body
      }

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
    _debugGetState
  };
})();
