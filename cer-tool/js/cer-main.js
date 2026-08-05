// cer-main.js
// Standalone CER tool. Local autosave is always on.

const STORAGE_PREFIX = 'cer_';

const FIELDS = [
  { id: 'textTitle', type: 'value' },
  { id: 'questionPrompt', type: 'value' },
  { id: 'claimBox', type: 'innerText' },
  { id: 'evidenceBox', type: 'innerText' },
  { id: 'reasoningBox', type: 'innerText' },
  { id: 'finalPreview', type: 'innerText' }
];

const PROGRESS_FIELDS = [
  { id: 'textTitle', type: 'value' },
  { id: 'questionPrompt', type: 'value' },
  { id: 'claimBox', type: 'innerText' },
  { id: 'evidenceBox', type: 'innerText' },
  { id: 'reasoningBox', type: 'innerText' }
];

function $(id){ return document.getElementById(id); }

function getTextValue(id){
  const el = $(id);
  if (!el) return '';
  return ('value' in el) ? (el.value || '') : (el.innerText || '');
}

function setTextValue(id, value){
  const el = $(id);
  if (!el) return;
  if ('value' in el) el.value = value || '';
  else el.innerText = value || '';
}

function getTitle(){ return getTextValue('textTitle').trim(); }
function getPrompt(){ return getTextValue('questionPrompt').trim(); }

function getFinalPreviewText(){
  return (getTextValue('finalPreview') || '').trim();
}

function applyTemplate(tpl){
  const title = getTitle() || 'the source';
  return tpl.replaceAll('{TITLE}', title);
}

function saveLocal(){
  for (const f of FIELDS){
    const el = $(f.id);
    if (!el) continue;
    const value = (f.type === 'value') ? (el.value ?? '') : (el.innerText ?? '');
    localStorage.setItem(`${STORAGE_PREFIX}${f.id}`, value);
  }

  const fp = $('finalPreview');
  if (fp){
    localStorage.setItem(`${STORAGE_PREFIX}finalPreview_generated`, fp.getAttribute('data-generated') || 'true');
  }

  localStorage.setItem(`${STORAGE_PREFIX}lastUpdatedAt`, String(Date.now()));
}

function restoreLocal(){
  for (const f of FIELDS){
    const el = $(f.id);
    if (!el) continue;
    const value = localStorage.getItem(`${STORAGE_PREFIX}${f.id}`);
    if (value == null) continue;
    if (f.type === 'value') el.value = value;
    else el.innerText = value;
  }

  const fp = $('finalPreview');
  if (fp){
    const generated = localStorage.getItem(`${STORAGE_PREFIX}finalPreview_generated`);
    if (generated != null) fp.setAttribute('data-generated', generated);
  }
}

function updateProgress(){
  const total = PROGRESS_FIELDS.length;
  let filled = 0;

  for (const f of PROGRESS_FIELDS){
    const el = $(f.id);
    if (!el) continue;
    const value = (f.type === 'value') ? (el.value ?? '') : (el.innerText ?? '');
    if (String(value).trim().length > 0) filled++;
  }

  const pct = Math.round((filled / total) * 100);
  const bar = $('progress-bar');
  const msg = $('progress-message');

  if (bar) bar.style.width = `${pct}%`;
  if (msg) msg.textContent = pct >= 100
    ? '🎉 Ready to revise + export!'
    : `Progress: ${filled}/${total} sections`;
}

function buildFinalResponse(){
  const parts = [
    getTextValue('claimBox').trim(),
    getTextValue('evidenceBox').trim(),
    getTextValue('reasoningBox').trim()
  ].filter(Boolean);

  return parts.join(' ');
}

function updateMirrors(){
  const prompt = getPrompt();
  const claim = getTextValue('claimBox').trim();
  const evidence = getTextValue('evidenceBox').trim();

  const promptText = prompt || 'Your question or prompt will appear here.';
  const claimText = claim || 'Your claim will appear here as you write.';
  const evidenceText = evidence || 'Your evidence will appear here as you write.';

  if ($('claimPromptMirror')) {
    $('claimPromptMirror').textContent = promptText;
  }

  if ($('claimMirrorEvidence')) {
    $('claimMirrorEvidence').textContent = claimText;
  }

  if ($('claimMirrorReasoning')) {
    $('claimMirrorReasoning').textContent = claimText;
  }

  if ($('evidenceMirrorReasoning')) {
    $('evidenceMirrorReasoning').textContent = evidenceText;
  }
}

