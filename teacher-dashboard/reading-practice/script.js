// script.js

// ====== HIGHLIGHTING STATE ======
let currentHighlightColor = "yellow"; // default color
// ====== ASSESSMENT LABEL ======
const ASSESSMENT_NAME = "School Start Time";


function setHighlightColor(color) {
  currentHighlightColor = color;

  // Toggle "active" class on all color buttons in both toolbars
  document.querySelectorAll(".hl-color-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.color === color);
  });
}

// Initialize toolbar listeners (call this once after DOM is ready)
function initHighlightToolbars() {
  document.querySelectorAll(".hl-color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const color = btn.dataset.color;
      if (!color) return;
      setHighlightColor(color);
    });
  });
}

// Cross-out helper: shift-click or right-click adds/removes crossed-out state
function attachCrossOutHandlers(btn) {
  // Right-click / two-finger tap
  btn.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (answered) return;
    btn.classList.toggle("crossed-out");
  });
}

// Ensure leveled practice globals exist (prevents ReferenceError)
window.CURRENT_PRACTICE_LEVEL =
  window.CURRENT_PRACTICE_LEVEL ||
  window.READING_LEVEL_KEY ||
  new URLSearchParams(location.search).get("level") ||
  "on";

window.CURRENT_PRACTICE_SET =
  window.CURRENT_PRACTICE_SET ||
  new URLSearchParams(location.search).get("set") ||
  "full"; // change default if yours is different


// --- Level + questions are loaded AFTER level-loader injects the level bundle ---
let LEVEL = null;

let questions = [];
let ALL_QUESTIONS = [];
let QUESTION_SETS = { full: null };


// ---- Boot gating (level/questions must be ready before starting) ----
let rpLevelReady = false;
let rpPendingStartPayload = null;
let rpPendingResumeData = null;

// Finalize LEVEL + questions once the bundle is ready
function configureLevelAndQuestions(levelObj) {
  LEVEL = levelObj;

  if (!LEVEL || typeof LEVEL !== "object") {
    console.error("READING_LEVEL object missing/invalid. Did the level bundle load?", levelObj);
    return;
  }

  questions = Array.isArray(LEVEL.questions) ? LEVEL.questions : [];
  ALL_QUESTIONS = questions.slice();
  QUESTION_SETS = (LEVEL && LEVEL.questionSets) ? LEVEL.questionSets : { full: null };

  // Resolved from URL params and used for reporting
  (function applyQuestionSetFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);

      // set: full | mini1 | mini2 (legacy: mini -> mini1)
      let setParam = (params.get("set") || "full").toLowerCase();
      if (setParam === "mini") setParam = "mini1";
      if (!Object.prototype.hasOwnProperty.call(QUESTION_SETS, setParam)) {
        setParam = "full";
      }
      window.CURRENT_PRACTICE_SET = setParam;

      // level: on | below | above (default: on)
      let levelParam = (params.get("level") || "on").toLowerCase();
      if (!["on", "below", "above"].includes(levelParam)) {
        levelParam = "on";
      }
      window.CURRENT_PRACTICE_LEVEL = levelParam;

      const config = QUESTION_SETS[setParam];

      if (Array.isArray(config)) {
        // Use only the questions whose IDs are in this set
        questions = ALL_QUESTIONS.filter(q => config.includes(q.id));
      } else {
        // "full" set = all questions
        questions = ALL_QUESTIONS.slice();
      }
    } catch (e) {
      // On any error, just use full / on-level
      CURRENT_PRACTICE_SET = "full";
      CURRENT_PRACTICE_LEVEL = "on";
      questions = ALL_QUESTIONS.slice();
      console.warn("[Reading Trainer] Could not apply question set from URL:", e);
    }
  })();

  // ✅ NOW the `questions` array is finalized (full or mini)
  if (typeof window !== "undefined") {
    window.RP_TOTAL_QUESTIONS = questions.length;
  }

  // IMPORTANT: answeredQuestions depends on questions length
  answeredQuestions = new Array(questions.length).fill(false);

  // Rebuild UI pieces that depend on questions
  if (questionTotalEl) {
    questionTotalEl.textContent = questions.length.toString();
  }
  initQuestionNavStrip();
  updateProgressBar();

  // Only render once LEVEL exists
  if (questionStemEl && questionOptionsEl) {
    renderPassagesFromLevel();
    renderQuestion();
  }

  // ✅ Level/questions are ready; if a student clicked Continue early, start now
  rpLevelReady = true;

  if (rpPendingStartPayload && !rpSessionInitialized) {
    const payload = rpPendingStartPayload;
    rpPendingStartPayload = null;
    beginTrainerSession(payload);

    // ✅ If we queued a resume, apply it after the session starts
    if (rpPendingResumeData) {
      const resumeData = rpPendingResumeData;
      rpPendingResumeData = null;
      applyResumeFromAutosave(resumeData);
    }
  }
}

function logQuestionResult(q, extra = {}) {
  if (!window.RP_REPORT || typeof RP_REPORT.recordQuestionResult !== "function") {
    return;
  }

  // If the renderer didn't pass q explicitly, fall back to currentQuestionIndex
  const questionObj = q || questions[currentQuestionIndex];
  if (!questionObj) return;

  const isCorrect = !!extra.isCorrect;
  const rest = { ...extra };
  delete rest.isCorrect;

  // ---- Base fields that are always useful in the dashboard ----
  const base = {
    isCorrect,
    ...rest,
    questionId: questionObj.id,
    questionType: questionObj.type,
    questionStem: questionObj.stem || "",
    linkedPassage: questionObj.linkedPassage ?? null,
    skills: Array.isArray(questionObj.skills) ? questionObj.skills.slice() : []
  };

  const type = questionObj.type;
  const hasOptions = Array.isArray(questionObj.options);
  const optionsCopy = hasOptions ? questionObj.options.slice() : null;

  // Helper for safe option lookup
  const getOpt = (opts, idx) =>
    opts && typeof idx === "number" && idx >= 0 && idx < opts.length
      ? opts[idx]
      : null;

  switch (type) {
    // ---------- Single-choice types (options + correctIndex) ----------
    case "mcq":
    case "dropdown":
    case "revise": {
      if (optionsCopy) base.options = optionsCopy;

      const studentIdx = typeof rest.selectedIndex === "number" ? rest.selectedIndex : null;
      const correctIdx =
        typeof questionObj.correctIndex === "number" ? questionObj.correctIndex : null;

      base.studentChoiceIndex = studentIdx;
      base.studentChoiceText = getOpt(optionsCopy, studentIdx);

      base.correctChoiceIndex = correctIdx;
      base.correctChoiceText = getOpt(optionsCopy, correctIdx);
      break;
    }

    // ---------- Select all that apply ----------
    case "multi": {
      if (optionsCopy) base.options = optionsCopy;

      const selectedIndices = Array.isArray(rest.selectedIndices)
        ? rest.selectedIndices
        : [];
      const correctIndices = Array.isArray(rest.correctIndices)
        ? rest.correctIndices
        : Array.isArray(questionObj.correctIndices)
          ? questionObj.correctIndices
          : [];

      base.selectedIndices = selectedIndices.slice();
      base.selectedTexts = optionsCopy
        ? selectedIndices.map((i) => getOpt(optionsCopy, i))
        : [];

      base.correctIndices = correctIndices.slice();
      base.correctTexts = optionsCopy
        ? correctIndices.map((i) => getOpt(optionsCopy, i))
        : [];
      break;
    }

    // ---------- Order / sequencing ----------
    case "order": {
      if (Array.isArray(questionObj.items)) {
        base.items = questionObj.items.map((it) => ({
          id: it.id,
          text: it.text
        }));
      }
      if (Array.isArray(rest.currentOrder)) {
        base.currentOrder = rest.currentOrder.slice();
      }
      if (Array.isArray(questionObj.correctOrder)) {
        base.correctOrder = questionObj.correctOrder.slice();
      }
      break;
    }

    // ---------- Matching ----------
    case "match": {
      if (Array.isArray(questionObj.left)) {
        base.left = questionObj.left.map((it) => ({
          id: it.id,
          text: it.text
        }));
      }
      if (Array.isArray(questionObj.right)) {
        base.right = questionObj.right.map((it) => ({
          id: it.id,
          text: it.text
        }));
      }
      base.pairs = rest.pairs || null;
      break;
    }

    // ---------- Classification (table sorting) ----------
    case "classify": {
      if (Array.isArray(questionObj.items)) {
        base.items = questionObj.items.map((it) => ({
          id: it.id,
          text: it.text,
          correctCategoryId: it.categoryId
        }));
      }
      if (Array.isArray(questionObj.categories)) {
        base.categories = questionObj.categories.map((cat) => ({
          id: cat.id,
          label: cat.label
        }));
      }
      base.placements = rest.placements || null;
      base.correctMap = rest.correctMap || null;
      break;
    }

    // ---------- Highlight sentences ----------
    case "highlight": {
      if (Array.isArray(questionObj.sentences)) {
        const sentences = questionObj.sentences.map((s) => ({
          id: s.id,
          text: s.text,
          correct: !!s.correct
        }));
        base.sentences = sentences;

        const selectedIds = Array.isArray(rest.selectedSentenceIds)
          ? rest.selectedSentenceIds
          : [];
        base.selectedSentenceIds = selectedIds.slice();
        base.selectedSentenceTexts = sentences
          .filter((s) => selectedIds.includes(s.id))
          .map((s) => s.text);

        const correctIds = sentences.filter((s) => s.correct).map((s) => s.id);
        base.correctSentenceIds = correctIds;
        base.correctSentenceTexts = sentences
          .filter((s) => s.correct)
          .map((s) => s.text);
      }
      break;
    }

    // ---------- Part A + Part B ----------
    case "partAB": {
      // Part A
      if (questionObj.partA) {
        const optsA = Array.isArray(questionObj.partA.options)
          ? questionObj.partA.options.slice()
          : [];
        const selA =
          typeof rest.selectedA === "number" ? rest.selectedA : null;
        const corA =
          typeof questionObj.partA.correctIndex === "number"
            ? questionObj.partA.correctIndex
            : null;

        base.partA = {
          stem: questionObj.partA.stem,
          options: optsA,
          correctIndex: corA,
          selectedIndex: selA,
          selectedText: getOpt(optsA, selA),
          correctText: getOpt(optsA, corA)
        };
      }

      // Part B
      if (questionObj.partB) {
        const optsB = Array.isArray(questionObj.partB.options)
          ? questionObj.partB.options.slice()
          : [];
        const selB =
          typeof rest.selectedB === "number" ? rest.selectedB : null;
        const corB =
          typeof questionObj.partB.correctIndex === "number"
            ? questionObj.partB.correctIndex
            : null;

        base.partB = {
          stem: questionObj.partB.stem,
          options: optsB,
          correctIndex: corB,
          selectedIndex: selB,
          selectedText: getOpt(optsB, selB),
          correctText: getOpt(optsB, corB)
        };
      }

      base.aCorrect = !!rest.aCorrect;
      base.bCorrect = !!rest.bCorrect;
      break;
    }

    default:
      // For any future types, we just keep base as-is.
      break;
  }

  RP_REPORT.recordQuestionResult(questionObj, base);
}



