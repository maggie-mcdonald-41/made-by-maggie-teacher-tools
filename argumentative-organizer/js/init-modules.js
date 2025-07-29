// === init-modules.js ===
// Initialization Modules Only — Used across all organizer types

function initVoiceControls() {
  if (typeof speechSynthesis !== 'undefined') {
    // ✅ Do NOT restore voice/language here – done inside populateVoiceList()
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        populateVoiceList();            // from readaloud.js
        setupPlayDirectionButtons();    // from readaloud.js
      };
    }
  }
}
window.initVoiceControls = initVoiceControls;

function initDownloadUpload() {
  document.getElementById('downloadBtn')?.addEventListener('click', () => {
    const data = {};
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      data[el.id] = el.innerText;
    });
    data.selectedBodyCount = selectedBodyCount;
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my_essay_work.json';
    a.click();
  });

  document.getElementById('uploadBtn')?.addEventListener('click', () => {
    document.getElementById('uploadInput').click();
  });

  document.getElementById('uploadInput')?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
Object.entries(data).forEach(([key, value]) => {
  if (key === 'selectedBodyCount') return;

  const el = document.getElementById(key);
  if (!el) return;

  if (el.isContentEditable) {
    el.innerText = value;
  } else if ('value' in el) {
    el.value = value;
  }

  localStorage.setItem(key, value);
});


        if (data.selectedBodyCount && [1, 2, 3].includes(data.selectedBodyCount)) {
          selectedBodyCount = data.selectedBodyCount;
          document.getElementById('paragraphCount').value = selectedBodyCount;
          localStorage.setItem('bodyParagraphs', selectedBodyCount);
          updateBodyParagraphVisibility(selectedBodyCount);
        }

        syncData();
        alert('✅ Your work has been loaded successfully.');
      } catch (err) {
        alert('❌ Failed to load file. Please make sure it is a valid save file.');
      }
    };
    reader.readAsText(file);
  });
}

function initCopyButton() {
  document.getElementById('copy-essay-btn')?.addEventListener('click', () => {
    const essayText = document.getElementById('essay-final')?.innerText.trim();
    if (!essayText) {
      alert("There's nothing to copy yet!");
      return;
    }

    navigator.clipboard.writeText(essayText)
      .then(() => alert("✅ Essay copied to clipboard!"))
      .catch(err => {
        console.error("Clipboard copy failed: ", err);
        alert("❌ Failed to copy. Please try again.");
      });
  });
}

function initDarkMode() {
  const darkToggle = document.getElementById('darkToggle');
  if (darkToggle) {
    darkToggle.checked = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkToggle.checked);
    darkToggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode', darkToggle.checked);
      localStorage.setItem('darkMode', darkToggle.checked);
    });
  }
}

function initDyslexiaMode() {
  const dyslexiaToggle = document.getElementById('dyslexiaToggle');
  if (dyslexiaToggle) {
    dyslexiaToggle.checked = localStorage.getItem('dyslexiaMode') === 'true';
    document.body.classList.toggle('dyslexia-mode', dyslexiaToggle.checked);
    dyslexiaToggle.addEventListener('change', () => {
      document.body.classList.toggle('dyslexia-mode', dyslexiaToggle.checked);
      localStorage.setItem('dyslexiaMode', dyslexiaToggle.checked);
    });
  }
}

function initToggleTips() {
  document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipId = btn.dataset.tipId;
      const tip = document.getElementById(tipId);
      if (tip) {
        tip.classList.toggle('hidden');
      }
    });
  });
}

function addDataOriginalAttributes() {
  const tips = document.querySelectorAll('.teacher-tip');
  const instructions = document.querySelectorAll('.h3-instruction, .instruction-text');

  [...tips, ...instructions].forEach(el => {
    if (!el.hasAttribute('data-original')) {
      const original = el.innerText.trim();
      el.setAttribute('data-original', original);
    }
  });
}

function initAll() {
  initVoiceControls();
  initDownloadUpload();
  initCopyButton();
  initDarkMode();
  initDyslexiaMode();
  initToggleTips();
  addDataOriginalAttributes();

  // ❌ REMOVE THIS — it's handled inside voice setup
  // setupPlayDirectionButtons();
}
window.initAll = initAll;

// === end-init-modules.js ===
