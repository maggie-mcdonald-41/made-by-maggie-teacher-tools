/* === google-integration.js ===
   Google OAuth + Drive Autosave + Docs Export + Edit Logging */

// 1) Constants & state
const CLIENT_ID = '592399844090-i5e5nc7a098as70j39cab8lsv8ini9t0.apps.googleusercontent.com';
const SCOPES      = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

const essayType = 'opinion'; 

let tokenClient;
let accessToken = localStorage.getItem('accessToken');
let userEmail   = localStorage.getItem('userEmail');
let isSignedIn  = !!accessToken;
let fileId = localStorage.getItem(`fileId-${essayType}`) || null;
let autosavePaused = false;
let folderId = null;
const FOLDER_NAME = 'EssayToolSave';


const writingLog = [];

const revisionCounts = {};
const editStartTimes = {};


const sectionLabels = {
  'claim-box': '🎯 Claim',
  'reason1-box': '📌 Reason 1',
  'evidence1-box': '🔍 Evidence 1',
  'explanation1-box': '🧠 Explanation 1',
  'reason2-box': '📌 Reason 2',
  'evidence2-box': '🔍 Evidence 2',
  'explanation2-box': '🧠 Explanation 2',
  'reason3-box': '📌 Reason 3',
  'evidence3-box': '🔍 Evidence 3',
  'explanation3-box': '🧠 Explanation 3',
  'conclusion-transition': '🔚 Conclusion Transition',
  'essay-final': '📝 Final Essay'
  // Add more as needed
};

// Collect editable IDs for sign-out
const observedIds = Array.from(
  document.querySelectorAll('[contenteditable="true"]')
).map(el => el.id);

// 2) Helpers
function logActivity(action, id = null) {
  const now = new Date();
  const timestamp = now.toLocaleString();
  const label = id && sectionLabels[id] ? sectionLabels[id] : id;
  const entry = label ? `[${timestamp}] ${action} (${label})` : `[${timestamp}] ${action}`;

  // ✅ Prevent exact duplicates in a row
  if (writingLog[writingLog.length - 1] === entry) return;

  writingLog.push(entry);
  localStorage.setItem('writingLog', JSON.stringify(writingLog));
  renderWritingLog();
}

function renderWritingLog() {
  const container = document.getElementById('teacher-log');
  if (container) {
    container.innerText = writingLog.join('\n');
  }
}

function showLoadingMessage(text) {
  let msg = document.getElementById('loading-msg');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'loading-msg';
    Object.assign(msg.style, {
      position: 'fixed', top: '20px', left: '50%',
      transform: 'translateX(-50%)', background: '#ffc',
      padding: '10px 20px', border: '1px solid #ccc',
      borderRadius: '8px', zIndex: 9999
    });
    document.body.appendChild(msg);
  }
  msg.innerText = text;
}
function hideLoadingMessage() {
  const msg = document.getElementById('loading-msg');
  if (msg) msg.remove();
}

async function gapiRequest(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  return res.json();
}

/* === 3) Restore on page load === */
async function restoreGoogleAuthIfPossible() {
  console.log('[Auth Restore] accessToken:', accessToken, 'userEmail:', userEmail);
  // bail early if there's no token
  if (!accessToken) return;

  // re-init the tokenClient so you can silently refresh later if needed
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: () => {}  // we never need an interactive callback here
  });

  isSignedIn = true;
  // update the UI
  const signInBtn = document.getElementById('googleSignIn');
  if (signInBtn) signInBtn.innerHTML = '✅ Signed In';

  // load *before* autosaving
  showLoadingMessage('🔄 Restoring your saved essay…');
    if (!userEmail) {
    try {
      const profileRes = await fetch(
        'https://openidconnect.googleapis.com/v1/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!profileRes.ok) throw new Error('Profile fetch failed');
      const profile = await profileRes.json();
      userEmail = profile.email;
      localStorage.setItem('userEmail', userEmail);
    } catch (e) {
      console.warn('⚠️ Could not fetch userEmail silently:', e);
    }
  }
  try {
    await loadFromDrive();
    hideLoadingMessage();

    // if you still want your old localStorage log fallback:
    restoreWritingLogFromStorage();

    // *then* start autosave + monitoring
    startAutoSave();
    setupEnhancedMonitoring();
  } catch (err) {
    console.error('❌ Restore failed:', err);
    hideLoadingMessage();
  }
}


