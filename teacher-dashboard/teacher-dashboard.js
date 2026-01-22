// teacher-dashboard.js
// UI for viewing reading practice attempts by session / class,
// with a left sidebar session-history panel and a CSV export
// (one row per student × skill).

// Keeps track of the *currently displayed* attempts for CSV export
let CURRENT_ATTEMPTS = [];
// Which student's data is being overlaid on the charts (if any)
let CURRENT_STUDENT_FOR_CHARTS = null;

// All attempts (owned + shared) hydrated for this teacher across sessions.
// Used so the Student Detail progress chart can show growth over time.
let ALL_VIEWER_ATTEMPTS = [];

// ---- Live Monitor shared state ----
let currentSessionCode = "";   // e.g. "MONDAY EVENING"
let currentClassFilter = "";   // e.g. "7TH", or "" for all
let currentSetParam = "full";  // "full" or "mini1" or "mini2"
let currentLevelParam = "on"; // "on" | "below" | "above"


// ---------- HISTORY STORAGE KEY ----------
const HISTORY_KEY = "rp_teacherSessionHistory_v1";

// ---------- DOM HOOKS ----------
const sessionInput = document.getElementById("filter-session");
const classInput = document.getElementById("filter-class");
const loadBtn = document.getElementById("load-attempts-btn");
const loadStatusEl = document.getElementById("load-status");
const sessionPill = document.getElementById("current-session-pill");

// New: starting sessions + link & copy
const sessionLinkInput = document.getElementById("current-session-link");
const copySessionLinkBtn = document.getElementById("copy-session-link-btn");
const copyLinkStatusEl = document.getElementById("copy-link-status");
const coTeacherLinkInput = document.getElementById("co-teacher-dashboard-link");
const copyCoTeacherLinkBtn = document.getElementById("copy-co-teacher-link-btn");
const copyCoTeacherStatusEl = document.getElementById("copy-co-teacher-status");

// One CSV button
const downloadCsvBtn = document.getElementById("download-csv");
const monitorSessionBtn = document.getElementById("monitor-session-btn");

// Filters / view summary / overlay
const clearFiltersBtn = document.getElementById("clear-filters-btn");
const clearStudentOverlayBtn = document.getElementById("clear-student-overlay-btn");
const currentViewSummaryEl = document.getElementById("current-view-summary");

// Export PDF
const exportPdfBtn = document.getElementById("export-pdf-btn");

// Session tags
const mostMissedSkillEl = document.getElementById("summary-most-missed-skill");
const mostMissedTypeEl = document.getElementById("summary-most-missed-type");

// Student detail drawer
const studentDetailPanel = document.getElementById("student-detail-panel");
const studentDetailCloseBtn = document.getElementById("student-detail-close");
const studentDetailNameEl = document.getElementById("student-detail-name");
const studentDetailOverallEl = document.getElementById("student-detail-overall");
const studentDetailAttemptsEl = document.getElementById("student-detail-attempts");
const studentDetailNeedsWorkEl = document.getElementById("student-detail-needs-work");
const studentDetailStrengthsEl = document.getElementById("student-detail-strengths");

// Selected student's full attempt (question-by-question) panel
const attemptQnPanel = document.querySelector(".student-attempt-detail-panel");
const attemptQnSubtitleEl = document.getElementById("student-attempt-detail-subtitle");
const attemptQnBodyEl = document.getElementById("student-attempt-detail");

// Tracks the last loaded full attempt (future-friendly)
let CURRENT_ATTEMPT_DETAIL = null;


// Heat map
const heatmapHeadEl = document.getElementById("skill-heatmap-head");
const heatmapBodyEl = document.getElementById("skill-heatmap-body");

// Summary DOM
const totalAttemptsEl = document.getElementById("summary-total-attempts");
const uniqueStudentsEl = document.getElementById("summary-unique-students");
const summaryAccuracyEl = document.getElementById("summary-accuracy");
const summaryCorrectTallyEl = document.getElementById("summary-correct-tally");
const summaryAvgQuestionsEl = document.getElementById("summary-avg-questions");
const summaryAvgCorrectEl = document.getElementById("summary-avg-correct");

const attemptsSubtitleEl = document.getElementById("attempts-subtitle");
const attemptsTableBody = document.getElementById("attempts-table-body");
const skillsTableBody = document.getElementById("skills-table-body");

let scoreBandsChart = null;
let typeAccuracyChart = null;
let skillAccuracyChart = null;
let studentProgressChart = null;

// Sidebar DOM
const historySidebar = document.getElementById("history-sidebar");
const historyToggleBtn = document.getElementById("history-sidebar-toggle");
const historyListEl = document.getElementById("history-list");

//  student search controls
const studentSearchInput = document.getElementById("student-search-input");
const studentSearchBtn = document.getElementById("student-search-btn");
const studentSearchResultsEl = document.getElementById("student-search-results");

// We'll use this to focus the student after loadAttempts() runs
let PENDING_STUDENT_FOCUS_NAME = null;

// history customization controls
const historyRenameBtn = document.getElementById("history-rename-btn");
const historyColorBtn = document.getElementById("history-color-btn");
const historyDeleteBtn = document.getElementById("history-delete-btn");

// Key format "SESSIONCODE||CLASSCODE"
let CURRENT_HISTORY_KEY = null;

// Expanded color cycle for session labels
const HISTORY_COLOR_SEQUENCE = [
  "",        // default / none
  "teal",
  "pink",
  "gold",
  "purple",
  "blue",
  "green",
  "orange",
  "red",
  "indigo",
  "mint",
  "slate"
];

// Auth DOM
const teacherSignInBtn = document.getElementById("teacher-signin-btn");
const teacherSignOutBtn = document.getElementById("teacher-signout-btn");

let teacherUser = null;

// NEW: which teacher actually OWNS the data we’re viewing.
// - For the main teacher: usually their own email.
// - For co-teachers: comes from ?owner= in the dashboard link.
let OWNER_EMAIL_FOR_VIEW = null;
let OWNER_EMAIL_FROM_URL = false;
let _historyHydrateInFlight = null;
let _historyHydrateEmail = "";


// ---------- UTILITIES ----------
function normalizeSetParam(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "mini") return "mini1"; // legacy support
  if (v === "full" || v === "mini1" || v === "mini2") return v;
  return "full";
}

function getSelectedPracticeSet() {
  const sel = document.getElementById("practice-set");
  if (sel && sel.value) return normalizeSetParam(sel.value);
  return normalizeSetParam(currentSetParam || "full");
}

// ---------- ATTEMPT DEDUPE HELPER (FIRST ATTEMPT PER STUDENT) ----------
function getFirstAttemptsPerStudent(attempts) {
  if (!Array.isArray(attempts) || !attempts.length) return [];

  // Sort by timestamp so "first" is truly the earliest run
  const sorted = attempts.slice().sort((a, b) => {
    const aTime =
      a.finishedAt || a.startedAt || a.createdAt || a.completedAt || "";
    const bTime =
      b.finishedAt || b.startedAt || b.createdAt || b.completedAt || "";

    if (aTime && bTime) {
      if (aTime < bTime) return -1;
      if (aTime > bTime) return 1;
    }
    return 0;
  });

  const perStudent = new Map();
  const noKeyAttempts = [];

  for (const a of sorted) {
    const rawId = (a.studentId || "").toString().trim();
    const rawName = (a.studentName || "").trim();
    const key = (rawId || rawName).toLowerCase();

    if (!key) {
      // No reliable identity → include it, but don't dedupe
      noKeyAttempts.push(a);
      continue;
    }

    // Only keep the FIRST attempt we see for this student
    if (!perStudent.has(key)) {
      perStudent.set(key, a);
    }
  }

  // Students we can identify (deduped) + anonymous attempts (all kept)
  return [...perStudent.values(), ...noKeyAttempts];
}

function formatPercent(numerator, denominator) {
  if (!denominator || denominator === 0) return "0%";
  const pct = Math.round((numerator / denominator) * 100);
  return `${pct}%`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

// ---------- ATTEMPT STATUS HELPERS ----------

// Status label: Completed vs In Progress
function formatAttemptStatus(attempt) {
  const total = Number(
    attempt.totalQuestions ??
    attempt.answeredCount ??
    0
  );

  const answered = Number(
    attempt.answeredCount != null
      ? attempt.answeredCount
      : (attempt.totalQuestions ?? 0)
  );

  if (!answered) {
    // They opened it but haven't checked anything yet
    return "Not started";
  }

  // Treat either isComplete=true OR answered >= total as completed
  if (
    attempt.isComplete ||
    (total > 0 && answered >= total)
  ) {
    return "Completed";
  }

  if (total > 0 && answered < total) {
    return "In progress";
  }

  // Fallback if we can't tell
  return "Partial";
}

// Answered label: "X of Y" + hint if partial
function formatAnsweredLabel(attempt) {
  const total = Number(
    attempt.totalQuestions ??
    attempt.answeredCount ??
    0
  );

  const answered = Number(
    attempt.answeredCount != null
      ? attempt.answeredCount
      : (attempt.totalQuestions ?? 0)
  );

  if (!total && !answered) return "—";

  if (total > 0) {
    if (answered < total) {
      return `${answered} of ${total} (partial)`;
    }
    return `${answered} of ${total}`;
  }

  // Older data that only had answeredCount
  return `${answered} answered`;
}

function updateViewSummary() {
  if (!currentViewSummaryEl) return;

  const sessionCodeRaw = sessionInput.value.trim();
  const classCodeRaw = classInput.value.trim();

  const sessionPart = sessionCodeRaw
    ? `Session: ${sessionCodeRaw}`
    : "Session: all sessions";

  const classPart = classCodeRaw
    ? `Class: ${classCodeRaw}`
    : "Class: all classes";

  let studentPart;
  if (CURRENT_STUDENT_FOR_CHARTS) {
    studentPart = `Student overlay: ${CURRENT_STUDENT_FOR_CHARTS}`;
  } else {
    studentPart = "Student overlay: none (click a row to compare)";
  }

  currentViewSummaryEl.textContent = `${sessionPart} · ${classPart} · ${studentPart}`;
}


function accuracyTagClass(pct) {
  if (pct < 40) return "tag tag-low";
  if (pct < 70) return "tag tag-mid";
  return "tag";
}
// ---------- attempt helpers (Q-by-Q panel on main dashboard) ----------
function clearAttemptQnPanel() {
  if (!attemptQnBodyEl || !attemptQnSubtitleEl) return;

  attemptQnBodyEl.innerHTML = `
    <p class="muted small">
      Click a row in the Student Attempts table to see their answers
      and the correct answers.
    </p>
  `;
  attemptQnSubtitleEl.textContent =
    "Click a row in the Student Attempts table to see their answers and the correct answers.";

  CURRENT_ATTEMPT_DETAIL = null;
}

// Clear the Q-by-Q attempt panel (button in the "Selected student’s full attempt" panel)
(function wireAttemptDetailClear() {
  const btn = document.getElementById("clear-student-detail-btn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    clearAttemptQnPanel();
  });
})();


async function loadAttemptQnPanel(attemptSummary) {
  if (!attemptQnBodyEl) return;

  if (!attemptSummary || !attemptSummary.attemptId) {
    clearAttemptQnPanel();
    return;
  }

  // Temporary loading state
  attemptQnBodyEl.innerHTML = `
    <p class="muted small">Loading full attempt…</p>
  `;

  try {
    const params = new URLSearchParams();
    params.set("attemptId", attemptSummary.attemptId);

    // Same scoping rules as loadAttempts() / loadStudentSearch
    const ownerEmail = OWNER_EMAIL_FOR_VIEW || "";
    const isCoTeacherView =
      ownerEmail && (!teacherUser || teacherUser.email !== ownerEmail);

    if (isCoTeacherView && ownerEmail) {
      params.set("ownerEmail", ownerEmail);
    } else if (teacherUser && teacherUser.email) {
      params.set("viewerEmail", teacherUser.email);
    } else if (ownerEmail) {
      params.set("ownerEmail", ownerEmail);
    }

    const res = await fetch(
      `/.netlify/functions/getReadingAttemptDetail?${params.toString()}`,
      {
        method: "GET",
        headers: { Accept: "application/json" }
      }
    );

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const json = await res.json();
    if (!json || !json.success || !json.attempt) {
      throw new Error("No attempt detail returned from server");
    }

    CURRENT_ATTEMPT_DETAIL = json.attempt;
    renderAttemptQnPanel(json.attempt);
  } catch (err) {
    console.error("[Dashboard] Error loading attempt detail:", err);
    attemptQnBodyEl.innerHTML = `
      <p class="muted small">
        Sorry, we couldn’t load this attempt’s question-by-question view. Please try again.
      </p>
    `;
  }
}