function renderFinalPreview(){
  const out = $('finalPreview');
  if (!out) return;

  const locked = out.getAttribute('data-generated') === 'false';
  const current = (out.innerText || '').trim();

  if (locked && current.length){
    return;
  }

  out.innerText = buildFinalResponse();
  out.setAttribute('data-generated', 'true');
}

function getSectionName(sectionId){
  const map = {
    claimBox: 'Claim',
    evidenceBox: 'Evidence',
    reasoningBox: 'Reasoning',
    finalPreview: 'Final Response'
  };
  return map[sectionId] || sectionId;
}

function initStarters(){
  document.querySelectorAll('[data-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-insert');
      const tpl = btn.getAttribute('data-template') || '';
      const target = $(targetId);
      if (!target) return;

      const text = applyTemplate(tpl);
      const current = (target.innerText || '').trim();
      target.innerText = current ? `${current} ${text}` : text;
      target.focus();

      saveLocal();
      updateProgress();
      updateMirrors();
      renderFinalPreview();

      try {
        window.logActivity?.('starter', targetId, {
          starterText: text,
          sectionName: getSectionName(targetId)
        });
      } catch {}
    });
  });
}

function initToggles(){
  const dark = $('darkToggle');
  const dys = $('dyslexiaToggle');

  const dm = localStorage.getItem(`${STORAGE_PREFIX}dark`) === 'true';
  const dx = localStorage.getItem(`${STORAGE_PREFIX}dys`) === 'true';

  document.body.classList.toggle('dark-mode', dm);
  document.body.classList.toggle('dyslexia-mode', dx);

  if (dark) dark.checked = dm;
  if (dys) dys.checked = dx;

  dark?.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', !!dark.checked);
    localStorage.setItem(`${STORAGE_PREFIX}dark`, String(!!dark.checked));
  });

  dys?.addEventListener('change', () => {
    document.body.classList.toggle('dyslexia-mode', !!dys.checked);
    localStorage.setItem(`${STORAGE_PREFIX}dys`, String(!!dys.checked));
  });
}

function normalizeTextForCompare(text=''){
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CLAIM_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'because', 'been',
  'by', 'can', 'could', 'did', 'do', 'does', 'for', 'from',
  'had', 'has', 'have', 'how', 'in', 'is', 'it', 'its', 'may',
  'might', 'of', 'on', 'or', 'should', 'that', 'the', 'their',
  'them', 'there', 'these', 'they', 'this', 'to', 'was', 'were',
  'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with',
  'would', 'you', 'your'
]);

function getImportantWords(text=''){
  return normalizeTextForCompare(text)
    .split(' ')
    .filter(word => word.length >= 3 && !CLAIM_STOP_WORDS.has(word));
}

function getPromptWordsUsedInClaim(prompt='', claim=''){
  const promptWords = [...new Set(getImportantWords(prompt))];
  const claimWords = new Set(getImportantWords(claim));

  return promptWords.filter(word => claimWords.has(word));
}

function claimRestatesPrompt(prompt='', claim=''){
  if (!prompt.trim() || !claim.trim()) return false;

  const importantPromptWords = [...new Set(getImportantWords(prompt))];

  if (!importantPromptWords.length) {
    return claim.trim().length >= 15;
  }

  const matchingWords = getPromptWordsUsedInClaim(prompt, claim);
  const neededMatches = importantPromptWords.length >= 4 ? 2 : 1;

  return matchingWords.length >= neededMatches;
}

function stripQuotedText(text=''){
  return String(text || '')
    // Remove complete curly-quote passages
    .replace(/“[^”]*”/g, ' ')
    // Remove complete straight-quote passages
    .replace(/"[^"]*"/g, ' ');
}