/* === 4) Sign-in on user click === */
function startGoogleAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse) => {
      try {
        accessToken = tokenResponse.access_token ||
                      (() => { throw new Error("No access token"); })();
        localStorage.setItem('accessToken', accessToken);
        isSignedIn = true;
        // fetch & store email
        const profileRes = await fetch(
          'https://openidconnect.googleapis.com/v1/userinfo',
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);
        const profile = await profileRes.json();
        userEmail = profile.email;
        localStorage.setItem('userEmail', userEmail);

        // load *first*
        showLoadingMessage('🔄 Restoring your saved essay…');
        await loadFromDrive();

        // persist fileId for next page load
        if (fileId) {
          localStorage.setItem(`fileId-${essayType}`, fileId);
        } else {
          throw new Error("No fileId found after loadFromDrive()");
        }

        hideLoadingMessage();

        // *then* start autosave & monitoring
        startAutoSave();
        setupEnhancedMonitoring();
        await new Promise(resolve => setTimeout(resolve, 50));

        // finally, reload so that restoreGoogleAuthIfPossible will run
        location.reload();
      } catch (err) {
        console.error("❌ Google Sign-In or restore failed:", err);
        hideLoadingMessage();
        alert("⚠️ Could not restore your essay. Try again?");
      }
    }
  });

  // trigger the OAuth flow
  tokenClient.requestAccessToken({ scope: SCOPES });
}


function restoreWritingLogFromStorage() {
  const savedLog = JSON.parse(localStorage.getItem('writingLog') || '[]');
  writingLog.push(...savedLog);
  renderWritingLog();
}