function renderAttemptQnPanel(attempt) {
  if (!attemptQnBodyEl) return;

  const questions = Array.isArray(attempt.questions) ? attempt.questions : [];

  if (!questions.length) {
    attemptQnBodyEl.innerHTML = `
      <p class="muted small">
        No question-level data was logged for this attempt yet.
      </p>
    `;
    if (attemptQnSubtitleEl) {
      attemptQnSubtitleEl.textContent =
        "No question-level data was logged for this attempt yet.";
    }
    return;
  }

  const name = (attempt.studentName || "").trim() || "this student";
  const totalQ = Number(
    attempt.totalQuestions ||
    attempt.answeredCount ||
    questions.length
  );
  const numCorrect =
    typeof attempt.numCorrect === "number"
      ? attempt.numCorrect
      : questions.filter((q) => q.isCorrect).length;
  const pct = totalQ ? Math.round((numCorrect / totalQ) * 100) : null;

  if (attemptQnSubtitleEl) {
    attemptQnSubtitleEl.textContent =
      pct != null
        ? `${name} – ${numCorrect} of ${totalQ} correct (${pct}%).`
        : `${name}'s answers for this attempt.`;
  }

  attemptQnBodyEl.innerHTML = "";

  questions
    .slice()
    .sort((a, b) => {
      const aNum = a.questionNumber ?? a.questionId ?? 0;
      const bNum = b.questionNumber ?? b.questionId ?? 0;
      return aNum - bNum;
    })
    .forEach((q) => {
      const card = document.createElement("section");
      card.className = "attempt-question-card";

      if (q.isCorrect === true) {
        card.classList.add("is-correct");
      } else if (q.isCorrect === false) {
        card.classList.add("is-incorrect");
      }

      // Header – Q#, type, primary skill, passage
      const header = document.createElement("div");
      header.className = "attempt-question-header";

      const numSpan = document.createElement("span");
      numSpan.className = "attempt-q-number";
      const qNum = q.questionNumber || q.questionId;
      numSpan.textContent = qNum ? `Q${qNum}` : "Question";

      const metaSpan = document.createElement("span");
      metaSpan.className = "attempt-q-meta";

      const typeLabel = q.typeLabel || q.type || "";
      const primarySkill =
        q.skillTagPrimary ||
        (Array.isArray(q.skills) && q.skills[0]) ||
        "";
      const metaParts = [];

      if (typeLabel) metaParts.push(typeLabel);
      if (primarySkill) metaParts.push(primarySkill);
      if (q.linkedPassage) metaParts.push(`Passage ${q.linkedPassage}`);

      metaSpan.textContent = metaParts.join(" · ");

      header.appendChild(numSpan);
      header.appendChild(metaSpan);

      // Question text
      const stemP = document.createElement("p");
      stemP.className = "attempt-q-stem";
      stemP.textContent =
        q.questionText || "Question text not available for this attempt.";

      // Student answer
      const studentP = document.createElement("p");
      studentP.className = "attempt-q-student-answer";
      const studentLabel =
        q.studentAnswerText || "No answer recorded for this question.";
      studentP.innerHTML =
        `<strong>Student answer:</strong> ${studentLabel}`;

      // Correct answer
      const correctP = document.createElement("p");
      correctP.className = "attempt-q-correct-answer";
      const correctLabel =
        q.correctAnswerText ||
        (q.isCorrect
          ? "Student’s answer was correct."
          : "Correct answer not recorded.");
      correctP.innerHTML =
        `<strong>Correct answer:</strong> ${correctLabel}`;

      card.appendChild(header);
      card.appendChild(stemP);
      card.appendChild(studentP);
      card.appendChild(correctP);

      attemptQnBodyEl.appendChild(card);
    });
}


// ---------- DASHBOARD PREFERENCES ----------
const DASHBOARD_PREFS_KEY = "readingDashboardPrefs_v1";

function saveDashboardPrefs() {
  try {
    const prefs = {
      filterSession: sessionInput.value.trim(),
      filterClass: classInput.value.trim()
    };
    localStorage.setItem(DASHBOARD_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn("[Dashboard] Could not save prefs:", e);
  }
}

function loadDashboardPrefs() {
  try {
    const raw = localStorage.getItem(DASHBOARD_PREFS_KEY);
    if (!raw) return;
    const prefs = JSON.parse(raw);
    if (prefs.filterSession && !sessionInput.value) {
      sessionInput.value = prefs.filterSession;
    }
    if (prefs.filterClass && !classInput.value) {
      classInput.value = prefs.filterClass;
    }
  } catch (e) {
    console.warn("[Dashboard] Could not load prefs:", e);
  }
}
(function wirePracticeLevelSelector() {
  const levelSelect = document.getElementById("practice-level");
  if (!levelSelect) return;

  // restore last choice
  try {
    const last = window.localStorage.getItem("rp_lastLevel");
    if (last && ["on", "below", "above"].includes(last)) {
      levelSelect.value = last;
      currentLevelParam = last;
    }
  } catch (e) {}

  const refreshOutputs = () => {
    const session = (sessionInput?.value || "").trim();
    const cls = (classInput?.value || "").trim();
    if (!session) return;

    if (sessionLinkInput) sessionLinkInput.value = buildStudentLink(session, cls);
    if (coTeacherLinkInput) coTeacherLinkInput.value = buildCoTeacherLink(session, cls);

enableMonitorButton(session, cls);
if (typeof updateCurrentViewSummary === "function") updateCurrentViewSummary();

  };

  levelSelect.addEventListener("change", () => {
    currentLevelParam = levelSelect.value || "on";
    try {
      window.localStorage.setItem("rp_lastLevel", currentLevelParam);
    } catch (e) {}
    refreshOutputs();
  });
})();

// --- Practice set selector should update links + monitor immediately ---
(function wirePracticeSetSelector() {
  const setSelect = document.getElementById("practice-set");
  if (!setSelect) return;

  const persist = () => {
    try {
      // store stable values: full | mini1 | mini2
      window.localStorage.setItem("rp_lastSet", normalizeSetParam(setSelect.value));
    } catch (e) {}
  };

  const refreshOutputs = () => {
    const session = (sessionInput?.value || "").trim();
    const cls = (classInput?.value || "").trim();

    if (session) {
      const studentLink = buildStudentLink(session, cls);
      if (sessionLinkInput) sessionLinkInput.value = studentLink;

      const coLink = buildCoTeacherLink(session, cls);
      if (coTeacherLinkInput) coTeacherLinkInput.value = coLink;
    }

    enableMonitorButton(session, cls);
    if (typeof updateCurrentViewSummary === "function") updateCurrentViewSummary();
  };

  setSelect.addEventListener("change", () => {
    // keep shared state consistent (if you use it elsewhere)
    currentSetParam = normalizeSetParam(setSelect.value);

    persist();
    refreshOutputs();
  });

  // restore on load (if present) — supports legacy "mini" too
  try {
    const last = normalizeSetParam(window.localStorage.getItem("rp_lastSet"));
    setSelect.value = last;
    currentSetParam = last;
  } catch (e) {}
})();


// CSV helpers
function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function downloadCSV(filename, rows) {
  const csvContent = rows.map(row => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ---------- HISTORY STORAGE HELPERS ----------
function loadHistoryFromStorage() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("[Dashboard] Could not parse session history:", e);
    return [];
  }
}

function saveHistoryToStorage(history) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("[Dashboard] Could not save session history:", e);
  }
}
// Helper for consistent keys
function getHistoryKey(sessionCode, classCode) {
  return `${(sessionCode || "").trim()}||${(classCode || "").trim()}`;
}

const HISTORY_DELETED_KEY = "rp_teacherSessionHistoryDeleted_v1";

function loadDeletedHistoryKeys() {
  try {
    const raw = window.localStorage.getItem(HISTORY_DELETED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveDeletedHistoryKeys(keys) {
  try {
    window.localStorage.setItem(HISTORY_DELETED_KEY, JSON.stringify(keys));
  } catch (e) {
    // non-fatal
  }
}

function updateHistoryActionButtonsState() {
  const disabled = !CURRENT_HISTORY_KEY;
  if (historyRenameBtn) historyRenameBtn.disabled = disabled;
  if (historyColorBtn) historyColorBtn.disabled = disabled;
  if (historyDeleteBtn) historyDeleteBtn.disabled = disabled;
}


/**
 * Update history based on the latest loaded attempts.
 */
function updateSessionHistory(sessionCodeRaw, classCodeRaw, attempts) {
  if (!sessionCodeRaw) return;

  const sessionCode = sessionCodeRaw.trim();
  const classCode = (classCodeRaw || "").trim();
  const nowIso = new Date().toISOString();

  const history = loadHistoryFromStorage() || [];

// if this session was previously deleted, clear its tombstone
const key = getHistoryKey(sessionCode, classCode);
let deletedKeys = loadDeletedHistoryKeys();
if (deletedKeys.includes(key)) {
  deletedKeys = deletedKeys.filter((k) => k !== key);
  saveDeletedHistoryKeys(deletedKeys);
}
  // ---------- DEDUPE ATTEMPTS BY STUDENT (FIRST ATTEMPT ONLY) ----------
  let dedupedAttempts = [];

  if (Array.isArray(attempts) && attempts.length > 0) {
    const perStudent = new Map();
    const noKeyAttempts = [];

    for (const a of attempts) {
      const rawId = (a.studentId || "").toString().trim();
      const rawName = (a.studentName || "").trim();

      // Build a stable key: prefer id, fallback to name
      const key = (rawId || rawName).toLowerCase();

      if (!key) {
        // No reliable identity → include, but don't dedupe
        noKeyAttempts.push(a);
        continue;
      }

      // Only keep the FIRST attempt we see for this student
      if (!perStudent.has(key)) {
        perStudent.set(key, a);
      }
    }

    dedupedAttempts = [...perStudent.values(), ...noKeyAttempts];
  }

  // ---------- AGGREGATE STATS FROM DEDUPED ATTEMPTS ----------
  let attemptsCount = 0;
  let totalQuestions = 0;
  let totalCorrect = 0;
  const uniqueStudentNames = new Set();

  if (dedupedAttempts.length > 0) {
    attemptsCount = dedupedAttempts.length;

    dedupedAttempts.forEach((a) => {
      // Use totalQuestions if present; otherwise fall back to answeredCount
      const questionsForThisAttempt =
        Number(a.totalQuestions || a.answeredCount || 0);
      const correctForThisAttempt = Number(a.numCorrect || 0);

      totalQuestions += questionsForThisAttempt;
      totalCorrect += correctForThisAttempt;

      if (a.studentName) {
        uniqueStudentNames.add(String(a.studentName).trim());
      }
    });
  }

  const uniqueStudentsCount = uniqueStudentNames.size || attemptsCount;

  // ---------- MERGE INTO HISTORY ----------
  const idx = history.findIndex(
    (entry) =>
      entry.sessionCode === sessionCode &&
      (entry.classCode || "") === classCode
  );

  
  const entry = {
    sessionCode,
    classCode,
    lastLoadedAt: nowIso,
    attemptsCount,
    totalQuestions,
    totalCorrect,
    uniqueStudentsCount,
    practiceSet: getSelectedPracticeSet(),          // full | mini1 | mini2
    practiceLevel: currentLevelParam || "on",       // below | on | above
  };

  if (idx >= 0) {
    history[idx] = entry;
  } else {
    history.push(entry);
  }

  saveHistoryToStorage(history);
  renderSessionHistory(history);
}


// ---------- SERVER-HYDRATED SESSION HISTORY (owned + shared) ----------

async function hydrateSessionHistoryFromServer(viewerEmail) {
  if (typeof fetch === "undefined") return;

  const email = String(viewerEmail || "").trim().toLowerCase();
  if (!email) return;

  // ✅ Prevent duplicate hydrates (auth restore + sign-in can fire twice)
  if (_historyHydrateInFlight && _historyHydrateEmail === email) {
    return _historyHydrateInFlight;
  }
  _historyHydrateEmail = email;

  _historyHydrateInFlight = (async () => {
    try {
      const params = new URLSearchParams();
      params.set("viewerEmail", email);

      const res = await fetch(
        `/.netlify/functions/getReadingAttempts?${params.toString()}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );

      if (!res.ok) {
        console.warn(
          "[Dashboard] History fetch failed:",
          res.status,
          await res.text().catch(() => "")
        );
        return;
      }

      const payload = await res.json().catch(() => ({}));
      const attempts = Array.isArray(payload.attempts) ? payload.attempts : [];
      // Cache all attempts for cross-session student progress graphs
      ALL_VIEWER_ATTEMPTS = attempts;

      if (!attempts.length) {
        // nothing to hydrate, fall back to whatever is in localStorage
        const existing = loadHistoryFromStorage();
        renderSessionHistory(existing);
        return;
      }

      // Group attempts by (sessionCode + classCode)
      const grouped = new Map();

      attempts.forEach((a) => {
        const sessionCode = (a.sessionCode || "").trim();
        if (!sessionCode) return;
        const classCode = (a.classCode || "").trim();
        const key = `${sessionCode}||${classCode}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            sessionCode,
            classCode,
            lastLoadedAt: null,
            rawAttempts: [],
          });
        }

        const entry = grouped.get(key);
        entry.rawAttempts.push(a);

        const t = a.finishedAt || a.startedAt;
        if (t && (!entry.lastLoadedAt || t > entry.lastLoadedAt)) {
          entry.lastLoadedAt = t;
        }
      });

      // Dedupe by student (per session + classCode) and aggregate stats
      const serverHistory = Array.from(grouped.values()).map((entry) => {
        const perStudent = new Map();
        const noKeyAttempts = [];

        entry.rawAttempts.forEach((a) => {
          const rawId = (a.studentId || "").toString().trim();
          const rawName = (a.studentName || "").trim();
          const key = (rawId || rawName).toLowerCase();

          if (!key) {
            // No reliable identity → include, but don't dedupe
            noKeyAttempts.push(a);
            return;
          }

          const existing = perStudent.get(key);
          if (!existing) {
            perStudent.set(key, a);
          } else {
            // Prefer the attempt with the most questions answered/completed
            const prevAnswered = Number(
              existing.answeredCount || existing.totalQuestions || 0
            );
            const currAnswered = Number(
              a.answeredCount || a.totalQuestions || 0
            );

            if (currAnswered >= prevAnswered) {
              perStudent.set(key, a);
            }
          }
        });

        const dedupedAttempts = [...perStudent.values(), ...noKeyAttempts];

        let attemptsCount = 0;
        let totalQuestions = 0;
        let totalCorrect = 0;
        const uniqueStudentNames = new Set();

        if (dedupedAttempts.length > 0) {
          attemptsCount = dedupedAttempts.length;

          dedupedAttempts.forEach((a) => {
            // Use totalQuestions if present; otherwise fall back to answeredCount
            const questionsForThisAttempt = Number(
              a.totalQuestions || a.answeredCount || 0
            );
            const correctForThisAttempt = Number(a.numCorrect || 0);

            totalQuestions += questionsForThisAttempt;
            totalCorrect += correctForThisAttempt;

            if (a.studentName) {
              uniqueStudentNames.add(String(a.studentName).trim());
            }
          });
        }

        const uniqueStudentsCount = uniqueStudentNames.size || attemptsCount;
    // NEW: infer practice set/level for this session (best-effort)
    let inferredSet = "";
    let inferredLevel = "";

    // Prefer the most recent attempt that has metadata
    const sortedForMeta = entry.rawAttempts
      .slice()
      .sort((a, b) => {
        const at = (a.finishedAt || a.startedAt || "").toString();
        const bt = (b.finishedAt || b.startedAt || "").toString();
        return bt.localeCompare(at);
      });

    for (const a of sortedForMeta) {
      const s = (a.practiceSet || a.set || a.setType || "").toString().trim();
      const l = (a.practiceLevel || a.level || a.levelBand || "").toString().trim();
      if (!inferredSet && s) inferredSet = normalizeSetParam(s);
      if (!inferredLevel && ["below","on","above"].includes(l.toLowerCase())) {
        inferredLevel = l.toLowerCase();
      }
      if (inferredSet && inferredLevel) break;
    }

        return {
          sessionCode: entry.sessionCode,
          classCode: entry.classCode,
          lastLoadedAt: entry.lastLoadedAt || new Date().toISOString(),
          attemptsCount,
          totalQuestions,
          totalCorrect,
          uniqueStudentsCount,
          practiceSet: inferredSet || undefined,
          practiceLevel: inferredLevel || undefined,

        };
      });

      // Merge with whatever is in localStorage already
      const localHistory = loadHistoryFromStorage();
      const mergedByKey = new Map();

      const addEntries = (entries) => {
        entries.forEach((h) => {
          const key = `${h.sessionCode}||${h.classCode || ""}`;
          const existing = mergedByKey.get(key);

          if (!existing) {
            mergedByKey.set(key, h);
          } else {
            // keep the entry with the newer lastLoadedAt
            const existingTime = (existing.lastLoadedAt || "").toString();
            const newTime = (h.lastLoadedAt || "").toString();
            if (newTime > existingTime) {
              mergedByKey.set(key, h);
            }
          }
        });
      };

      addEntries(localHistory || []);
      addEntries(serverHistory);

      const mergedHistory = Array.from(mergedByKey.values()).sort((a, b) =>
        (b.lastLoadedAt || "").toString().localeCompare(
          (a.lastLoadedAt || "").toString()
        )
      );

      // NEW: respect deleted sessions on this device
      const deletedKeys = loadDeletedHistoryKeys();
      const filteredMerged = mergedHistory.filter((h) => {
        const key = getHistoryKey(h.sessionCode, h.classCode || "");
        return !deletedKeys.includes(key);
      });

      saveHistoryToStorage(filteredMerged);
      renderSessionHistory(filteredMerged);
    } catch (err) {
      console.warn(
        "[Dashboard] Could not hydrate session history from server:",
        err
      );
      // fall back to local history if something goes wrong
      const existing = loadHistoryFromStorage();
      renderSessionHistory(existing);
    } finally {
      _historyHydrateInFlight = null;
    }
  })();

  return _historyHydrateInFlight;
}

