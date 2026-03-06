// races-main.js
// Standalone RACES tool (site-based). Local autosave is always on.

const FIELDS = [
  { id: 'textTitle', type: 'value' },
  { id: 'questionPrompt', type: 'value' },
  { id: 'rBox', type: 'innerText' },
  { id: 'aBox', type: 'innerText' },
  { id: 'cBox', type: 'innerText' },
  { id: 'eBox', type: 'innerText' },
  { id: 'sBox', type: 'innerText' },
  { id: 'finalPreview', type: 'innerText' }
];  

function $(id){ return document.getElementById(id); }

function getTitle(){ return ($('textTitle')?.value || '').trim(); }
function getPrompt(){ return ($('questionPrompt')?.value || '').trim(); }

function applyTemplate(tpl){
  const title = getTitle() || 'the text';
  return tpl.replaceAll('{TITLE}', title);
}

function saveLocal(){
  for (const f of FIELDS){
    const el = $(f.id);
    if (!el) continue;
    const v = (f.type === 'value') ? (el.value ?? '') : (el.innerText ?? '');
    localStorage.setItem(`races_${f.id}`, v);
  }
}

function restoreLocal(){
  for (const f of FIELDS){
    const el = $(f.id);
    if (!el) continue;
    const v = localStorage.getItem(`races_${f.id}`);
    if (v == null) continue;
    if (f.type === 'value') el.value = v;
    else el.innerText = v;
  }
}

function updateProgress(){
  const total = FIELDS.length;
  let filled = 0;
  for (const f of FIELDS){
    const el = $(f.id);
    if (!el) continue;
    const v = (f.type === 'value') ? (el.value ?? '') : (el.innerText ?? '');
    if (String(v).trim().length > 0) filled++;
  }
  const pct = Math.round((filled/total)*100);
  const bar = $('progress-bar');
  const msg = $('progress-message');
  if (bar) bar.style.width = `${pct}%`;
  if (msg) msg.textContent = pct >= 100 ? '🎉 Ready to revise + export!' : `Progress: ${filled}/${total} sections`;
}

function buildFinalResponse(){
  const parts = [
    $('rBox')?.innerText?.trim(),
    $('aBox')?.innerText?.trim(),
    $('cBox')?.innerText?.trim(),
    $('eBox')?.innerText?.trim(),
    $('sBox')?.innerText?.trim(),
  ].filter(Boolean);
return parts.join(' ');
}

function renderFinalPreview(){
  const out = $('finalPreview');
  if (!out) return;

  // If the student edits the preview, don't overwrite their changes.
  const locked = out.getAttribute('data-generated') === 'false';
  const current = (out.innerText || '').trim();

  if (locked && current.length){
    return;
  }

  out.innerText = buildFinalResponse();
  out.setAttribute('data-generated', 'true');
}

function initStarters(){
  document.querySelectorAll('[data-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-insert');
      const tpl = btn.getAttribute('data-template') || '';
      const target = $(targetId);
      if (!target) return;
      const text = applyTemplate(tpl);

      // Insert at end (simple + reliable)
      const current = (target.innerText || '').trim();
      target.innerText = current ? `${current} ${text}` : text;
      target.focus();

      saveLocal();
      updateProgress();
      renderFinalPreview();

      // Optional logging (google integration will define logActivity)
      try { window.logActivity?.('start', targetId); } catch {}
    });
  });
}

function initToggles(){
  const dark = $('darkToggle');
  const dys = $('dyslexiaToggle');

  // restore
  const dm = localStorage.getItem('races_dark') === 'true';
  const dx = localStorage.getItem('races_dys') === 'true';
  document.body.classList.toggle('dark-mode', dm);
  document.body.classList.toggle('dyslexia-mode', dx);
  if (dark) dark.checked = dm;
  if (dys) dys.checked = dx;

  dark?.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', !!dark.checked);
    localStorage.setItem('races_dark', String(!!dark.checked));
  });
  dys?.addEventListener('change', () => {
    document.body.classList.toggle('dyslexia-mode', !!dys.checked);
    localStorage.setItem('races_dys', String(!!dys.checked));
  });
}

