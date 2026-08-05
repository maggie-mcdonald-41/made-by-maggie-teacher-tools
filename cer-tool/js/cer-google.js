/* cer-google.js
   Google OAuth + Drive Autosave + Docs Export + Teacher Writing Insights
   Supports writing organization only. It does not generate answers.
*/

const CLIENT_ID = '592399844090-i5e5nc7a098as70j39cab8lsv8ini9t0.apps.googleusercontent.com';
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

const toolType = 'cer';
const FOLDER_NAME = 'EssayToolSave';

let tokenClient;

const TOKEN_KEY = `accessToken-${toolType}`;
const EMAIL_KEY = `userEmail-${toolType}`;
const FILE_KEY = `fileId-${toolType}`;
const LOG_KEY = `writingLog-${toolType}`;
const ACTIVITY_KEY = `activityMetrics-${toolType}`;

let accessToken = localStorage.getItem(TOKEN_KEY);
let userEmail   = localStorage.getItem(EMAIL_KEY);
let isSignedIn  = !!accessToken;
let fileId      = localStorage.getItem(FILE_KEY) || null;
let folderId    = null;
let autosaveTimer = null;
let monitoringSetup = false;

const writingLog = [];
const revisionCounts = {};
const editStartTimes = {};

const LOG_TIMEZONE = 'America/New_York';

const SECTION_LABELS = {
  textTitle: 'Text / Source Title',
  questionPrompt: 'Question / Prompt',
  claimBox: 'Claim',
  evidenceBox: 'Evidence',
  reasoningBox: 'Reasoning',
  finalPreview: 'Final Response',
  checklist: 'Checklist',
  all: 'All Sections'
};

function createEmptyActivityMetrics(){
  return {
    sessionStartedAt: null,
    lastUpdatedAt: null,
    sessionCount: 0,
    restoredFromDrive: false,
    restoredFromLocal: false,
    activeTimeMs: 0,
    sectionTime: {
      textTitle: 0,
      questionPrompt: 0,
      claimBox: 0,
      evidenceBox: 0,
      reasoningBox: 0,
      finalPreview: 0
    },
    pasteEvents: [],
    coachChecks: 0,
    starterClicks: 0,
    checklistRuns: 0,
    copyCount: 0,
    exportCount: 0,
    readAloudCount: 0,
    finalEdited: false,
    clearCount: 0
  };
}

let activityMetrics = createEmptyActivityMetrics();

function fmtTs(ts) {
  if (!ts) return '—';
  try { return new Date(ts).toLocaleString(undefined, { hour12: true, timeZone: LOG_TIMEZONE }); }
  catch { return new Date(ts).toLocaleString(); }
}

function fmtDuration(ms=0) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function countWords(text=''){
  const clean = (text || '').trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

function getSectionLabel(id){
  return SECTION_LABELS[id] || id || '';
}

function showLoadingMessage(text){
  const el = document.getElementById('loading-msg');
  if (!el) return;
  el.textContent = text;
  el.style.display = 'block';
}

function hideLoadingMessage(){
  const el = document.getElementById('loading-msg');
  if (!el) return;
  el.style.display = 'none';
}

function saveActivityLocal(){
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(writingLog));
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityMetrics));
  } catch {}
}

function restoreActivityLocal(){
  try {
    const savedLog = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    if (Array.isArray(savedLog)) {
      writingLog.length = 0;
      writingLog.push(...savedLog);
    }
  } catch {}

  try {
    const savedMetrics = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || 'null');
    if (savedMetrics && typeof savedMetrics === 'object') {
      activityMetrics = {
        ...createEmptyActivityMetrics(),
        ...savedMetrics,
        sectionTime: {
          ...createEmptyActivityMetrics().sectionTime,
          ...(savedMetrics.sectionTime || {})
        },
        pasteEvents: Array.isArray(savedMetrics.pasteEvents) ? savedMetrics.pasteEvents : []
      };
      activityMetrics.restoredFromLocal = true;
    }
  } catch {}
}

function beginNewPageSession(){
  if (!activityMetrics.sessionStartedAt) {
    activityMetrics.sessionStartedAt = Date.now();
  }
  activityMetrics.sessionCount = Number(activityMetrics.sessionCount || 0) + 1;
  activityMetrics.lastUpdatedAt = Date.now();
  saveActivityLocal();
}

