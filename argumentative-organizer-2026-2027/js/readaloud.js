// === readaloud.js ===

if (typeof sectionTranslations === 'undefined') {
  console.warn('⚠️ sectionTranslations is not defined.');
}

let availableVoices = [];
let isSectionPaused = false;

/** Restore language selection from localStorage */
function restoreLanguageSelection() {
  const langSelect = document.getElementById('directionLangSelect');
  const savedLang = localStorage.getItem('preferredLanguage');
  if (langSelect && savedLang) {
    langSelect.value = savedLang;
  }
}

/** Populate voice list & restore saved selection */
function populateVoiceList() {
  availableVoices = speechSynthesis.getVoices();
  const voiceSelect = document.getElementById('voiceSelect');
  if (!voiceSelect) return;

  voiceSelect.innerHTML = '';
  availableVoices.forEach((voice, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  const savedIndex = localStorage.getItem('preferredVoiceIndex');
  if (savedIndex && voiceSelect.options.length > savedIndex) {
    voiceSelect.value = savedIndex;
  }
}

/** Reset all direction buttons */
function resetAllPlayButtons() {
  document.querySelectorAll('.play-directions-btn').forEach(btn => {
    btn.textContent = '🔊 Play Directions';
  });
}

/** Attach click handlers to play-direction buttons */
function setupPlayDirectionButtons() {
  document.querySelectorAll('.play-directions-btn').forEach(button => {
    button.addEventListener('click', () => {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        isSectionPaused = true;
        button.textContent = '▶️ Resume';
        return;
      }

      if (isSectionPaused) {
        speechSynthesis.resume();
        isSectionPaused = false;
        button.textContent = '⏸️ Pause';
        return;
      }

      const sectionId = button.dataset.sectionId;
      const lang = document.getElementById('directionLangSelect')?.value ||
                   localStorage.getItem('preferredLanguage') || 'en-US';

      const sectionEl = document.getElementById(sectionId);
      if (!sectionEl) return;

      // Show hidden teacher tips
      sectionEl.querySelectorAll('.teacher-tip.hidden').forEach(tip =>
        tip.classList.remove('hidden')
      );

      let combinedText = '';
      if (lang !== 'en-US' && sectionTranslations?.[sectionId]?.[lang]) {
        combinedText = sectionTranslations[sectionId][lang].trim();
      } else {
        // Get full text content including all descendants, even if inside containers
        combinedText = sectionEl.innerText.trim();
      }

      if (!combinedText) return;

      // Remove emojis
      combinedText = combinedText.replace(/[\p{Emoji_Presentation}\p{Emoji}\u200D]+/gu, '');

      // Split into sentences
      const sentences = combinedText.match(/[^\.!\?]+[\.!\?]+/g) || [combinedText];
      speechSynthesis.cancel();
      speakTextSequence(sentences, lang, () => {
        isSectionPaused = false;
        resetAllPlayButtons();
      });

      button.textContent = '⏸️ Pause';
    });
  });
}
window.setupPlayDirectionButtons = setupPlayDirectionButtons;

/** Speak a single block */
function speakText(text, lang, onEnd = null) {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();

  let voiceIndex = document.getElementById('voiceSelect')?.value;
  if (voiceIndex === null || voiceIndex === undefined) {
    voiceIndex = localStorage.getItem('preferredVoiceIndex') || 0;
  }
  voiceIndex = parseInt(voiceIndex);

  let selectedVoice = lang === 'en-US'
    ? voices[voiceIndex]
    : voices.find(v => v.lang === lang);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  } else {
    utterance.lang = lang;
  }

  utterance.onend = () => onEnd?.();
  speechSynthesis.speak(utterance);
}
window.speakText = speakText;

/** Speak a series of sentences */
function speakTextSequence(sentences, lang, onEnd = null) {
  const voices = speechSynthesis.getVoices();

  let voiceIndex = document.getElementById('voiceSelect')?.value;
  if (voiceIndex === null || voiceIndex === undefined) {
    voiceIndex = localStorage.getItem('preferredVoiceIndex') || 0;
  }
  voiceIndex = parseInt(voiceIndex);

  let selectedVoice = lang === 'en-US'
    ? voices[voiceIndex]
    : voices.find(v => v.lang === lang);

  let index = 0;

  const speakNext = () => {
    if (index >= sentences.length) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentences[index]);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = lang;
    }

    utterance.onend = () => {
      index++;
      speakNext();
    };

    utterance.onerror = (e) => {
      console.error("Speech error:", e.error);
      index++;
      speakNext();
    };

    speechSynthesis.speak(utterance);
  };

  speakNext();
}
window.speakTextSequence = speakTextSequence;

// === On Load Setup ===
document.addEventListener('DOMContentLoaded', () => {
  restoreLanguageSelection();

  const tryPopulate = () => {
    populateVoiceList();
    setupPlayDirectionButtons();
  };

  if (speechSynthesis.getVoices().length > 0) {
    tryPopulate();
  } else {
    speechSynthesis.onvoiceschanged = tryPopulate;
  }
});

// === Save Selections ===
document.getElementById('voiceSelect')?.addEventListener('change', () => {
  const index = document.getElementById('voiceSelect').value;
  localStorage.setItem('preferredVoiceIndex', index);
});

document.getElementById('directionLangSelect')?.addEventListener('change', () => {
  const lang = document.getElementById('directionLangSelect').value;
  localStorage.setItem('preferredLanguage', lang);
});

function toggleReadAloud(sectionId, buttonId) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  const text = el.innerText.trim();
  if (!text) return;

  const lang = document.getElementById('directionLangSelect')?.value ||
               localStorage.getItem('preferredLanguage') || 'en-US';

  const button = document.getElementById(buttonId);
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    isSectionPaused = true;
    if (button) button.textContent = '▶️ Resume';
    return;
  }

  if (isSectionPaused) {
    speechSynthesis.resume();
    isSectionPaused = false;
    if (button) button.textContent = '⏸️ Pause';
    return;
  }

  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  speechSynthesis.cancel();
  speakTextSequence(sentences, lang, () => {
    isSectionPaused = false;
    if (button) button.textContent = '🔊 Read Aloud';
  });

  if (button) button.textContent = '⏸️ Pause';
}
window.toggleReadAloud = toggleReadAloud;


// == end readaloud.js ==