function getEvidenceQuoteIssues(text=''){
  const issues = [];
  const t = String(text || '').trim();

  if (!t) return issues;

  const straightQuotes = (t.match(/"/g) || []).length;
  const openingCurlyQuotes = (t.match(/“/g) || []).length;
  const closingCurlyQuotes = (t.match(/”/g) || []).length;

  const totalQuoteMarks =
    straightQuotes +
    openingCurlyQuotes +
    closingCurlyQuotes;

  // Evidence should contain a quotation.
  if (totalQuoteMarks === 0){
    issues.push(
      'Include quotation marks around the exact words you are using as evidence.'
    );

    return issues;
  }

  // Check for missing opening or closing quotation marks.
  const hasUnmatchedStraightQuote = straightQuotes % 2 !== 0;
  const hasUnmatchedCurlyQuote = openingCurlyQuotes !== closingCurlyQuotes;

  if (hasUnmatchedStraightQuote || hasUnmatchedCurlyQuote){
    issues.push(
      'Your quotation marks look incomplete. Check that every quotation has both an opening and a closing quotation mark.'
    );
  }

  // Make sure the marks actually surround some text.
  const hasCompleteQuotedText =
    /"[^"]+"/.test(t) ||
    /“[^”]+”/.test(t);

  if (
    totalQuoteMarks > 0 &&
    !hasUnmatchedStraightQuote &&
    !hasUnmatchedCurlyQuote &&
    !hasCompleteQuotedText
  ){
    issues.push(
      'You have quotation marks, but they do not appear to surround a complete piece of evidence.'
    );
  }

  return issues;
}

function getGeneralWritingIssues(text=''){
  const issues = [];
  const t = String(text || '').trim();

  if (!t) return issues;

  // Remove complete quotations before checking informal language.
  // This prevents the student's source quotation from being flagged.
  const outsideQuotes = stripQuotedText(t).trim();

  // ----- PUNCTUATION -----

  // Allows punctuation immediately before a closing quotation mark.
  if (!/[.!?](?:["”])?\s*$/.test(t)){
    issues.push({
      type: 'punctuation',
      message: 'Add ending punctuation to your sentence or response.'
    });
  }

  if (/\s+[,.!?;:]/.test(outsideQuotes)){
    issues.push({
      type: 'punctuation',
      message: 'Remove the extra space before punctuation marks.'
    });
  }

  if (/[.!?][A-Za-z]/.test(outsideQuotes)){
    issues.push({
      type: 'punctuation',
      message: 'Add a space after ending punctuation before starting the next sentence.'
    });
  }

  if (/[,;:][A-Za-z]/.test(outsideQuotes)){
    issues.push({
      type: 'punctuation',
      message: 'Check your spacing after commas, semicolons, and colons.'
    });
  }

  if (/[!?]{2,}/.test(outsideQuotes)){
    issues.push({
      type: 'punctuation',
      message: 'Use only one ending punctuation mark in formal academic writing.'
    });
  }

  // ----- CAPITALIZATION -----

  if (/^[a-z]/.test(outsideQuotes)){
    issues.push({
      type: 'capitalization',
      message: 'Begin your sentence with a capital letter.'
    });
  }

  if (/[.!?]\s+[a-z]/.test(outsideQuotes)){
    issues.push({
      type: 'capitalization',
      message: 'Check capitalization. A new sentence should begin with a capital letter.'
    });
  }

  // ----- INFORMAL PRONOUNS -----

  if (/\b(i|me|my|mine|you|your|yours|we|us|our|ours)\b/i.test(outsideQuotes)){
    issues.push({
      type: 'informalPronoun',
      message: 'Use formal academic language. Avoid I, me, my, you, your, we, or our unless those words are inside a quotation.'
    });
  }

  // ----- CONTRACTIONS -----

  if (
    /\b(?:[A-Za-z]+n['’]t|I['’]m|I['’]ve|I['’]ll|I['’]d|you['’]re|you['’]ve|you['’]ll|we['’]re|we['’]ve|we['’]ll|they['’]re|they['’]ve|they['’]ll|it['’]s|that['’]s|there['’]s|what['’]s)\b/i.test(outsideQuotes)
  ){
    issues.push({
      type: 'informalLanguage',
      message: 'Avoid contractions in formal academic writing. Write the complete words instead.'
    });
  }

  // ----- VAGUE / CASUAL WORDS -----

  if (/\b(awesome|cool|stuff|kinda|sorta|gonna|wanna)\b/i.test(outsideQuotes)){
    issues.push({
      type: 'informalLanguage',
      message: 'Replace casual language with more precise academic wording.'
    });
  }

  if (/\bthings\b/i.test(outsideQuotes)){
    issues.push({
      type: 'informalLanguage',
      message: 'The word “things” can be vague. Consider naming the specific idea, event, detail, or evidence instead.'
    });
  }

  // ----- COMMON GRAMMAR / USAGE ISSUES -----

  if (/\b([A-Za-z]+)\s+\1\b/i.test(outsideQuotes)){
    issues.push({
      type: 'grammar',
      message: 'Check for a repeated word that may have been typed twice.'
    });
  }

  if (/\balot\b/i.test(outsideQuotes)){
    issues.push({
      type: 'grammar',
      message: '“A lot” should be written as two words.'
    });
  }

  if (/\b(could|should|would)\s+of\b/i.test(outsideQuotes)){
    issues.push({
      type: 'grammar',
      message: 'Check your verb phrase. Use “could have,” “should have,” or “would have” instead of “could of,” “should of,” or “would of.”'
    });
  }

  if (/\b(they|we|you)\s+was\b/i.test(outsideQuotes)){
    issues.push({
      type: 'grammar',
      message: 'Check subject-verb agreement. “They,” “we,” and “you” normally use “were,” not “was.”'
    });
  }

  if (/\b(he|she|it)\s+were\b/i.test(outsideQuotes)){
    issues.push({
      type: 'grammar',
      message: 'Check subject-verb agreement. A singular subject such as he, she, or it normally uses “was,” not “were.”'
    });
  }

  if (/\bI\s+(is|are)\b/i.test(outsideQuotes)){
    issues.push({
      type: 'grammar',
      message: 'Check subject-verb agreement after “I.”'
    });
  }

  // Flag an unusually long sentence for rereading.
  const sentences = outsideQuotes
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  const hasVeryLongSentence = sentences.some(sentence => {
    const words = sentence.split(/\s+/).filter(Boolean);
    return words.length > 40;
  });

  if (hasVeryLongSentence){
    issues.push({
      type: 'grammar',
      message: 'One of your sentences is very long. Reread it for a possible run-on sentence or a place where two sentences would be clearer.'
    });
  }

  return issues;
}

function simpleCoachFeedback(sectionId, text){
  const tips = [];
  const t = (text || '').trim();

  if (!t){
    return ['Add a sentence so the coach can help.'];
  }

  const claimText = getTextValue('claimBox').trim();
  const evidenceText = getTextValue('evidenceBox').trim();

  // =========================================================
  // GENERAL TEACHER-STYLE WRITING CHECKS
  // Claim, Evidence, and Reasoning all run these.
  // =========================================================

  const generalIssues = getGeneralWritingIssues(t);

  generalIssues.forEach(issue => {
    tips.push(issue.message);
  });

  // =========================================================
  // CLAIM
  // =========================================================

  if (sectionId === 'claimBox'){
    const originalPrompt = getPrompt();
    const matchingPromptWords =
      getPromptWordsUsedInClaim(originalPrompt, t);

    if (t.length < 20){
      tips.push(
        'Your claim is very short. Restate the main idea of the question and include your complete answer.'
      );
    }

    if (
      originalPrompt &&
      !claimRestatesPrompt(originalPrompt, t)
    ){
      tips.push(
        'Use important words or ideas from the question so the reader can tell exactly what you are answering.'
      );
    }

    if (
      originalPrompt &&
      matchingPromptWords.length
    ){
      tips.push(
        `You carried forward these question words or ideas: ${matchingPromptWords.join(', ')}. Make sure they are used in a complete statement.`
      );
    }

    if (t.includes('?')){
      tips.push(
        'A claim should be a statement, not another question. Turn the question into a statement and include your answer.'
      );
    }

    if (/^(because|yes|no)\b/i.test(t)){
      tips.push(
        'Do not begin with only “because,” “yes,” or “no.” Restate what the question is asking before giving your answer.'
      );
    }
  }

  // =========================================================
  // EVIDENCE
  // =========================================================

  if (sectionId === 'evidenceBox'){
    const quoteIssues = getEvidenceQuoteIssues(t);

    quoteIssues.forEach(issue => {
      tips.push(issue);
    });

    const hasSourceCue =
      /\baccording to\b|\bthe text states\b|\bthe author states\b|\bthe author writes\b|\bin paragraph\b|\bin line\b|\bfor example\b/i.test(t);

    if (!hasSourceCue){
      tips.push(
        'Introduce your evidence so the reader knows where it came from. Try a phrase such as “According to the text…” or “The author states…”'
      );
    }

    const hasCompleteQuote =
      /"[^"]+"/.test(t) ||
      /“[^”]+”/.test(t);

    if (hasCompleteQuote){
      const quotedPieces = [
        ...(t.match(/"[^"]+"/g) || []),
        ...(t.match(/“[^”]+”/g) || [])
      ];

      const hasVeryShortQuote = quotedPieces.some(quote => {
        const cleaned = quote
          .replace(/^["“]|["”]$/g, '')
          .trim();

        return cleaned.split(/\s+/).filter(Boolean).length < 3;
      });

      if (hasVeryShortQuote){
        tips.push(
          'Your quotation is very short. Make sure it includes enough of the source to clearly support your claim.'
        );
      }
    }
  }

  // =========================================================
  // REASONING
  // =========================================================

  if (sectionId === 'reasoningBox'){
    if (
      !/\bbecause\b|\bthis shows\b|\bthis demonstrates\b|\bthis supports\b|\bthis proves\b|\bthis means\b|\btherefore\b|\bthis matters\b|\bas a result\b/i.test(t)
    ){
      tips.push(
        'Explain the connection between the evidence and claim. Try language such as “This evidence supports the claim because…”'
      );
    }

    const reasoningNorm = normalizeTextForCompare(t);
    const evidenceNorm = normalizeTextForCompare(evidenceText);
    const claimNorm = normalizeTextForCompare(claimText);

    if (
      evidenceNorm &&
      reasoningNorm &&
      reasoningNorm === evidenceNorm
    ){
      tips.push(
        'Your reasoning repeats your evidence. Explain why the evidence matters instead of repeating what the source says.'
      );
    }

    if (
      evidenceNorm.length >= 25 &&
      reasoningNorm.includes(evidenceNorm.slice(0, 25))
    ){
      tips.push(
        'Part of your reasoning sounds very similar to your evidence. Add more of your own explanation about how the evidence proves the claim.'
      );
    }

    if (
      claimNorm &&
      reasoningNorm === claimNorm
    ){
      tips.push(
        'Your reasoning repeats your claim. Explain how the evidence connects to that claim.'
      );
    }

    if (t.length < 25){
      tips.push(
        'Your reasoning is quite short. Explain how or why the evidence supports your claim.'
      );
    }
  }

  // Remove identical messages if two checks produced the same feedback.
  const uniqueTips = [...new Set(tips)];

  return uniqueTips.length
    ? uniqueTips
    : [
        'Your writing passed the coach’s current checks. Reread it once more for clarity, accuracy, and whether every sentence supports your response.'
      ];
}

function initCoachButtons(){
  document.querySelectorAll('[data-coach]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-coach');
      const el = $(targetId);
      if (!el) return;

      const tips = simpleCoachFeedback(targetId, el.innerText || '');
      const prompt = getPrompt();

      alert(
        'Writing Coach (support only)\n\n' +
        'Check that your writing clearly answers the prompt.\n\n' +
        (prompt ? 'Question / Prompt:\n' + prompt + '\n\n' : '') +
        tips.map(t => '• ' + t).join('\n')
      );

      try { window.logActivity?.('coach', targetId); } catch {}
    });
  });
}

