// === utils.js ===


// Change “because” to “since” in a thesis
function rewordThesis(text) {
  return text.replace(/\bbecause\b/i, 'since');
}

// Clear all thesis-related boxes and storage
function clearThesis() {
  ['claim-box', 'thesis-box', 'intro-thesis-box', 'restate-thesis'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = '';
      localStorage.removeItem(id);
    }
  });
}

// Clear all body paragraph boxes and storage
function clearBodyParagraphs() {
  const ids = [
    'reason1-box', 'reason2-box', 'reason3-box',
    'bp1-evidence', 'bp1-explanation', 'bp1-final',
    'bp2-evidence', 'bp2-explanation', 'bp2-final',
    'bp3-evidence', 'bp3-explanation', 'bp3-final'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerText = '';
      localStorage.removeItem(id);
    }
  });
}

// Insert a starter phrase at the front of a target box
function insertSentenceStarter(targetId, starter) {
  const box = document.getElementById(targetId);
  if (!box) return;

  const current = box.innerText.trim();
  if (!current || !current.startsWith(starter)) {
    box.innerText = starter + ' ' + current;
  }
  box.focus();
}

// Set up the Evidence-First toggle (if you still need it here)
function initEvidenceFirstToggle() {
  const toggle = document.getElementById('evidenceFirstToggle');
  if (!toggle) return;

  toggle.addEventListener('change', () => {
    isEvidenceFirst = toggle.checked;
    updateEvidenceFirstVisibility();
    updateEvidenceBoxes();
  });
}


// === end utils.js ===