// ---------- HISTORY RENDERING ----------
function renderSessionHistory(history) {
  historyListEl.innerHTML = "";

  const deletedKeys = loadDeletedHistoryKeys();
  const visibleHistory = (history || []).filter((entry) => {
    const key = getHistoryKey(entry.sessionCode, entry.classCode || "");
    return !deletedKeys.includes(key);
  });

  if (!visibleHistory || !visibleHistory.length) {
    const p = document.createElement("p");
    p.className = "history-empty muted";
    p.textContent = "No sessions saved yet. Load a session to add it here.";
    historyListEl.appendChild(p);
    // If nothing is visible, clear selection + disable buttons
    CURRENT_HISTORY_KEY = null;
    updateHistoryActionButtonsState();
    return;
  }

  const sorted = visibleHistory.slice().sort((a, b) => {
    const ta = new Date(a.lastLoadedAt).getTime();
    const tb = new Date(b.lastLoadedAt).getTime();
    return tb - ta; // newest first
  });

  const currentKey = CURRENT_HISTORY_KEY;

  sorted.forEach((entry) => {
    const accuracy = entry.totalQuestions
      ? Math.round((entry.totalCorrect / entry.totalQuestions) * 100)
      : 0;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "history-item";

    const key = getHistoryKey(entry.sessionCode, entry.classCode || "");
    btn.dataset.key = key;

    // Apply any saved color
    if (entry.color) {
      btn.classList.add(`history-color-${entry.color}`);
    }

    // Re-apply selection if it matches
    if (currentKey && key === currentKey) {
      btn.classList.add("is-selected");
    }

    const main = document.createElement("div");
    main.className = "history-main";

    const title = document.createElement("div");
    title.className = "history-title";
    // NEW: use label if present, otherwise the raw session code
    title.textContent = entry.label || entry.sessionCode;

    const meta = document.createElement("div");
    meta.className = "history-meta";
    const parts = [];
    if (entry.classCode) parts.push(entry.classCode);

    // ✅ NEW: show set + level (teacher-facing)
    if (entry.practiceLevel) parts.push(`Level: ${entry.practiceLevel}`);
    if (entry.practiceSet) parts.push(`Set: ${entry.practiceSet}`);

    if (entry.uniqueStudentsCount) {
      parts.push(`${entry.uniqueStudentsCount} students`);
    }
    if (entry.attemptsCount) {
      parts.push(`${entry.attemptsCount} attempts`);
    }
    meta.textContent = parts.join(" · ");


    main.appendChild(title);
    main.appendChild(meta);

    const pill = document.createElement("div");
    pill.className = "history-pill";
    pill.textContent = `${accuracy}% · ${formatDate(entry.lastLoadedAt)}`;

    btn.appendChild(main);
    btn.appendChild(pill);

    btn.addEventListener("click", () => {
      // Highlight this item
      document.querySelectorAll(".history-item").forEach((el) => {
        el.classList.toggle("is-selected", el === btn);
      });

      CURRENT_HISTORY_KEY = key;
      updateHistoryActionButtonsState();

      // Load this session into the filters and refresh dashboard
sessionInput.value = entry.sessionCode;
classInput.value = entry.classCode || "";

// ✅ NEW: sync set + level selectors to this session before loading
const setSelect = document.getElementById("practice-set");
const levelSelect = document.getElementById("practice-level");

if (entry.practiceSet && setSelect) {
  const v = normalizeSetParam(entry.practiceSet);
  setSelect.value = v;
  currentSetParam = v;
  try { localStorage.setItem("rp_lastSet", v); } catch (e) {}
}

if (entry.practiceLevel && levelSelect) {
  const v = entry.practiceLevel.toLowerCase();
  if (["below","on","above"].includes(v)) {
    levelSelect.value = v;
    currentLevelParam = v;
    try { localStorage.setItem("rp_lastLevel", v); } catch (e) {}
  }
}

loadAttempts();

      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    historyListEl.appendChild(btn);
  });
}
// ---------- HISTORY CUSTOMIZATION HANDLERS ----------

function findHistoryEntryByKey(key) {
  if (!key) return { history: [], index: -1 };
  const history = loadHistoryFromStorage() || [];
  const index = history.findIndex(
    (h) => getHistoryKey(h.sessionCode, h.classCode || "") === key
  );
  return { history, index };
}

if (historyRenameBtn) {
  historyRenameBtn.addEventListener("click", () => {
    if (!CURRENT_HISTORY_KEY) return;

    const { history, index } = findHistoryEntryByKey(CURRENT_HISTORY_KEY);
    if (index === -1) return;

    const entry = history[index];
    const currentLabel = entry.label || entry.sessionCode;
    const newLabel = window.prompt(
      "Rename this session (for your eyes only):",
      currentLabel
    );
    if (!newLabel || !newLabel.trim()) return;

    entry.label = newLabel.trim();
    saveHistoryToStorage(history);
    renderSessionHistory(history);
  });
}

if (historyColorBtn) {
  historyColorBtn.addEventListener("click", () => {
    if (!CURRENT_HISTORY_KEY) return;

    const { history, index } = findHistoryEntryByKey(CURRENT_HISTORY_KEY);
    if (index === -1) return;

    const entry = history[index];
    const current = entry.color || "";
    const currentIdx = HISTORY_COLOR_SEQUENCE.indexOf(current);
    const nextIdx = (currentIdx + 1 + HISTORY_COLOR_SEQUENCE.length) %
      HISTORY_COLOR_SEQUENCE.length;
    const nextColor = HISTORY_COLOR_SEQUENCE[nextIdx];

    if (!nextColor) {
      delete entry.color; // back to default
    } else {
      entry.color = nextColor;
    }

    saveHistoryToStorage(history);
    renderSessionHistory(history);
  });
}

if (historyDeleteBtn) {
  historyDeleteBtn.addEventListener("click", () => {
    if (!CURRENT_HISTORY_KEY) return;

    const confirmDelete = window.confirm(
      "Remove this session from your Session History list? " +
        "This does not delete any student data — only this shortcut on this device."
    );
    if (!confirmDelete) return;

    const { history, index } = findHistoryEntryByKey(CURRENT_HISTORY_KEY);
    if (index === -1) return;

    const key = CURRENT_HISTORY_KEY;

    // Remove from local history
    history.splice(index, 1);
    saveHistoryToStorage(history);

    // Record the deletion so server hydration won’t re-add it
    let deletedKeys = loadDeletedHistoryKeys();
    if (!deletedKeys.includes(key)) {
      deletedKeys.push(key);
      saveDeletedHistoryKeys(deletedKeys);
    }

    CURRENT_HISTORY_KEY = null;
    updateHistoryActionButtonsState();
    renderSessionHistory(history);
  });
}

// Initialize button state on first load
updateHistoryActionButtonsState();


// ---------- CHARTS ----------
function updateScoreBandsChart(allAttempts, studentAttempts = [], studentName = null) {
  const canvas = document.getElementById("chart-score-bands");
  if (!canvas || typeof Chart === "undefined") return;

  const makeBandTemplate = () => ([
    { label: "0–39%", min: 0, max: 39, count: 0 },
    { label: "40–59%", min: 40, max: 59, count: 0 },
    { label: "60–79%", min: 60, max: 79, count: 0 },
    { label: "80–100%", min: 80, max: 100, count: 0 }
  ]);

  const bandsAll = makeBandTemplate();
  const bandsSelected = makeBandTemplate();

  const bumpBand = (bands, pct) => {
    const band = bands.find((b) => pct >= b.min && pct <= b.max);
    if (band) band.count++;
  };

  allAttempts.forEach((a) => {
    const total = Number(a.totalQuestions ?? a.answeredCount ?? 0);
    if (!total) return;
    const correct = Number(a.numCorrect ?? 0);
    const pct = Math.round((correct / total) * 100);
    bumpBand(bandsAll, pct);
  });

  studentAttempts.forEach((a) => {
    const total = Number(a.totalQuestions ?? a.answeredCount ?? 0);
    if (!total) return;
    const correct = Number(a.numCorrect ?? 0);
    const pct = Math.round((correct / total) * 100);
    bumpBand(bandsSelected, pct);
  });

  const labels = bandsAll.map((b) => b.label);
  const allData = bandsAll.map((b) => b.count);
  const studentData = bandsSelected.map((b) => b.count);

  const datasets = [{ label: "All students in view", data: allData }];

  const hasStudentData =
    studentName &&
    Array.isArray(studentAttempts) &&
    studentAttempts.length > 0 &&
    studentData.some((v) => v > 0);

  if (hasStudentData) {
    datasets.push({ label: studentName, data: studentData });
  }

  const totalAll = allData.reduce((s, n) => s + n, 0);
  if (!totalAll && !hasStudentData) {
    if (scoreBandsChart) {
      scoreBandsChart.destroy();
      scoreBandsChart = null;
    }
    return;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },

    // ✅ prevents axis labels from clipping
    layout: { padding: { left: 12, right: 10, top: 8, bottom: 22 } },

    scales: {
      x: {
        ticks: { autoSkip: false, maxRotation: 0, minRotation: 0 }
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { padding: 14 }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`
        }
      }
    }
  };

  if (scoreBandsChart) {
    scoreBandsChart.data.labels = labels;
    scoreBandsChart.data.datasets = datasets;
    scoreBandsChart.options = options; // ✅ IMPORTANT (apply on updates)
    scoreBandsChart.update();
  } else {
    scoreBandsChart = new Chart(canvas, {
      type: "bar",
      data: { labels, datasets },
      options
    });
  }
}

function updateTypeAccuracyChart(allAttempts, studentAttempts = [], studentName = null) {
  const canvas = document.getElementById("chart-type-accuracy");
  if (!canvas || typeof Chart === "undefined") return;

  const typeTotalsAll = {};
  const typeTotalsStudent = {};

  allAttempts.forEach((a) => {
    if (!a.byType) return;
    Object.entries(a.byType).forEach(([type, stats]) => {
      if (!typeTotalsAll[type]) typeTotalsAll[type] = { correct: 0, total: 0 };
      typeTotalsAll[type].correct += Number(stats.correct || 0);
      typeTotalsAll[type].total += Number(stats.total || 0);
    });
  });

  studentAttempts.forEach((a) => {
    if (!a.byType) return;
    Object.entries(a.byType).forEach(([type, stats]) => {
      if (!typeTotalsStudent[type]) typeTotalsStudent[type] = { correct: 0, total: 0 };
      typeTotalsStudent[type].correct += Number(stats.correct || 0);
      typeTotalsStudent[type].total += Number(stats.total || 0);
    });
  });

  const friendlyLabels = {
    mcq: "MCQ",
    multi: "Select All",
    order: "Order",
    match: "Matching",
    highlight: "Highlight Evidence",
    dropdown: "Inline Choice",
    classify: "Classification",
    partAB: "Part A/B",
    revise: "Sentence Revision"
  };

  const allKeys = Array.from(
    new Set([...Object.keys(typeTotalsAll), ...Object.keys(typeTotalsStudent)])
  );

  // ✅ stable ordering so the chart doesn’t “jump” on re-renders
  allKeys.sort((a, b) => (friendlyLabels[a] || a).localeCompare(friendlyLabels[b] || b));

  const labels = [];
  const classData = [];
  const studentData = [];

  allKeys.forEach((type) => {
    labels.push(friendlyLabels[type] || type);

    const allStats = typeTotalsAll[type] || { correct: 0, total: 0 };
    const stuStats = typeTotalsStudent[type] || { correct: 0, total: 0 };

    const allPct = allStats.total ? Math.round((allStats.correct / allStats.total) * 100) : 0;
    const stuPct = stuStats.total ? Math.round((stuStats.correct / stuStats.total) * 100) : 0;

    classData.push(allPct);
    studentData.push(stuPct);
  });

  if (!labels.length) {
    if (typeAccuracyChart) {
      typeAccuracyChart.destroy();
      typeAccuracyChart = null;
    }
    return;
  }

  const datasets = [{ label: "All students in view", data: classData }];

  const hasStudentBars = studentName && studentData.some((v) => v > 0);
  if (hasStudentBars) {
    datasets.push({ label: studentName, data: studentData });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    onResize: (chart, size) => {
  chart.options.scales.x.ticks = getAdaptiveXAxisTicks(size.width, "type"); 
  chart.update("none");
},

  
layout: { padding: { left: 14, right: 10, top: 8, bottom: 56 } },

    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { padding: 14 }
      }
    },
    scales: {
x: {
  ticks: getAdaptiveXAxisTicks(canvas.getBoundingClientRect().width, "type")
}
,
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, callback: (v) => `${v}%` }
      }
    }
  };

  if (typeAccuracyChart) {
    typeAccuracyChart.data.labels = labels;
    typeAccuracyChart.data.datasets = datasets;
    typeAccuracyChart.options = options; // ✅ IMPORTANT
    typeAccuracyChart.update();
  } else {
    typeAccuracyChart = new Chart(canvas, {
      type: "bar",
      data: { labels, datasets },
      options
    });
  }
}

function updateSkillAccuracyChart(skillTotalsAll, skillTotalsStudent = {}, studentName = null) {
  const canvas = document.getElementById("chart-skill-accuracy");
  if (!canvas || typeof Chart === "undefined") return;

  const allKeys = Array.from(
    new Set([
      ...Object.keys(skillTotalsAll || {}),
      ...Object.keys(skillTotalsStudent || {})
    ])
  );

  allKeys.sort((a, b) => a.localeCompare(b));

  const labels = [];
  const classData = [];
  const studentData = [];

  allKeys.forEach((skill) => {
    const allStats = (skillTotalsAll && skillTotalsAll[skill]) || { correct: 0, total: 0 };
    const stuStats = (skillTotalsStudent && skillTotalsStudent[skill]) || { correct: 0, total: 0 };

    const allPct = allStats.total ? Math.round((allStats.correct / allStats.total) * 100) : 0;
    const stuPct = stuStats.total ? Math.round((stuStats.correct / stuStats.total) * 100) : 0;

    labels.push(skill);
    classData.push(allPct);
    studentData.push(stuPct);
  });

  if (!labels.length) {
    if (skillAccuracyChart) {
      skillAccuracyChart.destroy();
      skillAccuracyChart = null;
    }
    return;
  }

  const datasets = [{ label: "All students in view", data: classData }];

  const hasStudentBars = studentName && studentData.some((v) => v > 0);
  if (hasStudentBars) {
    datasets.push({ label: studentName, data: studentData });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    // ✅ add this RIGHT HERE (top-level in options)
    onResize: (chart, size) => {
      chart.options.scales.x.ticks = getAdaptiveXAxisTicks(size.width, "skill");
      chart.update("none");
    },

    layout: { padding: { left: 14, right: 10, top: 8, bottom: 56 } },

    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { padding: 14 }
      }
    },

    scales: {
      x: {
        // ✅ skill chart should use "skill"
        ticks: getAdaptiveXAxisTicks(canvas.getBoundingClientRect().width, "skill")
      },
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, callback: (v) => `${v}%` }
      }
    }
  };

  if (skillAccuracyChart) {
    skillAccuracyChart.data.labels = labels;
    skillAccuracyChart.data.datasets = datasets;
    skillAccuracyChart.options = options;
    skillAccuracyChart.update();
  } else {
    skillAccuracyChart = new Chart(canvas, {
      type: "bar",
      data: { labels, datasets },
      options
    });
  }
}


function getAdaptiveXAxisTicks(chartWidth, mode = "skill") {
  const compact = chartWidth < 620;         // small card
  const medium = chartWidth < 980;          // laptop-ish widths

  // ---------- COMPACT: skip + shorten ----------
  if (compact) {
    return {
      autoSkip: true,
      maxTicksLimit: mode === "skill" ? 6 : 8,
      maxRotation: 0,
      minRotation: 0,
      font: { size: 10 },
      padding: 6,
      callback: function (value) {
        const label = this.getLabelForValue(value);
        const s = String(label);
        return s.length > 12 ? s.slice(0, 12) + "…" : s;
      }
    };
  }

  // ---------- MEDIUM (most laptops): show all, angled ----------
  if (medium) {
    return {
      autoSkip: false,
      maxRotation: 40,
      minRotation: 40,
      font: { size: 11 },
      padding: 8,
      callback: function (value) {
        // keep single-line when angled (cleaner)
        return this.getLabelForValue(value);
      }
    };
  }

  // ---------- LARGE: show all, wrap (no angle needed) ----------
  return {
    autoSkip: false,
    maxRotation: 0,
    minRotation: 0,
    font: { size: 12 },
    padding: 10,
    callback: function (value) {
      const label = this.getLabelForValue(value);
      return mode === "skill"
        ? String(label).split("-")
        : String(label).split(" ");
    }
  };
}



// ---------- SESSION TAGS + STUDENT DETAIL + HEAT MAP ----------
function updateSessionTagsFromAttempts(attempts) {
  if (!mostMissedSkillEl || !mostMissedTypeEl) return;

  // Aggregate by skill
  const skillTotals = {};
  const typeTotals = {};

  attempts.forEach(a => {
    if (a.bySkill) {
      Object.entries(a.bySkill).forEach(([skill, stats]) => {
        if (!skillTotals[skill]) {
          skillTotals[skill] = { correct: 0, total: 0 };
        }
        skillTotals[skill].correct += stats.correct || 0;
        skillTotals[skill].total += stats.total || 0;
      });
    }
    if (a.byType) {
      Object.entries(a.byType).forEach(([type, stats]) => {
        if (!typeTotals[type]) {
          typeTotals[type] = { correct: 0, total: 0 };
        }
        typeTotals[type].correct += stats.correct || 0;
        typeTotals[type].total += stats.total || 0;
      });
    }
  });

  const pickMostMissed = (totalsObj, friendlyMap) => {
    let worstKey = null;
    let worstPct = 101;

    Object.entries(totalsObj).forEach(([key, stats]) => {
      if (!stats.total || stats.total < 2) return; // ignore tiny samples
      const pct = (stats.correct / stats.total) * 100;
      if (pct < worstPct) {
        worstPct = pct;
        worstKey = key;
      }
    });

    if (!worstKey) return "—";

    const label = friendlyMap?.[worstKey] || worstKey;
    return `${label} (${Math.round(worstPct)}%)`;
  };

  const friendlyTypes = {
    mcq: "MCQ",
    multi: "Select All",
    order: "Order",
    match: "Matching",
    highlight: "Highlight Evidence",
    dropdown: "Inline Choice",
    classify: "Classification",
    partAB: "Part A/B",
    revise: "Sentence Revision"
  };

  mostMissedSkillEl.textContent = pickMostMissed(skillTotals) || "—";
  mostMissedTypeEl.textContent = pickMostMissed(typeTotals, friendlyTypes) || "—";
}

function renderStudentDetailPanel(studentName, studentAttempts, skillTotalsSelected) {
  if (!studentDetailPanel) return;

  const hasData = studentName && studentAttempts && studentAttempts.length > 0;

  if (!hasData) {
    studentDetailPanel.classList.remove("is-open");
    studentDetailNameEl.textContent = "No student selected. Click a row in the table.";
    studentDetailOverallEl.textContent = "Overall accuracy for this session: —.";
    studentDetailAttemptsEl.textContent = "Attempts counted: —.";
    studentDetailNeedsWorkEl.innerHTML = '<li class="muted">Not enough data yet.</li>';
    studentDetailStrengthsEl.innerHTML = '<li class="muted">Not enough data yet.</li>';

    // clear progress chart if it exists
    if (studentProgressChart) {
      studentProgressChart.destroy();
      studentProgressChart = null;
    }

    // clear caption too
    const captionEl = document.getElementById("student-detail-progress-caption");
    if (captionEl) captionEl.textContent = "";

    return;
  }

  studentDetailPanel.classList.add("is-open");
  studentDetailNameEl.textContent = studentName;

  // ===== Overall stats across all attempts (for THIS view/session) =====
  const totals = studentAttempts.reduce(
    (acc, a) => {
      // Prefer explicit counts from the backend
      let correct = typeof a.numCorrect === "number" ? a.numCorrect : 0;

      // Prefer totalQuestions, then answeredCount, then derive from bySkill
      let total = 0;

      if (typeof a.totalQuestions === "number" && a.totalQuestions > 0) {
        total = a.totalQuestions;
      } else if (typeof a.answeredCount === "number" && a.answeredCount > 0) {
        total = a.answeredCount;
      }

      // If we *still* don't have good totals, derive from bySkill if present
      if ((!total || !correct) && a.bySkill && typeof a.bySkill === "object") {
        let derivedCorrect = 0;
        let derivedTotal = 0;
        Object.values(a.bySkill).forEach((stats) => {
          if (!stats) return;
          derivedCorrect += Number(stats.correct || 0);
          derivedTotal += Number(stats.total || 0);
        });

        if (!total && derivedTotal) total = derivedTotal;
        if (!correct && derivedCorrect) correct = derivedCorrect;
      }

      acc.correct += correct;
      acc.total += total;
      return acc;
    },
    { correct: 0, total: 0 }
  );

  const overallPct = totals.total
    ? Math.round((totals.correct / totals.total) * 100)
    : 0;

  studentDetailOverallEl.textContent =
    `Overall accuracy for this session: ${overallPct}% (${totals.correct} of ${totals.total} correct).`;

  studentDetailAttemptsEl.textContent =
    `Attempts counted: ${studentAttempts.length}.`;

  // ===== Progress-over-time chart =====
  const chartCanvas = document.getElementById("student-detail-progress-chart");
  if (chartCanvas && typeof Chart !== "undefined") {
    // Prefer cross-session attempts for this student if we've hydrated them
    let attemptsForChart = [];

    if (Array.isArray(ALL_VIEWER_ATTEMPTS) && ALL_VIEWER_ATTEMPTS.length) {
      const targetName = (studentName || "").trim().toLowerCase();
      const baseAssessment = (studentAttempts[0] && studentAttempts[0].assessmentName)
        ? String(studentAttempts[0].assessmentName).trim()
        : null;

      attemptsForChart = ALL_VIEWER_ATTEMPTS.filter((a) => {
        const nameNorm = (a.studentName || "").trim().toLowerCase();
        const assessmentNorm = (a.assessmentName || "").trim();
        if (!targetName || nameNorm !== targetName) return false;

        // If we know the assessmentName for this view, keep it consistent
        if (baseAssessment) {
          return assessmentNorm === baseAssessment;
        }
        return true;
      });

      // Fallback: if for some reason nothing matched, just use this view's attempts
      if (!attemptsForChart.length) {
        attemptsForChart = studentAttempts.slice();
      }
    } else {
      // No global cache (e.g. offline / demo mode) → just use attempts for this view
      attemptsForChart = studentAttempts.slice();
    }

    const sortedAttempts = attemptsForChart
      .slice()
      .sort((a, b) => {
        const aTime = (a.finishedAt || a.startedAt || "").toString();
        const bTime = (b.finishedAt || b.startedAt || "").toString();
        return aTime.localeCompare(bTime);
      });

    // ===== Progress-over-time chart =====
    const labels = sortedAttempts.map((_, idx) => `Attempt ${idx + 1}`);

    const labelDates = sortedAttempts.map((a, idx) => {
      const when = a.finishedAt || a.startedAt;
      return when ? formatDate(when) : `Attempt ${idx + 1}`;
    });

    // Ensure the canvas is controlled by its container, not by inline sizing
    chartCanvas.style.width = "";
    chartCanvas.style.height = "";
    chartCanvas.height = 200;

    const overallData = sortedAttempts.map((a) => {
      const total = a.totalQuestions || a.answeredCount || 0;
      const correct = a.numCorrect || 0;
      return total ? Math.round((correct / total) * 100) : 0;
    });

    // Aggregate skills across attempts to pick top 2–3 lines
    const aggregateBySkill = {};
    sortedAttempts.forEach((a) => {
      const map = a.bySkill || {};
      Object.entries(map).forEach(([skill, stats]) => {
        if (!aggregateBySkill[skill]) aggregateBySkill[skill] = { correct: 0, total: 0 };
        aggregateBySkill[skill].correct += Number(stats.correct || 0);
        aggregateBySkill[skill].total += Number(stats.total || 0);
      });
    });

    const topSkills = Object.entries(aggregateBySkill)
      .sort((a, b) => (b[1].total || 0) - (a[1].total || 0))
      .slice(0, 3)
      .map(([name]) => name);

    const datasets = [
      {
        label: "Overall %",
        data: overallData,
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 4
      }
    ];

    topSkills.forEach((skillName) => {
      const series = sortedAttempts.map((a) => {
        const stats = (a.bySkill && a.bySkill[skillName]) || null;
        if (!stats || !stats.total) return null;
        return Math.round((stats.correct / stats.total) * 100);
      });

      datasets.push({
        label: skillName,
        data: series,
        borderWidth: 1.5,
        pointRadius: 3,
        hidden: true
      });
    });

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio || 1,
      layout: { padding: { left: 22, right: 10, top: 8, bottom: 8 } },
      interaction: { mode: "index", intersect: false },
      scales: {
        y: {
          min: 0,
          max: 100,
          beginAtZero: true,
          ticks: {
            stepSize: 20,
            callback: (v) => `${v}%`,
            padding: 6
          },
          grid: { drawBorder: true },
          border: { display: true }
        },
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10,
            maxRotation: 55,
            minRotation: 55,
            padding: 6
          },
          grid: { drawBorder: true },
          border: { display: true }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { padding: 14, boxWidth: 14 },
onClick: (e, legendItem, legend) => {
  const chart = legend.chart;
  const datasetIndex = legendItem.datasetIndex;
  const meta = chart.getDatasetMeta(datasetIndex);

  // toggle the whole dataset (line) on/off
  meta.hidden = meta.hidden === null ? !chart.data.datasets[datasetIndex].hidden : null;

  chart.update();
}

        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items?.[0]?.dataIndex ?? 0;
              return labelDates?.[i] || `Attempt ${i + 1}`;
            },
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`
          }
        }
      }
    };

    if (studentProgressChart) {
      studentProgressChart.data.labels = labels;
      studentProgressChart.data.datasets = datasets;
      studentProgressChart.options = options;
      studentProgressChart.update();
    } else {
      studentProgressChart = new Chart(chartCanvas, {
        type: "line",
        data: { labels, datasets },
        options
      });
    }


    // ----- Update chart caption (runs on create + update) -----
    const captionEl = document.getElementById("student-detail-progress-caption");
    if (captionEl) {
      const multiAttempt = sortedAttempts.length > studentAttempts.length;

      if (multiAttempt) {
        captionEl.textContent = "Showing progress across all attempts of this assessment.";
      } else {
        captionEl.textContent = "Showing attempts for this session.";
      }
    }
  }

  // ===== Per-skill & per-type lists (Needs Work / Strengths) =====
  const MIN_QUESTIONS = 2;

  // ---- Skills: using skillTotalsSelected (already per-student) ----
  const skillEntries = Object.entries(skillTotalsSelected || {});
  const skillsWithPct = skillEntries
    .filter(([, stats]) => stats.total && stats.total >= MIN_QUESTIONS)
    .map(([skill, stats]) => ({
      skill,
      pct: (stats.correct / stats.total) * 100,
      total: stats.total
    }));

  // ---- Question types: aggregate from this student's attempts ----
  const typeTotalsSelected = {};
  studentAttempts.forEach((a) => {
    const map = a.byType || {};
    Object.entries(map).forEach(([typeKey, stats]) => {
      if (!typeTotalsSelected[typeKey]) {
        typeTotalsSelected[typeKey] = { correct: 0, total: 0 };
      }
      typeTotalsSelected[typeKey].correct += Number(stats.correct || 0);
      typeTotalsSelected[typeKey].total += Number(stats.total || 0);
    });
  });

  const friendlyTypeLabels = {
    mcq: "Multiple Choice",
    multi: "Select All",
    order: "Order",
    match: "Matching",
    highlight: "Highlight Evidence",
    dropdown: "Inline Choice",
    classify: "Classification",
    partAB: "Part A/B",
    revise: "Sentence Revision"
  };

  const typesWithPct = Object.entries(typeTotalsSelected)
    .filter(([, stats]) => stats.total && stats.total >= MIN_QUESTIONS)
    .map(([key, stats]) => ({
      key,
      label: friendlyTypeLabels[key] || key,
      pct: (stats.correct / stats.total) * 100,
      total: stats.total
    }));

  // If no usable skills or types, bail with "not enough data"
  if (!skillsWithPct.length && !typesWithPct.length) {
    studentDetailNeedsWorkEl.innerHTML = '<li class="muted">Not enough data yet.</li>';
    studentDetailStrengthsEl.innerHTML = '<li class="muted">Not enough data yet.</li>';
    return;
  }

  // ---- Sort + pick needs work & strengths for skills ----
  const sortedSkillLow = [...skillsWithPct].sort((a, b) => a.pct - b.pct);
  const sortedSkillHigh = [...skillsWithPct].sort((a, b) => b.pct - a.pct);

  const needsWorkSkills = sortedSkillLow.slice(0, 2);
  const needsWorkSkillNames = new Set(needsWorkSkills.map((s) => s.skill));

  const strengthsSkills = [];
  for (const s of sortedSkillHigh) {
    if (!needsWorkSkillNames.has(s.skill)) {
      strengthsSkills.push(s);
    }
    if (strengthsSkills.length >= 2) break;
  }

  // ---- Sort + pick needs work & strengths for types ----
  const sortedTypeLow = [...typesWithPct].sort((a, b) => a.pct - b.pct);
  const sortedTypeHigh = [...typesWithPct].sort((a, b) => b.pct - a.pct);

  const needsWorkTypes = sortedTypeLow.slice(0, 2);
  const needsWorkTypeKeys = new Set(needsWorkTypes.map((t) => t.key));

  const strengthsTypes = [];
  for (const t of sortedTypeHigh) {
    if (!needsWorkTypeKeys.has(t.key)) {
      strengthsTypes.push(t);
    }
    if (strengthsTypes.length >= 2) break;
  }

  const makeSkillLi = ({ skill, pct, total }) =>
    `<li>${skill}: ${Math.round(pct)}% (${total} questions)</li>`;

  const makeTypeLi = ({ label, pct, total }) =>
    `<li>${label}: ${Math.round(pct)}% (${total} questions)</li>`;

  // Build Needs Work list HTML
  let needsWorkHtml = "";

  if (needsWorkSkills.length) {
    needsWorkHtml += '<li class="drawer-subheading">Skills</li>';
    needsWorkHtml += needsWorkSkills.map(makeSkillLi).join("");
  }
  if (needsWorkTypes.length) {
    needsWorkHtml += '<li class="drawer-subheading">Question Types</li>';
    needsWorkHtml += needsWorkTypes.map(makeTypeLi).join("");
  }
  if (!needsWorkHtml) {
    needsWorkHtml = '<li class="muted">No clear weaknesses yet.</li>';
  }
  studentDetailNeedsWorkEl.innerHTML = needsWorkHtml;

  // Build Strengths list HTML
  let strengthsHtml = "";

  if (strengthsSkills.length) {
    strengthsHtml += '<li class="drawer-subheading">Skills</li>';
    strengthsHtml += strengthsSkills.map(makeSkillLi).join("");
  }
  if (strengthsTypes.length) {
    strengthsHtml += '<li class="drawer-subheading">Question Types</li>';
    strengthsHtml += strengthsTypes.map(makeTypeLi).join("");
  }
  if (!strengthsHtml) {
    strengthsHtml = '<li class="muted">No clear strengths yet.</li>';
  }
  studentDetailStrengthsEl.innerHTML = strengthsHtml;
}
//end renderstudentdetailpanel
function renderSkillHeatmap(attempts) {
  if (!heatmapHeadEl || !heatmapBodyEl) return;

  heatmapHeadEl.innerHTML = "";
  heatmapBodyEl.innerHTML = "";

  if (!attempts || !attempts.length) {
    return;
  }

  const skillSet = new Set();
  const studentSkillMap = {}; // student -> skill -> {correct,total}

  attempts.forEach(a => {
    const name = (a.studentName || "—").trim();
    if (!a.bySkill) return;
    if (!studentSkillMap[name]) studentSkillMap[name] = {};

    Object.entries(a.bySkill).forEach(([skill, stats]) => {
      skillSet.add(skill);
      if (!studentSkillMap[name][skill]) {
        studentSkillMap[name][skill] = { correct: 0, total: 0 };
      }
      studentSkillMap[name][skill].correct += stats.correct || 0;
      studentSkillMap[name][skill].total += stats.total || 0;
    });
  });

  const skills = Array.from(skillSet).sort((a, b) => a.localeCompare(b));
  const students = Object.keys(studentSkillMap).sort((a, b) => a.localeCompare(b));

  if (!skills.length || !students.length) return;

  // Header
  const headRow = document.createElement("tr");
  const thStudent = document.createElement("th");
  thStudent.textContent = "Student";
  headRow.appendChild(thStudent);

  skills.forEach(skill => {
    const th = document.createElement("th");
    th.textContent = skill;
    headRow.appendChild(th);
  });

  heatmapHeadEl.appendChild(headRow);

  // Rows
  students.forEach(student => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    tdName.textContent = student;
    tr.appendChild(tdName);

    skills.forEach(skill => {
      const cell = document.createElement("td");
      const stats = studentSkillMap[student][skill];

      if (!stats || !stats.total) {
        cell.textContent = "—";
        cell.classList.add("heat-empty");
      } else {
        const pct = (stats.correct / stats.total) * 100;
        const rounded = Math.round(pct);
        cell.textContent = `${rounded}%`;

        if (pct < 60) {
          cell.classList.add("heat-low");
        } else if (pct < 80) {
          cell.classList.add("heat-mid");
        } else {
          cell.classList.add("heat-high");
        }
      }

      tr.appendChild(cell);
    });

    heatmapBodyEl.appendChild(tr);
  });
}

