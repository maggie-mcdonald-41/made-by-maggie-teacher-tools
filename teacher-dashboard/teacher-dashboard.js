// teacher-dashboard.js
// UI for viewing reading practice attempts by session / class,
// with a left sidebar session-history panel and a CSV export
// (one row per student × skill).

// ---------- DEMO DATA FOR LOCAL TESTING (no Netlify functions needed) ----------
const DEMO_ATTEMPTS = [
  {
    studentName: "Avery Johnson",
    classCode: "6A",
    sessionCode: "6TH PERIOD",
    numCorrect: 12,
    totalQuestions: 18,
    bySkill: {
      "Main Idea": { correct: 3, total: 4 },
      "Vocabulary": { correct: 4, total: 6 },
      "Structure": { correct: 5, total: 8 }
    },
    byType: {
      mcq:      { correct: 4, total: 6 },
      multi:    { correct: 3, total: 5 },
      dropdown: { correct: 2, total: 4 },
      order:    { correct: 3, total: 3 }
    },
    startedAt: "2025-01-10T14:03:11Z",
    finishedAt: "2025-01-10T14:17:52Z"
  },
  {
    studentName: "Avery Johnson",
    classCode: "6A",
    sessionCode: "6TH PERIOD",
    numCorrect: 14,
    totalQuestions: 18,
    bySkill: {
      "Main Idea": { correct: 3, total: 4 },
      "Vocabulary": { correct: 5, total: 6 },
      "Structure": { correct: 6, total: 8 }
    },
    byType: {
      mcq:      { correct: 5, total: 6 },
      multi:    { correct: 4, total: 5 },
      dropdown: { correct: 3, total: 4 },
      order:    { correct: 2, total: 3 }
    },
    startedAt: "2025-01-11T14:03:11Z",
    finishedAt: "2025-01-11T14:17:52Z"
  },
  {
    studentName: "Jordan Lee",
    classCode: "6A",
    sessionCode: "6TH PERIOD",
    numCorrect: 8,
    totalQuestions: 18,
    bySkill: {
      "Main Idea": { correct: 2, total: 4 },
      "Vocabulary": { correct: 2, total: 6 },
      "Structure": { correct: 4, total: 8 }
    },
    byType: {
      mcq:      { correct: 2, total: 6 },
      multi:    { correct: 1, total: 5 },
      dropdown: { correct: 2, total: 4 },
      order:    { correct: 3, total: 3 }
    },
    startedAt: "2025-01-13T12:15:00Z",
    finishedAt: "2025-01-13T12:29:10Z"
  },
  {
    studentName: "Emily Parker",
    classCode: "6B",
    sessionCode: "6TH PERIOD",
    numCorrect: 16,
    totalQuestions: 18,
    bySkill: {
      "Main Idea": { correct: 4, total: 4 },
      "Vocabulary": { correct: 6, total: 6 },
      "Structure": { correct: 6, total: 8 }
    },
    byType: {
      mcq:      { correct: 6, total: 6 },
      multi:    { correct: 4, total: 5 },
      dropdown: { correct: 3, total: 4 },
      order:    { correct: 3, total: 3 }
    },
    startedAt: "2025-01-12T15:45:50Z",
    finishedAt: "2025-01-12T16:01:05Z"
  }
];

// Keeps track of the *currently displayed* attempts for CSV export
let CURRENT_ATTEMPTS = [];
// Which student's data is being overlaid on the charts (if any)
let CURRENT_STUDENT_FOR_CHARTS = null;
// ---- Live Monitor shared state ----
let currentSessionCode = "";   // e.g. "MONDAY EVENING"
let currentClassFilter = "";   // e.g. "7TH", or "" for all
let currentSetParam = "full";  // "full" or "mini"


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

// Auth DOM
const teacherSignInBtn = document.getElementById("teacher-signin-btn");
const teacherSignOutBtn = document.getElementById("teacher-signout-btn");

let teacherUser = null;

// NEW: which teacher actually OWNS the data we’re viewing.
// - For the main teacher: usually their own email.
// - For co-teachers: comes from ?owner= in the dashboard link.
let OWNER_EMAIL_FOR_VIEW = null;