function initReadAloudButtons(){
  document.querySelectorAll('[data-read]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-read');
      const el = document.getElementById(targetId);
      const label = el?.getAttribute('data-label') || '';
      const text = ((el && ('value' in el)) ? (el.value || '') : (el?.innerText || '')).trim();
      speakText((label ? label + '. ' : '') + text);

      try { window.logActivity?.('read', targetId); } catch {}
    });
  });

  document.querySelectorAll('[data-stop="speech"]').forEach(btn => {
    btn.addEventListener('click', () => stopSpeech());
  });
}

function hasBasicConventionIssues(text){
  const t = (text || '').trim();
  if (!t) return true;
  if (!/[.!?]/.test(t)) return true;
  if (/^[a-z]/.test(t)) return true;
  return false;
}

function initChecklist(){
  document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => confettiSmallPop());
  });

  $('runChecklist')?.addEventListener('click', () => {
    const claim = getTextValue('claimBox').trim();
    const evidence = getTextValue('evidenceBox').trim();
    const reasoning = getTextValue('reasoningBox').trim();
    const finalText = getFinalPreviewText() || buildFinalResponse();

    const reasoningNorm = normalizeTextForCompare(reasoning);
    const evidenceNorm = normalizeTextForCompare(evidence);

    const finalWritingIssues = getGeneralWritingIssues(finalText);
    const evidenceQuoteIssues = getEvidenceQuoteIssues(evidence);

    const hasInformalLanguageIssue = finalWritingIssues.some(issue =>
      issue.type === 'informalPronoun' ||
      issue.type === 'informalLanguage'
    );

    const hasConventionIssue = finalWritingIssues.some(issue =>
      issue.type === 'punctuation' ||
      issue.type === 'capitalization' ||
      issue.type === 'grammar'
    );

    const checks = {
      claimClear:
        claim.length > 15 &&
        !claim.includes('?') &&
        claimRestatesPrompt(getPrompt(), claim),

      claimSpecific:
        claim.length > 25 &&
        !/^(because|yes|no)\b/i.test(claim),

      evidencePresent:
        evidence.length > 15 &&
        evidenceQuoteIssues.length === 0,

      evidenceSource:
        /\baccording to\b|\bthe text states\b|\bthe author states\b|\bthe author writes\b|\bfor example\b|\bparagraph\b|\bline\b/i.test(evidence),

      reasoningPresent:
        reasoning.length > 20,

      reasoningNotRepeat:
        !!reasoning &&
        reasoningNorm !== evidenceNorm,

      academicLanguage:
        !hasInformalLanguageIssue,

      conventions:
        !hasConventionIssue
    };

    document.querySelectorAll('#checklist [data-check]').forEach(box => {
      const key = box.getAttribute('data-check');
      box.checked = !!checks[key];
    });

    const done = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const msg = $('checklistMsg');

    if (msg){
      msg.textContent = done === total
        ? '✅ Strong CER draft! Next: revise for precision, clarity, and strong reasoning.'
        : `You have ${done}/${total} checks. Fix the unchecked items, then run again.`;
    }

    try { window.logActivity?.('checklist', 'checklist', { completedChecks: done, totalChecks: total }); } catch {}
    launchBigConfetti(done === total);
  });
}