function simpleCoachFeedback(text){
  const formalMode = true; // always enforce academic/formal writing expectations
  const tips = [];
  const t = (text || '').trim();
  if (!t) return ['Add a sentence so the coach can help.'];

  // Evidence check (C section must include quotation marks)
  const quoteLike = /".+"|“.+”/.test(t);
  const isEvidenceBox = (text === ($('cBox')?.innerText || ''));
  if (isEvidenceBox && !quoteLike){
    tips.push('Your evidence must include quotation marks. Add “ ” (or " ") around the exact words you copied from the text.');
  }

  // Formality checks
  if (formalMode){
    if (/(\bI\b|\bmy\b|\bme\b|\bwe\b|\bour\b)/i.test(t)) tips.push('Formal Mode: Avoid first-person pronouns unless your teacher says it is allowed.');
    if (/(\bcan't\b|\bdon't\b|\bwon't\b|\bI'm\b|\bit's\b|\bthey're\b)/i.test(t)) tips.push('Formal Mode: Replace contractions with full words (can’t → cannot, don’t → do not).');
    if (/\b(awesome|cool|stuff|things|kinda|sorta)\b/i.test(t)) tips.push('Formal Mode: Swap casual words (cool/stuff/things) for precise academic words.');
  }

  // Conventions (lightweight)
  if (!/[.!?]$/.test(t.replace(/[”"]+\s*$/, ''))) tips.push('Add ending punctuation (., !, or ?).');
  if (/^[a-z]/.test(t)) tips.push('Start with a capital letter.');

  // Explain section reminder
  if (text === ($('eBox')?.innerText || '') && !/this shows|this means|this proves|therefore|because/i.test(t)){
    tips.push('In your explanation, add a connector like “This shows that…” to connect evidence to your answer.');
  }

  return tips.length ? tips : ['Looks good. Now check clarity: does every sentence connect back to the question?'];
}

function initCoachButtons(){
  document.querySelectorAll('[data-coach]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-coach');
      const el = $(targetId);
      if (!el) return;
      const tips = simpleCoachFeedback(el.innerText || '');
const prompt = getPrompt();

alert(
  'Writing Coach (support only)\n\n' +
  'Check that your response clearly answers the question.\n\n' +
  (prompt ? 'Question:\n' + prompt + '\n\n' : '') +
  tips.map(t => '• ' + t).join('\n')
);      try { window.logActivity?.('ai', targetId); } catch {}
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
    });
  });

  document.querySelectorAll('[data-stop="speech"]').forEach(btn => {
    btn.addEventListener('click', () => stopSpeech());
  });
}

function initChecklist(){
  // Confetti on every checklist box click
  document.querySelectorAll('#checklist input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => confettiSmallPop());
  });

  $('runChecklist')?.addEventListener('click', () => {
    const r = ($('rBox')?.innerText || '').trim();
    const a = ($('aBox')?.innerText || '').trim();
    const c = ($('cBox')?.innerText || '').trim();
    const e = ($('eBox')?.innerText || '').trim();
    const s = ($('sBox')?.innerText || '').trim();

    const checks = {
      restate: r.length > 10,
      answer: a.length > 10,
      evidence: /".+"|“.+”/.test(c) || c.length > 15,
      explain: e.length > 15,
      summary: s.length > 10,
      conventions: !hasBasicConventionIssues(buildFinalResponse())
    };

    document.querySelectorAll('#checklist [data-check]').forEach(box => {
      const key = box.getAttribute('data-check');
      box.checked = !!checks[key];
    });

    const done = Object.values(checks).filter(Boolean).length;
    const msg = $('checklistMsg');
    if (msg) msg.textContent = done === 6 ? '✅ Strong draft! Next: revise for clarity and specificity.' : `You have ${done}/6 checks. Fix the unchecked items, then run again.`;
    // Big celebration whenever the checklist is run
    launchBigConfetti(done === 6);
  });
}

