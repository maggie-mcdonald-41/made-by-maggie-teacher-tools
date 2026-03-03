// readaloud-trainer.js
// Floating read-aloud controls for the Reading Practice Trainer (global controls)
// - Voice selection
// - Read Passage / Read Question
// - Play/Pause toggle + Stop
// - Chunking for long text
// - Auto-cancel on navigation (tabs, next question, question jump)

(function () {
  // ---- DOM hooks (match index.html you already updated) ----
  const floatRoot = document.getElementById("rp-tts-float");
  const voiceSelect = document.getElementById("rp-tts-voice");
  const btnReadPassage = document.getElementById("rp-tts-read-passage");
  const btnReadQuestion = document.getElementById("rp-tts-read-question");
  const btnToggle = document.getElementById("rp-tts-toggle");
  const btnStop = document.getElementById("rp-tts-stop");

  // If the widget isn't present, do nothing.
  if (!floatRoot || !voiceSelect || !btnReadPassage || !btnReadQuestion || !btnToggle || !btnStop) {
    return;
  }

  // ---- Feature guard ----
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    // Hide if unsupported so it doesn't confuse students
    floatRoot.style.display = "none";
    return;
  }

  // ---- State ----
  let voices = [];
  let selectedVoice = null;

  // We store the last thing requested so Play can restart if needed.
  let lastText = "";
  let lastLabel = ""; // "passage" or "question"

  // Track current queue so we can cancel cleanly.
  let activeUtterances = [];
  let isPaused = false;
  let isSpeaking = false;

  // ---- Helpers ----
  function normalizeText(raw) {
    if (!raw) return "";
    return String(raw)
      .replace(/\s+/g, " ")
      .replace(/\u00A0/g, " ")
      .trim();
  }

  // Split long text into chunks so Web Speech doesn't cut out.
  // We chunk by ~900 chars at punctuation boundaries when possible.
  function chunkText(text, maxLen = 900) {
    const t = normalizeText(text);
    if (!t) return [];

    if (t.length <= maxLen) return [t];

    const chunks = [];
    let start = 0;

    while (start < t.length) {
      let end = Math.min(start + maxLen, t.length);

      // Try to break at a nice boundary (period, question mark, exclamation, semicolon)
      const slice = t.slice(start, end);
      const boundaryMatch = slice.match(/(.+)([.?!;:])\s+[^.?!;:]*$/);

      if (boundaryMatch && boundaryMatch.index != null) {
        // Move end back to that boundary
        const boundaryIndex = boundaryMatch[0].lastIndexOf(boundaryMatch[2]) + 1;
        end = start + boundaryIndex;
      } else {
        // Otherwise, try whitespace
        const lastSpace = slice.lastIndexOf(" ");
        if (lastSpace > 200) end = start + lastSpace;
      }

      chunks.push(t.slice(start, end).trim());
      start = end;
    }

    return chunks.filter(Boolean);
  }

  function setToggleLabel() {
    // If currently paused: show Play
    // If speaking: show Pause
    // If idle: show Play
    if (isSpeaking && !isPaused) {
      btnToggle.textContent = "⏸ Pause";
    } else {
      btnToggle.textContent = "▶️ Play";
    }
  }

  function setButtonsEnabled(enabled) {
    btnReadPassage.disabled = !enabled;
    btnReadQuestion.disabled = !enabled;
    btnToggle.disabled = !enabled && !lastText;
    btnStop.disabled = !enabled;
  }

  function hardStop() {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}

    activeUtterances = [];
    isPaused = false;
    isSpeaking = false;
    setToggleLabel();
  }

  function speak(text, labelForLast = "") {
    const cleaned = normalizeText(text);

    // If nothing meaningful to read, do nothing
    if (!cleaned) return;

    // Cancel anything currently speaking
    hardStop();

    lastText = cleaned;
    lastLabel = labelForLast || lastLabel;

    const pieces = chunkText(cleaned);
    if (!pieces.length) return;

    setButtonsEnabled(true);

    // Create utterances and queue them
    activeUtterances = pieces.map((chunk, idx) => {
      const u = new SpeechSynthesisUtterance(chunk);
      if (selectedVoice) u.voice = selectedVoice;

      // Keep defaults natural; you can adjust later if you want
      u.rate = 1;
      u.pitch = 1;

      u.onstart = () => {
        isSpeaking = true;
        isPaused = false;
        setToggleLabel();
      };

      u.onend = () => {
        // When the final chunk ends, mark idle
        if (idx === pieces.length - 1) {
          isSpeaking = false;
          isPaused = false;
          setToggleLabel();
        }
      };

      u.onerror = () => {
        // Fail gracefully
        isSpeaking = false;
        isPaused = false;
        setToggleLabel();
      };

      return u;
    });

    // Speak them in order
    for (const u of activeUtterances) {
      window.speechSynthesis.speak(u);
    }

    isSpeaking = true;
    isPaused = false;
    setToggleLabel();
  }

  function pause() {
    if (!isSpeaking || isPaused) return;
    try {
      window.speechSynthesis.pause();
      isPaused = true;
      setToggleLabel();
    } catch (_) {}
  }

  function resume() {
    if (!isPaused) return;
    try {
      window.speechSynthesis.resume();
      isPaused = false;
      isSpeaking = true;
      setToggleLabel();
    } catch (_) {}
  }

  // ---- Collect text from DOM ----
  function getActivePassageText() {
    const active = document.querySelector(".passage.active");
    if (!active) return "";
    return normalizeText(active.innerText);
  }

  function getCurrentQuestionText() {
    const stem = document.getElementById("question-stem");
    const instructions = document.getElementById("question-instructions");
    const options = document.getElementById("question-options");

    // Read stem + instructions + options
    const parts = [
      stem ? stem.innerText : "",
      instructions ? instructions.innerText : "",
      options ? options.innerText : ""
    ];

    return normalizeText(parts.filter(Boolean).join("\n\n"));
  }

  // ---- Voice loading ----
  function loadVoices() {
    voices = window.speechSynthesis.getVoices() || [];
    voiceSelect.innerHTML = "";

    // If no voices yet, keep the select empty and try again later
    if (!voices.length) return;

    voices.forEach((v, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });

    // Preserve selection if possible
    if (!selectedVoice) {
      selectedVoice = voices[0];
      voiceSelect.value = "0";
    } else {
      const idx = voices.findIndex(v => v.name === selectedVoice.name && v.lang === selectedVoice.lang);
      if (idx >= 0) voiceSelect.value = String(idx);
      else {
        selectedVoice = voices[0];
        voiceSelect.value = "0";
      }
    }
  }

  // Some browsers populate voices async
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  voiceSelect.addEventListener("change", () => {
    const idx = Number(voiceSelect.value);
    if (Number.isFinite(idx) && voices[idx]) {
      selectedVoice = voices[idx];
      // If currently speaking, do not switch mid-stream; next read will use new voice.
    }
  });

  // ---- UI events ----
  btnReadPassage.addEventListener("click", () => {
    const text = getActivePassageText();
    speak(text, "passage");
  });

  btnReadQuestion.addEventListener("click", () => {
    const text = getCurrentQuestionText();
    speak(text, "question");
  });

  // Toggle behavior:
  // - If speaking and not paused => pause
  // - If paused => resume
  // - If idle => restart lastText (if exists), otherwise do nothing
  btnToggle.addEventListener("click", () => {
    if (isSpeaking && !isPaused) {
      pause();
      return;
    }
    if (isPaused) {
      resume();
      return;
    }
    if (!isSpeaking && lastText) {
      // Restart the last requested read (we can't truly resume after cancel/end)
      speak(lastText, lastLabel);
    }
  });

  btnStop.addEventListener("click", () => {
    hardStop();
  });

  // ---- Auto-cancel on navigation ----
  // 1) Passage tab clicks
  document.addEventListener("click", (e) => {
    const tab = e.target && e.target.closest && e.target.closest(".passage-tab");
    if (tab) hardStop();
  });

  // 2) Next question button
  const nextBtn = document.getElementById("next-question-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => hardStop());
  }

  // 3) Jump-to-question strip
  const navStrip = document.getElementById("question-nav-strip");
  if (navStrip) {
    navStrip.addEventListener("click", () => hardStop());
  }

  // 4) If question number changes for any reason, stop (covers other navigation)
  const qNum = document.getElementById("question-number");
  if (qNum) {
    const obs = new MutationObserver(() => hardStop());
    obs.observe(qNum, { childList: true, characterData: true, subtree: true });
  }

  // Stop if user navigates away
  window.addEventListener("beforeunload", () => hardStop());

  // Initial UI state
  setButtonsEnabled(true);
  setToggleLabel();
})();