function initCopyFinal(){
  $('copyFinal')?.addEventListener('click', async () => {
    const finalText = getFinalPreviewText() || buildFinalResponse();
    if (!finalText.trim()) return alert('Nothing to copy yet.');

    try {
      await navigator.clipboard.writeText(finalText);
      alert('✅ Copied final response!');
      try { window.logActivity?.('copy', 'finalPreview', { characterCount: finalText.length }); } catch {}
    } catch {
      alert('Copy failed. Try selecting the text and copying manually.');
    }
  });
}

function initClear(){
  $('clearAll')?.addEventListener('click', () => {
    if (!confirm('Clear all CER fields? (Local autosave + Drive content will be overwritten after next save.)')) return;

    for (const f of FIELDS){
      const el = $(f.id);
      if (!el) continue;
      if (f.type === 'value') el.value = '';
      else el.innerText = '';
      localStorage.removeItem(`${STORAGE_PREFIX}${f.id}`);
    }

    localStorage.removeItem(`${STORAGE_PREFIX}finalPreview_generated`);

    const fp = $('finalPreview');
    if (fp) fp.setAttribute('data-generated', 'true');

    updateMirrors();
    renderFinalPreview();
    updateProgress();

    try { window.logActivity?.('clear', 'all'); } catch {}
  });
}