// ---------- UTILITIES ----------
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


// Answered label: "X of Y" + hint if partial
function formatAnsweredLabel(attempt) {
  const total = Number(attempt.totalQuestions || 0);
  const answered = Number(attempt.answeredCount || 0);

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

/**
 * Update history based on the latest loaded attempts.
 */
function updateSessionHistory(sessionCodeRaw, classCodeRaw, attempts) {
  if (!sessionCodeRaw) return;

  const sessionCode = sessionCodeRaw.trim();
  const classCode = (classCodeRaw || "").trim();
  const nowIso = new Date().toISOString();

  const history = loadHistoryFromStorage() || [];

  // Calculate aggregates if we have attempts, otherwise use zeros
  let attemptsCount = 0;
  let totalQuestions = 0;
  let totalCorrect = 0;
  const uniqueStudentNames = new Set();

  if (Array.isArray(attempts) && attempts.length > 0) {
    attemptsCount = attempts.length;

    attempts.forEach((a) => {
      totalQuestions += Number(a.totalQuestions || 0);
      totalCorrect += Number(a.numCorrect || 0);

      if (a.studentName) {
        uniqueStudentNames.add(String(a.studentName).trim());
      }
    });
  }

  const uniqueStudentsCount = uniqueStudentNames.size;

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
  if (!viewerEmail || typeof fetch === "undefined") return;

  try {
    const params = new URLSearchParams();
    params.set("viewerEmail", viewerEmail);

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
          lastLoadedAt: a.finishedAt || a.startedAt || null,
          attemptsCount: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          uniqueStudents: new Set(),
        });
      }

      const entry = grouped.get(key);

      entry.attemptsCount += 1;
      entry.totalQuestions += Number(a.totalQuestions || 0);
      entry.totalCorrect += Number(a.numCorrect || 0);

      if (a.studentName) {
        entry.uniqueStudents.add(String(a.studentName).trim());
      }

      const t = a.finishedAt || a.startedAt;
      if (t && (!entry.lastLoadedAt || t > entry.lastLoadedAt)) {
        entry.lastLoadedAt = t;
      }
    });

    const serverHistory = Array.from(grouped.values()).map((entry) => ({
      sessionCode: entry.sessionCode,
      classCode: entry.classCode,
      lastLoadedAt:
        entry.lastLoadedAt || new Date().toISOString(),
      attemptsCount: entry.attemptsCount,
      totalQuestions: entry.totalQuestions,
      totalCorrect: entry.totalCorrect,
      uniqueStudentsCount: entry.uniqueStudents.size,
    }));

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

    saveHistoryToStorage(mergedHistory);
    renderSessionHistory(mergedHistory);
  } catch (err) {
    console.warn(
      "[Dashboard] Could not hydrate session history from server:",
      err
    );
    // fall back to local history if something goes wrong
    const existing = loadHistoryFromStorage();
    renderSessionHistory(existing);
  }
}

