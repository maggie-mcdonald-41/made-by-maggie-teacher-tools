//=== js/main.js ===//

// === Global state ===
let selectedBodyCount = 2;
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
  'thesis-reason2-section',
  'thesis-reason3-section',
  'reason1-evidence',
  'reason2-evidence',
  'reason3-evidence',
  'ef-reason-bp1',
  'ef-reason-bp2',
  'ef-reason-bp3',
  'ef-evidence-bp1',
  'ef-evidence-bp2',
  'ef-evidence-bp3',
  'bp1-reason',
  'bp2-reason',
  'bp3-reason',
  'bp1-evidence',
  'bp2-evidence',
  'bp3-evidence' 
];

// — 1) Single up-front show/hide function —
function updateBodyParagraphVisibility(count) {

  for (let i = 1; i <= 3; i++) {
    const shouldShow = i <= count;

    // wrapper sections
    const wrapper = document.getElementById(`body${i}`);
    if (wrapper) {
      wrapper.style.display = shouldShow ? 'block' : 'none';
    }

    const ef = document.getElementById(`ef-evidence${i}`);
    if (ef) {
      ef.style.display = (isEvidenceFirst && shouldShow) ? 'block' : 'none';
    }

    // navigation links
    const link = document.getElementById(`link-body${i}`);
    if (link) {
      link.style.display = (!isEvidenceFirst && shouldShow) ? 'list-item' : 'none';
    }

    const efLink = document.getElementById(`ef-link-body${i}`);
    if (efLink) {
      efLink.style.display = (isEvidenceFirst && shouldShow) ? 'list-item' : 'none';
    }
  }

  // subsections toggles (reasons & evidence planners)
  document.getElementById('thesis-reason1-section')?.classList.toggle('hidden', count < 1);
  document.getElementById('thesis-reason2-section')?.classList.toggle('hidden', count < 2);
  document.getElementById('thesis-reason3-section')?.classList.toggle('hidden', count < 3);
  document.getElementById('evidence1-section')?.classList.toggle('hidden', count < 1);
  document.getElementById('evidence2-section')?.classList.toggle('hidden', count < 2);
  document.getElementById('evidence3-section')?.classList.toggle('hidden', count < 3);
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
  document.getElementById('googleSignIn')?.addEventListener('click', startGoogleAuth);
document.getElementById('googleSignOut')?.addEventListener('click', handleGoogleSignOut);

 
  document.querySelectorAll('[contenteditable="true"]').forEach(box => {
    box.addEventListener('focus', () => activeEdits.add(box.id));
    box.addEventListener('blur', () => {
      activeEdits.delete(box.id);
      if (box.id.startsWith('bp') && (box.id.endsWith('-reason') || box.id.endsWith('-evidence'))) {
        box.removeAttribute('data-source'); // 🧠 Stops future syncing
      }
    });
  
    if (box.getAttribute('data-source') === 'sync') {
      box.addEventListener('input', () => {
        box.removeAttribute('data-source'); // 🧠 Also stops syncing if typed in
      });
    }
  });
  

  
  // a) restore saved state
  const savedCount = localStorage.getItem('bodyParagraphs');
  if (savedCount) {
    selectedBodyCount = parseInt(savedCount, 10);
    document.getElementById('paragraphCount').value = selectedBodyCount;
  }

  isEvidenceFirst = localStorage.getItem('isEvidenceFirst') === 'true';
  document.getElementById('evidenceFirstToggle').checked = isEvidenceFirst;

  restoreGoogleAuthIfPossible()
  // b) initialize modules
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

  // d) Confirm-count listener
  document.getElementById('confirmParagraphCount')
    .addEventListener('click', () => {
      const newCount = parseInt(document.getElementById('paragraphCount').value, 10);
      if (newCount !== selectedBodyCount) {
        if (!confirm('⚠️ This will reset your thesis and body paragraphs. Continue?')) {
          document.getElementById('paragraphCount').value = selectedBodyCount;
          return;
        }
        selectedBodyCount = newCount;
        localStorage.setItem('bodyParagraphs', selectedBodyCount);
        clearThesis();
        clearBodyParagraphs();
        updateEvidenceFirstVisibility();
        updateBodyParagraphVisibility(selectedBodyCount);
        syncData();
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

});


//=== end js/main.js ===//