function logActivity(action, sectionId = null, extra = {}) {
  const ts = Date.now();
  const sectionLabel = getSectionLabel(sectionId);
  const entry = { ts, action, ...(sectionId ? { sectionId, sectionLabel } : {}), ...extra };

  const last = writingLog[writingLog.length - 1];
  if (last && last.action === entry.action && last.sectionId === entry.sectionId && (ts - last.ts) < 800) return;

  writingLog.push(entry);

  if (action === 'coach') activityMetrics.coachChecks += 1;
  if (action === 'starter') activityMetrics.starterClicks += 1;
  if (action === 'checklist') activityMetrics.checklistRuns += 1;
  if (action === 'copy') activityMetrics.copyCount += 1;
  if (action === 'export') activityMetrics.exportCount += 1;
  if (action === 'read') activityMetrics.readAloudCount += 1;
  if (action === 'final-edit') activityMetrics.finalEdited = true;
  if (action === 'clear') activityMetrics.clearCount += 1;

  activityMetrics.lastUpdatedAt = ts;
  saveActivityLocal();
}
window.logActivity = logActivity;

function capturePaste(sectionId, pastedText){
  const text = pastedText || '';
  const event = {
    sectionId,
    sectionLabel: getSectionLabel(sectionId),
    timestamp: Date.now(),
    characterCount: text.length,
    wordCount: countWords(text),
    preview: text.trim().slice(0, 120)
  };

  activityMetrics.pasteEvents.push(event);
  activityMetrics.lastUpdatedAt = Date.now();
  saveActivityLocal();

  logActivity('paste', sectionId, {
    pasteChars: event.characterCount,
    pasteWords: event.wordCount
  });
}

function finishSection(sectionId){
  const start = editStartTimes[sectionId];
  if (!start) return;

  const durationMs = Date.now() - start;
  revisionCounts[sectionId] = (revisionCounts[sectionId] || 0) + 1;
  activityMetrics.activeTimeMs += durationMs;
  activityMetrics.sectionTime[sectionId] = (activityMetrics.sectionTime[sectionId] || 0) + durationMs;
  activityMetrics.lastUpdatedAt = Date.now();

  logActivity('finish', sectionId, {
    durationMs,
    revision: revisionCounts[sectionId]
  });

  delete editStartTimes[sectionId];
  saveActivityLocal();
}

function setupEnhancedMonitoring(){
  if (monitoringSetup) return;
  monitoringSetup = true;

  const watchIds = ['claimBox', 'evidenceBox', 'reasoningBox', 'finalPreview'];
  watchIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('focus', () => {
      editStartTimes[id] = Date.now();
      activityMetrics.lastUpdatedAt = Date.now();
      logActivity('start', id);
    });

    el.addEventListener('blur', () => finishSection(id));

    el.addEventListener('paste', (evt) => {
      const txt = (evt.clipboardData || window.clipboardData)?.getData('text') || '';
      capturePaste(id, txt);
    });
  });

  ['textTitle', 'questionPrompt'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('focus', () => {
      editStartTimes[id] = Date.now();
      activityMetrics.lastUpdatedAt = Date.now();
      logActivity('start', id);
    });

    el.addEventListener('blur', () => finishSection(id));

    el.addEventListener('paste', (evt) => {
      const txt = (evt.clipboardData || window.clipboardData)?.getData('text') || '';
      capturePaste(id, txt);
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      Object.keys(editStartTimes).forEach(finishSection);
    }
  });

  window.addEventListener('beforeunload', () => {
    Object.keys(editStartTimes).forEach(finishSection);
    saveActivityLocal();
  });
}

async function gapiRequest(url, opts={}){
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    throw new Error(`${res.status} ${txt}`);
  }

  return res.json();
}