// ---------- CORE DASHBOARD RENDERING ----------
function renderDashboard(attempts) {
  const assessmentLabelEl = document.getElementById("summary-assessment-name");
  if (assessmentLabelEl) {
    const first = attempts[0];
    assessmentLabelEl.textContent = first?.assessmentName || "Unnamed Assessment";
  }

  // Keep a copy for CSV exports
  CURRENT_ATTEMPTS = attempts.slice();
  const hasData = CURRENT_ATTEMPTS.length > 0;
  downloadCsvBtn.disabled = !hasData;

    // If a pending student focus name was set (e.g. from global student search)
  // and the current attempts contain that student, make them the selected student.
  if (PENDING_STUDENT_FOCUS_NAME) {
    const match = attempts.find(
      (a) => (a.studentName || "").trim() === PENDING_STUDENT_FOCUS_NAME
    );
    if (match) {
      CURRENT_STUDENT_FOR_CHARTS = PENDING_STUDENT_FOCUS_NAME;
    }
    PENDING_STUDENT_FOCUS_NAME = null;
  }

  const totalAttempts = attempts.length;
  const totalCorrect = attempts.reduce(
    (sum, a) => sum + (a.numCorrect || 0),
    0
  );

  // Sum how many questions were actually answered across attempts
  const totalAnswered = attempts.reduce((sum, a) => {
    if (a.answeredCount != null) {
      return sum + Number(a.answeredCount);
    }
    return sum + Number(a.totalQuestions || 0);
  }, 0);


  const uniqueStudentNames = new Set(
    attempts.map(a => (a.studentName || "").trim()).filter(Boolean)
  );

  // If our selected student is no longer in this filtered set, clear the overlay
  if (
    CURRENT_STUDENT_FOR_CHARTS &&
    !uniqueStudentNames.has(CURRENT_STUDENT_FOR_CHARTS)
  ) {
    CURRENT_STUDENT_FOR_CHARTS = null;
  }

  // Attempts for the selected student (if any)
  const selectedStudentAttempts = CURRENT_STUDENT_FOR_CHARTS
    ? attempts.filter(
        a => (a.studentName || "").trim() === CURRENT_STUDENT_FOR_CHARTS
      )
    : [];

  // Update charts with class vs selected student
  updateScoreBandsChart(
    attempts,
    selectedStudentAttempts,
    CURRENT_STUDENT_FOR_CHARTS
  );
  updateTypeAccuracyChart(
    attempts,
    selectedStudentAttempts,
    CURRENT_STUDENT_FOR_CHARTS
  );

  // Summary cards
  if (totalAttemptsEl) {
    totalAttemptsEl.textContent = totalAttempts;
  }
  if (uniqueStudentsEl) {
    uniqueStudentsEl.textContent =
      uniqueStudentNames.size === 1
        ? "1 student"
        : `${uniqueStudentNames.size} students`;
  }

  if (summaryAccuracyEl) {
    summaryAccuracyEl.textContent = formatPercent(totalCorrect, totalAnswered);
  }
  if (summaryCorrectTallyEl) {
    summaryCorrectTallyEl.textContent =
      `${totalCorrect} of ${totalAnswered} questions answered correct`;
  }

  const avgQuestions = totalAttempts ? totalAnswered / totalAttempts : 0;
  const avgCorrect = totalAttempts ? totalCorrect / totalAttempts : 0;


  if (summaryAvgQuestionsEl) {
    summaryAvgQuestionsEl.textContent = avgQuestions.toFixed(1);
  }
  if (summaryAvgCorrectEl) {
    summaryAvgCorrectEl.textContent = `${avgCorrect.toFixed(1)} correct on average`;
  }

  // Attempts table
  attemptsTableBody.innerHTML = "";
  if (!attempts.length) {
    attemptsSubtitleEl.textContent = "No attempts match this filter yet.";
  } else {
    attemptsSubtitleEl.textContent = `${totalAttempts} attempt${
      totalAttempts === 1 ? "" : "s"
    } loaded.`;
  }
  if (!attempts.length && typeof clearAttemptQnPanel === "function") {
    clearAttemptQnPanel();
  }

  attempts.forEach(a => {
    const tr = document.createElement("tr");

    const studentName = (a.studentName || "—").trim();

    // How many were really answered on this attempt?
    const answeredForRow =
      a.answeredCount != null
        ? Number(a.answeredCount)
        : Number(a.totalQuestions || 0);

    const numCorrect = Number(a.numCorrect || 0);

    // Prefer server-computed accuracy (based on answered questions),
    // but fall back to local calculation if needed (demo data).
    const scorePct =
      typeof a.accuracy === "number"
        ? a.accuracy
        : (answeredForRow
            ? Math.round((numCorrect / answeredForRow) * 100)
            : 0);

    tr.innerHTML = `
      <td>${studentName || "—"}</td>
      <td>${a.classCode || "—"}</td>
      <td>${a.sessionCode || "—"}</td>
      <td>${formatAttemptStatus(a)}</td>
      <td>
        <span class="${accuracyTagClass(scorePct)}">${scorePct}%</span>
      </td>
      <td>${formatAnsweredLabel(a)}</td>
      <td>${numCorrect}</td>
      <td>${formatDate(a.startedAt)}</td>
      <td>${formatDate(a.finishedAt)}</td>
    `;

    // Make row clickable to toggle student overlay AND load Q-by-Q panel
    if (studentName && studentName !== "—") {
      tr.dataset.studentName = studentName;

      if (CURRENT_STUDENT_FOR_CHARTS === studentName) {
        tr.classList.add("is-selected-student");
      }

      tr.addEventListener("click", () => {
        // Toggle which student's data overlays the charts + drawer
        if (CURRENT_STUDENT_FOR_CHARTS === studentName) {
          CURRENT_STUDENT_FOR_CHARTS = null;
        } else {
          CURRENT_STUDENT_FOR_CHARTS = studentName;
        }

        // Re-render dashboard for charts + drawer
        renderDashboard(attempts);

        // Load THIS attempt into the full Q-by-Q panel
        loadAttemptQnPanel(a);
      });
    }

    attemptsTableBody.appendChild(tr);
  });


  // Skills aggregation – class vs selected student
  const skillTotalsAll = {};
  const skillTotalsSelected = {};

  attempts.forEach(a => {
    if (!a.bySkill) return;
    const isSelected =
      CURRENT_STUDENT_FOR_CHARTS &&
      (a.studentName || "").trim() === CURRENT_STUDENT_FOR_CHARTS;

    Object.entries(a.bySkill).forEach(([skill, stats]) => {
      if (!skillTotalsAll[skill]) {
        skillTotalsAll[skill] = { correct: 0, total: 0 };
      }
      skillTotalsAll[skill].correct += stats.correct || 0;
      skillTotalsAll[skill].total += stats.total || 0;

      if (isSelected) {
        if (!skillTotalsSelected[skill]) {
          skillTotalsSelected[skill] = { correct: 0, total: 0 };
        }
        skillTotalsSelected[skill].correct += stats.correct || 0;
        skillTotalsSelected[skill].total += stats.total || 0;
      }
    });
  });

  skillsTableBody.innerHTML = "";
  const skillEntries = Object.entries(skillTotalsAll);

  // Update skill accuracy chart (class vs student)
  updateSkillAccuracyChart(
    skillTotalsAll,
    skillTotalsSelected,
    CURRENT_STUDENT_FOR_CHARTS
  );

  if (!skillEntries.length) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      `<td colspan="4" class="muted">No skill data to show yet.</td>`;
    skillsTableBody.appendChild(tr);
  } else {
    skillEntries
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([skill, stats]) => {
        const pct = stats.total
          ? Math.round((stats.correct / stats.total) * 100)
          : 0;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${skill}</td>
          <td>${stats.correct}</td>
          <td>${stats.total}</td>
          <td><span class="${accuracyTagClass(pct)}">${pct}%</span></td>
        `;
        skillsTableBody.appendChild(tr);
      });
  }

  // Update session tags (most missed skill/type)
  updateSessionTagsFromAttempts(attempts);

  // Student detail panel (if a student is selected)
  renderStudentDetailPanel(
    CURRENT_STUDENT_FOR_CHARTS,
    selectedStudentAttempts,
    skillTotalsSelected
  );

  // Heat map (all students × skills)
  renderSkillHeatmap(attempts);

  // Update the little view summary bar
  updateViewSummary();
}

// ---------- SINGLE CSV EXPORT: one row per student × skill ----------
function exportCombinedCSV() {
  if (!CURRENT_ATTEMPTS.length) {
    alert("No attempts to export yet.");
    return;
  }

  const rows = [];

  // Header row – designed for pivot tables
  rows.push([
    "AttemptID",
    "StudentName",
    "ClassCode",
    "SessionCode",
    "SkillTag",
    "SkillCorrect",
    "SkillTotal",
    "SkillAccuracyPct",
    "AttemptCorrect",
    "AttemptTotalQuestions",
    "AttemptAccuracyPct",
    "StartedAt",
    "FinishedAt"
  ]);

  CURRENT_ATTEMPTS.forEach((a) => {
    const attemptTotalQ = a.totalQuestions || 0;
    const attemptCorrect = a.numCorrect || 0;
    const attemptPct = attemptTotalQ
      ? Math.round((attemptCorrect / attemptTotalQ) * 100)
      : 0;

    // If we *somehow* have no bySkill, still include a row so the student shows up.
    const skillsObj = a.bySkill && Object.keys(a.bySkill).length
      ? a.bySkill
      : { "(no-skill-tags)": { correct: attemptCorrect, total: attemptTotalQ } };

    Object.entries(skillsObj).forEach(([skill, stats]) => {
      const skillCorrect = stats.correct || 0;
      const skillTotal = stats.total || 0;
      const skillPct = skillTotal
        ? Math.round((skillCorrect / skillTotal) * 100)
        : 0;

      rows.push([
        a.attemptId || "",
        a.studentName || "",
        a.classCode || "",
        a.sessionCode || "",
        skill,
        skillCorrect,
        skillTotal,
        skillPct,
        attemptCorrect,
        attemptTotalQ,
        attemptPct,
        formatDate(a.startedAt),
        formatDate(a.finishedAt)
      ]);
    });
  });

  const sessionCodeRaw = sessionInput.value.trim() || "ALL";
  const classCodeRaw = classInput.value.trim() || "ALL";

  const safeSession = sessionCodeRaw.replace(/[^A-Z0-9]+/gi, "-");
  const safeClass = classCodeRaw.replace(/[^A-Z0-9]+/gi, "-");

  const filename = `reading-trainer-results-session-${safeSession}-class-${safeClass}.csv`;

  downloadCSV(filename, rows);
}

// ---------- GLOBAL STUDENT SEARCH (cross-session) ----------
// ---------- GLOBAL STUDENT SEARCH (cross-session) ----------

function clearStudentSearch() {
  if (studentSearchInput) {
    studentSearchInput.value = "";
  }
  // Reset the panel back to the "no search yet" state
  renderStudentSearchResults("", []);
}

function renderStudentSearchResults(searchTerm, attempts) {
  if (!studentSearchResultsEl) return;

  studentSearchResultsEl.innerHTML = "";

  const cleanTerm = (searchTerm || "").trim();

  // --- No active search: show default helper text ---
  if (!cleanTerm) {
    const p = document.createElement("p");
    p.className = "muted small";
    p.innerHTML =
      'No search yet. Type a student name above and click <strong>Search</strong>.';
    studentSearchResultsEl.appendChild(p);
    return;
  }

  // --- Header row with "Results for" + Clear link ---
  const header = document.createElement("div");
  header.className = "student-search-header";

  const label = document.createElement("span");
  label.className = "student-search-label";
  label.textContent = `Results for "${cleanTerm}"`;

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "student-search-clear";
  clearBtn.textContent = "Clear search";
  clearBtn.addEventListener("click", (e) => {
    e.preventDefault();
    clearStudentSearch();
  });

  header.appendChild(label);
  header.appendChild(clearBtn);
  studentSearchResultsEl.appendChild(header);

  // --- No matches for this term ---
  if (!Array.isArray(attempts) || !attempts.length) {
    const p = document.createElement("p");
    p.className = "student-search-empty";
    p.textContent = `No sessions found matching "${cleanTerm}".`;
    studentSearchResultsEl.appendChild(p);
    return;
  }

  // Group by session + class + assessment so each row is "one session"
  const byKey = new Map();
  attempts.forEach((a) => {
    const sessionCode = (a.sessionCode || "").trim();
    const classCode = (a.classCode || "").trim();
    const assessmentName = (a.assessmentName || "").trim();
    const key = `${sessionCode}||${classCode}||${assessmentName}`;

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, a);
      return;
    }

    // Prefer the latest finishedAt
    const existingTime =
      existing.finishedAt || existing.startedAt || existing.createdAt || "";
    const newTime = a.finishedAt || a.startedAt || a.createdAt || "";
    if (newTime && newTime > existingTime) {
      byKey.set(key, a);
    }
  });

  const rows = Array.from(byKey.values()).sort((a, b) => {
    const aTime = a.finishedAt || a.startedAt || "";
    const bTime = b.finishedAt || b.startedAt || "";
    if (aTime && bTime) {
      if (aTime > bTime) return -1;
      if (aTime < bTime) return 1;
    }
    return 0;
  });

  const table = document.createElement("table");
  table.className = "student-search-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Session</th>
        <th>Class</th>
        <th>Assessment</th>
        <th>Score (%)</th>
        <th>Answered</th>
        <th>Finished</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  rows.forEach((a) => {
    const tr = document.createElement("tr");

    const numCorrect = Number(a.numCorrect || 0);
    const answered = Number(
      a.answeredCount != null
        ? a.answeredCount
        : a.totalQuestions != null
        ? a.totalQuestions
        : 0
    );
    const scorePct =
      typeof a.accuracy === "number"
        ? Math.round(a.accuracy)
        : answered
        ? Math.round((numCorrect / answered) * 100)
        : 0;

    tr.innerHTML = `
      <td>${(a.sessionCode || "—").trim()}</td>
      <td>${(a.classCode || "—").trim()}</td>
      <td>${(a.assessmentName || "—").trim()}</td>
      <td><span class="${accuracyTagClass(scorePct)}">${scorePct}%</span></td>
      <td>${formatAnsweredLabel(a)}</td>
      <td>${formatDate(a.finishedAt || a.startedAt)}</td>
    `;

    tr.addEventListener("click", () => {
      const studentName = (a.studentName || "").trim();
      const sessionCode = (a.sessionCode || "").trim();
      const classCode = (a.classCode || "").trim();

      if (!sessionCode) return;

      // Remember who we want to focus once loadAttempts() finishes
      PENDING_STUDENT_FOCUS_NAME = studentName || null;

      // Set filters and load that session
      if (sessionInput) sessionInput.value = sessionCode;
      if (classInput) classInput.value = classCode;

      // Update the pill right away so teachers see where they're going
      if (sessionPill) {
        sessionPill.textContent = sessionCode
          ? `Session: ${sessionCode}`
          : "Session: all sessions";
      }

      loadAttempts();
      // Optional: scroll main content into view
      const mainEl = document.querySelector(".dashboard-main");
      if (mainEl && typeof mainEl.scrollIntoView === "function") {
        mainEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    tbody.appendChild(tr);
  });

  studentSearchResultsEl.appendChild(table);
}


async function runStudentSearch() {
  if (!studentSearchInput || !studentSearchResultsEl) return;

  const searchTerm = studentSearchInput.value || "";
  const cleanTerm = searchTerm.trim();
  if (!cleanTerm) {
    renderStudentSearchResults("", []);
    return;
  }

  // Show "loading" message
  studentSearchResultsEl.innerHTML = `
    <p class="muted small">Searching for "${cleanTerm}"…</p>
  `;

  try {
    const params = new URLSearchParams();

    const ownerEmail = OWNER_EMAIL_FOR_VIEW || "";
    const isCoTeacherView =
      ownerEmail && (!teacherUser || teacherUser.email !== ownerEmail);

    if (isCoTeacherView && ownerEmail) {
      // Co-teacher view → always scope to the owner
      params.set("ownerEmail", ownerEmail);
    } else if (teacherUser && teacherUser.email) {
      // Main teacher, signed in → owned + shared sessions
      params.set("viewerEmail", teacherUser.email);
    } else if (ownerEmail) {
      // Fallback: owner known but not signed in yet
      params.set("ownerEmail", ownerEmail);
    }

    const res = await fetch(
      `/.netlify/functions/getReadingAttempts?${params.toString()}`,
      {
        method: "GET",
        headers: { Accept: "application/json" }
      }
    );

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    const allAttempts = Array.isArray(data.attempts) ? data.attempts : [];

    const needle = cleanTerm.toLowerCase();
    const matching = allAttempts.filter((a) => {
      const name = (a.studentName || "").toLowerCase();
      return name && name.includes(needle);
    });

    renderStudentSearchResults(cleanTerm, matching);
  } catch (err) {
    console.error("[Dashboard] Student search error:", err);
    studentSearchResultsEl.innerHTML = `
      <p class="student-search-empty">
        Sorry, something went wrong while searching. Please try again.
      </p>
    `;
  }
}

// ---------- DATA LOADING (real backend + demo fallback) ----------
async function loadAttempts() {
  const sessionCodeRaw = sessionInput.value.trim();
  const classCodeRaw = classInput.value.trim();

  // Update pill
  sessionPill.textContent = sessionCodeRaw
    ? `Session: ${sessionCodeRaw}`
    : "Session: all sessions";

  loadBtn.disabled = true;
  loadStatusEl.textContent = "Loading attempts…";

  try {
    const params = new URLSearchParams();
    if (sessionCodeRaw) params.set("sessionCode", sessionCodeRaw);
    if (classCodeRaw) params.set("classCode", classCodeRaw);

    // ✅ NEW: leveled practice filters (full|mini1|mini2) + (below|on|above)
    // Defaults preserve current behavior.
  const setVal = getSelectedPracticeSet();
if (setVal) params.set("set", setVal);

const levelVal = currentLevelParam || "";
if (levelVal) params.set("level", levelVal);

    // Determine if we're in a co-teacher view:
    // - There is an OWNER_EMAIL_FOR_VIEW from the URL
    // - And it's different from the currently signed-in teacher (if any)
    const ownerEmail = OWNER_EMAIL_FOR_VIEW || "";
    const isCoTeacherView =
      ownerEmail && (!teacherUser || teacherUser.email !== ownerEmail);

    // 🔐 Scoping rules:
    // - Co-teacher view → always use ownerEmail + sessionCode/classCode
    // - Regular signed-in teacher → use viewerEmail (owned + shared)
    // - Not signed in but we know an owner (e.g. owner opens link before sign-in)
    //   → fall back to ownerEmail
    if (isCoTeacherView) {
      params.set("ownerEmail", ownerEmail);
    } else if (teacherUser && teacherUser.email) {
      params.set("viewerEmail", teacherUser.email);
    } else if (ownerEmail) {
      params.set("ownerEmail", ownerEmail);
    }

    const res = await fetch(
      `/.netlify/functions/getReadingAttempts?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    const rawAttempts = Array.isArray(data.attempts) ? data.attempts : [];
    const attempts = getFirstAttemptsPerStudent(rawAttempts);

    if (!attempts.length) {
      renderDashboard([]);
      loadStatusEl.textContent =
        "No attempts found yet. Once students complete the practice, load again.";
    } else {
      renderDashboard(attempts);
      // Hydrate session history with real attempts
      updateSessionHistory(sessionCodeRaw, classCodeRaw, attempts);
      loadStatusEl.textContent = `Loaded ${attempts.length} attempt${
        attempts.length === 1 ? "" : "s"
      } from server. (first attempt per student)`;
    }

    // Enable live monitor for this session
    enableMonitorButton(sessionCodeRaw, classCodeRaw);
  } catch (err) {
    console.error("[Dashboard] Error loading attempts:", err);

    // No demo fallback: show an empty state + clear message
    renderDashboard([]);
    loadStatusEl.textContent =
      "Could not reach the server. Please check your connection or try again.";

    // You can still allow live monitor; if the server is fully down,
    // that page will show the same issue.
    enableMonitorButton(sessionCodeRaw, classCodeRaw);
  } finally {
    loadBtn.disabled = false;
  }
}