// ====== STATE ======
let currentQuestionIndex = 0;
let answered = false;
let answeredQuestions = [];
// NEW: streak state
let currentStreak = 0;
let bestStreak = 0;

// DOM references
const questionNumberEl = document.getElementById("question-number");
//const questionTotalEl = document.getElementById("question-total");
const questionTypeLabelEl = document.getElementById("question-type-label");
const linkedPassageLabelEl = document.getElementById("linked-passage-label");
const questionStemEl = document.getElementById("question-stem");
const questionInstructionsEl = document.getElementById("question-instructions");
const questionOptionsEl = document.getElementById("question-options");
const questionFeedbackEl = document.getElementById("question-feedback");
const checkAnswerBtn = document.getElementById("check-answer-btn");
const nextQuestionBtn = document.getElementById("next-question-btn");

// NEW: streak + skills + progress + Squatch
const streakIndicatorEl = document.getElementById("streak-indicator");
const streakCountEl = document.getElementById("streak-count");
const questionSkillTagsEl = document.getElementById("question-skill-tags");
const progressBarEl = document.getElementById("progress-bar");
const progressMessageEl = document.getElementById("progress-message");
const sasquatchHelperEl = document.getElementById("sasquatch-helper");

const passageTabs = document.querySelectorAll(".passage-tab");
const passages = document.querySelectorAll(".passage");
const studentGoogleBtn = document.getElementById("rp-google-signin");
const authStatusEl = document.getElementById("rp-auth-status");
const sessionStatusEl = document.getElementById("rp-session-status");

// ====== PASSAGE & QUESTION HIGHLIGHTING (SELECTION-BASED) ======
const passageScrollEl = document.querySelector(".passage-scroll");


// ===== START SESSION BAR (student) =====

// Read from URL
function getSessionCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("session");
  return code ? code.trim() : "";
}

function getClassCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const val = params.get("class");
  return val ? val.trim() : "";
}

function getOwnerEmailFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const val = params.get("owner") || params.get("ownerEmail");
  return val ? val.trim() : "";
}

const SESSION_CODE = getSessionCodeFromUrl();
const URL_CLASS_CODE = getClassCodeFromUrl();
const URL_OWNER_EMAIL = getOwnerEmailFromUrl();


let rpSessionInitialized = false;

function beginTrainerSession({ studentName, classCode, sessionCode }) {
  if (rpSessionInitialized) return;
  rpSessionInitialized = true;

  const cleanName = (studentName || "").trim();
  const cleanClass = (classCode || "").trim();
  const cleanSession = (sessionCode || SESSION_CODE || "").trim();

  if (!cleanSession) {
    console.warn("[RP] beginTrainerSession called without a sessionCode.");
  }

  // Resolve ownerEmail for this attempt
  let ownerEmail = URL_OWNER_EMAIL;
  if (!ownerEmail) {
    try {
      // optional fallback if same browser was used to start session
      ownerEmail =
        window.localStorage.getItem("rp_lastOwnerEmail") || "";
    } catch (e) {
      // ignore
    }
  }

  if (window.RP_REPORT && typeof RP_REPORT.setSessionInfo === "function") {
    RP_REPORT.setSessionInfo({
      studentName: cleanName,
      classCode: cleanClass,
      sessionCode: cleanSession,
      assessmentName: ASSESSMENT_NAME,
      ownerEmail, //this ties attempts to the teacher
practiceSet: window.CURRENT_PRACTICE_SET,
practiceLevel: window.CURRENT_PRACTICE_LEVEL,
setType: window.CURRENT_PRACTICE_SET,
levelBand: window.CURRENT_PRACTICE_LEVEL

    });
  }

  // Optional: let reporting.js log a "joined" event
  if (window.RP_REPORT && typeof RP_REPORT.sendSessionStart === "function") {
    RP_REPORT.sendSessionStart();
  }

  // Hide any start screen, show trainer screen if you still use them
  if (startScreenEl) startScreenEl.style.display = "none";
  if (trainerScreenEl) trainerScreenEl.style.display = "block";

  // Render first question if the question UI exists
  if (questionStemEl && questionOptionsEl) {
    renderQuestion();
  }
}

function renderPassagesFromLevel() {
  const p1 = document.getElementById("passage-1");
  const p2 = document.getElementById("passage-2");
  if (!p1 || !p2 || !LEVEL || !LEVEL.passages) return;

  p1.innerHTML = LEVEL.passages[1]?.html || "<p class='muted'>Missing Passage 1</p>";
  p2.innerHTML = LEVEL.passages[2]?.html || "<p class='muted'>Missing Passage 2</p>";
}


// Optional screen containers (if you still use them)
const startScreenEl = document.getElementById("start-screen");
const trainerScreenEl = document.getElementById("trainer-screen");

// New session bar inputs
const studentNameInput = document.getElementById("rp-student-name");
const classCodeInput = document.getElementById("rp-class-code");
const sessionCodeInput = document.getElementById("rp-session-code");
const startBtn = document.getElementById("rp-start-session");
const startErrorMsg = document.getElementById("rp-session-status");

// Pre-fill session + class from URL if present
if (sessionCodeInput && SESSION_CODE) {
  sessionCodeInput.value = SESSION_CODE;
  sessionCodeInput.readOnly = true;
}

if (classCodeInput && URL_CLASS_CODE) {
  classCodeInput.value = URL_CLASS_CODE;
}
// ===== IDENTITY MODAL (student) =====
const identityModalEl = document.getElementById("rp-identity-modal");
const identityNameInput = document.getElementById("rp-id-name");
const identityClassInput = document.getElementById("rp-id-class");
const identityContinueBtn = document.getElementById("rp-id-continue");
const identityErrorEl = document.getElementById("rp-id-error");

function showIdentityModal() {
  if (!identityModalEl || rpSessionInitialized) return;

  // Prefill class from URL if available
  if (identityClassInput && URL_CLASS_CODE && !identityClassInput.value) {
    identityClassInput.value = URL_CLASS_CODE;
  }

  identityModalEl.classList.add("active");
  identityModalEl.setAttribute("aria-hidden", "false");
  if (identityNameInput) {
    identityNameInput.focus();
  }
  showCachedUserOptionIfExists();
}
function showCachedUserOptionIfExists() {
  const box = document.getElementById("rp-cached-user-box");
  const label = document.getElementById("rp-cached-user-label");

  if (!box || !label || !window.RP_AUTH) return;

  const cached = localStorage.getItem("rp_last_google_user");
  if (!cached) return;

  try {
    const user = JSON.parse(cached);
    if (user?.email) {
      label.textContent = `Continue as ${user.email}?`;
      box.style.display = "block";
    }
  } catch {}
}

function hideIdentityModal() {
  if (!identityModalEl) return;
  identityModalEl.classList.remove("active");
  identityModalEl.setAttribute("aria-hidden", "true");
}

if (identityContinueBtn) {
  identityContinueBtn.addEventListener("click", () => {
    if (rpSessionInitialized) return;
    const name = (identityNameInput?.value || "").trim();
    const classCode = (identityClassInput?.value || "").trim();
    const sessionCode = (SESSION_CODE || "").trim();


    if (!name) {
      if (identityErrorEl) {
        identityErrorEl.textContent = "Please type your name to continue.";
      }
      return;
    }

    if (!sessionCode) {
      if (identityErrorEl) {
        identityErrorEl.textContent =
          "This link is missing a session code. Ask your teacher for the correct link.";
      }
      return;
    }

    if (identityErrorEl) identityErrorEl.textContent = "";

    // NEW: sync into the main form fields so everything matches
    if (studentNameInput) {
      studentNameInput.value = name;
    }
    if (classCodeInput && classCode) {
      classCodeInput.value = classCode;
    }
    if (sessionCodeInput && sessionCode) {
      sessionCodeInput.value = sessionCode;
    }

    hideIdentityModal();
const payload = { studentName: name, classCode, sessionCode };

// ✅ Do not require Google sign-in, but do require level/questions to be ready
if (!rpLevelReady) {
  rpPendingStartPayload = payload;
  if (identityErrorEl) identityErrorEl.textContent = "Loading questions… one moment.";
  return;
}

beginTrainerSession(payload);
  });
}

// Start button behavior
if (startBtn) {
  startBtn.addEventListener("click", () => {
    if (rpSessionInitialized) return;
    const name = (studentNameInput?.value || "").trim();
    const classCode = (classCodeInput?.value || "").trim();
    const sessionCode = (SESSION_CODE || "").trim();

    if (!name) {
      if (startErrorMsg) {
        startErrorMsg.textContent = "Please type your name before starting.";
        startErrorMsg.classList.add("error");
      }
      return;
    }

    if (!sessionCode) {
      if (startErrorMsg) {
        startErrorMsg.textContent =
          "This link is missing a session code. Ask your teacher for the correct link.";
        startErrorMsg.classList.add("error");
      }
      return;
    }

    if (startErrorMsg) {
      startErrorMsg.textContent = "Session started! Scroll down to answer the questions.";
      startErrorMsg.classList.remove("error");
    }

    hideIdentityModal();
const payload = { studentName: name, classCode, sessionCode };

if (!rpLevelReady) {
  rpPendingStartPayload = payload;
  if (startErrorMsg) {
    startErrorMsg.textContent = "Loading questions… one moment.";
    startErrorMsg.classList.add("error");
  }
  return;
}

beginTrainerSession(payload);
  });
}