// ---------- HISTORY RENDERING ----------
function renderSessionHistory(history) {
  historyListEl.innerHTML = "";

  if (!history || !history.length) {
    const p = document.createElement("p");
    p.className = "history-empty muted";
    p.textContent = "No sessions saved yet. Load a session to add it here.";
    historyListEl.appendChild(p);
    return;
  }

  const sorted = history.slice().sort((a, b) => {
    const ta = new Date(a.lastLoadedAt).getTime();
    const tb = new Date(b.lastLoadedAt).getTime();
    return tb - ta; // newest first
  });

  sorted.forEach((entry) => {
    const accuracy = entry.totalQuestions
      ? Math.round((entry.totalCorrect / entry.totalQuestions) * 100)
      : 0;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "history-item";

    const main = document.createElement("div");
    main.className = "history-main";

    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = entry.sessionCode;

    const meta = document.createElement("div");
    meta.className = "history-meta";
    const classPart = entry.classCode ? `Class: ${entry.classCode} · ` : "";
    meta.textContent =
      `${classPart}${entry.attemptsCount} attempt${entry.attemptsCount === 1 ? "" : "s"} · ` +
      `${entry.uniqueStudentsCount || 0} student${(entry.uniqueStudentsCount || 0) === 1 ? "" : "s"}`;

    main.appendChild(title);
    main.appendChild(meta);

    const pill = document.createElement("div");
    pill.className = "history-pill";
    pill.textContent = `${accuracy}% · ${formatDate(entry.lastLoadedAt)}`;

    btn.appendChild(main);
    btn.appendChild(pill);

    btn.addEventListener("click", () => {
      // Load this session into the filters and refresh dashboard
      sessionInput.value = entry.sessionCode;
      classInput.value = entry.classCode || "";
      loadAttempts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    historyListEl.appendChild(btn);
  });
}

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
    const band = bands.find(b => pct >= b.min && pct <= b.max);
    if (band) band.count++;
  };

  allAttempts.forEach(a => {
    if (!a.totalQuestions) return;
    const pct = Math.round(((a.numCorrect || 0) / a.totalQuestions) * 100);
    bumpBand(bandsAll, pct);
  });

  studentAttempts.forEach(a => {
    if (!a.totalQuestions) return;
    const pct = Math.round(((a.numCorrect || 0) / a.totalQuestions) * 100);
    bumpBand(bandsSelected, pct);
  });

  const labels = bandsAll.map(b => b.label);
  const allData = bandsAll.map(b => b.count);
  const studentData = bandsSelected.map(b => b.count);

  const datasets = [
    {
      label: "All students in view",
      data: allData
    }
  ];

  const hasStudentData =
    studentAttempts &&
    studentAttempts.length > 0 &&
    studentData.some(v => v > 0);

  if (studentName && hasStudentData) {
    datasets.push({
      label: studentName,
      data: studentData
    });
  }

  // If there is literally no data (no attempts at all), destroy chart
  const totalAll = allData.reduce((s, n) => s + n, 0);
  if (!totalAll && !hasStudentData) {
    if (scoreBandsChart) {
      scoreBandsChart.destroy();
      scoreBandsChart = null;
    }
    return;
  }

  if (scoreBandsChart) {
    scoreBandsChart.data.labels = labels;
    scoreBandsChart.data.datasets = datasets;
    scoreBandsChart.update();
  } else {
    scoreBandsChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }
}