function enableMonitorButton(sessionCodeRaw, classCodeRaw) {
  if (!monitorSessionBtn) return;

  const session = (sessionCodeRaw || "").trim();
  const classCode = (classCodeRaw || "").trim();

  // No session? Turn the button off.
  if (!session) {
    monitorSessionBtn.disabled = true;
    monitorSessionBtn.onclick = null;
    return;
  }

  monitorSessionBtn.disabled = false;

  monitorSessionBtn.onclick = requireTeacherSignedIn(() => {
    const params = new URLSearchParams();

    // Live monitor expects `session`, `class`, `set`
    params.set("session", session.toUpperCase());
    if (classCode) params.set("class", classCode);

    // ✅ NEW: practice set selector (full | mini1 | mini2)
    const setParam = getSelectedPracticeSet();
    params.set("set", setParam);

    // OPTIONAL: include level if you are using it
    const levelSelect = document.getElementById("practice-level");
    const level = (levelSelect?.value || currentLevelParam || "").trim();
    if (level) params.set("level", level);

    // 🔑 Tie the live monitor to the same owner as the student link
    let ownerEmail = null;
    if (teacherUser && teacherUser.email) {
      ownerEmail = teacherUser.email;
    } else if (OWNER_EMAIL_FOR_VIEW) {
      ownerEmail = OWNER_EMAIL_FOR_VIEW;
    }
    if (ownerEmail) params.set("owner", ownerEmail);

    // Remember set/level for refresh behavior (non-fatal)
    try {
      window.localStorage.setItem("rp_lastSet", setParam);
      if (level) window.localStorage.setItem("rp_lastLevel", level);
      if (ownerEmail) window.localStorage.setItem("rp_lastOwnerEmail", ownerEmail);
    } catch (e) {}

    const url = `${window.location.origin}/teacher-dashboard/reading-practice/live-monitor.html?${params.toString()}`;
    window.open(url, "_blank");
  });
}