// 5) Drive file load/create
async function loadFromDrive() {
  await getOrCreateFolder();

  if (fileId) {
    console.log('[Drive] Using stored fileId:', fileId);
  } else {
    // only query if we don’t have fileId yet
    const query = `
      appProperties has { key='app' and value='madebymaggie-organizer' }
      and appProperties has { key='owner' and value='${userEmail}' }
      and trashed = false
      and '${folderId}' in parents
    `;
    const res = await gapiRequest(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,appProperties)`
    );
    if (res.files?.length) {
      fileId = res.files[0].id;
      localStorage.setItem(`fileId-${essayType}`, fileId);
      console.log('[Drive] Found existing file:', fileId);
    } else {
      console.log('[Drive] No matching file — creating one');
      await createDriveFile();
    }
  }

  // now fetch the JSON payload
  const content = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  ).then(r => r.json());

  populateFieldsFromJSON(content);
}


function populateFieldsFromJSON(data) {
  console.log('[Populate] Received data:', data);

  const defaultClaim = "Make a clear statement that shows your position on the topic. This is not a full sentence.";

  // ✅ Restore writingLog and revisionCounts
  if (Array.isArray(data._writingLog)) {
    writingLog.length = 0;
    writingLog.push(...data._writingLog);
    renderWritingLog();
  }

  if (typeof data._revisionCounts === 'object' && data._revisionCounts !== null) {
    Object.assign(revisionCounts, data._revisionCounts);
  }

  // ✅ Restore contenteditable + form fields
  Object.entries(data).forEach(([id, value]) => {
    if (id.startsWith('_')) return; // Skip meta entries like _writingLog

    const el = document.getElementById(id);
    if (!el || !id) return;

    if (id === 'claim-box' && value.includes(defaultClaim)) {
      localStorage.removeItem('claim-box');
      return;
    }

    if (el.isContentEditable) {
      el.innerText = value;
    } else if ('value' in el) {
      el.value = value;
    }

    localStorage.setItem(id, value);
  });
}


async function createDriveFile() {
  if (fileId) {
    console.warn('[Drive] File ID already exists. Skipping createDriveFile.');
    return;
  }

  await getOrCreateFolder(); // Ensure folder exists before file creation

  const metadata = {
    name: `EssayToolSave-${essayType}.json`,
    mimeType: 'application/json',
    parents: [folderId],
    appProperties: {
      app: 'madebymaggie-organizer',
      type: essayType,
      owner: userEmail 
    }
  };

  try {
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(metadata)
      }
    ).then(r => r.json());

    if (!res.id) throw new Error('❌ Failed to create Drive file — no ID returned.');

    fileId = res.id;
    localStorage.setItem(`fileId-${essayType}`, fileId); // ✅ <--- Add this line right here
    console.log('[Drive] Created new file:', fileId);

  } catch (error) {
    console.error('[Drive] Error creating file:', error);
    alert('❌ Failed to create Drive file. Please try again or check your connection.');
  }
}


const startAutoSave=()=>setInterval(saveToDriveNow,15000);


// 6) Auto-save & debounce
function saveToDriveNow() {
  if (autosavePaused) {
    console.warn('🛑 Autosave skipped (paused)');
    return;
  }

  if (!fileId || !accessToken) {
    console.warn('🚫 Skipping save — missing fileId or accessToken');
    return;
  }

  const data = {
    _writingLog: writingLog,
    _revisionCounts: revisionCounts
  };

  let hasContent = false;

  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    const id = el.id;
    if (!id) return;
    const value = el.innerText.trim();
    if (value) hasContent = true;
    data[id] = value;
  });

  if (!hasContent) {
    console.warn('⚠️ Skipping save — no user content yet');
    return;
  }

  console.log('[Drive Save] Payload:', data);

  indicateSavingNow();
  fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )
  .then(async res => {
    if (res.status === 404) {
      console.warn('📁 File not found on Drive — creating a new one.');
      // clear the bad ID so we fall back to creating
      localStorage.removeItem(`fileId-${essayType}`);
      fileId = null;
      await createDriveFile();
      // retry the save with the new file
      return saveToDriveNow();
    }
    if (!res.ok) throw new Error(`Drive save failed: ${res.status}`);
    showSaveStatus('Saved ✓');
    console.log('💾 Autosave successful at', new Date().toLocaleTimeString());
  })
  .catch(err => {
    console.error('❌ Autosave failed:', err);
    logActivity('❌ Autosave failed');
    showSaveStatus('❌ Save failed', 4000);
  });
}


const debouncedSaveToDrive = (fn,delay=500)=>(...a)=>{clearTimeout(fn._t);fn._t=setTimeout(()=>fn(...a),delay)};


async function getOrCreateFolder() {
  const query = `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const res = await gapiRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`);

  if (res.files?.length) {
    folderId = res.files[0].id;
    console.log('[Drive] Folder found:', folderId);
  } else {
    console.log('[Drive] No folder found. Creating folder...');
    const folderMeta = {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(folderMeta)
    }).then(r => r.json());

    if (!createRes.id) throw new Error('Failed to create Drive folder.');
    folderId = createRes.id;
    console.log('[Drive] Folder created:', folderId);
  }
}


async function findExistingDriveFile() {
  const query = `
    appProperties has { key='app' and value='madebymaggie-organizer' }
    and trashed = false
    and '${folderId}' in parents
  and (
       appProperties has { key='type' and value='${essayType}' }
    or not appProperties has { key='type' }
  )
`;
  console.log('[Drive Query]', query);
  const res = await gapiRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`);
  return res.files?.[0]?.id || null;
}


