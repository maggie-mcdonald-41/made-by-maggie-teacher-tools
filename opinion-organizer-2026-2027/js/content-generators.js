// === content-generators.js ===

function updateThesis() {
  const claim = document.getElementById('claim-box')?.innerText.trim();
  const reason1 = document.getElementById('reason1-box')?.innerText.trim();
  const reason2 = document.getElementById('reason2-box')?.innerText.trim();
  const reason3 = document.getElementById('reason3-box')?.innerText.trim();

  let thesisText = '';
  if (selectedBodyCount === 3 && claim && reason1 && reason2 && reason3) {
    thesisText = `${claim} because ${reason1}, ${reason2}, and ${reason3}.`;
  } else if (selectedBodyCount === 2 && claim && reason1 && reason2) {
    thesisText = `${claim} because ${reason1} and ${reason2}.`;
  } else if (selectedBodyCount === 1 && claim && reason1) {
    thesisText = `${claim} because ${reason1}.`;
  }

  const previous = localStorage.getItem('thesis');
  const thesisBox = document.getElementById('thesis-box');
  const introBox = document.getElementById('intro-thesis-box');
  const restateBox = document.getElementById('restate-thesis');

  // Only overwrite if box is empty or matches old thesis
  if (!thesisBox.innerText.trim() || thesisBox.innerText.trim() === previous) {
    thesisBox.innerText = thesisText;
  }

  if (!introBox.innerText.trim() || introBox.innerText.trim() === previous) {
    introBox.innerText = thesisText;
  }

  const reworded = rewordThesis(thesisText);
  if (!restateBox.innerText.trim() || restateBox.innerText.trim() === rewordThesis(previous)) {
    restateBox.innerText = reworded;
  }

  localStorage.setItem('thesis', thesisText);
}

  
function updateIntroFinal() {
  const hook = document.getElementById('hook-box')?.innerText.trim();
  const issue = document.getElementById('issue-box')?.innerText.trim();
  const thesis = document.getElementById('intro-thesis-box')?.innerText.trim();
  const introBox = document.getElementById('intro-final');
  const generated = `${hook} ${issue} ${thesis}`.trim();
  const current = introBox?.innerText.trim();
  const previous = localStorage.getItem('intro-final');

  if (
    !activeEdits.has('intro-final') &&
    (!current || current === previous || current === generated)
  ) {
    introBox.innerText = generated;
    localStorage.setItem('intro-final', generated);
  }
}


  
function updateParagraphFinal(num) {
  const reason = document.getElementById(`bp${num}-reason`)?.innerText.trim();
  const evidence = document.getElementById(`bp${num}-evidence`)?.innerText.trim();
  const explanation = document.getElementById(`bp${num}-explanation`)?.innerText.trim();
  const boxId = `bp${num}-final`;
  const finalBox = document.getElementById(boxId);
  const generated = `${reason} ${evidence} ${explanation}`.trim();
  const current = finalBox?.innerText.trim();
  const previous = localStorage.getItem(boxId);

  if (
    !activeEdits.has(boxId) &&
    (!current || current === previous || current === generated)
  ) {
    finalBox.innerText = generated;
    localStorage.setItem(boxId, generated);
  }
}


  
function updateConclusionFinal() {
  const trans = document.getElementById('conclusion-transition')?.innerText.trim();
  const restate = document.getElementById('restate-thesis')?.innerText.trim();
  const call = document.getElementById('call-to-action')?.innerText.trim();
  const boxId = 'conclusion-final';
  const conclusionBox = document.getElementById(boxId);
  const generated = `${trans} ${restate} ${call}`.trim();
  const current = conclusionBox?.innerText.trim();
  const previous = localStorage.getItem(boxId);

  if (
    !activeEdits.has(boxId) &&
    (!current || current === previous || current === generated)
  ) {
    conclusionBox.innerText = generated;
    localStorage.setItem(boxId, generated);
  }
}


  
function updateEssay() {
  const intro = document.getElementById('intro-final')?.innerText.trim();
  const bp1 = document.getElementById('bp1-final')?.innerText.trim();
  const bp2 = document.getElementById('bp2-final')?.innerText.trim();
  const bp3 = document.getElementById('bp3-final')?.innerText.trim();
  const conclusion = document.getElementById('conclusion-final')?.innerText.trim();
  const boxId = 'essay-final';
  const essayBox = document.getElementById(boxId);

  const indentParagraph = p => p ? `&nbsp;&nbsp;&nbsp;&nbsp;${p}` : '';
  const paragraphs = [intro, bp1, bp2, bp3, conclusion]
    .filter(Boolean)
    .map(indentParagraph)
    .join('<br><br>');

  const current = essayBox?.innerText.trim();
  const previous = localStorage.getItem(boxId);

  if (
    !activeEdits.has(boxId) &&
    (!current || current === previous || current === paragraphs)
  ) {
    essayBox.innerHTML = paragraphs;
    localStorage.setItem(boxId, paragraphs);
  }
}