function hasBasicConventionIssues(text){
  const t = (text || '').trim();
  if (!t) return true;
  // at least one end punctuation in the response
  if (!/[.!?]/.test(t)) return true;
  // starts with capital
  if (/^[a-z]/.test(t)) return true;
  return false;
}

function initCopyFinal(){
  $('copyFinal')?.addEventListener('click', async () => {
    const finalText = buildFinalResponse();
    if (!finalText.trim()) return alert('Nothing to copy yet.');
    try {
      await navigator.clipboard.writeText(finalText);
      alert('✅ Copied final response!');
    } catch {
      alert('Copy failed. Try selecting the text and copying manually.');
    }
  });
}

function initClear(){
  $('clearAll')?.addEventListener('click', () => {
    if (!confirm('Clear all RACES fields? (Local autosave + Drive content will be overwritten after next save.)')) return;
    for (const f of FIELDS){
      const el = $(f.id);
      if (!el) continue;
      if (f.type === 'value') el.value = '';
      else el.innerText = '';
      localStorage.removeItem(`races_${f.id}`);
    }
    renderFinalPreview();
    updateProgress();
  });
}

function attachAutosaveListeners(){
  const debounced = debounce(() => {
    saveLocal();
    updateProgress();
    renderFinalPreview();
  }, 250);

  // inputs
  $('textTitle')?.addEventListener('input', debounced);
  $('questionPrompt')?.addEventListener('input', debounced);

  // contenteditable
  ['rBox','aBox','cBox','eBox','sBox'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', debounced);
  });
}

function debounce(fn, wait=300){
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// Expose export gatherer for google integration
window.getRacesTextForExport = () => {
  const title = getTitle();
  const q = getPrompt();
  const finalText = buildFinalResponse();
  const header = [
    title ? `Text: ${title}` : null,
    q ? `Question: ${q}` : null
  ].filter(Boolean).join('\n');
  return (header ? header + '\n\n' : '') + finalText;
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  // Populate voices (may load async)
  if ('speechSynthesis' in window) {
    if (speechSynthesis.getVoices().length) populateVoiceList();
    else speechSynthesis.onvoiceschanged = populateVoiceList;
  }
  document.getElementById('voiceSelect')?.addEventListener('change', (e) => {
    localStorage.setItem('races_preferredVoiceIndex', e.target.value);
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
  // Mark final preview as user-edited when they type
  const fp = $('finalPreview');
  fp?.addEventListener('input', () => fp.setAttribute('data-generated', 'false'));
  attachAutosaveListeners();
  updateProgress();
  renderFinalPreview();
});

// When Drive restore applies state, refresh UI
window.addEventListener('races:restored', () => {
  try { updateProgress(); renderFinalPreview(); } catch {}
});



// ---- Shared footer loader (pulls your site's global footer) ----
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
      // Only mount if it looks like footer content
      if (html && html.trim().length > 40){
        host.innerHTML = html;
        return;
      }
    }catch(e){ /* ignore and try next */ }
  }

  // Fallback (minimal)
  host.innerHTML = '<div style="opacity:.7; text-align:center; padding:20px 12px; font-size:13px;">© Made by Maggie</div>';
}

// ---- Read aloud (Web Speech API) ----
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

  const saved = localStorage.getItem('races_preferredVoiceIndex');
  if (saved && select.options.length > Number(saved)){
    select.value = saved;
  }
}

function getSelectedVoice(){
  const select = document.getElementById('voiceSelect');
  const voices = window.speechSynthesis.getVoices() || [];
  const idx = Number(select?.value ?? localStorage.getItem('races_preferredVoiceIndex') ?? 0);
  return voices[idx] || null;
}



// ---- Confetti (canvas-confetti) ----
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

// expose for Google export success
window.launchConfetti = launchBigConfetti;