async function exportDashboardPDF() {
  try {
    const root = document.querySelector(".dashboard-main");
    if (!root) return;

    const canvas = await html2canvas(root, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const dateStr = new Date().toISOString().slice(0, 10);
    pdf.save(`reading-dashboard-${dateStr}.pdf`);
  } catch (e) {
    console.error("[Dashboard] PDF export failed:", e);
    alert("Sorry, something went wrong generating the PDF.");
  }
}

// ---------- BUILD & COPY STUDENT LINK ----------
function buildStudentLink(sessionCode, classCode) {
  const cleanSession = (sessionCode || "").trim().toUpperCase();
  const cleanClass = (classCode || "").trim();

  // Keep the normalized value in the inputs so the teacher sees it
  if (sessionInput) sessionInput.value = cleanSession;
  if (classInput && cleanClass) classInput.value = cleanClass;

  if (!cleanSession) return "";

  const baseUrl = `${window.location.origin}/teacher-dashboard/reading-practice/index.html`;
  const params = new URLSearchParams();
  params.set("session", cleanSession);

  if (cleanClass) params.set("class", cleanClass);

  // NEW: set = full | mini1 | mini2 (from selector)
  const setParam = getSelectedPracticeSet();
  params.set("set", setParam);

  // OPTIONAL: level (only if you’re using it)
  const levelSelect = document.getElementById("practice-level");
  const level = (levelSelect?.value || currentLevelParam || "").trim();
  if (level) params.set("level", level);

  // tie this student link to the signed-in teacher (owner of attempts)
  let ownerEmail = null;
  if (teacherUser && teacherUser.email) {
    ownerEmail = teacherUser.email;
  } else if (OWNER_EMAIL_FOR_VIEW) {
    ownerEmail = OWNER_EMAIL_FOR_VIEW;
  }
  if (ownerEmail) params.set("owner", ownerEmail);

  const link = `${baseUrl}?${params.toString()}`;

  try {
    window.localStorage.setItem("rp_lastSessionCode", cleanSession);
    if (cleanClass) window.localStorage.setItem("rp_lastSessionClass", cleanClass);
    window.localStorage.setItem("rp_lastSet", setParam);
    if (level) window.localStorage.setItem("rp_lastLevel", level);
    if (ownerEmail) window.localStorage.setItem("rp_lastOwnerEmail", ownerEmail);
  } catch (e) {
    // non-fatal
  }

  return link;
}
function buildCoTeacherLink(sessionCode, classCode) {
  const cleanSession = (sessionCode || "").trim().toUpperCase();
  const cleanClass = (classCode || "").trim();

  if (!cleanSession) {
    if (coTeacherLinkInput) coTeacherLinkInput.value = "";
    return "";
  }

  const baseUrl = `${window.location.origin}/teacher-dashboard/teacher-dashboard.html`;
  const params = new URLSearchParams();
  params.set("sessionCode", cleanSession);

  if (cleanClass) params.set("classCode", cleanClass);

  // NEW: include selected practice set (full | mini1 | mini2)
  const setParam = getSelectedPracticeSet();
  params.set("set", setParam);

  // OPTIONAL: level (only if you’re using it)
  const levelSelect = document.getElementById("practice-level");
  const level = (levelSelect?.value || currentLevelParam || "").trim();
  if (level) params.set("level", level);

  // the teacher who OWNS this data (for co-teacher access)
  let ownerEmail = null;

  if (teacherUser && teacherUser.email) {
    ownerEmail = teacherUser.email;
  } else if (OWNER_EMAIL_FOR_VIEW) {
    ownerEmail = OWNER_EMAIL_FOR_VIEW;
  } else {
    try {
      const lastOwner = window.localStorage.getItem("rp_lastOwnerEmail");
      if (lastOwner) ownerEmail = lastOwner;
    } catch (e) {}
  }

  if (ownerEmail) params.set("owner", ownerEmail);

  const link = `${baseUrl}?${params.toString()}`;

  if (coTeacherLinkInput) coTeacherLinkInput.value = link;

  try {
    window.localStorage.setItem("rp_lastCoTeacherLink", link);
    window.localStorage.setItem("rp_lastSet", setParam);
    if (level) window.localStorage.setItem("rp_lastLevel", level);
    if (ownerEmail) window.localStorage.setItem("rp_lastOwnerEmail", ownerEmail);
  } catch (e) {
    // non-fatal
  }

  return link;
}

function startNewSession() {
  const rawSession = sessionInput.value.trim();
  const rawClass = classInput.value.trim();

  if (!rawSession) {
    alert(
      "Type a Session Code first (for example: 6A-STARTTIME-DEC2), then click Start New Session."
    );
    sessionInput.focus();
    return;
  }

  // Build both links: student practice link + co-teacher dashboard link
  const studentLink = buildStudentLink(rawSession, rawClass);
  const coLink = buildCoTeacherLink(rawSession, rawClass);

  // Show the student link in its box
  if (sessionLinkInput) {
    sessionLinkInput.value = studentLink;
  }

  // Show the co-teacher link (if present)
  if (typeof coTeacherLinkInput !== "undefined" && coTeacherLinkInput) {
    coTeacherLinkInput.value = coLink;
  }

  // Update pill to match the new session
  const normalizedSession = rawSession.trim().toUpperCase();
  sessionPill.textContent = `Session: ${normalizedSession}`;

  // Little helper text
  if (copyLinkStatusEl) {
    copyLinkStatusEl.textContent =
      "Link ready. Click Copy to share with students.";
    copyLinkStatusEl.style.display = "inline";
  }

  // Remember this session in localStorage for convenience
  try {
    window.localStorage.setItem("rp_lastSessionCode", normalizedSession);
    window.localStorage.setItem("rp_lastSessionClass", rawClass || "");
    window.localStorage.setItem("rp_lastSessionLink", studentLink);
    // Note: rp_lastCoTeacherLink is already saved inside buildCoTeacherLink()

    const ownerEmail =
      OWNER_EMAIL_FOR_VIEW ||
      (teacherUser && teacherUser.email) ||
      "";
    if (ownerEmail) {
      window.localStorage.setItem("rp_lastOwnerEmail", ownerEmail);
    }
  } catch (e) {
    // non-fatal
  }

  enableMonitorButton(rawSession, rawClass);
}
(function wireLinkPreviewAutofill() {
  const setSelect = document.getElementById("practice-set");
  const levelSelect = document.getElementById("practice-level"); // only if you’re using level

  const refresh = () => {
    const session = (sessionInput?.value || "").trim();
    const cls = (classInput?.value || "").trim();
    if (!session) return;

    // only update the boxes if they already have something
    // (prevents overwriting if you later allow custom links)
    if (sessionLinkInput && sessionLinkInput.value) {
      sessionLinkInput.value = buildStudentLink(session, cls);
    }
    if (coTeacherLinkInput && coTeacherLinkInput.value) {
      coTeacherLinkInput.value = buildCoTeacherLink(session, cls);
    }

    enableMonitorButton(session, cls);
    if (typeof updateCurrentViewSummary === "function") updateCurrentViewSummary();
  };

  if (sessionInput) sessionInput.addEventListener("input", refresh);
  if (classInput) classInput.addEventListener("input", refresh);

  // NEW: selector change instead of checkbox
  if (setSelect) setSelect.addEventListener("change", refresh);

  // OPTIONAL: only if you keep the practice-level selector
  if (levelSelect) levelSelect.addEventListener("change", refresh);
})();


function copySessionLink() {
  if (!sessionLinkInput || !sessionLinkInput.value) {
    alert("No student link yet. Start a new session first.");
    return;
  }

  const text = sessionLinkInput.value;

  const showCopied = (message = "Copied!") => {
    if (!copyLinkStatusEl) return;
    copyLinkStatusEl.textContent = message;
    copyLinkStatusEl.style.opacity = "1";
    copyLinkStatusEl.style.visibility = "visible";
    setTimeout(() => {
      copyLinkStatusEl.style.opacity = "0";
      copyLinkStatusEl.style.visibility = "hidden";
      copyLinkStatusEl.textContent = "";
    }, 1800);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showCopied("Copied!"))
      .catch(() => showCopied("Copied (fallback)."));
  } else {
    // Fallback: select + execCommand
    sessionLinkInput.select();
    try {
      document.execCommand("copy");
      showCopied("Copied!");
    } catch (e) {
      console.warn("Copy failed:", e);
      showCopied("Unable to copy");
    } finally {
      sessionLinkInput.setSelectionRange(0, 0);
      sessionLinkInput.blur();
    }
  }
}

