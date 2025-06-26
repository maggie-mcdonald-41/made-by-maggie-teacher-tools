//=== js/main.js ===//

// === Global state ===
let selectedBodyCount = 1;
let isEvidenceFirst = false;
let hasCelebrated = false;
const activeEdits = new Set();

// === Debounce Utility ===
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debouncedSyncData = debounce(syncData, 300);


// === List of IDs That Trigger Syncing ===
const syncTriggerIds = [
  'thesis-reason1-section',
  'reason1-evidence',
  'ef-reason-bp1',
  'ef-evidence-bp1',
  'bp1-reason',
  'bp1-evidence', 
];

// — 1) Single up-front show/hide function —
function updateBodyParagraphVisibility(count) {
  // Always force count to 1 in free version
  count = 1;

  // Only show Body Paragraph 1
  const wrapper1 = document.getElementById('body1');
  if (wrapper1) wrapper1.style.display = 'block';

  const ef1 = document.getElementById('ef-evidence1');
  if (ef1) ef1.style.display = isEvidenceFirst ? 'block' : 'none';

  const link1 = document.getElementById('link-body1');
  if (link1) link1.style.display = isEvidenceFirst ? 'none' : 'list-item';

  const efLink1 = document.getElementById('ef-link-body1');
  if (efLink1) efLink1.style.display = isEvidenceFirst ? 'list-item' : 'none';

  // Always hide paragraphs 2 & 3
  for (let i = 2; i <= 3; i++) {
    document.getElementById(`body${i}`)?.classList.add('hidden');
    document.getElementById(`ef-evidence${i}`)?.classList.add('hidden');
    document.getElementById(`link-body${i}`)?.classList.add('hidden');
    document.getElementById(`ef-link-body${i}`)?.classList.add('hidden');
  }

  // Show/hide thesis + evidence planner subsections
  document.getElementById('thesis-reason1-section')?.classList.remove('hidden');
  document.getElementById('evidence1-section')?.classList.remove('hidden');

  document.getElementById('thesis-reason2-section')?.classList.add('hidden');
  document.getElementById('thesis-reason3-section')?.classList.add('hidden');
  document.getElementById('evidence2-section')?.classList.add('hidden');
  document.getElementById('evidence3-section')?.classList.add('hidden');
}


// — 2) EF-mode top-level swaps —
function updateEvidenceFirstVisibility() {
  // main directory vs EF directory
  document.getElementById('directory')?.classList.toggle('hidden', isEvidenceFirst);
  document.getElementById('directory-evidence-first')?.classList.toggle('hidden', !isEvidenceFirst);

  // EF claim & EF-planner sections
  document.getElementById('evidence-first-setup')?.classList.toggle('hidden', !isEvidenceFirst);
  document.getElementById('evidence-first-section')?.classList.toggle('hidden', !isEvidenceFirst);

  // standard evidence block
  document.getElementById('evidence')?.classList.toggle('hidden', isEvidenceFirst);
}

function syncEFtoStandard() {
  const claimEF = document.getElementById('ef-claim-box')?.innerText.trim() || '';
  const claimBox = document.getElementById('claim-box');
  if (claimBox && claimBox.innerText.trim() === '') {
   claimBox.innerText = claimEF;
   localStorage.setItem('claim-box', claimEF);
  }

  [1, 2, 3].forEach(n => {
    const r = document.getElementById(`ef-reason-bp${n}`)?.innerText.trim() || '';
    const e = document.getElementById(`ef-evidence-bp${n}`)?.innerText.trim() || '';

    const reasonBox = document.getElementById(`reason${n}-box`);
    const evidenceBox = document.getElementById(`bp${n}-evidence`);

    if (reasonBox && reasonBox.innerText.trim() === '') {
     reasonBox.innerText = r;
    localStorage.setItem(`reason${n}-box`, r);
    }

    if (evidenceBox && evidenceBox.innerText.trim() === '') {
    evidenceBox.innerText = e;
    localStorage.setItem(`bp${n}-evidence`, e);
    }
  });
}



