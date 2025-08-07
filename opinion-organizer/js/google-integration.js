/* === google-integration.js ===
   Google OAuth + Drive Autosave + Docs Export + Edit Logging */

// 1) Constants & state
const CLIENT_ID = '592399844090-i5e5nc7a098as70j39cab8lsv8ini9t0.apps.googleusercontent.com';
const SCOPES      = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
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

// 7) Export to Docs
async function exportToGoogleDocs() {
  // — ensure any in-progress typing is committed
 const focused = document.activeElement;
 if (focused && focused.isContentEditable) focused.blur();

  // — grab and inspect the exact text we’re exporting
  const finalText = getEssayTextForExport();

  console.log('[Export Debug] text:', JSON.stringify(finalText));
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
     console.log('[Export Debug] new Doc ID:', createRes.documentId);

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