function updateTypeAccuracyChart(allAttempts, studentAttempts = [], studentName = null) {
  const canvas = document.getElementById("chart-type-accuracy");
  if (!canvas || typeof Chart === "undefined") return;

  const typeTotalsAll = {};
  const typeTotalsStudent = {};

  allAttempts.forEach(a => {
    if (!a.byType) return;
    Object.entries(a.byType).forEach(([type, stats]) => {
      if (!typeTotalsAll[type]) {
        typeTotalsAll[type] = { correct: 0, total: 0 };
      }
      typeTotalsAll[type].correct += stats.correct || 0;
      typeTotalsAll[type].total += stats.total || 0;
    });
  });

  studentAttempts.forEach(a => {
    if (!a.byType) return;
    Object.entries(a.byType).forEach(([type, stats]) => {
      if (!typeTotalsStudent[type]) {
        typeTotalsStudent[type] = { correct: 0, total: 0 };
      }
      typeTotalsStudent[type].correct += stats.correct || 0;
      typeTotalsStudent[type].total += stats.total || 0;
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

  const allKeys = new Set([
    ...Object.keys(typeTotalsAll),
    ...Object.keys(typeTotalsStudent)
  ]);

  const labels = [];
  const classData = [];
  const studentData = [];

  allKeys.forEach(type => {
    const friendly = friendlyLabels[type] || type;
    labels.push(friendly);

    const allStats = typeTotalsAll[type] || { correct: 0, total: 0 };
    const stuStats = typeTotalsStudent[type] || { correct: 0, total: 0 };

    const allPct = allStats.total
      ? Math.round((allStats.correct / allStats.total) * 100)
      : 0;
    const stuPct = stuStats.total
      ? Math.round((stuStats.correct / stuStats.total) * 100)
      : 0;

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

  const datasets = [
    {
      label: "All students in view",
      data: classData
    }
  ];

  const hasStudentBars = studentData.some(v => v > 0);
  if (studentName && hasStudentBars) {
    datasets.push({
      label: studentName,
      data: studentData
    });
  }

  if (typeAccuracyChart) {
    typeAccuracyChart.data.labels = labels;
    typeAccuracyChart.data.datasets = datasets;
    typeAccuracyChart.update();
  } else {
    typeAccuracyChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
}

function updateSkillAccuracyChart(skillTotalsAll, skillTotalsStudent = {}, studentName = null) {
  const canvas = document.getElementById("chart-skill-accuracy");
  if (!canvas || typeof Chart === "undefined") return;

  const allKeys = new Set([
    ...Object.keys(skillTotalsAll || {}),
    ...Object.keys(skillTotalsStudent || {})
  ]);

  const labels = [];
  const classData = [];
  const studentData = [];

  allKeys.forEach(skill => {
    const allStats = (skillTotalsAll && skillTotalsAll[skill]) || {
      correct: 0,
      total: 0
    };
    const stuStats = (skillTotalsStudent && skillTotalsStudent[skill]) || {
      correct: 0,
      total: 0
    };

    const allPct = allStats.total
      ? Math.round((allStats.correct / allStats.total) * 100)
      : 0;
    const stuPct = stuStats.total
      ? Math.round((stuStats.correct / stuStats.total) * 100)
      : 0;

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

  const datasets = [
    {
      label: "All students in view",
      data: classData
    }
  ];

  const hasStudentBars = studentData.some(v => v > 0);
  if (studentName && hasStudentBars) {
    datasets.push({
      label: studentName,
      data: studentData
    });
  }

  if (skillAccuracyChart) {
    skillAccuracyChart.data.labels = labels;
    skillAccuracyChart.data.datasets = datasets;
    skillAccuracyChart.update();
  } else {
    skillAccuracyChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
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
      if (!stats.total || stats.total < 3) return; // ignore tiny samples
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

    return;
  }

  studentDetailPanel.classList.add("is-open");
  studentDetailNameEl.textContent = studentName;

  // Overall stats across all attempts
  const totals = studentAttempts.reduce(
    (acc, a) => {
      acc.correct += a.numCorrect || 0;
      acc.total += a.totalQuestions || 0;
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

  // === Progress-over-time chart ===
  const chartCanvas = document.getElementById("student-detail-progress-chart");
  if (chartCanvas && typeof Chart !== "undefined") {
    // Sort attempts by finishedAt/startedAt ascending
    const sortedAttempts = studentAttempts
      .slice()
      .sort((a, b) => {
        const aTime = (a.finishedAt || a.startedAt || "").toString();
        const bTime = (b.finishedAt || b.startedAt || "").toString();
        return aTime.localeCompare(bTime);
      });

    const labels = sortedAttempts.map((a, idx) => {
      const when = a.finishedAt || a.startedAt;
      const labelDate = when ? formatDate(when) : `Attempt ${idx + 1}`;
      return `${idx + 1}. ${labelDate}`;
    });

    // Overall %
    const overallData = sortedAttempts.map((a) => {
      const total = a.totalQuestions || 0;
      const correct = a.numCorrect || 0;
      return total ? Math.round((correct / total) * 100) : 0;
    });

    // Aggregate skills to pick the top 2–3 for lines
    const aggregateBySkill = {};
    sortedAttempts.forEach((a) => {
      const map = a.bySkill || {};
      Object.entries(map).forEach(([skill, stats]) => {
        if (!aggregateBySkill[skill]) {
          aggregateBySkill[skill] = { correct: 0, total: 0 };
        }
        aggregateBySkill[skill].correct += stats.correct || 0;
        aggregateBySkill[skill].total += stats.total || 0;
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
        const s = (a.bySkill && a.bySkill[skillName]) || {
          correct: 0,
          total: 0
        };
        const total = s.total || 0;
        const correct = s.correct || 0;
        return total ? Math.round((correct / total) * 100) : 0;
      });

      datasets.push({
        label: skillName,
        data: series,
        borderWidth: 1.5,
        pointRadius: 3
      });
    });

    if (studentProgressChart) {
      studentProgressChart.data.labels = labels;
      studentProgressChart.data.datasets = datasets;
      studentProgressChart.update();
    } else {
      studentProgressChart = new Chart(chartCanvas, {
        type: "line",
        data: { labels, datasets },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => `${value}%`
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              onClick: (e, legendItem, legend) => {
                const ci = legend.chart;
                const index = legendItem.datasetIndex;
                const meta = ci.getDatasetMeta(index);
                meta.hidden = meta.hidden === null
                  ? !ci.data.datasets[index].hidden
                  : null;
                ci.update();
              }
            }
          }
        }
      });
    }
  }
  // Build per-skill list from skillTotalsSelected
  const entries = Object.entries(skillTotalsSelected || {});
  if (!entries.length) {
    studentDetailNeedsWorkEl.innerHTML = '<li class="muted">Not enough skill data yet.</li>';
    studentDetailStrengthsEl.innerHTML = '<li class="muted">Not enough skill data yet.</li>';
  } else {
    const skillsWithPct = entries
      .filter(([, stats]) => stats.total && stats.total >= 3) // require some data
      .map(([skill, stats]) => ({
        skill,
        pct: (stats.correct / stats.total) * 100,
        total: stats.total
      }));

    if (!skillsWithPct.length) {
      studentDetailNeedsWorkEl.innerHTML = '<li class="muted">Not enough skill data yet.</li>';
      studentDetailStrengthsEl.innerHTML = '<li class="muted">Not enough skill data yet.</li>';
      return;
    }

    // Sort ascending for "needs work", descending for strengths
    const sortedByLow = [...skillsWithPct].sort((a, b) => a.pct - b.pct);
    const sortedByHigh = [...skillsWithPct].sort((a, b) => b.pct - a.pct);

    const needsWork = sortedByLow.slice(0, 2);
    const strengths = sortedByHigh.slice(0, 2);

    const makeLi = ({ skill, pct, total }) =>
      `<li>${skill}: ${Math.round(pct)}% (${total} questions)</li>`;

    studentDetailNeedsWorkEl.innerHTML =
      needsWork.length
        ? needsWork.map(makeLi).join("")
        : '<li class="muted">No clear weaknesses yet.</li>';

    studentDetailStrengthsEl.innerHTML =
      strengths.length
        ? strengths.map(makeLi).join("")
        : '<li class="muted">No clear strengths yet.</li>';
  }
}

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

    // Make row clickable to toggle student overlay
    if (studentName && studentName !== "—") {
      tr.dataset.studentName = studentName;

      if (CURRENT_STUDENT_FOR_CHARTS === studentName) {
        tr.classList.add("is-selected-student");
      }

      tr.addEventListener("click", () => {
        if (CURRENT_STUDENT_FOR_CHARTS === studentName) {
          CURRENT_STUDENT_FOR_CHARTS = null;
        } else {
          CURRENT_STUDENT_FOR_CHARTS = studentName;
        }
        renderDashboard(attempts);
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

    // UPDATED: scope results based on sign-in state
    // - If teacher is signed in, use viewerEmail → get all owned + shared sessions
    // - If not signed in but we have an OWNER_EMAIL_FOR_VIEW (co-teacher link),
    //   use ownerEmail → show the owner's data for that session
    if (teacherUser && teacherUser.email) {
      params.set("viewerEmail", teacherUser.email);
    } else {
      const ownerEmail = OWNER_EMAIL_FOR_VIEW || "";
      if (ownerEmail) {
        params.set("ownerEmail", ownerEmail);
      }
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
    const attempts = Array.isArray(data.attempts) ? data.attempts : [];

    if (!attempts.length) {
      renderDashboard([]);
      loadStatusEl.textContent =
        "No attempts found yet. Once students complete the practice, load again.";
    } else {
      renderDashboard(attempts);
      updateSessionHistory(sessionCodeRaw, classCodeRaw, attempts);
      loadStatusEl.textContent = `Loaded ${attempts.length} attempt${
        attempts.length === 1 ? "" : "s"
      } from server.`;
    }

    // Enable live monitor for this session
    enableMonitorButton(sessionCodeRaw, classCodeRaw);
  } catch (err) {
    console.error(
      "[Dashboard] Error loading attempts, falling back to demo:",
      err
    );

    // --------- SMART DEMO FALLBACK ---------
    // Start with all demo attempts
    const allDemo = DEMO_ATTEMPTS.slice();

    const sessionCodeRaw2 = sessionInput.value.trim();
    const classCodeRaw2 = classInput.value.trim();

    let filtered = allDemo;

    // Apply filters to demo data, if any
    if (sessionCodeRaw2) {
      const codeUpper = sessionCodeRaw2.toUpperCase();
      filtered = filtered.filter(
        (a) => (a.sessionCode || "").toUpperCase() === codeUpper
      );
    }

    if (classCodeRaw2) {
      const classUpper = classCodeRaw2.toUpperCase();
      filtered = filtered.filter(
        (a) => (a.classCode || "").toUpperCase() === classUpper
      );
    }

    let attemptsToShow = filtered;
    let statusMessage =
      "Could not reach the server. Showing demo data instead.";

    // If filters wipe everything out, show full demo so you still see samples
    if (!attemptsToShow.length) {
      attemptsToShow = allDemo;
      statusMessage =
        "Could not reach the server. Showing all demo data (no real attempts stored yet).";
    } else if (sessionCodeRaw2 || classCodeRaw2) {
      statusMessage =
        "Could not reach the server. Showing demo data filtered by your choices.";
    }

    renderDashboard(attemptsToShow);
    loadStatusEl.textContent = statusMessage;

    // Using demo data – live monitor should stay disabled
    enableMonitorButton(sessionCodeRaw2, classCodeRaw2);
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
    if (classCode) {
      params.set("class", classCode);
    }

    // Match the mini/full set choice for live monitor as well
    const miniCheckbox = document.getElementById("use-mini-set");
    if (miniCheckbox && miniCheckbox.checked) {
      params.set("set", "mini");
    } else {
      params.set("set", "full");
    }

    // 🔑 NEW: tie the live monitor to the same owner as the student link
    let ownerEmail = null;
    if (teacherUser && teacherUser.email) {
      ownerEmail = teacherUser.email;
    } else if (OWNER_EMAIL_FOR_VIEW) {
      // co-teacher viewing another teacher’s data
      ownerEmail = OWNER_EMAIL_FOR_VIEW;
    }

    if (ownerEmail) {
      params.set("owner", ownerEmail);
    }

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

// ---------- NEW: BUILD & COPY STUDENT LINK ----------
function buildStudentLink(sessionCode, classCode) {
  const cleanSession = sessionCode.trim().toUpperCase();
  const cleanClass = (classCode || "").trim();

  // Keep the normalized value in the inputs so the teacher sees it
  sessionInput.value = cleanSession;
  if (cleanClass) {
    classInput.value = cleanClass;
  }

  const baseUrl = `${window.location.origin}/teacher-dashboard/reading-practice/index.html`;
  const params = new URLSearchParams();
  params.set("session", cleanSession);
  if (cleanClass) {
    params.set("class", cleanClass);
  }

  // set = mini | full
  const miniCheckbox = document.getElementById("use-mini-set");
  if (miniCheckbox && miniCheckbox.checked) {
    params.set("set", "mini");
  } else {
    params.set("set", "full");
  }

  // tie this student link to the signed-in teacher (owner of attempts)
  let ownerEmail = null;
  if (teacherUser && teacherUser.email) {
    ownerEmail = teacherUser.email;
  } else if (OWNER_EMAIL_FOR_VIEW) {
    // Fallback for co-teacher viewing another teacher’s sessions
    ownerEmail = OWNER_EMAIL_FOR_VIEW;
  }

  if (ownerEmail) {
    params.set("owner", ownerEmail);
  }

  const link = `${baseUrl}?${params.toString()}`;

  try {
    window.localStorage.setItem("rp_lastSessionCode", cleanSession);
    if (cleanClass) {
      window.localStorage.setItem("rp_lastSessionClass", cleanClass);
    }
    if (ownerEmail) {
      window.localStorage.setItem("rp_lastOwnerEmail", ownerEmail);
    }
  } catch (e) {
    // non-fatal
  }

  return link;
}


function buildCoTeacherLink(sessionCode, classCode) {
  const cleanSession = sessionCode.trim().toUpperCase();
  const cleanClass = (classCode || "").trim();

  if (!cleanSession) {
    if (coTeacherLinkInput) {
      coTeacherLinkInput.value = "";
    }
    return "";
  }

  const baseUrl = `${window.location.origin}/teacher-dashboard/teacher-dashboard.html`;

  const params = new URLSearchParams();
  params.set("sessionCode", cleanSession);
  if (cleanClass) {
    params.set("classCode", cleanClass);
  }

  // the teacher who actually OWNS this data (for co-teacher access)
  const ownerEmail =
    OWNER_EMAIL_FOR_VIEW ||
    (teacherUser && teacherUser.email) ||
    "";
  if (ownerEmail) {
    params.set("owner", ownerEmail);
  }

  const link = `${baseUrl}?${params.toString()}`;

  if (coTeacherLinkInput) {
    coTeacherLinkInput.value = link;
  }

  // remember it for restore-on-refresh
  try {
    window.localStorage.setItem("rp_lastCoTeacherLink", link);
    if (ownerEmail) {
      window.localStorage.setItem("rp_lastOwnerEmail", ownerEmail);
    }
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

// Google auth buttons
teacherSignInBtn.addEventListener("click", () => {
  if (!window.RP_AUTH) {
    alert("Google sign-in is not ready yet. Please try again in a moment.");
    return;
  }
  RP_AUTH.promptSignIn();
});

teacherSignOutBtn.addEventListener("click", () => {
  if (window.RP_AUTH) {
    RP_AUTH.signOut();
  }
});

// Listen for auth changes
if (window.RP_AUTH) {
  RP_AUTH.onAuthChange((user) => {
    teacherUser = user;

    if (teacherUser) {
      teacherSignInBtn.style.display = "none";
      teacherSignOutBtn.style.display = "inline-flex";
      teacherSignOutBtn.textContent = `Sign out (${teacherUser.email})`;

      // If we didn't already have an owner (e.g. not a co-teacher link),
      // default the owner to the signed-in teacher.
      if (!OWNER_EMAIL_FOR_VIEW) {
        OWNER_EMAIL_FOR_VIEW = teacherUser.email;
      }

      // NEW: hydrate Session History with all sessions this teacher owns
      // or that are shared with them
      if (typeof hydrateSessionHistoryFromServer === "function") {
        hydrateSessionHistoryFromServer(teacherUser.email);
      }
    } else {
      teacherSignInBtn.style.display = "inline-flex";
      teacherSignOutBtn.style.display = "none";
      teacherSignOutBtn.textContent = "Sign out";
    }
  });

  RP_AUTH.initGoogleAuth();
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

// Try to restore last Google user so buttons work after refresh
(function restoreTeacherFromLocalStorage() {
  try {
    const raw = window.localStorage.getItem("rp_last_google_user");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.email) return;

    teacherUser = parsed;

    // Mirror the same UI changes as in onAuthChange
    teacherSignInBtn.style.display = "none";
    teacherSignOutBtn.style.display = "inline-flex";
    teacherSignOutBtn.textContent = `Sign out (${teacherUser.email})`;

    if (!OWNER_EMAIL_FOR_VIEW) {
      OWNER_EMAIL_FOR_VIEW = teacherUser.email;
    }
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

    if (urlOwner) {
      OWNER_EMAIL_FOR_VIEW = urlOwner;
    }

    if (urlSession && sessionInput) {
      sessionInput.value = urlSession;
      sessionPill.textContent = `Session: ${urlSession}`;
    }

    if (urlClass && classInput) {
      classInput.value = urlClass;
    }

    // Auto-load if a session was provided
    if ((urlSession || urlClass) && typeof loadAttempts === "function") {
      loadAttempts();
    }
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
