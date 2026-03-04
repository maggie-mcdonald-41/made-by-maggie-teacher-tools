/* races-google.js
   Google OAuth + Drive Autosave + Docs Export + Editing Log

   IMPORTANT: This supports writing — it does NOT generate answers.
   Multi-day note: access tokens expire; students may need to click Sign In again
   to continue Drive autosave/export, but local autosave always works.
*/

const CLIENT_ID = '592399844090-i5e5nc7a098as70j39cab8lsv8ini9t0.apps.googleusercontent.com';
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

const toolType = 'races';
const FOLDER_NAME = 'EssayToolSave'; // keep consistent with your suite

let tokenClient;

// ✅ tool-scoped storage keys (prevents collisions with other tools)
const TOKEN_KEY = `accessToken-${toolType}`;
const EMAIL_KEY = `userEmail-${toolType}`;

let accessToken = localStorage.getItem(TOKEN_KEY);
let userEmail   = localStorage.getItem(EMAIL_KEY);
let isSignedIn  = !!accessToken;
let fileId      = localStorage.getItem(`fileId-${toolType}`) || null;
let folderId    = null;
let autosaveTimer = null;

// ---- editing log ----
const writingLog = []
;
// Restore any previously saved teacher-only writing log (for multi-day work)
try{
  const saved = JSON.parse(localStorage.getItem('races_writingLog') || '[]');
  if (Array.isArray(saved)) saved.forEach(e => writingLog.push(e));
}catch(e){}
;
const revisionCounts = {};
const editStartTimes = {};
const LOG_TIMEZONE = 'America/New_York';

function fmtTs(ts) {
  try { return new Date(ts).toLocaleString(undefined, { hour12: true, timeZone: LOG_TIMEZONE }); }
  catch { return new Date(ts).toLocaleString(); }
}
function fmtDuration(ms=0) {
  const s = Math.max(0, Math.round(ms/1000));
  const m = Math.floor(s/60), ss = s%60;
  return m ? `${m}m ${ss}s` : `${ss}s`;
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

function logActivity(action, sectionId = null, extra = {}) {
  const ts = Date.now();
  const sectionLabel = sectionId || undefined;
  const entry = { ts, action, ...(sectionId ? { sectionId, sectionLabel } : {}), ...extra };
  const last = writingLog[writingLog.length - 1];
  if (last && last.action === entry.action && last.sectionId === entry.sectionId && (ts - last.ts) < 1200) return;
  writingLog.push(entry);
  // persist lightweight locally so it survives token expiry (tool-scoped)
  try { localStorage.setItem(`writingLog-${toolType}`, JSON.stringify(writingLog)); } catch {}
  renderWritingLog();
}
window.logActivity = logActivity;

function restoreWritingLogFromStorage(){
  try {
    const saved = JSON.parse(localStorage.getItem(`writingLog-${toolType}`) || '[]');
    if (Array.isArray(saved) && saved.length) writingLog.push(...saved);
    renderWritingLog();
  } catch {}
}

function renderWritingLog(){
  // UI is hidden from students; log is kept for Google Docs export only.
  try{ localStorage.setItem('races_writingLog', JSON.stringify(writingLog)); }catch(e){}
}

function setupEnhancedMonitoring(){
  const watchIds = ['rBox','aBox','cBox','eBox','sBox'];
  watchIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('focus', () => {
      editStartTimes[id] = Date.now();
      logActivity('start', id);
    });

    el.addEventListener('blur', () => {
      const start = editStartTimes[id];
      if (!start) return;
      const durationMs = Date.now() - start;
      revisionCounts[id] = (revisionCounts[id] || 0) + 1;
      logActivity('finish', id, { durationMs, revision: revisionCounts[id] });
      delete editStartTimes[id];
    });

    el.addEventListener('paste', (evt) => {
      const txt = (evt.clipboardData || window.clipboardData)?.getData('text') || '';
      logActivity('paste', id, { pasteChars: txt.length });
    });
  });

  // Inputs
  ['textTitle','questionPrompt'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('focus', () => { editStartTimes[id] = Date.now(); logActivity('start', id); });
    el.addEventListener('blur', () => {
      const start = editStartTimes[id];
      if (!start) return;
      const durationMs = Date.now() - start;
      revisionCounts[id] = (revisionCounts[id] || 0) + 1;
      logActivity('finish', id, { durationMs, revision: revisionCounts[id] });
      delete editStartTimes[id];
    });
    el.addEventListener('paste', (evt) => {
      const txt = (evt.clipboardData || window.clipboardData)?.getData('text') || '';
      logActivity('paste', id, { pasteChars: txt.length });
    });
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
  const ids = ['textTitle','questionPrompt','rBox','aBox','cBox','eBox','sBox'];
  const data = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    data[id] = el.isContentEditable ? (el.innerText || '') : (el.value || '');
  });
  data._writingLog = writingLog;
  data._revisionCounts = revisionCounts;
  data._tool = toolType;
  data._updatedAt = Date.now();
  return data;
}

function applyState(data){
  if (!data || typeof data !== 'object') return;

  // restore meta
  if (Array.isArray(data._writingLog)) {
    writingLog.length = 0;
    writingLog.push(...data._writingLog);
    renderWritingLog();
  }
  if (data._revisionCounts && typeof data._revisionCounts === 'object') {
    Object.assign(revisionCounts, data._revisionCounts);
  }

  // restore fields
  Object.entries(data).forEach(([id, value]) => {
    if (id.startsWith('_')) return;
    const el = document.getElementById(id);
    if (!el) return;
    if (el.isContentEditable) el.innerText = value;
    else if ('value' in el) el.value = value;

    // mirror to local autosave keys used in races-main
    try { localStorage.setItem(`races_${id}`, value); } catch {}
  });

  // refresh preview/progress if races-main is loaded
  try { window.dispatchEvent(new Event('races:restored')); } catch {}
}

