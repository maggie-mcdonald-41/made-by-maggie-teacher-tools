// level-loader.js
(() => {
  const params = new URLSearchParams(location.search);
  const mode = (params.get("mode") || "practice").toLowerCase();

  const benchmarkMap = {
    q4: "../benchmarks/mgb_6th_grade_q4_benchmark.json"
  };

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function choicesObjectToArray(choices) {
    if (!choices || typeof choices !== "object") return [];
    return Object.keys(choices)
      .sort()
      .map((key) => choices[key]);
  }

  function letterToIndex(letter) {
    if (!letter) return null;
    return String(letter).trim().toUpperCase().charCodeAt(0) - 65;
  }

  function stimulusToSentences(text, correctSelections = []) {
    const correctSet = new Set(correctSelections || []);
    return String(text || "")
      .match(/[^.!?]+[.!?]+/g)
      ?.map((sentence, index) => {
        const clean = sentence.trim();
        return {
          id: `s${index + 1}`,
          text: clean,
          correct: correctSet.has(clean)
        };
      }) || [];
  }

  function convertBenchmarkToLevel(data) {
    const questions = [];

    (data.sections || []).forEach((section, sectionIndex) => {
      const sectionPassages = section.passages || [];

function buildPassageHtml(p, fallbackTitle = "Benchmark Passage") {
  return `
    <h2 class="passage-title">${escapeHtml(p.title || fallbackTitle)}</h2>
    ${String(p.text || "")
      .split(/\n\s*\n/)
      .map((para, idx) => {
        const clean = para.trim();
        const isImage = clean.startsWith("<img");

        if (isImage) {
          return `<div class="passage-media">${clean}</div>`;
        }

        return `<p><span class="para-num">${idx + 1}</span> ${escapeHtml(para)}</p>`;
      })
      .join("")}
  `;
}

const passageHtmlById = {};
sectionPassages.forEach((p) => {
  passageHtmlById[p.passageId] = buildPassageHtml(
    p,
    p.title || section.title || "Benchmark Passage"
  );
});

const passage1Html =
  sectionPassages[0] ? buildPassageHtml(sectionPassages[0], section.title) : "";

const passage2Html =
  sectionPassages[1] ? buildPassageHtml(sectionPassages[1], section.title) : "";

const combinedPassageHtml =
  sectionPassages.length > 1
    ? sectionPassages
        .map((p) => buildPassageHtml(p, p.title || section.title || "Benchmark Passage"))
        .join("")
    : passage1Html;
      (section.questions || []).forEach((q) => {
      const base = {
        id: q.id,
        linkedPassage: q.hidePassageTabs
          ? null
          : (q.linkedPassageTab || 1),
        linkedPassageId: q.linkedPassageId || null,
        hidePassageTabs: !!q.hidePassageTabs,
        showPassagesTogether: !!q.showPassagesTogether,
        standards: q.standards || [],
        skills: q.standards || [],
        passageTabs: q.hidePassageTabs
          ? null
          : q.showPassagesTogether
            ? {
                1: combinedPassageHtml,
                2: ""
              }
            : {
                1: passage1Html,
                2: passage2Html
              },
        sectionTitle: section.title || ""
      };

        if (q.type === "multiple_choice") {
          questions.push({
            ...base,
            type: "mcq",
            stem: q.prompt,
            stimulus: q.stimulus || "",
            instructions: "Choose the best answer.",
            options: choicesObjectToArray(q.choices),
            correctIndex: letterToIndex(q.correctAnswer)
          });
        }

        else if (q.type === "multi_select") {
          questions.push({
            ...base,
            type: "multi",
            stem: q.prompt,
            stimulus: q.stimulus || "",
            instructions: "Select all correct answers.",
            options: choicesObjectToArray(q.choices),
            correctIndices: (q.correctAnswers || []).map(letterToIndex)
          });
        }

        else if (q.type === "two_part_multiple_choice") {
          questions.push({
            ...base,
            type: "partAB",
            stem: q.prompt || "Answer Part A and Part B.",
            instructions: "Answer both parts.",
            partA: {
              label: "Part A",
              stem: q.partA?.prompt || q.partA?.stem || "",
              options: choicesObjectToArray(q.partA?.choices),
              correctIndex: letterToIndex(q.partA?.correctAnswer)
            },
            partB: {
              label: "Part B",
              stem: q.partB?.prompt || q.partB?.stem || "",
              options: choicesObjectToArray(q.partB?.choices),
              correctIndex: letterToIndex(q.partB?.correctAnswer)
            }
          });
        }

else if (q.type === "dropdown") {
  questions.push({
    ...base,
    type: "dropdown",
    stem: q.prompt,
    stimulus: q.stimulus || "",
    instructions: q.dropdownLabel || "Choose the best answer from the dropdown.",
    sentenceParts: [
      q.dropdownLabel ? `${q.dropdownLabel} ` : "The answer is ",
      "."
    ],
    options: choicesObjectToArray(q.choices),
    correctIndex: letterToIndex(q.correctAnswer)
  });
}

else if (q.type === "classify") {
  const categories = Array.isArray(q.categories)
    ? q.categories
    : Object.entries(q.categories || {}).map(([id, label]) => ({
        id,
        label
      }));

  questions.push({
    ...base,
    type: "classify",
    stem: q.prompt,
    instructions: q.instructions || "Drag each item into the correct category.",
    categories,
    items: (q.items || []).map((item) => ({
      id: item.id,
      text: item.text,
      categoryId: item.categoryId || item.correctCategory
    }))
  });
}

else if (q.type === "highlight_sentence" || q.type === "highlight_sentence_multi") {
  questions.push({
    ...base,
    type: "highlight",
    stem: q.stemQuestion ? `${q.prompt}\n\n${q.stemQuestion}` : q.prompt,
    instructions: "Click the sentence or sentences that best answer the question.",
    sentences: stimulusToSentences(
      q.stimulus,
      q.correctSelections || q.correctSelection || []
    )
  });
}
      });
    });

    return {
      id: "benchmark",
      label: data.title || "Benchmark",
      benchmarkId: data.assessmentId || "",
      mode: "benchmark",
      passages: {
        1: {
          title: data.title || "Benchmark",
          html: `<h2 class="passage-title">${escapeHtml(data.title || "Benchmark")}</h2><p>Select a question to view its passage.</p>`
        },
        2: {
          title: "",
          html: ""
        }
      },
      questions,
      questionSets: {
        benchmark: null,
        full: null
      }
    };
  }

  async function loadBenchmark() {
    const key = params.get("benchmark") || "q4";
    const src = benchmarkMap[key];

    if (!src) {
      console.error("Unknown benchmark:", key);
      return;
    }

    try {
      const res = await fetch(src, {
        method: "GET",
        headers: { Accept: "application/json" }
      });

      if (!res.ok) throw new Error(`Failed to load benchmark: ${src}`);

      const data = await res.json();
      window.READING_LEVEL_KEY = "benchmark";
      window.READING_LEVEL = convertBenchmarkToLevel(data);

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("reading-level:ready", { detail: window.READING_LEVEL })
        );
        console.log("[RP_LEVEL] benchmark ready", { key, src });
      }, 0);
    } catch (err) {
      console.error("[RP_LEVEL] Benchmark load failed:", err);
    }
  }

  if (mode === "benchmark") {
    loadBenchmark();
    return;
  }

  const fromUrl =
    params.get("level") ||
    params.get("readingLevel") ||
    params.get("rl");

  const normalized = (fromUrl || "").toLowerCase();

  const levelKey =
    normalized === "below" || normalized === "on" || normalized === "above"
      ? normalized
      : "on";

  const bundleMap = {
    below: "levels/below-level.js",
    on: "levels/on-level.js",
    above: "levels/above-level.js"
  };

  const src = bundleMap[levelKey];

  window.READING_LEVEL_KEY = levelKey;

  try {
    localStorage.setItem("rp_level", levelKey);
  } catch (e) {}

  const s = document.createElement("script");
  s.src = src;

  s.onload = () => {
    const levelObj = window.READING_LEVEL;

    if (!levelObj || typeof levelObj !== "object") {
      console.error("Level bundle loaded but window.READING_LEVEL is missing/invalid.");
      return;
    }

    window.READING_LEVEL = levelObj;

    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("reading-level:ready", { detail: window.READING_LEVEL })
      );
      console.log("[RP_LEVEL] reading-level:ready dispatched", {
        levelKey,
        src
      });
    }, 0);
  };

  s.onerror = () => {
    console.error("Failed to load level bundle:", src);
  };

  document.head.appendChild(s);
})();