async function getOrCreateFolder(){
  if (folderId) return folderId;

  const q = `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`;
  const res = await gapiRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`);

  if (res.files && res.files.length){
    folderId = res.files[0].id;
    return folderId;
  }

  const meta = { name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' };
  const created = await fetch('https://www.googleapis.com/drive/v3/files', {
    method:'POST',
    headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json; charset=UTF-8' },
    body: JSON.stringify(meta)
  }).then(r => r.json());

  if (!created.id) throw new Error('Folder create failed');
  folderId = created.id;
  return folderId;
}

function gatherToolState(){
  const ids = ['textTitle', 'questionPrompt', 'claimBox', 'evidenceBox', 'reasoningBox', 'finalPreview'];
  const data = {};

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    data[id] = el.isContentEditable ? (el.innerText || '') : (el.value || '');
  });

  const finalPreviewEl = document.getElementById('finalPreview');
  data._finalPreviewGenerated = finalPreviewEl?.getAttribute('data-generated') || 'true';

  data._writingLog = writingLog;
  data._revisionCounts = revisionCounts;
  data._activityMetrics = activityMetrics;
  data._tool = toolType;
  data._updatedAt = Date.now();

  return data;
}

function applyState(data){
  if (!data || typeof data !== 'object') return;

  if (Array.isArray(data._writingLog)) {
    writingLog.length = 0;
    writingLog.push(...data._writingLog);
  }

  if (data._revisionCounts && typeof data._revisionCounts === 'object') {
    Object.keys(revisionCounts).forEach(k => delete revisionCounts[k]);
    Object.assign(revisionCounts, data._revisionCounts);
  }

  if (data._activityMetrics && typeof data._activityMetrics === 'object') {
    activityMetrics = {
      ...createEmptyActivityMetrics(),
      ...data._activityMetrics,
      sectionTime: {
        ...createEmptyActivityMetrics().sectionTime,
        ...(data._activityMetrics.sectionTime || {})
      },
      pasteEvents: Array.isArray(data._activityMetrics.pasteEvents) ? data._activityMetrics.pasteEvents : []
    };
    activityMetrics.restoredFromDrive = true;
  }

  Object.entries(data).forEach(([id, value]) => {
    if (id.startsWith('_')) return;
    const el = document.getElementById(id);
    if (!el) return;

    if (el.isContentEditable) el.innerText = value;
    else if ('value' in el) el.value = value;

    try { localStorage.setItem(`cer_${id}`, value); } catch {}
  });

  const fp = document.getElementById('finalPreview');
  if (fp){
    const generated = data._finalPreviewGenerated || 'true';
    fp.setAttribute('data-generated', generated);
    try { localStorage.setItem('cer_finalPreview_generated', generated); } catch {}
  }

  if (data._updatedAt) {
    try { localStorage.setItem('cer_lastUpdatedAt', String(data._updatedAt)); } catch {}
  }

  saveActivityLocal();

  try { window.dispatchEvent(new Event('cer:restored')); } catch {}
}

async function findOrCreateDriveFile(){
  await getOrCreateFolder();

  if (fileId) return fileId;
  if (!userEmail) throw new Error('Missing email');

  const query = `appProperties has { key='app' and value='madebymaggie-organizer' } and appProperties has { key='owner' and value='${userEmail}' } and appProperties has { key='type' and value='${toolType}' } and trashed=false and '${folderId}' in parents`;
  const res = await gapiRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`);

  if (res.files?.length){
    fileId = res.files[0].id;
    localStorage.setItem(FILE_KEY, fileId);
    return fileId;
  }

  const metadata = {
    name: `EssayToolSave-${toolType}.json`,
    mimeType: 'application/json',
    parents: [folderId],
    appProperties: { app:'madebymaggie-organizer', type: toolType, owner: userEmail }
  };

  const created = await fetch('https://www.googleapis.com/drive/v3/files', {
    method:'POST',
    headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json; charset=UTF-8' },
    body: JSON.stringify(metadata)
  }).then(r => r.json());

  if (!created.id) throw new Error('Drive file create failed');

  fileId = created.id;
  localStorage.setItem(FILE_KEY, fileId);

  await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method:'PATCH',
    headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      _writingLog: [],
      _revisionCounts: {},
      _activityMetrics: createEmptyActivityMetrics(),
      _tool: toolType
    })
  });

  return fileId;
}

async function loadFromDrive(){
  await findOrCreateDriveFile();

  const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers:{ Authorization:`Bearer ${accessToken}` }
  });

  let data = {};
  try { data = await resp.json(); } catch { data = {}; }

  const localUpdatedAt = Number(localStorage.getItem('cer_lastUpdatedAt') || 0);
  const driveUpdatedAt = Number(data?._updatedAt || 0);

  if (!localUpdatedAt || driveUpdatedAt >= localUpdatedAt) {
    applyState(data);
    logActivity('restore', 'all', { source: 'drive' });
  } else {
    console.info('[Restore] Kept newer local CER work instead of older Drive data.');
  }
}