function getEssayTextForExport() {
const essayFinal = document
    .getElementById('essay-final')
    ?.innerText
    .trim();

  if (!essayFinal) {
    alert('⚠️ No text found in the Final Essay box.');
    return '';
  }

  return essayFinal;
}


  function regenerateBoxContent(id) {
    const box = document.getElementById(id);
    if (!box) return;
  
    box.classList.add('loading');
  
    setTimeout(() => {
      switch (id) {
        case 'thesis-box':
          updateThesis();
          break;
        case 'intro-final':
          updateIntroFinal();
          break;
        case 'bp1-final':
          updateParagraphFinal(1);
          break;
        case 'bp2-final':
          updateParagraphFinal(2);
          break;
        case 'bp3-final':
          updateParagraphFinal(3);
          break;
        case 'conclusion-final':
          updateConclusionFinal();
          break;
        case 'essay-final':
          updateEssay();
          break;
        default:
          console.warn(`No regenerate logic defined for box ID: ${id}`);
      }
      box.classList.remove('loading');
    }, 50);
  }
  
  window.regenerateBoxContent = regenerateBoxContent;
  
  function syncEvidenceFirstToStandard() {
    // Claim
    const efClaim = document.getElementById('ef-claim')?.innerText.trim();
    if (efClaim) document.getElementById('claim-box').innerText = efClaim;
  
    // Reasons
    const reason1 = document.getElementById('ef-reason-bp1')?.innerText.trim();
    if (reason1) document.getElementById('reason1-box').innerText = reason1;
  
    const reason2 = document.getElementById('ef-reason-bp2')?.innerText.trim();
    if (reason2) document.getElementById('reason2-box').innerText = reason2;
  
    const reason3 = document.getElementById('ef-reason-bp3')?.innerText.trim();
    if (reason3) document.getElementById('reason3-box').innerText = reason3;
  
    // Evidence
    const evidence1 = document.getElementById('ef-evidence-bp1')?.innerText.trim();
    if (evidence1) document.getElementById('bp1-evidence').innerText = evidence1;
  
    const evidence2 = document.getElementById('ef-evidence-bp2')?.innerText.trim();
    if (evidence2) document.getElementById('bp2-evidence').innerText = evidence2;
  
    const evidence3 = document.getElementById('ef-evidence-bp3')?.innerText.trim();
    if (evidence3) document.getElementById('bp3-evidence').innerText = evidence3;
  }

  function initTopicSync() {
    const topicBox = document.getElementById('essay-topic');
    if (!topicBox) return;
  
    function updateReasonBoxesWithTopic() {
      const topic = topicBox.innerText.trim();
  
      [1, 2, 3].forEach(num => {
        const reasonSource = document.getElementById(`reason${num}-box`);
        const targetReason = document.getElementById(`bp${num}-reason`);
        const reasonText = reasonSource?.innerText.trim();
  
        if (targetReason && reasonText) {
          const shouldSync =
            targetReason.innerText.trim() === '' ||
            (targetReason.getAttribute('data-source') === 'sync' && !activeEdits.has(targetReason.id));
          if (shouldSync) {
            targetReason.innerText = topic ? `${topic} ${reasonText}` : reasonText;
            targetReason.setAttribute('data-source', 'sync');
          }
        }
  
        const evidenceSource = document.getElementById(`evidence${num}-box`);
        const targetEvidence = document.getElementById(`bp${num}-evidence`);
        const evidenceText = evidenceSource?.innerText.trim();
  
        if (targetEvidence && evidenceText) {
          const shouldSync =
            targetEvidence.innerText.trim() === '' ||
            (targetEvidence.getAttribute('data-source') === 'sync' && !activeEdits.has(targetEvidence.id));
          if (shouldSync) {
            targetEvidence.innerText = evidenceText;
            targetEvidence.setAttribute('data-source', 'sync');
          }
        }
      });
    }
  
    let debounce;
    topicBox.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(updateReasonBoxesWithTopic, 300);
    });
  }
  
  
  // === end-content-generators.js ===