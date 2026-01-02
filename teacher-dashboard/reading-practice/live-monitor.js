// live-monitor.js
(function () {
  const params = new URLSearchParams(window.location.search);
  const SESSION_CODE = params.get("session") || "";
  const CLASS_FILTER = params.get("class") || "";

  const RAW_SET = (params.get("set") || "full").toLowerCase();
  const SET_PARAM =
    RAW_SET === "mini" ? "mini1" : // legacy support
    ["full", "mini1", "mini2"].includes(RAW_SET) ? RAW_SET : "full";

  const SET_LABEL =
    SET_PARAM === "mini1"
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

  // Mini-Quick Check (Mini Set 1)
  const MINI1_IDS = [3, 6, 7, 10, 11, 16, 17, 20, 22, 24];

  // Mini-Extra Practice (Mini Set 2)
  const MINI2_IDS = [4, 8, 9, 12, 14, 18, 19, 21, 23, 25];

  // Question types in order for your reading trainer (questions 1–25)
  // Index 0 = Q1, index 1 = Q2, etc.
  const QUESTION_TYPES_FULL = [
    "mcq",       // 1
    "mcq",       // 2
    "multi",     // 3
    "multi",     // 4
    "order",     // 5
    "order",     // 6
    "match",     // 7
    "match",     // 8
    "highlight", // 9
    "highlight", // 10
    "dropdown",  // 11
    "dropdown",  // 12
    "classify",  // 13
    "classify",  // 14
    "partAB",    // 15
    "partAB",    // 16
    "classify",  // 17
    "classify",  // 18
    "revise",    // 19
    "revise",    // 20
    "mcq",       // 21 (audio-based MCQ)
    "audio",     // 22 (audio-focused)
    "mcq",       // 23 (graph + audio)
    "audio",     // 24 (video / multimedia)
    "mcq"        // 25
  ];

  // For a full set: [1, 2, 3, ..., 25]
  const QUESTION_ID_SEQUENCE =
    SET_PARAM === "mini1"
      ? MINI1_IDS
      : SET_PARAM === "mini2"
      ? MINI2_IDS
      : QUESTION_TYPES_FULL.map((_, idx) => idx + 1);

  const MAX_QUESTIONS = QUESTION_ID_SEQUENCE.length;

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
      case "audio": return "Audio";
      case "video": return "Video";
      default: return "";
    }
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
    if (CLASS_FILTER) url.searchParams.set("classCode", CLASS_FILTER);

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

      // Build table with question-type header row
      let html = "<table class='monitor-table'><thead><tr>";
      html += "<th>Student</th><th>% Correct</th>";

      for (let i = 0; i < MAX_QUESTIONS; i++) {
        const qId = QUESTION_ID_SEQUENCE[i];
        const typeKey = QUESTION_TYPES_FULL[qId - 1] || "";
        const label = mapTypeToLabel(typeKey) || (i + 1);
        html += `<th><div class="header-rotate">${label}</div></th>`;
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