// ===============================
// Google auth wiring (student page)
// NOTE: This wires listeners only.
// DO NOT call initGoogleAuth() here.
// ===============================
function wireStudentAuth() {
  if (!window.RP_AUTH) return;

  RP_AUTH.onAuthChange((user) => {
    if (user) {
      const displayName = user.name || user.email || "";

      // Auto-fill name field(s)
      const nameInput = document.getElementById("rp-student-name");
      if (nameInput && !nameInput.value.trim()) {
        nameInput.value = displayName;
      }
      if (identityNameInput && !identityNameInput.value.trim()) {
        identityNameInput.value = displayName;
      }

      if (authStatusEl) {
        authStatusEl.textContent = `Signed in as ${user.email}. Your progress will sync across devices.`;
      }

      const sessionCode = (SESSION_CODE || "").trim();
      if (!sessionCode) {
        // No session in the URL – nothing else to do yet
        return;
      }

      // If we haven't started the session yet, check for a previous autosave
      if (!rpSessionInitialized) {
        const saved = tryLoadLocalAutosaveForGoogleUser(sessionCode, user);

        if (
          saved &&
          Array.isArray(saved.questionResults) &&
          saved.questionResults.length > 0
        ) {
          const resume = window.confirm(
            "It looks like you already started this practice set.\n\n" +
              "Click OK to jump back in where you left off, or Cancel to start a fresh attempt."
          );

          if (!resume) {
            // Teacher still keeps the earlier attempt in the dashboard,
            // but we clear the local resume record for this browser.
            try {
              const studentKey = `google-${user.sub}`;
              const localKey = `rp_progress_${sessionCode}_${studentKey}`;
              localStorage.removeItem(localKey);
            } catch (_) {
              // ignore
            }
          } else {
            // Start session, then apply resume
            const classCode = (classCodeInput?.value || URL_CLASS_CODE || "").trim();
            hideIdentityModal();

            const payload = {
              studentName: displayName,
              classCode,
              sessionCode
            };

            if (!rpLevelReady) {
              rpPendingStartPayload = payload;
              rpPendingResumeData = saved;
              return;
            }

            beginTrainerSession(payload);
            applyResumeFromAutosave(saved);
            return; // ✅ session started + resumed
          }
        }

        // If no autosave or they chose "start fresh", just auto-start like before
        const classCode = (classCodeInput?.value || URL_CLASS_CODE || "").trim();
        hideIdentityModal();

        const payload = {
          studentName: displayName,
          classCode,
          sessionCode
        };

        if (!rpLevelReady) {
          rpPendingStartPayload = payload;
          return;
        }

        beginTrainerSession(payload);
      }
    } else {
      if (authStatusEl) {
        authStatusEl.textContent =
          "Google sign-in saves your progress across devices. Local saving is also enabled.";
      }
      // If they sign out mid-session, we do NOT end the session.
    }
  });
}



if (studentGoogleBtn) {
  studentGoogleBtn.addEventListener("click", () => {
    // Put the official Google button in front of them
    showIdentityModal();
    showCachedUserOptionIfExists();

    // Optional: if you still want promptSignIn as a backup:
    if (window.RP_AUTH && typeof RP_AUTH.promptSignIn === "function") {
      RP_AUTH.promptSignIn();
    }
  });
}


// Optional: keep for future logic if you want to inspect colors
const PASSAGE_HL_CLASSES = [
  "passage-hl-yellow",
  "passage-hl-green",
  "passage-hl-blue",
  "passage-hl-pink"
];

const QUESTION_HL_CLASSES = [
  "q-hl-yellow",
  "q-hl-green",
  "q-hl-blue",
  "q-hl-pink"
];

// Helper to get the currently visible passage <article>
function getActivePassageElement() {
  return document.querySelector(".passage.active");
}

/**
 * Wrap the current selection inside `containerEl` in a wrapper span.
 * Uses extractContents() to avoid InvalidStateError when selection touches
 * inline elements like <strong>, <em>, etc.
 */
function applySelectionHighlight(containerEl, mode) {
  if (!currentHighlightColor || !containerEl) return;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  // Ignore empty selections or selections that are outside this container
  if (
    selection.isCollapsed ||
    !containerEl.contains(range.commonAncestorContainer) ||
    !range.toString().trim()
  ) {
    return;
  }

  // Build the wrapper span with the correct classes
  const wrapper = document.createElement("span");
  if (mode === "passage") {
    wrapper.classList.add("passage-highlight", `passage-hl-${currentHighlightColor}`);
  } else if (mode === "question") {
    wrapper.classList.add("q-highlight", `q-hl-${currentHighlightColor}`);
  }
  wrapper.dataset.highlightColor = currentHighlightColor;

  try {
    const contents = range.extractContents();
    wrapper.appendChild(contents);
    range.insertNode(wrapper);
    // Clear the native blue selection
    selection.removeAllRanges();
  } catch (err) {
    console.error("Highlight error:", err);
  }
}


// Mouseup in the passage area → highlight inside the ACTIVE passage only
if (passageScrollEl) {
  passageScrollEl.addEventListener("mouseup", () => {
    const activePassage = getActivePassageElement();
    if (activePassage) {
      applySelectionHighlight(activePassage, "passage");
    }
  });
}

// Mouseup on the question stem → highlight selection in the stem
if (questionStemEl) {
  questionStemEl.addEventListener("mouseup", () => {
    applySelectionHighlight(questionStemEl, "question");
  });
}

/**
 * Utility to unwrap highlight spans (keeps the text, removes the span).
 */
function unwrapHighlightSpan(span) {
  const parent = span.parentNode;
  while (span.firstChild) {
    parent.insertBefore(span.firstChild, span);
  }
  parent.removeChild(span);
}

/**
 * Clear ALL passage highlights (any color).
 */
function clearPassageHighlights() {
  const activePassage = getActivePassageElement();
  if (!activePassage) return;

  const spans = activePassage.querySelectorAll(".passage-highlight");
  spans.forEach(unwrapHighlightSpan);
}


/**
 * Clear ALL question highlights (any color) from the stem.
 */
function clearQuestionHighlights() {
  if (!questionStemEl) return;
  const spans = questionStemEl.querySelectorAll(".q-highlight");
  spans.forEach(unwrapHighlightSpan);
}


