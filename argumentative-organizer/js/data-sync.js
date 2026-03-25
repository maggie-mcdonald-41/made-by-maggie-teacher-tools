// === data-sync.js ===
console.log('syncData =', typeof syncData);

function syncData() {
  if (window.isReconfiguringStructure) {
    console.log("⏸️ syncData skipped during structure reconfiguration");
    return;
  }

  const defaultClaimText = "Make a clear statement that shows your position on the topic. This is not a full sentence.";

  function canSyncInto(el) {
    if (!el || !el.id) return false;

    const currentText = el.innerText.trim();
    const source = el.getAttribute('data-source');

    // Model A: once a student has manually taken over, do not overwrite
    if (source === 'manual') return false;
    if (activeEdits.has(el.id)) return false;

    return currentText === '' || source === 'sync';
  }

  // === 1) Persist all contenteditable fields ===
  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    if (!el.id) return;

    const content = el.innerText.trim();

    // ⛔️ Skip saving default instructional text
    if (el.id === 'claim-box' && content.includes(defaultClaimText)) {
      localStorage.removeItem('claim-box');
      console.log("⛔️ Skipping saving instructional placeholder in claim-box");
      return;
    }

    localStorage.setItem(el.id, content);
  });

  // === 2) Sync EF → Standard (claim only if safe) ===
  const efClaim = document.getElementById('ef-claim-box')?.innerText.trim();
  const claimBox = document.getElementById('claim-box');
  const claimContent = claimBox?.innerText.trim();

  if (
    isEvidenceFirst &&
    efClaim &&
    !efClaim.includes("Make a clear statement") &&
    claimBox &&
    canSyncInto(claimBox)
  ) {
    claimBox.innerText = efClaim;
    claimBox.setAttribute('data-source', 'sync');
    localStorage.setItem('claim-box', efClaim);
    console.log("🔁 Synced EF claim to standard claim-box");
  }

  // === 3) Sync EF reasons/evidence → standard ===
  [1, 2, 3].forEach(n => {
    if (n > selectedBodyCount) return;

    const efReason = document.getElementById(`ef-reason-bp${n}`)?.innerText.trim();
    const efEvidence = document.getElementById(`ef-evidence-bp${n}`)?.innerText.trim();

    const stdReasonBox = document.getElementById(`reason${n}-box`);
    const stdEvidenceBox = document.getElementById(`evidence${n}-box`);

    if (
      efReason &&
      stdReasonBox &&
      canSyncInto(stdReasonBox)
    ) {
      stdReasonBox.innerText = efReason;
      stdReasonBox.setAttribute('data-source', 'sync');
      localStorage.setItem(stdReasonBox.id, efReason);
      console.log(`🔁 Synced EF reason${n} to standard`);
    }

    if (
      efEvidence &&
      stdEvidenceBox &&
      canSyncInto(stdEvidenceBox)
    ) {
      stdEvidenceBox.innerText = efEvidence;
      stdEvidenceBox.setAttribute('data-source', 'sync');
      localStorage.setItem(stdEvidenceBox.id, efEvidence);
      console.log(`🔁 Synced EF evidence${n} to standard`);
    }
  });

  // === 4) Sync reasons → evidence planner ===
  [1, 2, 3].forEach(n => {
    if (n > selectedBodyCount) return;

    const reasonText = document.getElementById(`reason${n}-box`)?.innerText.trim() || '';
    const plannerEl = document.getElementById(`reason${n}-evidence`);
    if (plannerEl) plannerEl.innerText = reasonText;

    const finalReasonEl = document.getElementById(`bp${n}-reason`);
    if (
      finalReasonEl &&
      canSyncInto(finalReasonEl)
    ) {
      finalReasonEl.innerText = reasonText;
      finalReasonEl.setAttribute('data-source', 'sync');
      localStorage.setItem(finalReasonEl.id, reasonText);
      console.log(`🔁 Synced reason${n} → bp${n}-reason`);
    }
  });

  // === 5) Sync evidence → final body paragraphs ===
  [1, 2, 3].forEach(n => {
    if (n > selectedBodyCount) return;

    const evText = document.getElementById(`evidence${n}-box`)?.innerText.trim() || '';
    const finalEvEl = document.getElementById(`bp${n}-evidence`);

    if (
      finalEvEl &&
      canSyncInto(finalEvEl)
    ) {
      finalEvEl.innerText = evText;
      finalEvEl.setAttribute('data-source', 'sync');
      localStorage.setItem(finalEvEl.id, evText);
      console.log(`🔁 Synced evidence${n} → bp${n}-evidence`);
    }
  });

  // === 6) Trigger downstream updates ===
  updateThesis?.();
  updateIntroFinal?.();
  updateParagraphFinal?.(1);
  if (selectedBodyCount >= 2) updateParagraphFinal?.(2);
  if (selectedBodyCount === 3) updateParagraphFinal?.(3);
  updateConclusionFinal?.();
  updateEssay?.();
  updateProgressBar?.();
}

// === end data-sync.js ===
