// live-monitor.js

(function () {
  const params = new URLSearchParams(window.location.search);
  const SESSION_CODE = params.get("session") || "";
  const CLASS_FILTER = params.get("class") || "";

  const gridEl = document.getElementById("monitor-grid");
  const metaEl = document.getElementById("monitor-meta");
  const refreshBtn = document.getElementById("monitor-refresh");

  if (!SESSION_CODE) {
    gridEl.innerHTML = "<p style='padding:1rem;'>Missing session code in the URL.</p>";
    return;
  }

  async function fetchProgress() {
    const url = new URL("/.netlify/functions/getReadingProgress", window.location.origin);
    url.searchParams.set("sessionCode", SESSION_CODE);
    if (CLASS_FILTER) {
      url.searchParams.set("classCode", CLASS_FILTER);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error("Failed to load progress");
    }
    const data = await res.json();
    return Array.isArray(data.progress) ? data.progress : data;
  }

  function buildSlots(maxQuestions, questionResults) {
    const slots = [];
    const byIndex = new Map();
    // Expecting [{ index, isCorrect, partial, answered }] in questionResults.
    questionResults.forEach((qr) => {
      if (typeof qr.index === "number") {
        byIndex.set(qr.index, qr);
      }
    });

    for (let i = 0; i < maxQuestions; i++) {
      const qr = byIndex.get(i);
      if (!qr || !qr.answered) {
        slots.push({ status: "empty" });
      } else if (qr.partial) {
        slots.push({ status: "partial" });
      } else if (qr.isCorrect) {
        slots.push({ status: "correct" });
      } else {
        slots.push({ status: "incorrect" });
      }
    }
    return slots;
  }

  function computePercent(questionResults) {
    let answered = 0;
    let correct = 0;
    questionResults.forEach((qr) => {
      if (qr.answered) {
        answered++;
        if (qr.isCorrect) correct++;
      }
    });
    if (answered === 0) return 0;
    return Math.round((correct / answered) * 100);
  }

  async function render() {
    gridEl.innerHTML = "<p style='padding:1rem;'>Loading live data…</p>";

    try {
      const progressDocs = await fetchProgress();

      if (!progressDocs.length) {
        gridEl.innerHTML =
          "<p style='padding:1rem;'>No students joined yet. As they start, you’ll see them appear here.</p>";
        if (metaEl) {
          metaEl.textContent = `Session: ${SESSION_CODE} • 0 students`;
        }
        return;
      }

      // Determine max questions count from first doc
      const maxQuestions =
        progressDocs[0].questionResults?.length || questions.length || 20;

      const rows = progressDocs
        .filter((doc) => (!CLASS_FILTER || doc.classCode === CLASS_FILTER))
        .map((doc) => {
          const questionResults = doc.questionResults || [];
          const slots = buildSlots(maxQuestions, questionResults);
          const percent = computePercent(questionResults);
          return {
            name: doc.studentName || "Unnamed student",
            classCode: doc.classCode || "",
            slots,
            percent
          };
        });

      // Build table
      let html = "<table class='monitor-table'><thead><tr>";
      html += "<th>Student</th><th>% Correct</th>";
      for (let i = 0; i < maxQuestions; i++) {
        html += `<th>${i + 1}</th>`;
      }
      html += "</tr></thead><tbody>";

      rows.forEach((row) => {
        html += "<tr>";
        html += `<td class="monitor-name-cell">${row.name}${row.classCode ? " • " + row.classCode : ""}</td>`;
        html += `<td>${row.percent}%</td>`;
        row.slots.forEach((slot, idx) => {
          html += `<td><div class="slot ${slot.status}">${idx + 1}</div></td>`;
        });
        html += "</tr>";
      });

      html += "</tbody></table>";

      gridEl.innerHTML = html;
      if (metaEl) {
        metaEl.textContent = `Session: ${SESSION_CODE} • Students: ${rows.length}`;
      }
    } catch (err) {
      console.error("[Monitor] Error:", err);
      gridEl.innerHTML =
        "<p style='padding:1rem;color:#ef4444;'>Could not load live data. Check your Netlify function or try again.</p>";
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", render);
  }

  // Auto-refresh every 10s
  render();
  setInterval(render, 10000);
})();