// ====== HELPERS ======
function setActivePassage(passageNumber) {
  passageTabs.forEach((tab) => {
    const isActive = tab.dataset.passage === String(passageNumber);
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  passages.forEach((p) => {
    const isActive = p.dataset.passage === String(passageNumber);
    p.classList.toggle("active", isActive);
  });
}

function resetFeedback() {
  questionFeedbackEl.textContent = "";
  questionFeedbackEl.classList.remove("ok", "error");
}

function setFeedback(message, isOK = true) {
  questionFeedbackEl.textContent = message;
  questionFeedbackEl.classList.toggle("ok", isOK);
  questionFeedbackEl.classList.toggle("error", !isOK);
}

function getTypeLabel(type) {
  switch (type) {
    case "mcq":
      return "Multiple Choice";
    case "multi":
      return "Select All That Apply";
    case "order":
      return "Chronological Order";
    case "match":
      return "Matching";
    case "highlight":
      return "Text Evidence (Highlight)";
    case "dropdown":
      return "Inline Choice";
    case "classify":
      return "Classification Table";
    case "partAB":
      return "Part A & Part B"
    case "revise":
      return "Sentence Revision"; 
    default:
      return "Question";
  }
}

// ====== SKILL TAGS ======
const SKILL_LABELS = {
  "central-idea": "Central Idea",
  "claim": "Claim / Argument",
  "text-evidence": "Text Evidence",
  "details": "Supporting Details",
  "graph-analysis": "Graphs & Data",
  "compare-passages": "Compare Passages",
  "listening-comprehension": "Listening",
  "multimedia-analysis": "Multimedia",
  "revise-sentence": "Sentence Revision",
  "chronological-order": "Text Structure",
  "argument-structure": "Argument Structure"
};

function prettifySkillKey(key) {
  if (SKILL_LABELS[key]) return SKILL_LABELS[key];

  return key
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderSkillTags(q) {
  if (!questionSkillTagsEl) return;
  questionSkillTagsEl.innerHTML = "";

  if (!q.skills || !Array.isArray(q.skills) || !q.skills.length) return;

  const unique = Array.from(new Set(q.skills));
  unique.slice(0, 4).forEach((key) => {
    const tag = document.createElement("span");
    tag.className = "skill-tag";
    tag.textContent = prettifySkillKey(key);
    questionSkillTagsEl.appendChild(tag);
  });
}


function initQuestionNavStrip() {
  const strip = document.getElementById("question-nav-strip");
  if (!strip) return;

  strip.innerHTML = "";

  questions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "q-nav-btn";
    btn.dataset.index = String(index);
    btn.textContent = index + 1; // show 1–10

    btn.addEventListener("click", () => {
      currentQuestionIndex = index;
      renderQuestion();
    });

    strip.appendChild(btn);
  });

  updateQuestionNavStrip();
}
initHighlightToolbars();

function updateQuestionNavStrip() {
  const strip = document.getElementById("question-nav-strip");
  if (!strip) return;

  const buttons = strip.querySelectorAll(".q-nav-btn");
  buttons.forEach((btn) => {
    const idx = Number(btn.dataset.index);
    btn.classList.toggle("current", idx === currentQuestionIndex);
    btn.classList.toggle("answered", answeredQuestions[idx]);
  });
}

// NEW: overall set progress bar (like the organizers)
function updateProgressBar() {
  if (!progressBarEl || !progressMessageEl) return;

  const total = questions.length || 0;
  const answeredCount = answeredQuestions.filter(Boolean).length;
  const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  progressBarEl.style.width = `${percent}%`;

  if (percent >= 100 && total > 0) {
    progressBarEl.classList.add("complete");
    progressMessageEl.innerText = "🎉 You finished this practice set! 🎉";
  } else {
    progressBarEl.classList.remove("complete");
    progressMessageEl.innerText = "";
  }
}

function triggerProgressPulse() {
  if (!progressBarEl) return;
  progressBarEl.classList.remove("pulse");
  // force reflow so the animation can replay
  void progressBarEl.offsetWidth;
  progressBarEl.classList.add("pulse");
}

function updateStreak(isCorrect) {
  if (isCorrect) {
    currentStreak += 1;
    bestStreak = Math.max(bestStreak, currentStreak);
  } else {
    currentStreak = 0;
  }

  if (streakCountEl) {
    streakCountEl.textContent = String(currentStreak);
  }

  if (streakIndicatorEl) {
    streakIndicatorEl.classList.remove("pop");
    void streakIndicatorEl.offsetWidth;
    streakIndicatorEl.classList.add("pop");
  }

  // Give Squatch a little bounce every 3 correct in a row
  if (sasquatchHelperEl && isCorrect && currentStreak > 0 && currentStreak % 3 === 0) {
    sasquatchHelperEl.classList.remove("squatch-celebrate");
    void sasquatchHelperEl.offsetWidth;
    sasquatchHelperEl.classList.add("squatch-celebrate");
  }
}

function onQuestionAnsweredResult(isCorrect) {
  updateStreak(isCorrect);
  if (isCorrect) {
    triggerProgressPulse();
  }
}


function markQuestionAnswered() {
  answeredQuestions[currentQuestionIndex] = true;
  updateQuestionNavStrip();
  updateProgressBar();
}


const questionTotalEl = document.getElementById("question-total");

// ======================================
// 🎉 Confetti Helpers (Reading Trainer)
// Requires canvas-confetti to be loaded
// ======================================
function fireCorrectAnswerConfetti() {
  if (typeof confetti !== "function") return;

  // Small on-brand burst for correct answers
  confetti({
    particleCount: 45,
    spread: 70,
    startVelocity: 45,
    scalar: 0.9,
    origin: { x: 0.5, y: 0.6 }, // center-ish
    colors: [
      "#05c1b8", // teal
      "#ff8f85", // pink
      "#f97316", // orange-y accent
      "#4f46e5"  // indigo
    ]
  });
}

function fireSetCompleteConfetti() {
  if (typeof confetti !== "function") return;

  // Bigger, longer celebration – based on your original snippet
  const duration = 4000; // 4 seconds
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 10,
      spread: 80,
      startVelocity: 50,
      scalar: 1,
      origin: {
        x: Math.random(),          // random across the top
        y: Math.random() * 0.6     // upper ~60% of screen
      },
      colors: [
        "#05c1b8",
        "#ff8f85",
        "#f97316",
        "#4f46e5"
      ]
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
// ===== end confetti helpers =====


// ====== MEDIA RENDERING (audio / video with subtitles support) ======
function renderMediaIfPresent(q) {
  if (!q.media) return;

  const { type, src, captions, label } = q.media || {};
  if (!src || (type !== "audio" && type !== "video")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "question-media";

  //  IMPORTANT:
  // Browsers DO NOT show captions on <audio>.
  // If captions exist, we MUST switch to <video>.
  const useVideo = !!captions || type === "video";
  const player = document.createElement(useVideo ? "video" : "audio");

  player.className = "question-media-player";
  player.controls = true;
  player.preload = "metadata";
  player.src = src;

  // Make video-style audio player look nice
  if (useVideo) {
    player.style.width = "100%";
    player.style.maxWidth = "520px";
  }

  // Add captions track if present
  if (captions) {
    const track = document.createElement("track");
    track.kind = "captions"; 
    track.src = captions;
    track.srclang = "en";
    track.label = label || "English";
    track.default = true;
    player.appendChild(track);
  }

  wrapper.appendChild(player);

  if (label) {
    const labelEl = document.createElement("p");
    labelEl.className = "media-caption";
    labelEl.textContent = label;
    wrapper.appendChild(labelEl);
  }

  // Insert media block into question area
  questionOptionsEl.appendChild(wrapper);
}

// ====== RENDERING ======
// ====== RENDERING ======
function renderQuestion() {
  // --- Required DOM refs check ---
  if (
    !questionNumberEl ||
    !questionTypeLabelEl ||
    !questionStemEl ||
    !questionInstructionsEl ||
    !questionOptionsEl ||
    !questionFeedbackEl
  ) {
    return;
  }

  // --- SAFETY: normalize the question bank source ---
  // Prefer local `questions` if it exists/has data, otherwise fall back to global(s)
  const qList =
    (Array.isArray(questions) && questions.length ? questions : null) ||
    (Array.isArray(window.questions) && window.questions.length ? window.questions : null) ||
    (Array.isArray(window.QUESTIONS) && window.QUESTIONS.length ? window.QUESTIONS : null) ||
    (Array.isArray(window.ACTIVE_QUESTIONS) && window.ACTIVE_QUESTIONS.length ? window.ACTIVE_QUESTIONS : null) ||
    [];

  // Keep your existing index variable, but make it safe
  const idx = Number.isInteger(currentQuestionIndex) ? currentQuestionIndex : 0;

  // --- SAFETY: guard missing/out-of-range question ---
  const q = qList[idx];
  if (!q) {
    console.error("[RP] No question to render.", {
      idx,
      qListLength: qList.length,
      // These are the usual suspects for “why is q missing?”
      practiceLevel: window.CURRENT_PRACTICE_LEVEL,
      practiceSet: window.CURRENT_PRACTICE_SET,
      readingLevelKey: window.READING_LEVEL_KEY,
      hasLEVEL: !!window.LEVEL,
      hasREADING_LEVEL: !!window.READING_LEVEL
    });

    // Prevent hard crash + show something on screen
    questionNumberEl.textContent = "—";
    questionTypeLabelEl.textContent = "—";
    questionStemEl.textContent = "No questions loaded for this set.";
    questionInstructionsEl.textContent =
      "Please refresh, or check that the student link includes the correct level/set.";

    questionOptionsEl.innerHTML = "";
    resetFeedback();
    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = true;

    if (linkedPassageLabelEl) linkedPassageLabelEl.textContent = "";
    return;
  }

  // If you still use `questions` elsewhere (next/prev logic), keep it synced
  // without breaking existing references.
  if (!Array.isArray(questions) || questions !== qList) {
    // NOTE: this rebinds the global `questions` variable if it's declared with `let`.
    // If `questions` is `const`, remove this line and rely on qList.
    try {
      questions = qList;
    } catch (e) {
      // ignore (const or scoped) - rendering will still work via qList
    }
  }

  answered = false;

  // NEW: update skill bar (guard in case q is missing fields)
  if (typeof renderSkillTags === "function") {
    renderSkillTags(q);
  }

  // Progress + type label
  questionNumberEl.textContent = (idx + 1).toString();
  questionTypeLabelEl.textContent = getTypeLabel(q.type);

  // Reset question stem highlight for each new question
  questionStemEl.classList.remove(
    "q-highlight",
    "q-hl-yellow",
    "q-hl-green",
    "q-hl-blue",
    "q-hl-pink"
  );
  delete questionStemEl.dataset.highlightColor;

  // Linked passage helper label
  if (q.linkedPassage === 1 || q.linkedPassage === 2) {
    if (linkedPassageLabelEl) {
      linkedPassageLabelEl.textContent = `Tip: You may want to look back at Passage ${q.linkedPassage}.`;
    }
    if (typeof setActivePassage === "function") {
      setActivePassage(q.linkedPassage);
    }
  } else {
    if (linkedPassageLabelEl) linkedPassageLabelEl.textContent = "";
  }

  // Stem and instructions
  questionStemEl.textContent = q.stem || "";
  questionInstructionsEl.textContent = q.instructions || "";

  // Reset area
  questionOptionsEl.innerHTML = "";
  resetFeedback();
  checkAnswerBtn.disabled = true;
  nextQuestionBtn.disabled = true;

  // 🔊 Render media (audio/video) if this question has it
  if (typeof renderMediaIfPresent === "function") {
    renderMediaIfPresent(q);
  }

  // Render by type (with a safe fallback)
  if (q.type === "mcq") {
    renderMCQ(q);
  } else if (q.type === "multi") {
    renderMulti(q);
  } else if (q.type === "order") {
    renderOrder(q);
  } else if (q.type === "match") {
    renderMatch(q);
  } else if (q.type === "highlight") {
    renderHighlight(q);
  } else if (q.type === "dropdown") {
    renderDropdown(q);
  } else if (q.type === "classify") {
    renderClassify(q);
  } else if (q.type === "partAB") {
    renderPartAB(q);
  } else if (q.type === "revise") {
    renderRevise(q);
  } else {
    console.error("[RP] Unknown question type:", q.type, q);
    questionStemEl.textContent = "This question type isn't supported yet.";
    questionInstructionsEl.textContent = "";
  }

  // Smooth fade-in for each new question
  const bodyEl = document.querySelector(".question-body");
  if (bodyEl) {
    bodyEl.classList.remove("fade-in");
    void bodyEl.offsetWidth;
    bodyEl.classList.add("fade-in");
  }

  if (typeof updateQuestionNavStrip === "function") {
    updateQuestionNavStrip();
  }
}



// ====== TYPE: MCQ ======
function renderMCQ(q) {
  const list = document.createElement("div");
  list.className = "choice-list";

  let selectedIndex = null;

  q.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.dataset.index = String(index);

    const labelSpan = document.createElement("span");
    labelSpan.className = "choice-btn-label";
    labelSpan.textContent = String.fromCharCode(65 + index) + ".";

    const contentSpan = document.createElement("span");
    contentSpan.className = "choice-btn-content";
    contentSpan.textContent = optText;

    btn.appendChild(labelSpan);
    btn.appendChild(contentSpan);

    // Main click: select answer. Shift-click: cross out.
    btn.addEventListener("click", (event) => {
      if (answered) return;

      if (event.shiftKey) {
        event.preventDefault();
        btn.classList.toggle("crossed-out");
        return;
      }

      selectedIndex = index;
      list.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      checkAnswerBtn.disabled = false;
      resetFeedback();
    });

    // Right-click / two-finger tap also crosses out
    attachCrossOutHandlers(btn);

    list.appendChild(btn);
  });

  questionOptionsEl.appendChild(list);

checkAnswerBtn.onclick = () => {
  if (selectedIndex === null || answered) return;

  answered = true;
  markQuestionAnswered();

  const buttons = list.querySelectorAll(".choice-btn");
  const isCorrect = selectedIndex === q.correctIndex;

  buttons.forEach((b) => {
    const idx = Number(b.dataset.index);
    if (idx === q.correctIndex) {
      b.classList.add("correct");
    }
    if (idx === selectedIndex && idx !== q.correctIndex) {
      b.classList.add("incorrect");
    }
    b.disabled = true;
  });

  if (isCorrect) {
    setFeedback("Nice work! That’s the correct answer.", true);
    fireCorrectAnswerConfetti(); 
  } else {
    setFeedback("Not quite. Check the passage again and think about the main idea.", false);
  }
  onQuestionAnsweredResult(isCorrect);


  // 🔹 REPORTING HOOK
  logQuestionResult(q, {
    isCorrect,
    selectedIndex
  });

  checkAnswerBtn.disabled = true;
  nextQuestionBtn.disabled = false;
};

}

// ====== TYPE: MULTI (Select All That Apply) ======
function renderMulti(q) {
  const list = document.createElement("div");
  list.className = "choice-list";

  const selectedSet = new Set();
  const minSelections = q.minSelections || 1;

  q.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    // use same base style, but add a hook class if you want special styling later
    btn.className = "choice-btn multi-choice";
    btn.dataset.index = String(index);

    // 🟦 NO LETTER LABEL HERE – just the text box
    const contentSpan = document.createElement("span");
    contentSpan.className = "choice-btn-content";
    contentSpan.textContent = optText;

    btn.appendChild(contentSpan);

    btn.addEventListener("click", (event) => {
      if (answered) return;

      // Shift-click to cross out without changing selection
      if (event.shiftKey) {
        event.preventDefault();
        btn.classList.toggle("crossed-out");
        return;
      }

      const idx = Number(btn.dataset.index);

      if (selectedSet.has(idx)) {
        selectedSet.delete(idx);
        btn.classList.remove("selected");
      } else {
        if (q.maxSelections && selectedSet.size >= q.maxSelections) {
          setFeedback(`You can select up to ${q.maxSelections} answers.`, false);
          return;
        }
        selectedSet.add(idx);
        btn.classList.add("selected");
      }

      resetFeedback();
      checkAnswerBtn.disabled = selectedSet.size < minSelections;
    });

    attachCrossOutHandlers(btn);


    list.appendChild(btn);
  });

  questionOptionsEl.appendChild(list);

