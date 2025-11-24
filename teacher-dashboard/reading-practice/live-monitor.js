// live-monitor.js

(function () {
  const params = new URLSearchParams(window.location.search);
  const SESSION_CODE = params.get("session") || "";
  const CLASS_FILTER = params.get("class") || "";

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

  // Question types in order for your reading trainer (1–25)
  const QUESTION_TYPES = [
    "mcq", "mcq", "multi", "multi", "order",
    "order", "match", "match", "highlight", "highlight",
    "dropdown", "dropdown", "classify", "classify", "partAB",
    "partAB", "classify", "classify", "revise", "revise",
    "mcq", "audio", "mcq", "audio", "mcq"
  ];
  const MAX_QUESTIONS = QUESTION_TYPES.length; // 25

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

  async function fetchProgress() {
    const url = new URL(
      "/.netlify/functions/getReadingProgress",
      window.location.origin
    );
    url.searchParams.set("sessionCode", SESSION_CODE);
    if (CLASS_FILTER) {
      url.searchParams.set("classCode", CLASS_FILTER);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error("Failed to load progress");
    }
    const data = await res.json();
    // Our function returns { success, progress: [...] }
    return Array.isArray(data.progress) ? data.progress : data;
  }

  // Convert questionResults → array of { status } for each question 1..25
  function buildSlots(questionResults) {
    const slots = [];
    const byId = new Map();

    // questionResults entries look like:
    // { questionId, type, isCorrect, raw: {...} }
    (questionResults || []).forEach((qr) => {
      if (typeof qr.questionId === "number") {
        byId.set(qr.questionId, qr);
      }
    });

    for (let i = 1; i <= MAX_QUESTIONS; i++) {
      const qr = byId.get(i);

      if (!qr) {
        // no entry logged yet → not answered
        slots.push({ status: "empty" });
        continue;
      }

      // If you later add partial credit (e.g. qr.raw.score between 0 and 1),
      // you can check that here and use "partial".
      const isCorrect = !!qr.isCorrect;
      if (isCorrect) {
        slots.push({ status: "correct" });
      } else {
        slots.push({ status: "incorrect" });
      }
    }

    return slots;
  }

  // Percent correct based on questionResults shape from reporting.js
  function computePercent(questionResults) {
    if (!Array.isArray(questionResults) || !questionResults.length) return 0;

    const byId = new Map();
    questionResults.forEach((qr) => {
      if (typeof qr.questionId === "number") {
        byId.set(qr.questionId, qr);
      }
    });

    let answered = 0;
    let correct = 0;

    byId.forEach((qr) => {
      answered++;
      if (qr.isCorrect) correct++;
    });

    if (answered === 0) return 0;
    return Math.round((correct / answered) * 100);
  }

  async function render() {
    if (gridEl) {
      gridEl.innerHTML = "<p style='padding:1rem;'>Loading live data…</p>";
    }

    try {
      const progressDocs = await fetchProgress();

      if (!progressDocs || !progressDocs.length) {
        if (gridEl) {
          gridEl.innerHTML =
            "<p style='padding:1rem;'>No students joined yet. As they start, you’ll see them appear here.</p>";
        }
        if (metaEl) {
          metaEl.textContent = `Session: ${SESSION_CODE} • 0 students`;
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
          metaEl.textContent = `Session: ${SESSION_CODE} • 0 students`;
        }
        return;
      }

      // Build table with question-type header row
      let html = "<table class='monitor-table'><thead><tr>";
      html += "<th>Student</th><th>% Correct</th>";
      for (let i = 0; i < MAX_QUESTIONS; i++) {
        const type = QUESTION_TYPES[i] || "";
        const label = mapTypeToLabel(type) || (i + 1);
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

      if (gridEl) {
        gridEl.innerHTML = html;
      }
      if (metaEl) {
        metaEl.textContent = `Session: ${SESSION_CODE} • Students: ${rows.length}`;
      }
    } catch (err) {
      console.error("[Monitor] Error:", err);
      if (gridEl) {
        gridEl.innerHTML =
          "<p style='padding:1rem;color:#ef4444;'>Could not load live data. Check your Netlify function or try again.</p>";
      }
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", render);
  }

  // Initial render + auto-refresh every 10s
  render();
  setInterval(render, 10000);
})();