async function saveToDriveNow(){
  if (!isSignedIn || !accessToken) return;

  try {
    await findOrCreateDriveFile();
    const data = gatherToolState();

    await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method:'PATCH',
      headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.warn('[Drive] Autosave failed (token may be expired):', e?.message || e);
  }
}

function startAutoSave(){
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(saveToDriveNow, 15000);
}

function updateGoogleAuthButtonsUI(){
  const signInBtn  = document.getElementById('googleSignIn');
  const signOutBtn = document.getElementById('googleSignOut');

  accessToken = localStorage.getItem(TOKEN_KEY);
  userEmail   = localStorage.getItem(EMAIL_KEY);
  isSignedIn  = !!accessToken;

  if (signInBtn) {
    if (isSignedIn) {
      const emailText = userEmail ? ` (${userEmail})` : '';
      signInBtn.textContent = `✅ Signed in${emailText}`;
      signInBtn.title = userEmail ? `Signed in as ${userEmail}` : 'Signed in';
      signInBtn.setAttribute('aria-label', signInBtn.textContent);
    } else {
      signInBtn.textContent = 'Sign in with Google';
      signInBtn.title = 'Sign in to enable Drive autosave and Docs export';
      signInBtn.setAttribute('aria-label', signInBtn.textContent);
    }
  }

  if (signOutBtn) {
    signOutBtn.style.display = isSignedIn ? '' : 'none';
  }
}