function showSaveStatus(message, duration = 2000) {
  const statusEl = document.getElementById('save-status');
  if (!statusEl) return;

  statusEl.innerText = message;
  statusEl.style.display = 'block';

  clearTimeout(statusEl._hideTimer);
  statusEl._hideTimer = setTimeout(() => {
    statusEl.style.display = 'none';
  }, duration);
}

function indicateSavingNow() {
  const statusEl = document.getElementById('save-status');
  if (!statusEl) return;

  statusEl.innerText = 'Saving...';
  statusEl.style.display = 'block';
}


function setupEnhancedMonitoring() {
  const startedSections = new Set();

  // === Grammarly Detection ===
  function isGrammarlyActive() {
    return !!document.querySelector('[data-gramm_editor]') ||
           !!document.querySelector('[class*="grammarly"]');
  }

  function showGrammarlyWarning() {
    if (document.getElementById('grammarly-warning')) return;

    const banner = document.createElement('div');
    banner.id = 'grammarly-warning';
    banner.innerHTML = `
      ⚠️ Grammarly is active. Please disable it for authentic writing.
      <button style="margin-left:10px" onclick="this.parentElement.remove()">Dismiss</button>
    `;
    Object.assign(banner.style, {
      backgroundColor: '#ffcccc',
      color: '#800000',
      padding: '10px',
      textAlign: 'center',
      fontWeight: 'bold',
      position: 'fixed',
      top: '0',
      width: '100%',
      zIndex: 9999
    });
    document.body.appendChild(banner);
  }

  function detectAndWarnGrammarly() {
    if (isGrammarlyActive()) {
      logActivity("⚠️ Grammarly detected on page");
      showGrammarlyWarning();
    }
  }

  detectAndWarnGrammarly();
  setTimeout(detectAndWarnGrammarly, 3000); // Extra check after Grammarly loads

document.querySelectorAll('[contenteditable="true"]').forEach(el => {
  const id = el.id;

  if (el.dataset.monitored === 'true') return; // ✅ Skip if already wired
  el.dataset.monitored = 'true'; // ✅ Mark as wired

  el.addEventListener('input', () => {
    if (!startedSections.has(id)) {
      startedSections.add(id);
      editStartTimes[id] = Date.now();
      logActivity("Started editing", id);
    }
    debouncedSaveToDrive(saveToDriveNow)();
  });

  el.addEventListener('blur', () => {
    if (startedSections.has(id)) {
      startedSections.delete(id);

      const duration = Date.now() - (editStartTimes[id] || Date.now());
      const minutes = Math.round(duration / 60000);
      revisionCounts[id] = (revisionCounts[id] || 0) + 1;

      logActivity(`Finished editing after ${minutes} min (revision ${revisionCounts[id]})`, id);
      delete editStartTimes[id];
    }
  });

  el.addEventListener('paste', () => {
    logActivity("Pasted into", id);
    debouncedSaveToDrive(saveToDriveNow)();
  });

  el.addEventListener('ai-edit', () => {
    logActivity("Used AI Help in", id);
    delete el.dataset.aiInserted;
  });
});

}