function copyCoTeacherLink() {
  if (!coTeacherLinkInput || !coTeacherLinkInput.value) {
    alert("No co-teacher link yet. Start a new session first.");
    return;
  }

  const text = coTeacherLinkInput.value;

  const showCopied = (message = "Copied!") => {
    if (!copyCoTeacherStatusEl) return;
    copyCoTeacherStatusEl.textContent = message;
    copyCoTeacherStatusEl.style.opacity = "1";
    copyCoTeacherStatusEl.style.visibility = "visible";
    setTimeout(() => {
      copyCoTeacherStatusEl.style.opacity = "0";
      copyCoTeacherStatusEl.style.visibility = "hidden";
      copyCoTeacherStatusEl.textContent = "";
    }, 1800);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => showCopied("Copied!"))
      .catch(() => showCopied("Copied (fallback)."));
  } else {
    coTeacherLinkInput.select();
    try {
      document.execCommand("copy");
      showCopied("Copied!");
    } catch (e) {
      console.warn("Copy failed:", e);
      showCopied("Unable to copy");
    } finally {
      coTeacherLinkInput.setSelectionRange(0, 0);
      coTeacherLinkInput.blur();
    }
  }
}

// ---------- AUTH WIRING ----------
function requireTeacherSignedIn(action) {
  return function (...args) {
    if (!teacherUser) {
      alert("Please sign in with Google before using the dashboard.");
      return;
    }
    return action(...args);
  };
}

