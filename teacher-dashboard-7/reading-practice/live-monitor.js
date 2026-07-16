// live-monitor.js
(function () {
  const params = new URLSearchParams(window.location.search);
  const SESSION_CODE = params.get("session") || "";
  const CLASS_FILTER = params.get("class") || "";

 const MODE_PARAM = (params.get("mode") || "practice").toLowerCase();
const BENCHMARK_KEY = (params.get("benchmark") || "q4").toLowerCase();
const READING_GRADE_LEVEL = String(
  params.get("grade") ||
  params.get("gradeLevel") ||
  "7"
).trim() || "7";

const RAW_SET = (params.get("set") || "full").toLowerCase();
const SET_PARAM =
  RAW_SET === "mini" ? "mini1" : // legacy support
  ["full", "mini1", "mini2", "benchmark"].includes(RAW_SET) ? RAW_SET : "full";

const IS_BENCHMARK_MODE =
  MODE_PARAM === "benchmark" ||
  SET_PARAM === "benchmark" ||
  (params.get("level") || "").toLowerCase() === "benchmark";

const SET_LABEL =
  IS_BENCHMARK_MODE
    ? "Benchmark"
    : SET_PARAM === "mini1"
    ? "Mini-Quick Check"
    : SET_PARAM === "mini2"
    ? "Mini-Extra Practice"
    : "Full Practice";

  // 🔑 the teacher who owns this data
  const OWNER_EMAIL = params.get("owner") || "";

  const gridEl = document.getElementById("monitor-grid");
  const metaEl = document.getElementById("monitor-meta");
  const refreshBtn = document.getElementById("monitor-refresh");

  if (!SESSION_CODE) {
    if (gridEl) {
      gridEl.innerHTML =
        "<p style='padding:1rem;'>Missing session code in the URL.</p>";
    }
    return;
  }

  const PRACTICE_LEVEL_KEY = ["below", "on", "above"].includes(
    (params.get("level") || "on").toLowerCase()
  )
    ? (params.get("level") || "on").toLowerCase()
    : "on";

  const PRACTICE_LEVEL_SCRIPT_MAP = {
    below: "levels/below-level.js",
    on: "levels/on-level.js",
    above: "levels/above-level.js"
  };

  // Fallbacks only run if the level file cannot load. The real source of truth
  // is loaded from the same level file the student trainer uses.
  const FALLBACK_MINI1_IDS = [1, 3, 5, 7, 10, 11, 13, 16, 20, 23];
  const FALLBACK_MINI2_IDS = [2, 4, 6, 8, 9, 12, 14, 17, 22, 25];
  const FALLBACK_QUESTION_TYPES_FULL = [
    "mcq",       // 1
    "mcq",       // 2
    "mcq",       // 3
    "mcq",       // 4
    "multi",     // 5
    "multi",     // 6
    "mcq",       // 7
    "mcq",       // 8
    "order",     // 9
    "match",     // 10
    "highlight", // 11
    "highlight", // 12
    "partAB",    // 13
    "partAB",    // 14
    "classify",  // 15
    "mcq",       // 16
    "mcq",       // 17
    "mcq",       // 18
    "match",     // 19
    "audio",     // 20
    "audio",     // 21
    "audio",     // 22
    "video",     // 23
    "video",     // 24
    "video"      // 25
  ];

  function buildFallbackQuestionIdSequence() {
    if (SET_PARAM === "mini1") return FALLBACK_MINI1_IDS.slice();
    if (SET_PARAM === "mini2") return FALLBACK_MINI2_IDS.slice();
    return FALLBACK_QUESTION_TYPES_FULL.map((_, idx) => idx + 1);
  }

  let QUESTION_ID_SEQUENCE = buildFallbackQuestionIdSequence();
  let MAX_QUESTIONS = QUESTION_ID_SEQUENCE.length;

  function mapTypeToLabel(type) {
    switch (type) {
      case "mcq": return "MCQ";
      case "multi": return "Multi";
      case "order": return "Order";
      case "match": return "Match";
      case "highlight": return "Highlight";
      case "dropdown": return "Dropdown";
      case "classify": return "Classify";
      case "partAB": return "Part A/B";
      case "revise": return "Revise";
      case "audio": return "Podcast";
      case "video": return "Video";
      default: return "";
    }
  }

  function getQuestionDisplayLabel(q) {
    if (!q) return "";
    if (q.questionLabel) return q.questionLabel;
    if (q.media?.type === "audio") return "Podcast";
    if (q.media?.type === "video") return "Video";
    return mapTypeToLabel(q.type);
  }

  function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const BENCHMARK_PATHS = {
  q4: "../benchmarks/mgb_7th_grade_benchmark.json"
};

let benchmarkQuestionMetaPromise = null;
let practiceQuestionMetaPromise = null;

async function loadPracticeQuestionMeta() {
  if (IS_BENCHMARK_MODE) {
    return { metaById: new Map(), sequence: buildFallbackQuestionIdSequence() };
  }

  if (practiceQuestionMetaPromise) return practiceQuestionMetaPromise;

  practiceQuestionMetaPromise = new Promise((resolve) => {
    const src = PRACTICE_LEVEL_SCRIPT_MAP[PRACTICE_LEVEL_KEY] || PRACTICE_LEVEL_SCRIPT_MAP.on;
    const previousLevel = window.READING_LEVEL;
    const script = document.createElement("script");

    script.src = src;
    script.onload = () => {
      const level = window.READING_LEVEL || {};
      const allQuestions = Array.isArray(level.questions) ? level.questions : [];
      const questionSets = level.questionSets || {};
      const setConfig = questionSets[SET_PARAM];
      const sequence = Array.isArray(setConfig)
        ? setConfig.slice()
        : allQuestions.map((q) => q.id).filter((id) => id != null);

      const metaById = new Map();
      allQuestions.forEach((q) => {
        const qid = normalizeQuestionId(q.id);
        if (qid == null) return;
        metaById.set(qid, {
          type: q.type || "",
          questionLabel: getQuestionDisplayLabel(q),
          mediaType: q.media?.type || ""
        });
      });

      // Avoid surprising other scripts if they inspect READING_LEVEL later.
      if (previousLevel) window.READING_LEVEL = previousLevel;

      resolve({
        metaById,
        sequence: sequence.length ? sequence : buildFallbackQuestionIdSequence()
      });
    };

    script.onerror = () => {
      console.warn("[Monitor] Could not load practice level file:", src);
      resolve({ metaById: new Map(), sequence: buildFallbackQuestionIdSequence() });
    };

    document.head.appendChild(script);
  });

  return practiceQuestionMetaPromise;
}

async function getBenchmarkQuestionMeta() {
  if (!IS_BENCHMARK_MODE) return new Map();

  if (benchmarkQuestionMetaPromise) {
    return benchmarkQuestionMetaPromise;
  }

  benchmarkQuestionMetaPromise = (async () => {
    const path = BENCHMARK_PATHS[BENCHMARK_KEY] || BENCHMARK_PATHS.q4;
    const metaById = new Map();

    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Could not load benchmark file: ${path}`);

      const benchmark = await res.json();

      (benchmark.sections || []).forEach((section) => {
        (section.questions || []).forEach((q) => {
          const qid = normalizeQuestionId(q.id);
          if (qid == null) return;

          metaById.set(qid, {
            standards: Array.isArray(q.standards) ? q.standards : [],
            type: q.type || ""
          });
        });
      });
    } catch (err) {
      console.warn("[Monitor] Could not load benchmark standards:", err);
    }

    return metaById;
  })();

  return benchmarkQuestionMetaPromise;
}

function getOfficialStandardTooltip(standards = []) {
  const catalog = window.RP_STANDARDS_CATALOG;

  return standards
    .map((code) => {
      const official =
        catalog && typeof catalog.getOfficialText === "function"
          ? catalog.getOfficialText(code)
          : "";

      return official ? `${code}: ${official}` : code;
    })
    .join("\n\n");
}

function getQuestionHeaderLabel(qId, benchmarkMeta, practiceMeta) {
  if (IS_BENCHMARK_MODE) {
    const meta = benchmarkMeta && benchmarkMeta.get(qId);
    const standards = meta && Array.isArray(meta.standards)
      ? meta.standards
      : [];

    return {
      label: standards.length ? standards.join(" / ") : `Q${qId}`,
      title: standards.length ? getOfficialStandardTooltip(standards) : `Question ${qId}`
    };
  }

  const meta = practiceMeta?.metaById?.get(qId);
  const label = meta?.questionLabel || mapTypeToLabel(FALLBACK_QUESTION_TYPES_FULL[qId - 1]) || `Q${qId}`;

  return {
    label,
    title: `${label} — Question ${qId}`
  };
}

  // ✅ NEW: normalize questionId whether it comes as number or string ("3")
  function normalizeQuestionId(qid) {
    if (typeof qid === "number" && Number.isFinite(qid)) return qid;
    if (typeof qid === "string" && qid.trim() !== "") {
      const n = Number(qid);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  async function fetchProgress() {
    const url = new URL(
      "/.netlify/functions/getReadingProgress",
      window.location.origin
    );
    url.searchParams.set("sessionCode", SESSION_CODE);
    url.searchParams.set("grade", READING_GRADE_LEVEL);
    url.searchParams.set("gradeLevel", READING_GRADE_LEVEL);
    if (CLASS_FILTER) url.searchParams.set("classCode", CLASS_FILTER);

    // ✅ keep live monitor scoped to the exact set in the URL
    if (SET_PARAM) {
      url.searchParams.set("set", SET_PARAM);
    }

    // 🔑 scope progress to the correct teacher (if function expects it)
    if (OWNER_EMAIL) {
      url.searchParams.set("ownerEmail", OWNER_EMAIL);
      url.searchParams.set("viewerEmail", OWNER_EMAIL);
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to load progress");

    const data = await res.json();
    return Array.isArray(data.progress) ? data.progress : data;
  }

  // Convert questionResults → array of { status } for each question in the active set
  function buildSlots(questionResults) {
    const slots = [];
    const byId = new Map();

    (questionResults || []).forEach((qr) => {
      const qid = normalizeQuestionId(qr?.questionId);
      if (qid != null) byId.set(qid, qr);
    });

    QUESTION_ID_SEQUENCE.forEach((qId) => {
      const qr = byId.get(qId);

      if (!qr) {
        slots.push({ status: "empty" });
        return;
      }

      const isCorrect = !!qr.isCorrect;
      slots.push({ status: isCorrect ? "correct" : "incorrect" });
    });

    return slots;
  }

  // ✅ FIXED: Percent correct based ONLY on the active set (mini/full)
  function computePercent(questionResults) {
    if (!Array.isArray(questionResults) || !questionResults.length) return 0;

    const byId = new Map();
    questionResults.forEach((qr) => {
      const qid = normalizeQuestionId(qr?.questionId);
      if (qid != null) byId.set(qid, qr);
    });

    let answered = 0;
    let correct = 0;

    QUESTION_ID_SEQUENCE.forEach((qId) => {
      const qr = byId.get(qId);
      if (!qr) return;
      answered++;
      if (qr.isCorrect) correct++;
    });

    if (answered === 0) return 0;
    return Math.round((correct / answered) * 100);
  }

  async function render() {
    if (gridEl) gridEl.innerHTML = "<p style='padding:1rem;'>Loading live data…</p>";

    try {
      const progressDocs = await fetchProgress();

      if (!progressDocs || !progressDocs.length) {
        if (gridEl) {
          gridEl.innerHTML =
            "<p style='padding:1rem;'>No responses yet — students may still be reading or reviewing the passage. Student names will appear here after they submit their first answer.</p>";
        }
        if (metaEl) {
          metaEl.textContent = `Session: ${SESSION_CODE} • ${SET_LABEL} • 0 students responding yet`;
        }
        return;
      }

      const rows = progressDocs
        .filter((doc) => (!CLASS_FILTER || doc.classCode === CLASS_FILTER))
        .map((doc) => {
          const questionResults = doc.questionResults || [];
          const slots = buildSlots(questionResults);
          const percent = computePercent(questionResults);

          return {
            name: doc.studentName || "Unnamed student",
            classCode: doc.classCode || "",
            slots,
            percent,
          };
        });

      if (!rows.length) {
        if (gridEl) {
          gridEl.innerHTML =
            "<p style='padding:1rem;'>No students matched this class filter yet.</p>";
        }
        if (metaEl) {
          metaEl.textContent = `Session: ${SESSION_CODE} • ${SET_LABEL} • 0 students`;
        }
        return;
      }

    const benchmarkMeta = await getBenchmarkQuestionMeta();
    const practiceMeta = await loadPracticeQuestionMeta();

    if (!IS_BENCHMARK_MODE && practiceMeta?.sequence?.length) {
      QUESTION_ID_SEQUENCE = practiceMeta.sequence.slice();
      MAX_QUESTIONS = QUESTION_ID_SEQUENCE.length;
    }

    // Build table with question header row.
    // Practice mode uses the actual question labels from the selected level file.
    // Benchmark mode shows standards such as 7.T.T.1.a.
    let html = "<table class='monitor-table'><thead><tr>";
    html += "<th>Student</th><th>% Correct</th>";

    for (let i = 0; i < MAX_QUESTIONS; i++) {
      const qId = QUESTION_ID_SEQUENCE[i];
      const header = getQuestionHeaderLabel(qId, benchmarkMeta, practiceMeta);

      html += `
        <th title="${escapeHtml(header.title)}">
          <div class="header-rotate">${escapeHtml(header.label)}</div>
        </th>
      `;
    }

    html += "</tr></thead><tbody>";

      rows.forEach((row) => {
        html += "<tr>";
        html += `<td class="monitor-name-cell">${row.name}${
          row.classCode ? " • " + row.classCode : ""
        }</td>`;
        html += `<td>${row.percent}%</td>`;
        row.slots.forEach((slot, idx) => {
          html += `<td><div class="slot ${slot.status}">${idx + 1}</div></td>`;
        });
        html += "</tr>";
      });

      html += "</tbody></table>";

      if (gridEl) gridEl.innerHTML = html;
      if (metaEl) {
        metaEl.textContent = `Session: ${SESSION_CODE} • ${SET_LABEL} • Students: ${rows.length}`;
      }
    } catch (err) {
      console.error("[Monitor] Error:", err);
      if (gridEl) {
        gridEl.innerHTML =
          "<p style='padding:1rem;color:#ef4444;'>Could not load live data. Check your Netlify function or try again.</p>";
      }
    }
  }

  if (refreshBtn) refreshBtn.addEventListener("click", render);

  // Initial render + auto-refresh every 10s
  render();
  setInterval(render, 10000);

  // ---------- THEME TOGGLE ----------
  const STORAGE_KEY = "mbm-theme";
  const toggle = document.getElementById("theme-toggle");

  if (!toggle) return;

  function applyTheme(theme) {
    if (theme === "dark") document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }

  const saved = localStorage.getItem(STORAGE_KEY) || "light";
  applyTheme(saved);
  toggle.checked = saved === "dark";

  toggle.addEventListener("change", () => {
    const newTheme = toggle.checked ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  });
})();
