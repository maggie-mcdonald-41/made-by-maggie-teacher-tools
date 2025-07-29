/* === google-integration.js ===
   Google OAuth + Drive Autosave + Docs Export + Edit Logging */

// 1) Constants & state
const CLIENT_ID = '592399844090-i5e5nc7a098as70j39cab8lsv8ini9t0.apps.googleusercontent.com';
const SCOPES      = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/userinfo.email'
].join(' ');

let tokenClient;
let accessToken = localStorage.getItem('accessToken');
let userEmail   = localStorage.getItem('userEmail');
let isSignedIn  = !!accessToken;
let fileId = null; // Always declared here to avoid ReferenceErrors
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

// 3) Restore on page load
async function restoreGoogleAuthIfPossible() {
console.log('[Auth Restore] Trying to restore...');
console.log('[Auth Restore] accessToken:', accessToken);
console.log('[Auth Restore] userEmail:', userEmail);

  if (!accessToken || !userEmail) return;
  isSignedIn = true;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope:     SCOPES,
    callback:  () => {} // silent
  });

  showLoadingMessage('🔄 Restoring your saved essay…');
  await loadFromDrive();
  restoreWritingLogFromStorage(); // ✅ Add this here
  hideLoadingMessage();
  startAutoSave();
  setupEnhancedMonitoring();

  const signInBtn = document.getElementById('googleSignIn');
  if (signInBtn) {
    signInBtn.innerHTML = '✅ Signed In';
  }
}


function restoreWritingLogFromStorage() {
  const savedLog = JSON.parse(localStorage.getItem('writingLog') || '[]');
  writingLog.push(...savedLog);
  renderWritingLog();
}

// 4) Sign-in on user click
function startGoogleAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse) => {
      try {
        accessToken = tokenResponse.access_token;
        if (!accessToken) throw new Error("No access token received.");
        localStorage.setItem('accessToken', accessToken);
        isSignedIn = true;

        console.log("🔑 Access token received:", accessToken);

        const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!profileRes.ok) {
          throw new Error(`Failed to fetch user info: ${profileRes.status}`);
        }

        const profile = await profileRes.json();
        console.log("✅ User profile loaded:", profile);

        userEmail = profile.email;
        localStorage.setItem('userEmail', userEmail);

        const signInBtn = document.getElementById('googleSignIn');
        if (signInBtn) {
          signInBtn.innerHTML = '✅ Signed In';
        }

        showLoadingMessage('🔄 Restoring your saved essay…');

        setTimeout(async () => {
          await loadFromDrive();
          hideLoadingMessage();
          startAutoSave();
          setupEnhancedMonitoring();

          // ✅ Trigger refresh after full sign-in + setup
          location.reload();
        }, 150);

      } catch (err) {
        console.error("❌ Google Sign-In failed:", err);
        alert("⚠️ Google Sign-In failed. Please try again.");
      }
    }
  });

  // 🔐 Only call after user triggers sign-in (click, etc.)
  tokenClient.requestAccessToken({ scope: SCOPES });
}


// 5) Drive file load/create
async function loadFromDrive() {
  try {
    await getOrCreateFolder();

const query = `
  appProperties has { key='app' and value='madebymaggie-organizer' }
  and appProperties has { key='owner' and value='${userEmail}' }
  and trashed = false
  and '${folderId}' in parents
`;

    const res = await gapiRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,appProperties)`);

    if (res.files?.length) {
      fileId = res.files[0].id;
      console.log('[Drive] Matched existing file:', fileId);
    } else {
      console.log('[Drive] No matching file found. Creating new one...');
      await createDriveFile();
    }

    const content = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ).then(r => r.json());

    console.log("📦 Drive file content loaded:", content);
    populateFieldsFromJSON(content);

  } catch (err) {
    console.error('❌ loadFromDrive() failed:', err);
    alert('⚠️ Error loading your saved work from Google Drive.');
  }
}


function populateFieldsFromJSON(data) {
  console.log('[Populate] Received data:', data);

  const defaultClaim = "Make a clear statement that shows your position on the topic. This is not a full sentence.";

  Object.entries(data).forEach(([id, value]) => {
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
  name: 'EssayToolSave.json',
  mimeType: 'application/json',
  parents: [folderId],
  appProperties: {
    app: 'madebymaggie-organizer',
    type: 'opinion',
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

  const data = {};

  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    const id = el.id;
    if (!id) return;
    data[id] = el.innerText.trim();
  });

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
  .then(res => {
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
    and appProperties has { key='owner' and value='${userEmail}' }
    and trashed = false
    and '${folderId}' in parents
  `;
  console.log('[Drive Query]', query);
  const res = await gapiRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`);
  return res.files?.[0]?.id || null;
}

// Then update inside loadFromDrive() as:
async function loadFromDrive() {
  try {
    await getOrCreateFolder();
    fileId = await findExistingDriveFile();

    if (!fileId) {
      console.log('[Drive] No matching file found. Creating new one...');
      await createDriveFile();
    }
  } catch (err) {
    console.error('❌ loadFromDrive() failed:', err);
    alert('⚠️ Error loading your saved work from Google Drive.');
  }
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

// 7) Export to Docs
async function exportToGoogleDocs() {
  const finalText = getEssayTextForExport();
  if (finalText.length < 10) return alert('⚠️ Essay is too short to export.');

  if (!accessToken) {
    alert("🚫 Missing access token. Please sign in again.");
    return;
  }

  const full = `${finalText}\n\n🧑‍🏫 Teacher View:\n${writingLog.join('\n')}`;

  try {
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Final Essay' })
    }).then(r => r.json());

    if (!createRes.documentId) {
      throw new Error("⛔️ Document creation failed. No ID returned.");
    }

    await fetch(`https://docs.googleapis.com/v1/documents/${createRes.documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{ insertText: { location: { index: 1 }, text: full } }]
      })
    });

    logActivity('✅ Exported to Google Docs');
    window.open(`https://docs.google.com/document/d/${createRes.documentId}/edit`, '_blank');
  } catch (error) {
    console.error("❌ Google Docs export failed:", error);
    alert("❌ Export failed. Please check your sign-in status or try again.");
  }
}


function handleGoogleDocsExport(){if(!isSignedIn)return alert('Sign in first');exportToGoogleDocs();}


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
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('writingLog');
  fileId = null; // <- Crucial: prevent loading from Drive again

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

  // Restart autosave (blank session)
  setTimeout(() => {
    autosavePaused = false;
    alert('✅ Organizer reset! You can start a new essay.');
  }, 150);
}



// 8) Expose globals
// 8) Expose globals
window.startGoogleAuth             = startGoogleAuth;
window.restoreGoogleAuthIfPossible = restoreGoogleAuthIfPossible;
window.handleGoogleDocsExport      = handleGoogleDocsExport;
window.handleGoogleSignOut         = handleGoogleSignOut;
window.setupEnhancedMonitoring     = setupEnhancedMonitoring;
window.logActivity                 = logActivity;
/* === end google-integration.js === */
/* === end google-integration.js === */