checkAnswerBtn.onclick = () => {
  if (answered) return;

  const minSelections = q.minSelections || 1;
  if (selectedSet.size < minSelections) {
    setFeedback(
      `Select at least ${minSelections} answer${minSelections > 1 ? "s" : ""} before checking.`,
      false
    );
    return;
  }

  answered = true;
  markQuestionAnswered();

  const correctSet = new Set(q.correctIndices);
  const buttons = list.querySelectorAll(".choice-btn");

  buttons.forEach((b) => {
    const idx = Number(b.dataset.index);
    const isSelected = selectedSet.has(idx);
    const isCorrect = correctSet.has(idx);

    if (isCorrect) {
      b.classList.add("correct");
    }
    if (isSelected && !isCorrect) {
      b.classList.add("incorrect");
    }
    b.disabled = true;
  });

  const allCorrectSelected =
    [...correctSet].every((idx) => selectedSet.has(idx)) &&
    [...selectedSet].every((idx) => correctSet.has(idx));

  if (allCorrectSelected) {
    setFeedback("Great job! You selected all the correct statements.", true);
    fireCorrectAnswerConfetti(); 
  } else {
    setFeedback(
      "Some of your choices are off. Revisit the passage and think about the author’s point of view.",
      false
    );
  }

onQuestionAnsweredResult(allCorrectSelected);

  // 🔹 REPORTING HOOK
  logQuestionResult(q, {
    isCorrect: allCorrectSelected,
    selectedIndices: [...selectedSet],
    correctIndices: [...correctSet]
  });

  checkAnswerBtn.disabled = true;
  nextQuestionBtn.disabled = false;
};

}
// ====== TYPE: ORDER (Chronological) ======
function renderOrder(q) {
  const list = document.createElement("div");
  list.className = "order-list";

  q.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "order-item";
    row.draggable = true;
    row.dataset.id = item.id;

    const handle = document.createElement("span");
    handle.className = "order-item-handle";
    handle.textContent = "⋮⋮";

    const textSpan = document.createElement("span");
    textSpan.textContent = item.text;

    row.appendChild(handle);
    row.appendChild(textSpan);
    list.appendChild(row);
  });

  questionOptionsEl.appendChild(list);

  let dragSrcEl = null;

  list.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (!target.classList.contains("order-item") || answered) return;
    dragSrcEl = target;
    target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  list.addEventListener("dragend", (e) => {
    const target = e.target;
    if (target.classList.contains("order-item")) {
      target.classList.remove("dragging");
    }
  });

  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (answered) return;
    const dragging = list.querySelector(".dragging");
    const afterElement = getDragAfterElement(list, e.clientY);
    if (!dragging) return;
    if (afterElement == null) {
      list.appendChild(dragging);
    } else {
      list.insertBefore(dragging, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [
      ...container.querySelectorAll(".order-item:not(.dragging)")
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  checkAnswerBtn.disabled = false;

  checkAnswerBtn.onclick = () => {
    if (answered) return;

    answered = true;
    markQuestionAnswered();

    const items = [...list.querySelectorAll(".order-item")];
    const currentOrder = items.map((el) => el.dataset.id);

    // Freeze drag + clear old visual states
    items.forEach((el) => {
      el.draggable = false;
      el.classList.remove("dragging", "drag-over", "correct", "incorrect");
    });

    let allCorrect = true;
    items.forEach((el, idx) => {
      const id = currentOrder[idx];
      const correctId = q.correctOrder[idx];
      if (id === correctId) {
        el.classList.add("correct");
      } else {
        el.classList.add("incorrect");
        allCorrect = false;
      }
    });

    if (allCorrect) {
      setFeedback("Yes! You placed all the events in the correct order.", true);
      fireCorrectAnswerConfetti(); 
    } else {
      setFeedback(
        "Some events are out of order. Use the passage to double-check the sequence.",
        false
      );
    }
onQuestionAnsweredResult(allCorrect);

    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect: allCorrect,
      currentOrder,
      correctOrder: q.correctOrder.slice()
    });

    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== TYPE: MATCH ======
function renderMatch(q) {
  const layout = document.createElement("div");
  layout.className = "match-layout";

  const rowsContainer = document.createElement("div");
  rowsContainer.className = "match-rows";

  const bank = document.createElement("div");
  bank.className = "match-bank";
  bank.dataset.bank = "true";

  // Create chips
  q.right.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "match-chip";
    chip.draggable = true;
    chip.dataset.id = item.id;
    chip.textContent = item.text;
    bank.appendChild(chip);
  });

  // Create rows with drop zones
  q.left.forEach((item) => {
    const row = document.createElement("div");
    row.className = "match-row";

    const leftCell = document.createElement("div");
    leftCell.className = "match-left";
    leftCell.textContent = item.text;

    const dropZone = document.createElement("div");
    dropZone.className = "match-drop";
    dropZone.dataset.leftId = item.id;

    row.appendChild(leftCell);
    row.appendChild(dropZone);
    rowsContainer.appendChild(row);
  });

  layout.appendChild(rowsContainer);
  layout.appendChild(bank);
  questionOptionsEl.appendChild(layout);

  let draggedChip = null;

  function handleDragStart(e) {
    if (!e.target.classList.contains("match-chip") || answered) return;
    draggedChip = e.target;
    draggedChip.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd(e) {
    if (draggedChip) {
      draggedChip.classList.remove("dragging");
      draggedChip = null;
    }
  }

  function handleDragOver(e) {
    if (!draggedChip || answered) return;
    e.preventDefault();
  }

  function handleDropZoneDrop(e) {
    if (!draggedChip || answered) return;
    e.preventDefault();
    const dropZone = e.currentTarget;

    // If dropZone already has a chip, move that one back to the bank
    if (dropZone.firstElementChild) {
      bank.appendChild(dropZone.firstElementChild);
    }

    dropZone.appendChild(draggedChip);
    dropZone.classList.add("filled");
  }

  function handleBankDrop(e) {
    if (!draggedChip || answered) return;
    e.preventDefault();
    bank.appendChild(draggedChip);
  }

  // Listeners
  questionOptionsEl.addEventListener("dragstart", handleDragStart);
  questionOptionsEl.addEventListener("dragend", handleDragEnd);

  const dropZones = questionOptionsEl.querySelectorAll(".match-drop");
  dropZones.forEach((dz) => {
    dz.addEventListener("dragover", handleDragOver);
    dz.addEventListener("drop", handleDropZoneDrop);
  });

  bank.addEventListener("dragover", handleDragOver);
  bank.addEventListener("drop", handleBankDrop);

  checkAnswerBtn.disabled = false;

  checkAnswerBtn.onclick = () => {
    if (answered) return;
    answered = true;
  markQuestionAnswered();
    dropZones.forEach((dz) => {
      const leftId = dz.dataset.leftId;
      const correctRightId = q.pairs[leftId];
      const chip = dz.firstElementChild;

      dz.classList.remove("correct", "incorrect");

      if (!chip) {
        dz.classList.add("incorrect");
        return;
      }

      const chosenId = chip.dataset.id;
      if (chosenId === correctRightId) {
        dz.classList.add("correct");
      } else {
        dz.classList.add("incorrect");
      }
    });

    const allCorrect = [...dropZones].every((dz) =>
      dz.classList.contains("correct")
    );

    if (allCorrect) {
      setFeedback("Awesome! All your matches are correct.", true);
      fireCorrectAnswerConfetti(); 
    } else {
      setFeedback("Some matches are not correct yet. Recheck how each description fits the term.", false);
    }
// Build a mapping of leftId -> chosen rightId (or null)
const mapping = {};
dropZones.forEach((dz) => {
  const leftId = dz.dataset.leftId;
  const chip = dz.firstElementChild;
  mapping[leftId] = chip ? chip.dataset.id : null;
});

onQuestionAnsweredResult(allCorrect);

// 🔹 REPORTING HOOK
logQuestionResult(q, {
  isCorrect: allCorrect,
  pairs: mapping
});

    // Disable further dragging
    const allChips = questionOptionsEl.querySelectorAll(".match-chip");
    allChips.forEach((chip) => (chip.draggable = false));

    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}

// ====== TYPE: CLASSIFY (Table Sorting) ======
function renderClassify(q) {
  const layout = document.createElement("div");
  layout.className = "classify-layout";

  // Bank of unsorted items
  const bank = document.createElement("div");
  bank.className = "classify-bank";
  bank.dataset.role = "bank";

  q.items.forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "classify-chip";
    chip.draggable = true;
    chip.dataset.id = item.id;
    chip.textContent = item.text;
    bank.appendChild(chip);
  });

  // Columns for categories
  const columnsWrapper = document.createElement("div");
  columnsWrapper.className = "classify-columns";

  q.categories.forEach((cat) => {
    const col = document.createElement("div");
    col.className = "classify-column";
    col.dataset.categoryId = cat.id;

    const header = document.createElement("div");
    header.className = "classify-column-header";
    header.textContent = cat.label;

    const dropZone = document.createElement("div");
    dropZone.className = "classify-dropzone";
    dropZone.dataset.categoryId = cat.id;

    col.appendChild(header);
    col.appendChild(dropZone);
    columnsWrapper.appendChild(col);
  });

  layout.appendChild(bank);
  layout.appendChild(columnsWrapper);
  questionOptionsEl.appendChild(layout);

  let draggedChip = null;

  // Drag behavior (delegated on layout)
  layout.addEventListener("dragstart", (e) => {
    const target = e.target;
    if (!target.classList.contains("classify-chip") || answered) return;
    draggedChip = target;
    draggedChip.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });

  layout.addEventListener("dragend", () => {
    if (draggedChip) {
      draggedChip.classList.remove("dragging");
      draggedChip = null;
      if (!answered) {
        updateCheckButtonState();
      }
    }
  });

  const dropZones = layout.querySelectorAll(".classify-dropzone, .classify-bank");

  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      if (!draggedChip || answered) return;
      e.preventDefault();
    });

    zone.addEventListener("drop", (e) => {
      if (!draggedChip || answered) return;
      e.preventDefault();
      zone.appendChild(draggedChip);
      if (!answered) {
        resetFeedback();
        updateCheckButtonState();
      }
    });
  });

  checkAnswerBtn.disabled = true;

  function updateCheckButtonState() {
    const chipsInBank = bank.querySelectorAll(".classify-chip");
    // Require students to sort all chips out of the bank before checking
    checkAnswerBtn.disabled = chipsInBank.length > 0;
  }

  checkAnswerBtn.onclick = () => {
    if (answered) return;

    const chipsInBank = bank.querySelectorAll(".classify-chip");
    if (chipsInBank.length > 0) {
      setFeedback(
        "Sort all of the details into a category before checking.",
        false
      );
      return;
    }

    answered = true;
    markQuestionAnswered();

    const correctMap = {};
    q.items.forEach((item) => {
      correctMap[item.id] = item.categoryId;
    });

    let allCorrect = true;

    const categoryDropZones = layout.querySelectorAll(".classify-dropzone");

    categoryDropZones.forEach((zone) => {
      const zoneCatId = zone.dataset.categoryId;
      const chips = zone.querySelectorAll(".classify-chip");

      chips.forEach((chip) => {
        const itemId = chip.dataset.id;
        const correctCatId = correctMap[itemId];

        chip.classList.remove("correct", "incorrect");

        if (correctCatId === zoneCatId) {
          chip.classList.add("correct");
        } else {
          chip.classList.add("incorrect");
          allCorrect = false;
        }
      });
    });

    if (allCorrect) {
      setFeedback(
        "Awesome sorting! Each detail is in the correct category.",
        true
      );
      fireCorrectAnswerConfetti(); 
    } else {
      setFeedback(
        "Some details are in the wrong category. Reread the passage and think about what each statement mainly supports.",
        false
      );
    }

    // Build placements for reporting
    const placements = {};
    q.items.forEach((item) => {
      const chip = layout.querySelector(`.classify-chip[data-id="${item.id}"]`);
      if (!chip) {
        placements[item.id] = null;
        return;
      }
      const parentZone = chip.closest(".classify-dropzone");
      placements[item.id] = parentZone ? parentZone.dataset.categoryId : null;
    });

    onQuestionAnsweredResult(allCorrect);

    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect: allCorrect,
      placements,
      correctMap
    });

    // Disable further dragging
    const allChips = layout.querySelectorAll(".classify-chip");
    allChips.forEach((chip) => (chip.draggable = false));

    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== TYPE: HIGHLIGHT ======