function attachAutosaveListeners(){
  const debounced = debounce(() => {
    saveLocal();
    updateProgress();
    updateMirrors();
    renderFinalPreview();
  }, 250);

  $('textTitle')?.addEventListener('input', debounced);
  $('questionPrompt')?.addEventListener('input', debounced);

  ['claimBox', 'evidenceBox', 'reasoningBox'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', debounced);
  });

  const finalEl = $('finalPreview');
  finalEl?.addEventListener('input', () => {
    finalEl.setAttribute('data-generated', 'false');
    saveLocal();
    updateProgress();

    try { window.logActivity?.('final-edit', 'finalPreview'); } catch {}
  });
}

function debounce(fn, wait=300){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function getExportData(){
  const finalText = getFinalPreviewText() || buildFinalResponse();
  return {
    title: getTitle(),
    prompt: getPrompt(),
    claim: getTextValue('claimBox').trim(),
    evidence: getTextValue('evidenceBox').trim(),
    reasoning: getTextValue('reasoningBox').trim(),
    finalText,
    finalWasEdited: $('finalPreview')?.getAttribute('data-generated') === 'false'
  };
}

window.getCerExportData = getExportData;
window.getCerTextForExport = () => {
  const data = getExportData();
  const header = [
    data.title ? `Text / Source: ${data.title}` : null,
    data.prompt ? `Prompt: ${data.prompt}` : null
  ].filter(Boolean).join('\n');

  return (header ? header + '\n\n' : '') + data.finalText;
};

document.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    if (speechSynthesis.getVoices().length) populateVoiceList();
    else speechSynthesis.onvoiceschanged = populateVoiceList;
  }

  document.getElementById('voiceSelect')?.addEventListener('change', (e) => {
    localStorage.setItem(`${STORAGE_PREFIX}preferredVoiceIndex`, e.target.value);
  });

  restoreLocal();
  initToggles();
  initStarters();
  initCoachButtons();
  initReadAloudButtons();
  loadSharedFooter();
  initChecklist();
  initCopyFinal();
  initClear();
  attachAutosaveListeners();
  updateMirrors();
  updateProgress();
  renderFinalPreview();
});