// Wrap buttons that should only work when signed in
loadBtn.addEventListener(
  "click",
  requireTeacherSignedIn((e) => {
    e.preventDefault();
    loadAttempts();
  })
);

downloadCsvBtn.addEventListener(
  "click",
  requireTeacherSignedIn(exportCombinedCSV)
);
// Global student search (cross-session)
if (studentSearchBtn) {
  studentSearchBtn.addEventListener(
    "click",
    requireTeacherSignedIn((e) => {
      e.preventDefault();
      runStudentSearch();
    })
  );
}

if (studentSearchInput) {
  studentSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (teacherUser) {
        runStudentSearch();
      } else {
        alert("Please sign in with Google before using the dashboard.");
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      clearStudentSearch();
      studentSearchInput.blur();
    }
  });
}


if (exportPdfBtn) {
  exportPdfBtn.addEventListener(
    "click",
    requireTeacherSignedIn((e) => {
      e.preventDefault();
      exportDashboardPDF();
    })
  );
}

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener(
    "click",
    requireTeacherSignedIn((e) => {
      e.preventDefault();
      sessionInput.value = "";
      classInput.value = "";
      CURRENT_STUDENT_FOR_CHARTS = null;
      loadAttempts();
    })
  );
}

// Save prefs when filters change
sessionInput.addEventListener("input", () => saveDashboardPrefs());
classInput.addEventListener("input", () => saveDashboardPrefs());

// Clear student overlay button
if (clearStudentOverlayBtn) {
  clearStudentOverlayBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!CURRENT_STUDENT_FOR_CHARTS) return;
    CURRENT_STUDENT_FOR_CHARTS = null;
    renderDashboard(CURRENT_ATTEMPTS);
  });
}

// Student detail drawer close
if (studentDetailCloseBtn && studentDetailPanel) {
  studentDetailCloseBtn.addEventListener("click", () => {
    studentDetailPanel.classList.remove("is-open");
    CURRENT_STUDENT_FOR_CHARTS = null;
    renderDashboard(CURRENT_ATTEMPTS);
  });
}

// Start Session button (requires sign-in)
const startSessionBtn = document.getElementById("start-session-btn");
if (startSessionBtn) {
  startSessionBtn.addEventListener(
    "click",
    requireTeacherSignedIn((e) => {
      e.preventDefault();
      startNewSession();
    })
  );
}

// ====== FULLSCREEN CHARTS ======
function initChartFullscreen() {
  const overlay = document.getElementById("chart-fullscreen-backdrop");
  if (!overlay) return;

  let activeWrapper = null;

  function closeFullscreen() {
    if (!activeWrapper) return;
    activeWrapper.classList.remove("chart-wrapper-fullscreen");
    const closeBtn = activeWrapper.querySelector(".chart-fullscreen-close");
    if (closeBtn) {
      closeBtn.classList.remove("is-visible");
    }
    overlay.classList.remove("is-active");
    activeWrapper = null;
  }

  // Close on backdrop click
  overlay.addEventListener("click", closeFullscreen);

  // Close on Escape key
  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") {
      closeFullscreen();
    }
  });

  // Attach to all dashboard charts
  document.querySelectorAll(".dashboard-charts .chart-wrapper").forEach((wrapper) => {
    // Create a close button inside each wrapper (once)
    let closeBtn = wrapper.querySelector(".chart-fullscreen-close");
    if (!closeBtn) {
      closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "chart-fullscreen-close";
      closeBtn.setAttribute("aria-label", "Close full screen chart");
      closeBtn.innerHTML = "&times;";
      wrapper.appendChild(closeBtn);

      closeBtn.addEventListener("click", (evt) => {
        evt.stopPropagation(); // don’t re-trigger the wrapper click
        closeFullscreen();
      });
    }

    // Click chart to open fullscreen
    wrapper.addEventListener("click", () => {
      // If this chart is already fullscreen, ignore (or you could close here)
      if (activeWrapper === wrapper) return;

      // If some other chart is open, close it first
      if (activeWrapper) {
        activeWrapper.classList.remove("chart-wrapper-fullscreen");
        const prevBtn = activeWrapper.querySelector(".chart-fullscreen-close");
        if (prevBtn) prevBtn.classList.remove("is-visible");
      }

      activeWrapper = wrapper;
      wrapper.classList.add("chart-wrapper-fullscreen");
      closeBtn.classList.add("is-visible");
      overlay.classList.add("is-active");
    });
  });
}

// Try to restore last Google user for *display only* (NOT authenticated)
(function restoreTeacherFromLocalStorage() {
  try {
    const raw = window.localStorage.getItem("rp_last_google_user");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.email) return;

    const restoredEmail = String(parsed.email);

    // ✅ UI hint only: keep Sign In visible because this is NOT real auth
    // (Avoids the dashboard pretending the teacher is authenticated.)
    if (teacherSignInBtn) teacherSignInBtn.style.display = "inline-flex";
    if (teacherSignOutBtn) teacherSignOutBtn.style.display = "none";
    if (teacherSignOutBtn) teacherSignOutBtn.textContent = "Sign out";

    // ✅ You MAY set owner for link-building convenience
    if (!OWNER_EMAIL_FOR_VIEW) OWNER_EMAIL_FOR_VIEW = restoredEmail;

    // ❌ Do NOT hydrate from server here (requires real auth)
  } catch (e) {
    console.warn("[Dashboard] Could not restore teacher from localStorage:", e);
  }
})();

// Sidebar collapse / expand
historyToggleBtn.addEventListener("click", () => {
  const isCollapsed = historySidebar.classList.toggle("collapsed");
  historyToggleBtn.textContent = isCollapsed ? "⮞ Expand" : "⮜ Collapse";
});

// Copy Link button
if (copySessionLinkBtn) {
  copySessionLinkBtn.addEventListener("click", (e) => {
    e.preventDefault();
    copySessionLink();
  });
}
if (copyCoTeacherLinkBtn) {
  copyCoTeacherLinkBtn.addEventListener("click", (e) => {
    e.preventDefault();
    copyCoTeacherLink();
  });
}

// ---------- INITIAL LOAD ----------
// Load any saved filter prefs
loadDashboardPrefs();

// Enable click-to-fullscreen on dashboard charts
initChartFullscreen();

// Initial render: empty dashboard + any stored history
renderDashboard([]);
renderSessionHistory(loadHistoryFromStorage());

// Use URL ?sessionCode=&classCode=&owner= to pre-fill filters
(function applyUrlFiltersOnLoad() {
  try {
    const params = new URLSearchParams(window.location.search);

    const urlSession = params.get("sessionCode") || params.get("session");
    const urlClass = params.get("classCode") || params.get("class");
    const urlOwner = params.get("owner") || params.get("ownerEmail");

    // NEW: set can be full | mini1 | mini2 (and legacy "mini")
    const rawSet = (params.get("set") || "").toLowerCase();
    const urlSet = normalizeSetParam(rawSet); // full | mini1 | mini2

    // OPTIONAL: level (if you keep this feature)
    const urlLevelRaw = (params.get("level") || "on").toLowerCase();
    currentLevelParam = ["on", "below", "above"].includes(urlLevelRaw)
      ? urlLevelRaw
      : "on";

    // Sync level selector (if present)
    const levelSelect = document.getElementById("practice-level");
    if (levelSelect) levelSelect.value = currentLevelParam;
    try {
      localStorage.setItem("rp_lastLevel", currentLevelParam);
    } catch (e) {}

// Owner email for co-teacher / shared view (ONLY when provided by URL)
if (urlOwner) {
  OWNER_EMAIL_FOR_VIEW = String(urlOwner || "").trim().toLowerCase();
  OWNER_EMAIL_FROM_URL = true;
  try {
    localStorage.setItem("rp_lastOwnerEmail", OWNER_EMAIL_FOR_VIEW);
  } catch (e) {}
}


    // Prefill session + pill
    if (urlSession && sessionInput) {
      sessionInput.value = urlSession;
      if (sessionPill) sessionPill.textContent = `Session: ${urlSession}`;
    }

    // Prefill class
    if (urlClass && classInput) {
      classInput.value = urlClass;
    }

    // ✅ Sync practice set from URL into selector
    const setSelect = document.getElementById("practice-set");
    if (setSelect) {
      setSelect.value = urlSet;
    }
    currentSetParam = urlSet;

    try {
      localStorage.setItem("rp_lastSet", urlSet);
    } catch (e) {}

    // Auto-load if a session or class was provided
    if ((urlSession || urlClass) && typeof loadAttempts === "function") {
      loadAttempts();
    }

    // Keep monitor button & view summary aligned after URL-prefill
    const session = (sessionInput?.value || "").trim();
    const cls = (classInput?.value || "").trim();
    enableMonitorButton(session, cls);
    if (typeof updateCurrentViewSummary === "function") updateCurrentViewSummary();
  } catch (e) {
    console.warn("[Dashboard] Could not parse URL filters:", e);
  }
})();



// Optional: restore last session info into the UI on load
(function restoreLastSession() {
  try {
    const lastCode = window.localStorage.getItem("rp_lastSessionCode");
    const lastClass = window.localStorage.getItem("rp_lastSessionClass");
    const lastLink = window.localStorage.getItem("rp_lastSessionLink");
    const lastCoLink = window.localStorage.getItem("rp_lastCoTeacherLink");
    const lastOwner = window.localStorage.getItem("rp_lastOwnerEmail");

    if (lastCode && sessionInput && !sessionInput.value) {
      sessionInput.value = lastCode;
      sessionPill.textContent = `Session: ${lastCode}`;
    }

    if (lastClass && classInput && !classInput.value) {
      classInput.value = lastClass;
    }

    if (lastLink && sessionLinkInput && !sessionLinkInput.value) {
      sessionLinkInput.value = lastLink;
    }

    if (lastCoLink && coTeacherLinkInput && !coTeacherLinkInput.value) {
      coTeacherLinkInput.value = lastCoLink;
    }

    // If we don't already have an owner (e.g. not a co-teacher URL), restore from localStorage
    if (lastOwner && !OWNER_EMAIL_FOR_VIEW) {
      OWNER_EMAIL_FOR_VIEW = lastOwner;
    }

    // Also re-enable the live monitor button for this session
    if (lastCode) {
      enableMonitorButton(lastCode, lastClass || "");
    }
  } catch (e) {
    // ignore
  }
})();


document.addEventListener("DOMContentLoaded", () => {
  if (window.RP_AUTH && typeof window.RP_AUTH.initGoogleAuth === "function") {
    window.RP_AUTH.initGoogleAuth();
  }

  const signInBtn = document.getElementById("teacher-signin-btn");
  const gsiHost = document.getElementById("teacher-gsi-button-container");
  const signOutBtn = document.getElementById("teacher-signout-btn");
  const authStatusEl = document.getElementById("teacher-auth-status"); // optional

  function openTeacherSignIn() {
    // Hide your button immediately so only Google's chooser is visible
    if (signInBtn) signInBtn.style.display = "none";

    // Show GIS host (if you’re using one)
    if (gsiHost) {
      gsiHost.style.display = "block";
      gsiHost.setAttribute("aria-hidden", "false");
    }

    // Trigger Google sign-in
    if (window.RP_AUTH && typeof window.RP_AUTH.promptSignIn === "function") {
      window.RP_AUTH.promptSignIn();
    } else {
      // Restore button if sign-in isn't ready
      if (signInBtn) signInBtn.style.display = "inline-flex";
      alert("Google sign-in is not ready yet. Please try again in a moment.");
    }
  }

  if (signInBtn) {
    signInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openTeacherSignIn();
    });

    signInBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openTeacherSignIn();
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener("click", () => {
      window.RP_AUTH?.signOut?.();
    });
  }

  if (window.RP_AUTH && typeof window.RP_AUTH.onAuthChange === "function") {
    window.RP_AUTH.onAuthChange((user) => {
      teacherUser = user || null;
      const signedIn = !!teacherUser;

      // Button visibility
      if (signInBtn) signInBtn.style.display = signedIn ? "none" : "inline-flex";
      if (signOutBtn) signOutBtn.style.display = signedIn ? "inline-flex" : "none";

      // Optional status line
      if (authStatusEl) {
        if (signedIn) {
          authStatusEl.textContent = teacherUser?.email
            ? `Signed in as ${teacherUser.email}`
            : "Signed in";
          authStatusEl.style.display = "";
        } else {
          authStatusEl.textContent = "";
          authStatusEl.style.display = "none";
        }
      }

      // Hide GIS host after sign-in
      if (gsiHost && signedIn) {
        gsiHost.style.display = "none";
        gsiHost.setAttribute("aria-hidden", "true");
      }

      // Owner logic (your existing behavior)
      if (signedIn && !OWNER_EMAIL_FROM_URL) {
        OWNER_EMAIL_FOR_VIEW = teacherUser.email;
      }

      const isCoTeacherView =
        OWNER_EMAIL_FROM_URL &&
        OWNER_EMAIL_FOR_VIEW &&
        teacherUser?.email &&
        OWNER_EMAIL_FOR_VIEW !== teacherUser.email;

      // Hydrate history (main teacher only)
      if (signedIn && !isCoTeacherView && typeof hydrateSessionHistoryFromServer === "function") {
        hydrateSessionHistoryFromServer(teacherUser.email);
      }
    });
  }
});