// --- helpers for safe HTML + proper paragraphs ---
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Split on blank lines into <p>…</p>, preserve single newlines as <br>
function textToParagraphHtml(txt) {
  const paras = String(txt).trim().split(/\n\s*\n/g);
  return paras
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Helper: build clean HTML for conversion
function buildExportHtml(finalText, writingLog = []) {
  const essayHtml = textToParagraphHtml(finalText);

  const logItems = (writingLog && writingLog.length)
    ? writingLog.map(item => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>No entries recorded.</li>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Final Essay</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; line-height: 1.5; }
  h1, h2 { margin: 0 0 10pt; }
  p { 
    margin: 0 0 12pt; 
    text-indent: 0.5in; /* First-line indent */
  }
  ul { margin: 8pt 0 0 18pt; }
  .section { margin: 16pt 0; }
  .divider { border: 0; border-top: 1px solid #ccc; margin: 20pt 0; }
  .meta { color: #666; font-size: 11px; margin-top: 18pt; }
  .badge { display:inline-block; background:#eef5ff; padding:4px 8px; border-radius:999px; }
</style>

</head>
<body>
  <h1>Final Essay</h1>

  <div class="section essay">
    ${essayHtml}
  </div>

  <hr class="divider" />

  <div class="section">
    <h2>Teacher View: Writing Log</h2>
    <ul>${logItems}</ul>
  </div>

  <div class="meta">
    <span class="badge">Exported from Made by Maggie Organizer</span>
  </div>
</body>
</html>`;
}

/* =======================
   Toast + Sparkles + Confetti
   ======================= */

// Creates a floating toast with a <canvas> for animations
/* =======================
   Toast + Confetti Gather→Burst
   ======================= */

function createExportToast(initialText = '📄 Exporting to Google Docs…') {
  const toast = document.createElement('div');
  toast.id = 'export-status-msg';
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#4cafef',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    pointerEvents: 'none'
  });

  const label = document.createElement('div');
  label.textContent = initialText;

  const canvas = document.createElement('canvas');
  canvas.width = 180;
  canvas.height = 60;
  canvas.style.display = 'block';

  toast.appendChild(label);
  toast.appendChild(canvas);
  document.body.appendChild(toast);

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Confetti particles
  const N = 90;
  const parts = [];
  const target = { x: W - 24, y: H - 14 }; // gather point near the corner
  let mode = 'gather'; // 'gather' | 'burst'
  let rafId = null;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function rc() { return `hsl(${Math.floor(rand(0,360))},85%,60%)`; }

  // init scattered confetti
  for (let i = 0; i < N; i++) {
    parts.push({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5),
      size: rand(3, 6),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.15, 0.15),
      color: rc(),
      arrived: false
    });
  }

  function step(dt) {
    ctx.clearRect(0, 0, W, H);

    for (const p of parts) {
      if (mode === 'gather') {
        // Attraction toward target with slight damping
        const dx = target.x - p.x, dy = target.y - p.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const k = 12; // spring-ish factor
        const ax = (dx / dist) * (k / (dist + 8));
        const ay = (dy / dist) * (k / (dist + 8));

        p.vx += ax * dt * 60;
        p.vy += ay * dt * 60;

        // friction
        p.vx *= 0.92;
        p.vy *= 0.92;

        // when close, jitter in place
        if (dist < 10) {
          p.arrived = true;
          p.vx += rand(-0.15, 0.15);
          p.vy += rand(-0.15, 0.15);
          // stronger friction near target to keep them clustered
          p.vx *= 0.85;
          p.vy *= 0.85;
        }
      } else if (mode === 'burst') {
        // gravity + slow air drag
        p.vy += 0.08 * (dt * 60);
        p.vx *= 0.995;
        p.vy *= 0.995;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      // keep within canvas loosely
      if (mode === 'gather') {
        if (p.x < 0 || p.x > W) p.vx *= -0.6;
        if (p.y < 0 || p.y > H) p.vy *= -0.6;
      }

      // draw rectangle confetto
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size, -p.size*0.6, p.size*2, p.size*1.2);
      ctx.restore();
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  function burst() {
    // give each particle an outward velocity from the target
    for (const p of parts) {
      const dx = p.x - target.x, dy = p.y - target.y;
      const dist = Math.max(0.2, Math.hypot(dx, dy));
      const power = 3.2 + Math.random()*1.6;
      p.vx = (dx / dist) * power;
      p.vy = (dy / dist) * power - 1.2; // slight upward kick
      p.vr = rand(-0.4, 0.4);
    }
    mode = 'burst';
  }

  return {
    setText: (t) => label.textContent = t,
    burst,
    remove: () => { cancelAnimationFrame(rafId); toast.remove(); }
  };
}

/* =======================
   Export (uses gather→burst)
   ======================= */

async function exportToGoogleDocs() {
  // Commit any in-progress typing
  const focused = document.activeElement;
  if (focused && focused.isContentEditable) focused.blur();

  // Gather content
  const finalText = getEssayTextForExport();
  if (!finalText || finalText.trim().length < 10) {
    alert('⚠️ Essay is too short to export.');
    return;
  }
  if (!accessToken) {
    alert('🚫 Missing access token. Please sign in again.');
    return;
  }

  // Toast with confetti gathering
  const toast = createExportToast('📄 Exporting to Google Docs…');

  const html = buildExportHtml(finalText, writingLog);
  const titleBase = 'Final Essay';
  const stamp = new Date().toISOString().slice(0,19).replace('T',' ').replace(/:/g,'-');
  const title = `${titleBase}${typeof essayType === 'string' ? ` — ${essayType}` : ''} — ${stamp}`;

  // Build multipart/related body for Drive upload
  const boundary = '-------maggie_' + Math.random().toString(36).slice(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.document',
    ...(folderId ? { parents: [folderId] } : {})
  };

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    html +
    closeDelim;

  try {
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Drive upload failed: ${res.status} ${txt}`);
    }

    const file = await res.json();
    logActivity?.('✅ Exported to Google Docs (via Drive conversion)');

    // Burst, then open tab with a tiny delay so they see it
    toast.setText('✅ Export complete — opening Google Doc…');
    toast.burst();
    setTimeout(() => {
      if (file.webViewLink) window.open(file.webViewLink, '_blank');
      setTimeout(() => toast.remove(), 1200);
    }, 300); // short pause lets the burst register
  } catch (error) {
    console.error('❌ Google Docs export failed:', error);
    toast.setText('❌ Export failed. Please try again.');
    setTimeout(() => toast.remove(), 1500);
    alert('❌ Export failed. Please check your sign-in status or try again.');
  }
}



// Button handler
function handleGoogleDocsExport() {
  if (!isSignedIn) return alert('Sign in first');
  exportToGoogleDocs();
}


function handleGoogleSignOut() {
  if (!confirm('👋 Sign out of Google?')) return;

  // Clear saved credentials
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userEmail');


  // Reload the page after a short delay
  setTimeout(() => {
    location.reload();
  }, 300);
}

function handleClearFormOnly() {
  if (!confirm('🧹 Start completely fresh? This will reset everything and prepare a new blank organizer.')) return;

  autosavePaused = true;

  // Remove saved Drive file reference and auth
// Just clear local session, not Drive file
localStorage.removeItem('writingLog');
observedIds.forEach(id => localStorage.removeItem(id));

// ✅ Clear the essayType-specific fileId to avoid reusing a blank file after clear
localStorage.removeItem(`fileId-${essayType}`);

  // Clear all contenteditable boxes
  observedIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '';
  });

  // Also clear any form elements (inputs, selects, etc.)
  document.querySelectorAll('input, textarea, select').forEach(el => {
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
    else el.value = '';
  });

  // Reset UI labels like sign-in status
  const signInBtn = document.getElementById('googleSignIn');
  if (signInBtn) signInBtn.innerText = '🔒 Sign in with Google';

  writingLog.length = 0;
  renderWritingLog();

  // ✅ Clear progress tracking (adjust key names if needed)
  localStorage.removeItem('progressData'); // or loop if you use progress-* keys
  if (typeof updateProgressBar === 'function') updateProgressBar();


  // Restart autosave (blank session)
  setTimeout(() => {
    autosavePaused = false;
    alert('✅ Organizer reset! You can start a new essay.');
  }, 150);
}


// 8) Expose globals
window.startGoogleAuth             = startGoogleAuth;
window.restoreGoogleAuthIfPossible = restoreGoogleAuthIfPossible;
window.handleGoogleDocsExport      = handleGoogleDocsExport;
window.handleGoogleSignOut         = handleGoogleSignOut;
window.setupEnhancedMonitoring     = setupEnhancedMonitoring;
window.logActivity                 = logActivity;
/* === end google-integration.js === */