function renderHighlight(q) {
  const block = document.createElement("div");
  block.className = "highlight-block paragraph-mode";

  const para = document.createElement("p");
  para.className = "highlight-paragraph";

  const selectedSet = new Set();

  q.sentences.forEach((sent, index) => {
    const span = document.createElement("span");
    span.className = "highlight-sentence";
    span.dataset.id = sent.id;
    span.textContent = sent.text;

    // Add a space after each sentence except maybe the last
    if (index < q.sentences.length - 1) {
      span.textContent += " ";
    }

    span.addEventListener("click", () => {
      if (answered) return;

      if (selectedSet.has(sent.id)) {
        selectedSet.delete(sent.id);
        span.classList.remove("selected");
      } else {
        selectedSet.add(sent.id);
        span.classList.add("selected");
      }
      resetFeedback();
      checkAnswerBtn.disabled = selectedSet.size === 0;
    });

    para.appendChild(span);
  });

  block.appendChild(para);
  questionOptionsEl.appendChild(block);
  checkAnswerBtn.disabled = true;

  checkAnswerBtn.onclick = () => {
    if (answered) return;
    if (selectedSet.size === 0) {
      setFeedback("Click at least one sentence before checking.", false);
      return;
    }

    answered = true;
    markQuestionAnswered();

    const correctIds = new Set(q.sentences.filter((s) => s.correct).map((s) => s.id));
    const sentenceEls = block.querySelectorAll(".highlight-sentence");

    let allCorrect = true;

    sentenceEls.forEach((el) => {
      const id = el.dataset.id;
      const isCorrect = correctIds.has(id);
      const isSelected = selectedSet.has(id);

      el.classList.remove("selected", "correct", "incorrect");

      if (isCorrect && isSelected) {
        el.classList.add("correct");
      } else if (!isCorrect && isSelected) {
        el.classList.add("incorrect");
        allCorrect = false;
      } else if (isCorrect && !isSelected) {
        // A correct sentence was missed
        allCorrect = false;
      }
    });

    if (allCorrect) {
      setFeedback("You highlighted the correct evidence. Nice close reading!", true);
      fireCorrectAnswerConfetti(); 
    } else {
      setFeedback("Some evidence is missing or incorrect. Reread and think about which sentences show feelings or opinions.", false);
    }
    onQuestionAnsweredResult(allCorrect);
    logQuestionResult(q, {
      isCorrect: allCorrect,
      selectedSentenceIds: Array.from(selectedSet)
    });
    
    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}

// ====== TYPE: DROPDOWN (Inline Choice / Replacement) ======
function renderDropdown(q) {
  const block = document.createElement("div");
  block.className = "dropdown-block";

  const para = document.createElement("p");
  para.className = "dropdown-sentence";

  const beforeSpan = document.createElement("span");
  beforeSpan.textContent = q.sentenceParts[0] || "";

  const select = document.createElement("select");
  select.className = "dropdown-select";

  // Default placeholder option
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "— Select an answer —";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  q.options.forEach((optText, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = optText;
    select.appendChild(opt);
  });

  const afterSpan = document.createElement("span");
  afterSpan.textContent = q.sentenceParts[1] || "";

  para.appendChild(beforeSpan);
  para.appendChild(select);
  para.appendChild(afterSpan);

  block.appendChild(para);
  questionOptionsEl.appendChild(block);

  let selectedIndex = null;
  checkAnswerBtn.disabled = true;

  select.addEventListener("change", () => {
    if (answered) return;
    const value = select.value;

    if (value === "") {
      selectedIndex = null;
      checkAnswerBtn.disabled = true;
    } else {
      selectedIndex = Number(value);
      checkAnswerBtn.disabled = false;
    }

    // Clear old feedback + classes while they're choosing
    resetFeedback();
    select.classList.remove("correct", "incorrect");
  });

  checkAnswerBtn.onclick = () => {
    if (answered) return;
    if (selectedIndex === null) {
      setFeedback("Choose an option from the dropdown before checking.", false);
      return;
    }

    answered = true;
    markQuestionAnswered();

    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) {
      select.classList.add("correct");
      setFeedback("Nice work! You chose the best replacement.", true);
      fireCorrectAnswerConfetti(); 
    } else {
      select.classList.add("incorrect");
      setFeedback(
        "Not quite. Reread the passage and think about what the author is really saying.",
        false
      );
    }
  onQuestionAnsweredResult(isCorrect);
    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect,
      selectedIndex
    });

    select.disabled = true;
    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== TYPE: PART A + PART B ======