async function findOrCreateDriveFile(){
  await getOrCreateFolder();

  if (fileId) return fileId;

  if (!userEmail) throw new Error('Missing email');

  const query = `appProperties has { key='app' and value='madebymaggie-organizer' } and appProperties has { key='owner' and value='${userEmail}' } and appProperties has { key='type' and value='${toolType}' } and trashed=false and '${folderId}' in parents`;
  const res = await gapiRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`);
  if (res.files?.length){
    fileId = res.files[0].id;
    localStorage.setItem(`fileId-${toolType}`, fileId);
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
  localStorage.setItem(`fileId-${toolType}`, fileId);

  // write initial JSON
  await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method:'PATCH',
    headers:{ Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json' },
    body: JSON.stringify({ _writingLog: [], _revisionCounts: {}, _tool: toolType })
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
  applyState(data);
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

async function exportToGoogleDocs(){
  const finalText = (window.getRacesTextForExport?.() || '').trim();
  if (finalText.length < 10) return alert('⚠️ Response is too short to export.');
  if (!accessToken) return alert('🚫 Please sign in again to export.');

  await getOrCreateFolder();

  const html = buildExportHtml(finalText, writingLog);
  const stamp = new Date().toISOString().slice(0,19).replace('T',' ').replace(/:/g,'-');
  const title = `Constructed Response — RACES — ${stamp}`;

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
    try{ window.launchConfetti?.(); }catch(e){}
    alert('✅ Exported to Google Docs!');
  } catch (e) {
    hideLoadingMessage();
    console.error(e);
    alert('❌ Export failed. You may need to Sign in again.');
  }
}

function escapeHtml(s=''){
  return s
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

function buildExportHtml(finalText, log){
  const lines = (Array.isArray(log) ? log : []).map(e => {
    const label = e.sectionLabel || e.sectionId || '';
    if (e.action === 'start') return `[${fmtTs(e.ts)}] Started (${label})`;
    if (e.action === 'finish') return `[${fmtTs(e.ts)}] Finished after ${fmtDuration(e.durationMs||0)} (rev ${e.revision||1}) (${label})`;
    if (e.action === 'paste') return `[${fmtTs(e.ts)}] Pasted (${label})${e.pasteChars?` — ${e.pasteChars} chars`:''}`;
    if (e.action === 'ai') return `[${fmtTs(e.ts)}] Coach used (${label})`;
    if (e.action === 'export') return `[${fmtTs(e.ts)}] Exported`;
    return `[${fmtTs(e.ts)}] ${e.action}${label?` (${label})`:''}`;
  }).join('\n');

  return `<!doctype html><html><head><meta charset='utf-8'></head><body>
    <h1>Constructed Response (RACES)</h1>
    <pre style="white-space:pre-wrap;font-family:Arial, sans-serif; font-size: 12pt;">${escapeHtml(finalText)}</pre>
    <hr>
    <h2>Teacher Editing Log</h2>
    <pre style="white-space:pre-wrap;font-family:Consolas, monospace; font-size: 10pt;">${escapeHtml(lines)}</pre>
  </body></html>`;
}

async function restoreGoogleAuthIfPossible(){
  // If token exists in localStorage, try to load Drive silently.
  // NOTE: access tokens expire; if expired, Drive calls fail and students click Sign In again.
  if (!accessToken || !userEmail) {
    restoreWritingLogFromStorage();
    return;
  }

  isSignedIn = true;
  try {
    showLoadingMessage('🔄 Restoring from Google Drive…');
    await loadFromDrive();
    hideLoadingMessage();
    startAutoSave();
    setupEnhancedMonitoring();
  } catch (e) {
    hideLoadingMessage();
    console.warn('[Restore] Could not restore (token may be expired). Local autosave still works.', e?.message || e);
    restoreWritingLogFromStorage();
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

        // fetch email
        const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers:{ Authorization:`Bearer ${accessToken}` }
        });
        const profile = await profileRes.json();
        userEmail = profile.email;
        localStorage.setItem(EMAIL_KEY, userEmail);

        isSignedIn = true;
        showLoadingMessage('🔄 Loading your saved work…');
        await loadFromDrive();
        hideLoadingMessage();

        startAutoSave();
        setupEnhancedMonitoring();
        // keep them on the same page; no forced reload
      } catch (e) {
        hideLoadingMessage();
        console.error(e);
        alert('⚠️ Sign-in worked, but restore failed. Local autosave still works. Try Sign In again if needed.');
      }
    }
  });

  // ✅ Silent if we already have a token; otherwise force consent/select-account
  const promptMode = accessToken ? '' : 'consent';
  tokenClient.requestAccessToken({ scope: SCOPES, prompt: promptMode });
}

function handleGoogleSignOut(){
  if (!confirm('Sign out of Google for Drive saving/export?')) return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(`fileId-${toolType}`);
  localStorage.removeItem(`writingLog-${toolType}`);

  accessToken = null;
  userEmail = null;
  isSignedIn = false;

  try { window.google?.accounts?.oauth2?.revoke?.(accessToken || ''); } catch {}

  if (autosaveTimer) clearInterval(autosaveTimer);
  alert('Signed out. Local autosave is still active.');
}
// Wire buttons
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('googleSignIn')?.addEventListener('click', startGoogleAuth);
  document.getElementById('googleSignOut')?.addEventListener('click', handleGoogleSignOut);
  document.getElementById('exportDoc')?.addEventListener('click', () => {
    if (!isSignedIn) return alert('Sign in with Google to export.');
    exportToGoogleDocs();
  });

  restoreGoogleAuthIfPossible();
});