// — 5) DOM Ready / Bootstrap —
document.addEventListener('DOMContentLoaded', () => {
const lockedSelectors = [
  "#googleSignIn",
  "#directionLangSelect",
  "#googleSignOut",
  "#downloadBtn",
  "#uploadBtn",
  "#voiceSelect",
  "#run-final-checklist",
  "#copy-essay-btn",
  "#handleGoogleDocsExport",
  "#sync-thesis",
  ".docs-btn"
];

// Lock standard selectors
lockedSelectors.forEach(selector => {
  const el = document.querySelector(selector);
  if (el) {
    el.classList.add("locked-feature");
    el.addEventListener("click", showLockedMessage);
  }
});

// Lock sentence starter buttons with data-lock
document.querySelectorAll('.btn-tip[data-lock="true"]').forEach(btn => {
  btn.classList.add("locked-feature");
  btn.addEventListener("click", showLockedMessage);
});

document.querySelectorAll('.btn-coach').forEach(btn => {
  btn.classList.add("locked-feature");
  btn.addEventListener("click", showLockedMessage);
});


function showLockedMessage(e) {
  e.preventDefault();
  e.stopPropagation();
  alert("🔒 This section is available in the full version.");
}


  // a) restore saved state
  const savedCount = localStorage.getItem('bodyParagraphs');
  if (savedCount) {
    selectedBodyCount = parseInt(savedCount, 10);
    document.getElementById('paragraphCount').value = selectedBodyCount;
  }

  isEvidenceFirst = localStorage.getItem('isEvidenceFirst') === 'true';
  document.getElementById('evidenceFirstToggle').checked = isEvidenceFirst;
  initEvidenceFirstToggle();
  initAll();              // voice, download/upload, copy, dark/dyslexia, tip-toggles
  initEventHandlers();    // contenteditable, refresh, “next” buttons, etc.
  initTopicSync();        // auto-sync topic → reasons

  // c) initial UI render
  updateEvidenceFirstVisibility();
  updateBodyParagraphVisibility(selectedBodyCount);
  syncData();
  setupEnhancedMonitoring();
  


    // Sync on every input
    syncTriggerIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', debouncedSyncData);
      }
    });

    function generateChecklistReview(prompt, text) {
      const checklist = [];
      const relevance = isRelevantToPrompt(prompt, text);
    
      if (!relevance.match) {
        checklist.push(`❌ ${relevance.warning}`);
      } else {
        checklist.push("✅ Your writing connects to the prompt.");
      }
    
      if (text.length < 100) {
        checklist.push("❌ Essay may be too short. Add more support.");
      } else {
        checklist.push("✅ Your essay has a solid length.");
      }
    
      if (!/["“”]/.test(text)) {
        checklist.push("❌ No quotes detected — include direct evidence.");
      } else {
        checklist.push("✅ Quote(s) found from the text.");
      }
    
      if (!/in conclusion|to summarize|overall/.test(text.toLowerCase())) {
        checklist.push("❌ Missing a concluding sentence.");
      } else {
        checklist.push("✅ Essay includes a clear conclusion.");
      }
    
      return `<div class="checklist-summary"><strong>📋 Georgia Milestones Writing Checklist Review:</strong><br><ul>${checklist.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
    }
    
    function runFinalChecklist() {
      const checklistBox = document.getElementById('checklist-review');
      checklistBox.classList.remove('hidden');
      checklistBox.scrollIntoView({ behavior: 'smooth' });
    
      // Get current prompt and essay text
      const prompt = document.getElementById('writing-prompt')?.innerText || '';
      const essay = document.getElementById('essay-final')?.innerText || '';
    
      // Generate checklist HTML
      const checklistHTML = generateChecklistReview(prompt, essay);
      checklistBox.innerHTML = checklistHTML;
    
      // 🎉 Trigger celebration if complete
      const isComplete = document.getElementById('progress-bar')?.classList.contains('complete');
      const essayFinal = essay.trim();
    
      if (isComplete && essayFinal.length > 100 && !hasCelebrated) {
        celebrateEssayCompletion();
        hasCelebrated = true;
      }
    }
    
    

  document.getElementById('run-final-checklist')?.addEventListener('click', runFinalChecklist);

  // f) Evidence-First toggle listener
  document.getElementById('evidenceFirstToggle')
    .addEventListener('change', (e) => {
      isEvidenceFirst = e.target.checked;
      updateBodyParagraphVisibility(selectedBodyCount);
      localStorage.setItem('isEvidenceFirst', isEvidenceFirst);
      updateEvidenceFirstVisibility();
      syncData();
    });
// d) Wire up re-syncs
document.querySelectorAll('[contenteditable="true"]')
  .forEach(el => el.addEventListener('input', debouncedSyncData));

document.getElementById('evidenceFirstToggle')
  .addEventListener('change', (e) => {
    isEvidenceFirst = e.target.checked;
    updateBodyParagraphVisibility(selectedBodyCount);
    localStorage.setItem('isEvidenceFirst', isEvidenceFirst);
    updateEvidenceFirstVisibility();
    syncData();
  });

    const thesisBox = document.getElementById('thesis-box');
const syncWarning = document.getElementById('sync-warning');
const syncButton = document.getElementById('sync-thesis');

thesisBox.addEventListener('input', () => {
  syncWarning.innerText = "⚠️ You've edited your thesis. Click 'Sync Thesis Edits Back' to update your outline.";
  syncWarning.classList.remove('hidden');
  syncButton.classList.add('attention');
});

document.getElementById('confirm-sync-button')?.addEventListener('click', confirmReverseSync);
});


//=== end js/main.js ===//