function renderPartAB(q) {
  const block = document.createElement("div");
  block.className = "partab-block";

  // ---- Part A section ----
  const partASection = document.createElement("div");
  partASection.className = "partab-section partab-section-a";

  const partALabel = document.createElement("div");
  partALabel.className = "partab-label";
  partALabel.textContent = q.partA.label || "Part A";

  const partAStem = document.createElement("div");
  partAStem.className = "partab-stem";
  partAStem.textContent = q.partA.stem;

  const partAChoices = document.createElement("div");
  partAChoices.className = "choice-list partab-choices";

  let selectedA = null;

  q.partA.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn partab-choice-a";
    btn.dataset.index = String(index);

    const labelSpan = document.createElement("span");
    labelSpan.className = "choice-btn-label";
    labelSpan.textContent = String.fromCharCode(65 + index) + ".";

    const contentSpan = document.createElement("span");
    contentSpan.className = "choice-btn-content";
    contentSpan.textContent = optText;

    btn.appendChild(labelSpan);
    btn.appendChild(contentSpan);

    btn.addEventListener("click", (event) => {
      if (answered) return;

      if (event.shiftKey) {
        event.preventDefault();
        btn.classList.toggle("crossed-out");
        return;
      }

      selectedA = index;
      partAChoices
        .querySelectorAll(".choice-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      resetFeedback();
      updateCheckEnabled();
    });

    attachCrossOutHandlers(btn);
    partAChoices.appendChild(btn);
  });

  partASection.appendChild(partALabel);
  partASection.appendChild(partAStem);
  partASection.appendChild(partAChoices);

  // ---- Part B section ----
  const partBSection = document.createElement("div");
  partBSection.className = "partab-section partab-section-b";

  const partBLabel = document.createElement("div");
  partBLabel.className = "partab-label";
  partBLabel.textContent = q.partB.label || "Part B";

  const partBStem = document.createElement("div");
  partBStem.className = "partab-stem";
  partBStem.textContent = q.partB.stem;

  const partBChoices = document.createElement("div");
  partBChoices.className = "choice-list partab-choices";

  let selectedB = null;

  q.partB.options.forEach((optText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn partab-choice-b";
    btn.dataset.index = String(index);

    const labelSpan = document.createElement("span");
    labelSpan.className = "choice-btn-label";
    labelSpan.textContent = String.fromCharCode(65 + index) + ".";

    const contentSpan = document.createElement("span");
    contentSpan.className = "choice-btn-content";
    contentSpan.textContent = optText;

    btn.appendChild(labelSpan);
    btn.appendChild(contentSpan);

    btn.addEventListener("click", (event) => {
      if (answered) return;

      if (event.shiftKey) {
        event.preventDefault();
        btn.classList.toggle("crossed-out");
        return;
      }

      selectedB = index;
      partBChoices
        .querySelectorAll(".choice-btn")
        .forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      resetFeedback();
      updateCheckEnabled();
    });

    attachCrossOutHandlers(btn);
    partBChoices.appendChild(btn);
  });

  partBSection.appendChild(partBLabel);
  partBSection.appendChild(partBStem);
  partBSection.appendChild(partBChoices);

  // ---- Add both sections to block ----
  block.appendChild(partASection);
  block.appendChild(partBSection);
  questionOptionsEl.appendChild(block);

  // Require both parts selected before checking
  checkAnswerBtn.disabled = true;

  function updateCheckEnabled() {
    checkAnswerBtn.disabled = selectedA === null || selectedB === null;
  }

  checkAnswerBtn.onclick = () => {
    if (answered) return;
    if (selectedA === null || selectedB === null) {
      setFeedback("Answer both Part A and Part B before checking.", false);
      return;
    }

    answered = true;
    markQuestionAnswered();

    const buttonsA = partAChoices.querySelectorAll(".choice-btn");
    const buttonsB = partBChoices.querySelectorAll(".choice-btn");

    // Mark Part A
    buttonsA.forEach((b) => {
      const idx = Number(b.dataset.index);
      if (idx === q.partA.correctIndex) {
        b.classList.add("correct");
      }
      if (idx === selectedA && idx !== q.partA.correctIndex) {
        b.classList.add("incorrect");
      }
      b.disabled = true;
    });

    // Mark Part B
    buttonsB.forEach((b) => {
      const idx = Number(b.dataset.index);
      if (idx === q.partB.correctIndex) {
        b.classList.add("correct");
      }
      if (idx === selectedB && idx !== q.partB.correctIndex) {
        b.classList.add("incorrect");
      }
      b.disabled = true;
    });

    const aCorrect = selectedA === q.partA.correctIndex;
    const bCorrect = selectedB === q.partB.correctIndex;

    if (aCorrect && bCorrect) {
      setFeedback(
        "Excellent! You chose the correct answer in Part A and the best supporting evidence in Part B.",
        true
      );
      fireCorrectAnswerConfetti(); 
    } else if (aCorrect && !bCorrect) {
      setFeedback(
        "You chose a strong answer for Part A, but the evidence in Part B doesn’t best support it. Revisit the passage and look for a sentence that proves your Part A choice.",
        false
      );
    } else if (!aCorrect && bCorrect) {
      setFeedback(
        "Your evidence in Part B is strong, but your Part A answer doesn’t fully match it. Reread to make sure your main idea and evidence go together.",
        false
      );
    } else {
      setFeedback(
        "Part A and Part B are both off. Reread the passage and think about the author’s main point and the sentence that proves it.",
        false
      );
    }
onQuestionAnsweredResult(aCorrect && bCorrect);
    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect: aCorrect && bCorrect,
      selectedA,
      selectedB,
      aCorrect,
      bCorrect
    });

    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}

// ====== TYPE: REVISE (Sentence Revision / Stronger Phrasing) ======
function renderRevise(q) {
  const block = document.createElement("div");
  block.className = "revise-block";

  // Original sentence (read-only)
  const original = document.createElement("div");
  original.className = "revise-row revise-original";

  const originalTag = document.createElement("span");
  originalTag.className = "revise-tag";
  originalTag.textContent = "Original:";

  const originalText = document.createElement("span");
  originalText.className = "revise-text";
  originalText.textContent = q.originalSentence;

  original.appendChild(originalTag);
  original.appendChild(originalText);

  // Edited sentence (with inline dropdown)
  const edited = document.createElement("div");
  edited.className = "revise-row revise-edited";

  const editedTag = document.createElement("span");
  editedTag.className = "revise-tag";
  editedTag.textContent = "Revised:";

  const sentenceSpan = document.createElement("span");
  sentenceSpan.className = "revise-sentence";

  const beforeSpan = document.createElement("span");
  beforeSpan.textContent = q.sentenceParts[0] || "";

  const select = document.createElement("select");
  select.className = "revise-select";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = "— choose a revision —";
  select.appendChild(placeholder);

  q.options.forEach((optText, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = optText;
    select.appendChild(opt);
  });

  const afterSpan = document.createElement("span");
  afterSpan.textContent = q.sentenceParts[1] || "";

  sentenceSpan.appendChild(beforeSpan);
  sentenceSpan.appendChild(select);
  sentenceSpan.appendChild(afterSpan);

  edited.appendChild(editedTag);
  edited.appendChild(sentenceSpan);

  block.appendChild(original);
  block.appendChild(edited);
  questionOptionsEl.appendChild(block);

  let selectedIndex = null;
  checkAnswerBtn.disabled = true;

  select.addEventListener("change", () => {
    if (answered) return;
    const value = select.value;

    if (value === "") {
      selectedIndex = null;
      checkAnswerBtn.disabled = true;
    } else {
      selectedIndex = Number(value);
      checkAnswerBtn.disabled = false;
    }

    resetFeedback();
    select.classList.remove("correct", "incorrect");
  });

  checkAnswerBtn.onclick = () => {
    if (answered) return;

    if (selectedIndex === null) {
      setFeedback("Choose a revision from the dropdown before checking.", false);
      return;
    }

    answered = true;
    markQuestionAnswered();

    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) {
      select.classList.add("correct");
      setFeedback(
        "Nice revision! Your wording is strong and matches the author’s meaning.",
        true
      );
      fireCorrectAnswerConfetti(); 
    } else {
      select.classList.add("incorrect");
      setFeedback(
        "This revision isn’t the strongest match. Think about which choice is clear, precise, and supported by the passage.",
        false
      );
    }
onQuestionAnsweredResult(isCorrect);


    // 🔹 REPORTING HOOK
    logQuestionResult(q, {
      isCorrect,
      selectedIndex
    });

    select.disabled = true;
    checkAnswerBtn.disabled = true;
    nextQuestionBtn.disabled = false;
  };
}


// ====== NAVIGATION ======
if (nextQuestionBtn) {
  nextQuestionBtn.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      // End of set
      setFeedback("You’ve reached the end of this practice set. 🎉", true);
      fireSetCompleteConfetti();
      // 🔹 REPORTING HOOK – send summary to Netlify/Google Sheet
      if (window.RP_REPORT && typeof window.RP_REPORT.sendFinalReport === "function") {
        window.RP_REPORT.sendFinalReport();
      }
    }
  });
}


// Passage tab clicks
passageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const num = tab.dataset.passage;
    setActivePassage(num);
  });
});


// Show identity modal on load if we have a session code and the trainer UI is present
if (SESSION_CODE && questionStemEl && questionOptionsEl && identityModalEl) {
  showIdentityModal();
}


// ====== THEME TOGGLE & CLEAR HIGHLIGHTS ======
(function initThemeAndHighlightControls() {
  const bodyEl = document.body;
  const themeToggleInput = document.getElementById("theme-toggle");

  if (themeToggleInput) {
    const savedTheme = localStorage.getItem("rp-theme");
    if (savedTheme === "dark") {
      bodyEl.classList.add("dark-theme");
      themeToggleInput.checked = true;
    }

    themeToggleInput.addEventListener("change", () => {
      if (themeToggleInput.checked) {
        bodyEl.classList.add("dark-theme");
        localStorage.setItem("rp-theme", "dark");
      } else {
        bodyEl.classList.remove("dark-theme");
        localStorage.setItem("rp-theme", "light");
      }
    });
  }

  const clearPassageBtn = document.getElementById("clear-passage-highlights");
  if (clearPassageBtn) {
    clearPassageBtn.addEventListener("click", () => {
      clearPassageHighlights();
    });
  }

  const clearQuestionBtn = document.getElementById("clear-question-highlights");
  if (clearQuestionBtn) {
    clearQuestionBtn.addEventListener("click", () => {
      clearQuestionHighlights();
    });
  }
})();