function getSectionTimeRows(metrics){
  const rows = [
    ['Text / Source Title', metrics.sectionTime?.textTitle || 0],
    ['Question / Prompt', metrics.sectionTime?.questionPrompt || 0],
    ['Claim', metrics.sectionTime?.claimBox || 0],
    ['Evidence', metrics.sectionTime?.evidenceBox || 0],
    ['Reasoning', metrics.sectionTime?.reasoningBox || 0],
    ['Final Response', metrics.sectionTime?.finalPreview || 0]
  ];

  return rows
    .map(([label, ms]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(fmtDuration(ms))}</li>`)
    .join('');
}

function getPasteSummary(metrics, exportData){
  const events = Array.isArray(metrics.pasteEvents) ? metrics.pasteEvents : [];
  const totalEvents = events.length;
  const totalChars = events.reduce((sum, e) => sum + Number(e.characterCount || 0), 0);
  const totalWords = events.reduce((sum, e) => sum + Number(e.wordCount || 0), 0);
  const finalLength = (exportData.finalText || '').length || 1;
  const pastedPct = Math.round((totalChars / finalLength) * 100);

  const grouped = {};
  events.forEach(e => {
    const key = e.sectionLabel || getSectionLabel(e.sectionId);
    if (!grouped[key]) grouped[key] = { events: 0, chars: 0, words: 0 };
    grouped[key].events += 1;
    grouped[key].chars += Number(e.characterCount || 0);
    grouped[key].words += Number(e.wordCount || 0);
  });

  const bySection = Object.entries(grouped).length
    ? Object.entries(grouped)
        .map(([label, v]) => `<li><strong>${escapeHtml(label)}:</strong> ${v.events} paste event(s), ${v.chars} character(s), ${v.words} word(s)</li>`)
        .join('')
    : '<li>No paste events were recorded.</li>';

  return `
    <p><strong>Total paste events:</strong> ${totalEvents}</p>
    <p><strong>Total pasted characters:</strong> ${totalChars}</p>
    <p><strong>Total pasted words:</strong> ${totalWords}</p>
    <p><strong>Approximate pasted amount compared with final response length:</strong> ${Math.max(0, pastedPct)}%</p>
    <ul>${bySection}</ul>
  `;
}

function buildLogLines(log){
  return (Array.isArray(log) ? log : []).map(e => {
    const label = e.sectionLabel || e.sectionId || '';
    if (e.action === 'start') return `[${fmtTs(e.ts)}] Began working in ${label}`;
    if (e.action === 'finish') return `[${fmtTs(e.ts)}] Finished ${label} after ${fmtDuration(e.durationMs || 0)} (revision ${e.revision || 1})`;
    if (e.action === 'paste') return `[${fmtTs(e.ts)}] Pasted into ${label}${e.pasteChars ? ` — ${e.pasteChars} chars` : ''}`;
    if (e.action === 'coach') return `[${fmtTs(e.ts)}] Used Writing Coach in ${label}`;
    if (e.action === 'starter') return `[${fmtTs(e.ts)}] Used sentence starter in ${label}`;
    if (e.action === 'checklist') return `[${fmtTs(e.ts)}] Ran checklist (${e.completedChecks || 0}/${e.totalChecks || 0})`;
    if (e.action === 'copy') return `[${fmtTs(e.ts)}] Copied final response`;
    if (e.action === 'read') return `[${fmtTs(e.ts)}] Used read-aloud in ${label}`;
    if (e.action === 'export') return `[${fmtTs(e.ts)}] Exported to Google Docs`;
    if (e.action === 'restore') return `[${fmtTs(e.ts)}] Restored saved work from ${e.source || 'saved state'}`;
    if (e.action === 'final-edit') return `[${fmtTs(e.ts)}] Edited final response directly`;
    if (e.action === 'clear') return `[${fmtTs(e.ts)}] Cleared organizer`;
    return `[${fmtTs(e.ts)}] ${e.action}${label ? ` (${label})` : ''}`;
  }).join('\n');
}

function escapeHtml(s=''){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function buildExportHtml(exportData, log, metrics){
  const totalElapsedMs = metrics.lastUpdatedAt && metrics.sessionStartedAt
    ? Math.max(0, metrics.lastUpdatedAt - metrics.sessionStartedAt)
    : 0;

  const logLines = buildLogLines(log);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>CER Writing Response</title>
</head>
<body style="font-family:Arial, sans-serif; line-height:1.45; color:#111;">
  <h1>CER Writing Response</h1>

  <p><strong>Text / Source / Investigation:</strong> ${escapeHtml(exportData.title || '—')}</p>
  <p><strong>Question / Prompt:</strong> ${escapeHtml(exportData.prompt || '—')}</p>

  <h2>Claim</h2>
  <pre style="white-space:pre-wrap;font-family:Arial, sans-serif;font-size:12pt;">${escapeHtml(exportData.claim || '')}</pre>

  <h2>Evidence</h2>
  <pre style="white-space:pre-wrap;font-family:Arial, sans-serif;font-size:12pt;">${escapeHtml(exportData.evidence || '')}</pre>

  <h2>Reasoning</h2>
  <pre style="white-space:pre-wrap;font-family:Arial, sans-serif;font-size:12pt;">${escapeHtml(exportData.reasoning || '')}</pre>

  <h2>Final CER Response</h2>
  <pre style="white-space:pre-wrap;font-family:Arial, sans-serif;font-size:12pt;">${escapeHtml(exportData.finalText || '')}</pre>

  <hr>

  <h2>Teacher Writing Insights</h2>

  <h3>Work Session</h3>
  <ul>
    <li><strong>Started:</strong> ${escapeHtml(fmtTs(metrics.sessionStartedAt))}</li>
    <li><strong>Last updated:</strong> ${escapeHtml(fmtTs(metrics.lastUpdatedAt))}</li>
    <li><strong>Active writing time:</strong> ${escapeHtml(fmtDuration(metrics.activeTimeMs || 0))}</li>
    <li><strong>Total elapsed time:</strong> ${escapeHtml(fmtDuration(totalElapsedMs))}</li>
    <li><strong>Page sessions:</strong> ${escapeHtml(String(metrics.sessionCount || 0))}</li>
    <li><strong>Restored from local save:</strong> ${metrics.restoredFromLocal ? 'Yes' : 'No'}</li>
    <li><strong>Restored from Google Drive:</strong> ${metrics.restoredFromDrive ? 'Yes' : 'No'}</li>
  </ul>

  <h3>Time by Section</h3>
  <ul>
    ${getSectionTimeRows(metrics)}
  </ul>

  <h3>Typing and Pasting</h3>
  ${getPasteSummary(metrics, exportData)}

  <h3>Tool Use</h3>
  <ul>
    <li><strong>Writing Coach checks:</strong> ${metrics.coachChecks || 0}</li>
    <li><strong>Sentence starter uses:</strong> ${metrics.starterClicks || 0}</li>
    <li><strong>Checklist runs:</strong> ${metrics.checklistRuns || 0}</li>
    <li><strong>Read-aloud uses:</strong> ${metrics.readAloudCount || 0}</li>
    <li><strong>Copy final response uses:</strong> ${metrics.copyCount || 0}</li>
    <li><strong>Final response manually edited:</strong> ${metrics.finalEdited ? 'Yes' : 'No'}</li>
    <li><strong>Organizer cleared:</strong> ${metrics.clearCount || 0} time(s)</li>
  </ul>

  <h3>Teacher Editing Log</h3>
  <pre style="white-space:pre-wrap;font-family:Consolas, monospace;font-size:10pt;">${escapeHtml(logLines)}</pre>
</body>
</html>`;
}

async function exportToGoogleDocs(){
  const exportData = window.getCerExportData?.();
  if (!exportData || !(exportData.finalText || '').trim() || (exportData.finalText || '').trim().length < 10){
    return alert('⚠️ Response is too short to export.');
  }

  if (!accessToken) return alert('🚫 Please sign in again to export.');

  await getOrCreateFolder();

  const html = buildExportHtml(exportData, writingLog, activityMetrics);
  const stamp = new Date().toISOString().slice(0,19).replace('T',' ').replace(/:/g,'-');
  const title = `CER Writing Response — ${stamp}`;

  const boundary = '-------maggie_' + Math.random().toString(36).slice(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.document',
    ...(folderId ? { parents: [folderId] } : {})
  };

  const body =
    delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) +
    delimiter + 'Content-Type: text/html; charset=UTF-8\r\n\r\n' + html +
    closeDelim;

  showLoadingMessage('📄 Exporting to Google Docs…');

  try {
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method:'POST',
      headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Export failed: ${res.status} ${txt}`);
    }

    const file = await res.json();
    logActivity('export');

    hideLoadingMessage();

    if (file.webViewLink) window.open(file.webViewLink, '_blank');

    try { window.launchConfetti?.(); } catch {}
    alert('✅ Exported to Google Docs!');
  } catch (e) {
    hideLoadingMessage();
    console.error(e);
    alert('❌ Export failed. You may need to Sign in again.');
  }
}

async function restoreGoogleAuthIfPossible(){
  updateGoogleAuthButtonsUI();

  if (!accessToken || !userEmail) return;

  isSignedIn = true;
  updateGoogleAuthButtonsUI();

  try {
    showLoadingMessage('🔄 Restoring from Google Drive…');
    await loadFromDrive();
    hideLoadingMessage();
    startAutoSave();
  } catch (e) {
    hideLoadingMessage();
    console.warn('[Restore] Could not restore (token may be expired). Local autosave still works.', e?.message || e);
  }
}

function startGoogleAuth(){
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse) => {
      try {
        accessToken = tokenResponse.access_token;
        if (!accessToken) throw new Error('No access token');
        localStorage.setItem(TOKEN_KEY, accessToken);

        const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers:{ Authorization:`Bearer ${accessToken}` }
        });
        const profile = await profileRes.json();
        userEmail = profile.email;
        localStorage.setItem(EMAIL_KEY, userEmail);

        isSignedIn = true;
        updateGoogleAuthButtonsUI();

        showLoadingMessage('🔄 Loading your saved work…');
        await loadFromDrive();
        hideLoadingMessage();

        startAutoSave();
      } catch (e) {
        hideLoadingMessage();
        console.error(e);
        alert('⚠️ Sign-in worked, but restore failed. Local autosave still works. Try Sign In again if needed.');
      }
    }
  });

  const promptMode = accessToken ? '' : 'consent';
  tokenClient.requestAccessToken({ scope: SCOPES, prompt: promptMode });
}

function handleGoogleSignOut(){
  if (!confirm('Sign out of Google for Drive saving/export?')) return;

  const tokenToRevoke = accessToken || localStorage.getItem(TOKEN_KEY) || '';

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(FILE_KEY);

  accessToken = null;
  userEmail = null;
  isSignedIn = false;

  try { window.google?.accounts?.oauth2?.revoke?.(tokenToRevoke); } catch {}

  if (autosaveTimer) clearInterval(autosaveTimer);

  updateGoogleAuthButtonsUI();
  alert('Signed out. Local autosave is still active.');
}

document.addEventListener('DOMContentLoaded', () => {
  restoreActivityLocal();
  beginNewPageSession();
  setupEnhancedMonitoring();
  updateGoogleAuthButtonsUI();

  document.getElementById('googleSignIn')?.addEventListener('click', startGoogleAuth);
  document.getElementById('googleSignOut')?.addEventListener('click', handleGoogleSignOut);
  document.getElementById('exportDoc')?.addEventListener('click', () => {
    if (!isSignedIn) return alert('Sign in with Google to export.');
    exportToGoogleDocs();
  });

  restoreGoogleAuthIfPossible();
});