// === event-handlers.js ===

function initEventHandlers() {
  // Persist & sync all contenteditable fields
  document.querySelectorAll('[contenteditable=true]').forEach(el => {
    const saved = localStorage.getItem(el.id);

    // ✅ Only restore if the box is empty (don't overwrite live input)
    if (saved && el.innerText.trim().length === 0) {
      el.innerText = saved;
    }

    el.setAttribute('role', 'textbox'); // Accessibility

    let debounce;
    el.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(syncData, 300);
    });
  });
}

  // Refresh buttons
  document.querySelectorAll('.refresh-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      const box = document.getElementById(id);
      const hasUserTyped = box?.innerText.trim().length > 0;

      if (hasUserTyped) {
        const confirmRefresh = confirm(
          "🔄 Refresh this box?\n\n" +
          "This will rewrite the box using your answers from above.\n" +
          "✏️ If you’ve typed here already, your changes will be erased.\n" +
          "💡 Only click refresh if the box didn’t load correctly."
        );
        if (!confirmRefresh) return;
      }
    // 🔧 Handle final essay box separately
    if (id === 'essay-final') {
      activeEdits.delete('essay-final');
      updateEssay();
      return; // ⛔ skip regenerateBoxContent for essay-final
    }
      regenerateBoxContent(id);
    });
  });

  // “Next” buttons → completion messages
  [
    ['thesis-box',        'thesis-complete-message',        'thesis-next-btn'],
    ['evidence1-box',     'evidence-complete-message',      'evidence-next-btn'],
    ['ef-evidence-bp1',   'evidence-first-complete-message','evidence-first-next-btn'],
    ['intro-final',       'intro-complete-message',         'intro-next-btn'],
    ['bp1-final',         'bp1-complete-message',           'bp1-next-btn'],
    ['bp2-final',         'bp2-complete-message',           'bp2-next-btn'],
    ['bp3-final',         'bp3-complete-message',           'bp3-next-btn'],
    ['conclusion-final',  'conclusion-complete-message',    'conclusion-next-btn'],
    ['essay-final',       'final-celebration-message',      'all-done-btn']
  ].forEach(([boxId, msgId, btnId]) => {
    document.getElementById(btnId)?.addEventListener('click', () => {
      if (document.getElementById(boxId)?.innerText.trim()) {
        showCompletionMessage(msgId, btnId);
      }
    });
  });

  // Checklist checkboxes → save state + confetti
  document.querySelectorAll('.section-checklist input[type="checkbox"]').forEach(box => {
    const saved = localStorage.getItem(box.name);
    if (saved === 'true') box.checked = true;

    box.addEventListener('change', (event) => {
      localStorage.setItem(box.name, box.checked);
      const rect = event.target.getBoundingClientRect();
      confetti({
        particleCount: 40,
        spread: 70,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top  + rect.height / 2) / window.innerHeight
        },
        startVelocity: 25
      });
    });
  });

  // Writing coach buttons
  document.querySelectorAll('.writing-check-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId   = btn.dataset.target;
      const userText   = document.getElementById(targetId)?.innerText.trim();
      const prompt     = document.getElementById('writing-prompt')?.innerText.trim();
      const tipBox     = document.getElementById(`writing-tip-${targetId}`);
      const previewBox = document.getElementById(`writing-preview-${targetId}`);

      // hide any open tips/previews
      document.querySelectorAll('.writing-tip-box, .writing-preview-box')
              .forEach(box => box.classList.add('hidden'));

      if (!userText) {
        tipBox.innerHTML = '✏️ Please write something first for feedback.';
        return tipBox.classList.remove('hidden');
      }

      tipBox.innerHTML = generateWritingTip(prompt, userText, targetId);
      tipBox.classList.remove('hidden');

      if (previewBox) {
        previewBox.innerHTML = `<strong>📝 Preview with Highlights:</strong><br><br>` +
                               highlightWritingIssues(userText, targetId);
        previewBox.classList.remove('hidden');
      }
    });
  });

  function showCompletionMessage(messageId, buttonId) {
    const message = document.getElementById(messageId);
    const button  = document.getElementById(buttonId);
  
    if (!message) return;
    message.classList.remove('hidden');
    button?.classList.add('hidden');
  
    // apply dark-mode styling if needed
    message.classList.toggle('dark-mode', document.body.classList.contains('dark-mode'));
  
    // 🎉 confetti burst
    const end = Date.now() + 4000;
    if (typeof confetti === 'function') {
      (function frame() {
        confetti({
          particleCount: 10,
          spread: 70,
          origin: { x: Math.random(), y: Math.random() * 0.6 }
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  
    // 🧭 Scroll to the message after a slight delay
    setTimeout(() => {
      message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
  }
  

// Evidence-First visibility toggles
function updateEvidenceFirstVisibility() {
  const isEF = document.getElementById('evidenceFirstToggle').checked;
  document.getElementById('directory').classList.toggle('hidden', isEF);
  document.getElementById('evidence').classList.toggle('hidden', isEF);
  document.getElementById('directory-evidence-first').classList.toggle('hidden', !isEF);
  document.getElementById('evidence-first-setup').classList.toggle('hidden', !isEF);
  document.getElementById('evidence-first-section').classList.toggle('hidden', !isEF);
}

//Reverse the edits on the thesis
function attemptThesisReverseSync() {
  const thesis = document.getElementById('thesis-box')?.innerText.trim();
  const warning = document.getElementById('sync-warning');
  const previewBox = document.getElementById('sync-preview');
  const previewClaim = document.getElementById('preview-claim');
  const previewReasons = document.getElementById('preview-reasons');
  const paragraphCount = parseInt(document.getElementById('paragraphCount')?.value, 10);

  // Reset previous state
  warning.innerText = '';
  previewBox.classList.add('hidden');
  previewClaim.innerText = '';
  previewReasons.innerHTML = '';

  if (!thesis.toLowerCase().includes('because')) {
    warning.innerText = `⚠️ Unable to sync — please use the format: 'Claim because Reason 1${paragraphCount >= 2 ? " and Reason 2" : ""}${paragraphCount === 3 ? " and Reason 3" : ""}.'`;
    return;
  }

  const [claimPartRaw, reasonsPartRaw] = thesis.split(/because/i);
  if (!claimPartRaw || !reasonsPartRaw) {
    warning.innerText = "⚠️ Could not extract claim and reasons. Please check your sentence structure.";
    return;
  }

  const claimPart = claimPartRaw.trim().replace(/\.$/, '');
  const normalizedReasons = reasonsPartRaw
    .replace(/,\s*and\s+/gi, ', ')
    .replace(/\s+and\s+/gi, ', ')
    .replace(/\.$/, '');

  const reasonPieces = normalizedReasons
    .split(',')
    .map(r => r.trim())
    .filter(r => r.length > 0);

  if (reasonPieces.length !== paragraphCount) {
    warning.innerText = `⚠️ Unable to sync — your thesis should include exactly ${paragraphCount} reason${paragraphCount > 1 ? 's' : ''}.`;
    return;
  }

  // Show preview
  previewClaim.innerText = claimPart;
  reasonPieces.forEach(reason => {
    const li = document.createElement('li');
    li.innerText = reason;
    previewReasons.appendChild(li);
  });

  // Store temporarily for confirmation step
  previewBox.dataset.claim = claimPart;
  previewBox.dataset.reasons = JSON.stringify(reasonPieces);
  previewBox.classList.remove('hidden');
}

function confirmReverseSync() {
  const previewBox = document.getElementById('sync-preview');
  const claim = previewBox.dataset.claim;
  let reasons;
  try {
    reasons = JSON.parse(previewBox.dataset.reasons);
  } catch (e) {
    console.error("❌ Failed to parse reasons:", previewBox.dataset.reasons);
    return;
  }

  // Update claim
  if (claim) {
    document.getElementById('claim-box').innerText = claim;
  }

  // Update each reason box dynamically
  reasons.forEach((reason, index) => {
    const box = document.getElementById(`reason${index + 1}-box`);
    if (box) {
      box.innerText = reason;
    }
  });

  // Save changes to localStorage
  syncData();

  // Clear preview display
  previewBox.classList.add('hidden');

  // Show success message
  const messageEl = document.getElementById('sync-warning');
  messageEl.innerText = "✅ Claim and reasons updated!";
  
  // Auto-hide message after 4 seconds
  setTimeout(() => {
    messageEl.innerText = "";
  }, 4000);
}
// === end event-handlers.js ===