// ====== THEME + DYSLEXIA FONT TOGGLES ======
(function initThemeAndFontToggles() {
  const bodyEl = document.body;

  // --- Dark mode toggle ---
  const themeToggleInput = document.getElementById("theme-toggle");
  if (themeToggleInput) {
    const savedTheme = localStorage.getItem("rp-theme");
    if (savedTheme === "dark") {
      bodyEl.classList.add("dark-theme");
      themeToggleInput.checked = true;
    }

    themeToggleInput.addEventListener("change", () => {
      if (themeToggleInput.checked) {
        bodyEl.classList.add("dark-theme");
        localStorage.setItem("rp-theme", "dark");
      } else {
        bodyEl.classList.remove("dark-theme");
        localStorage.setItem("rp-theme", "light");
      }
    });
  }

  // --- Dyslexia font toggle (page-wide text) ---
  const dyslexiaToggleInput = document.getElementById("dyslexia-toggle");
  if (dyslexiaToggleInput) {
    const savedDyslexia = localStorage.getItem("rp-dyslexia-font");

    if (savedDyslexia === "on") {
      bodyEl.classList.add("dyslexia-font");
      dyslexiaToggleInput.checked = true;
    }

    dyslexiaToggleInput.addEventListener("change", () => {
      if (dyslexiaToggleInput.checked) {
        bodyEl.classList.add("dyslexia-font");
        localStorage.setItem("rp-dyslexia-font", "on");
      } else {
        bodyEl.classList.remove("dyslexia-font");
        localStorage.setItem("rp-dyslexia-font", "off");
      }
    });
  }
})();

// ---- RESTORE FROM LOCAL AUTOSAVE (same browser) ----
function tryLoadLocalAutosaveForGoogleUser(sessionCode, user) {
  if (!sessionCode || !user || !user.sub) return null;

  try {
    const studentKey = `google-${user.sub}`;
    const localKey = `rp_progress_${sessionCode}_${studentKey}`;
    const raw = localStorage.getItem(localKey);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    console.log("[RP] Found local autosave for session/user:", {
      sessionCode,
      studentKey,
      answeredCount: Array.isArray(payload.questionResults)
        ? payload.questionResults.length
        : 0
    });
    return payload;
  } catch (e) {
    console.warn("[RP] Failed to read local autosave:", e);
    return null;
  }
}
function applyResumeFromAutosave(payload) {
  if (!payload) return;

  // Use the last saved question index, or 0 as a fallback
  const savedIndex =
    typeof payload.currentQuestionIndex === "number"
      ? payload.currentQuestionIndex
      : 0;

  // Clamp just in case
  currentQuestionIndex = Math.min(
    Math.max(savedIndex, 0),
    Math.max(questions.length - 1, 0)
  );

  // For now, we only resume "where you left off":
  // - We do NOT try to reconstruct every past answer in the UI.
  // - We may later extend this to re-mark answered questions using payload.questionResults.

  console.log("[RP] Resuming trainer at question index:", currentQuestionIndex);
  if (questionStemEl && questionOptionsEl) {
    renderQuestion();
  }

  // Optional: Update the progress bar based on how many results existed.
  try {
    if (Array.isArray(payload.questionResults)) {
      const answeredCount = payload.questionResults.length;
      answeredQuestions = answeredQuestions.map((_, idx) => idx < answeredCount);
      updateQuestionNavStrip();
      updateProgressBar();
    }
  } catch (e) {
    console.warn("[RP] Could not rebuild progress from autosave:", e);
  }
}

// ====== PROGRESS AUTOSAVE ======

// Build a stable key so each student (name + class + session)
// gets their own row in the live monitor.
function getStudentKey() {
  // If they're signed in with Google, keep using the Google sub.
  const user =
    window.RP_AUTH &&
    (typeof RP_AUTH.getCurrentUser === "function"
      ? RP_AUTH.getCurrentUser()
      : RP_AUTH.currentUser);

  if (user && user.sub) {
    return `google-${user.sub}`;
  }

  // Otherwise, derive the key from session info: session + class + name
  try {
    if (window.RP_REPORT && RP_REPORT._debugGetState) {
      const state = RP_REPORT._debugGetState();
      const info = state.sessionInfo || {};

      const safe = (value, fallback) =>
        (value || fallback)
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[^\w]+/g, "_");

      const session = safe(info.sessionCode, "nosession");
      const name = safe(info.studentName, "noname");
      const cls = safe(info.classCode, "noclass");

      // Example: sess_new_test__class_6a__name_maya_j
      return `sess_${session}__class_${cls}__name_${name}`;
    }
  } catch (e) {
    console.warn(
      "[RP] Failed to build name-based studentKey, falling back to anon id",
      e
    );
  }

  // Final fallback: old anon-id behavior, just in case sessionInfo isn't set.
  const KEY = "rp_anon_id";
  try {
    let anon = localStorage.getItem(KEY);
    if (!anon) {
      anon = "anon-" + Math.random().toString(36).slice(2);
      localStorage.setItem(KEY, anon);
    }
    return anon;
  } catch (_) {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}



// Simple debounce so we don't spam the server
function debounce(fn, delay) {
  let timeoutId = null;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function getOwnerEmailFallback() {
  try {
    const p = new URLSearchParams(location.search);
    return (p.get("ownerEmail") || p.get("owner") || p.get("teacherEmail") || "").trim();
  } catch (e) {
    return "";
  }
}

// Called after any question is checked
async function autosaveProgress() {
  if (!window.RP_REPORT || !RP_REPORT._debugGetState) return;

  const state = RP_REPORT._debugGetState();
  const info = state.sessionInfo || {};
  const sessionCode = (info.sessionCode || "").trim();
  if (!sessionCode) return;

  const studentKey = getStudentKey();

  // ✅ This MUST resolve to the teacher who owns the session
  const ownerEmail = (info.ownerEmail || window.RP_OWNER_EMAIL || getOwnerEmailFallback() || "").trim();

  const payload = {
    // who + session
    studentKey,
    sessionCode,
    studentName: info.studentName || "",
    classCode: info.classCode || "",
    assessmentName: info.assessmentName || "",
    ownerEmail,

    // progress
    startedAt: state.startedAt,
    lastSavedAt: new Date().toISOString(),
    currentQuestionIndex: typeof currentQuestionIndex === "number" ? currentQuestionIndex : null,
    questionResults: state.questionResults || [],

    // lightweight summary so the backend can log partial attempts
    totalQuestions:
      (typeof window !== "undefined" && window.RP_TOTAL_QUESTIONS != null)
        ? Number(window.RP_TOTAL_QUESTIONS) || 0
        : (Array.isArray(state.questionResults) ? state.questionResults.length : 0),

    answeredCount: Array.isArray(state.questionResults) ? state.questionResults.length : 0,
    numCorrect: Array.isArray(state.questionResults)
      ? state.questionResults.filter((r) => r && r.isCorrect).length
      : 0,

    // optional Google user info (student)
    user: (window.RP_AUTH && RP_AUTH.currentUser)
      ? {
          email: RP_AUTH.currentUser.email,
          name: RP_AUTH.currentUser.name,
          sub: RP_AUTH.currentUser.sub,
        }
      : null,
  };

  // Local fallback
  try {
    const localKey = `rp_progress_${sessionCode}_${studentKey}`;
    localStorage.setItem(localKey, JSON.stringify(payload));
  } catch (e) {
    console.warn("[RP] Unable to save progress locally:", e);
  }

  // Server copy (Netlify function)
  try {
    await fetch("/.netlify/functions/saveReadingProgress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn("[RP] Autosave to server failed (will retry later).", e);
  }
}


if (sasquatchHelperEl) {
  sasquatchHelperEl.addEventListener("click", () => {
    setFeedback("Squatch says: Keep going, you’re doing great! 🐾", true);
  });
}

// Debounced wrapper used by reporting.js
window.RP_AUTOSAVE_PROGRESS = debounce(autosaveProgress, 2000);

// Boot once the level bundle is ready
window.addEventListener("reading-level:ready", (e) => {
  configureLevelAndQuestions(e.detail);
});

// Safety fallback: if some page still loads a level bundle directly (without event)
if (window.READING_LEVEL && typeof window.READING_LEVEL === "object") {
  configureLevelAndQuestions(window.READING_LEVEL);
} else {
  // Helpful log so we know the student page is waiting correctly
  console.log("[RP] Waiting for reading-level:ready ...");
}

// ===============================
// AUTH BOOT (student page)
// This is the ONLY place we init auth on this page.
// ===============================
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // If auth hasn't loaded yet, wait briefly (GIS script is async/defer)
  let tries = 0;
  const maxTries = 30; // ~3s total

  const tick = () => {
    tries++;

    if (window.RP_AUTH && typeof window.RP_AUTH.initGoogleAuth === "function") {
      // 1) Wire listeners FIRST so we don't miss the first auth change event
      wireStudentAuth();

      // 1.5) Wire cached-user buttons (if present)
      wireCachedUserButtons();

      // 2) Init google auth (renders button / restores state depending on your auth file)
      window.RP_AUTH.initGoogleAuth();

      // 3) If the identity modal is already visible on load, show cached option
      showCachedUserOptionIfExists();

      return;
    }

    if (tries < maxTries) {
      setTimeout(tick, 100);
    } else {
      console.warn("[RP] RP_AUTH not ready after waiting. Google sign-in may be unavailable.");
    }
  };

  tick();
});

// ===============================
// Cached-user UI helpers (drop-in)
// ===============================

function wireCachedUserButtons() {
  const useCachedBtn = document.getElementById("rp-use-cached-user");
  const clearCachedBtn = document.getElementById("rp-clear-cached-user");

  if (useCachedBtn) {
    useCachedBtn.addEventListener("click", () => {
      if (window.RP_AUTH) {
        RP_AUTH.promptSignIn(); // explicit restore will adopt cached user
      }
    });
  }

  if (clearCachedBtn) {
    clearCachedBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem("rp_last_google_user");
      } catch (e) {}

      if (window.RP_AUTH) {
        RP_AUTH.signOut();
      }

      location.reload(); // clean slate
    });
  }
}

function showCachedUserOptionIfExists() {
  const box = document.getElementById("rp-cached-user-box");
  const label = document.getElementById("rp-cached-user-label");

  if (!box || !label) return;

  let cached = null;
  try {
    cached = JSON.parse(localStorage.getItem("rp_last_google_user"));
  } catch (e) {}

  if (cached && cached.email) {
    label.textContent = `Continue as ${cached.email}?`;
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }
}


//script end