window.addEventListener('cer:restored', () => {
  try {
    updateMirrors();
    updateProgress();
    renderFinalPreview();
  } catch {}
});

// ---- Shared footer loader ----
async function loadSharedFooter(){
  const host = document.getElementById('sharedFooter');
  if (!host) return;

  const candidates = [
    '/shared/footer.html',
    '/includes/footer.html',
    '/footer.html'
  ];

  for (const url of candidates){
    try{
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) continue;
      const html = await res.text();
      if (html && html.trim().length > 40){
        host.innerHTML = html;
        return;
      }
    }catch(e){}
  }

  host.innerHTML = '<div style="opacity:.7; text-align:center; padding:20px 12px; font-size:13px;">© Made by Maggie</div>';
}

// ---- Read aloud ----
let _speechUtterance = null;

function speakText(text){
  try{
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const t = (text || '').trim();
    if (!t) return;
    const u = new SpeechSynthesisUtterance(t);
    u.rate = 1.0;
    u.pitch = 1.0;
    const v = getSelectedVoice?.();
    if (v) { u.voice = v; u.lang = v.lang || u.lang; }
    _speechUtterance = u;
    window.speechSynthesis.speak(u);
  }catch(e){}
}

function stopSpeech(){
  try{
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }catch(e){}
}

// ---- Voice selection ----
let availableVoices = [];

function populateVoiceList(){
  if (!('speechSynthesis' in window)) return;
  const select = document.getElementById('voiceSelect');
  if (!select) return;

  availableVoices = window.speechSynthesis.getVoices() || [];
  select.innerHTML = '';

  availableVoices.forEach((v, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = `${v.name} (${v.lang})`;
    select.appendChild(opt);
  });

  const saved = localStorage.getItem(`${STORAGE_PREFIX}preferredVoiceIndex`);
  if (saved && select.options.length > Number(saved)){
    select.value = saved;
  }
}

function getSelectedVoice(){
  const select = document.getElementById('voiceSelect');
  const voices = window.speechSynthesis.getVoices() || [];
  const idx = Number(select?.value ?? localStorage.getItem(`${STORAGE_PREFIX}preferredVoiceIndex`) ?? 0);
  return voices[idx] || null;
}

// ---- Confetti ----
let _myConfetti = null;

function getConfetti(){
  if (_myConfetti) return _myConfetti;
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas || !(typeof window.confetti === 'function' || typeof window.confetti?.create === 'function')) return null;
  _myConfetti = window.confetti.create(canvas, { resize: true, useWorker: true });
  return _myConfetti;
}

function confettiSmallPop(){
  const c = getConfetti();
  if (!c) return;
  c({ particleCount: 40, spread: 70, startVelocity: 35, origin: { y: 0.85 } });
}

function launchBigConfetti(isPerfect = false){
  const c = getConfetti();
  if (!c) return;

  const bursts = isPerfect ? 7 : 5;
  for (let i = 0; i < bursts; i++){
    setTimeout(() => {
      c({
        particleCount: isPerfect ? 140 : 110,
        spread: 90,
        startVelocity: 45,
        scalar: 1,
        origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.3 + 0.55 }
      });
    }, i * 220);
  }
}

window.launchConfetti = launchBigConfetti;