/* === google-integration.js ===
   Google OAuth + Drive Autosave + Docs Export + Edit Logging */

// 1) Constants & state
const CLIENT_ID   = GOOGLE_CLIENT_ID;
const SCOPES      = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents'
].join(' ');

let tokenClient;
let accessToken = localStorage.getItem('accessToken');
let userEmail   = localStorage.getItem('userEmail');
let fileId      = userEmail ? localStorage.getItem(`essayFileId_${userEmail}`) : null;
let isSignedIn  = !!accessToken;
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
  writingLog.push(entry);
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
  if (!accessToken || !userEmail) return;
  isSignedIn = true;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope:     SCOPES,
    callback:  () => {} // silent
  });
  showLoadingMessage('🔄 Restoring your saved essay…');
  await loadFromDrive();
  hideLoadingMessage();
  startAutoSave();
  setupEnhancedMonitoring();
  // update the Sign-In button text
  const signInBtn = document.getElementById('googleSignIn');
  if (signInBtn) {
    signInBtn.innerHTML = '✅ Signed In';
  }
}

// 4) Sign-in on user click
function startGoogleAuth() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope:     SCOPES,
    callback:  async (tokenResponse) => {
      accessToken = tokenResponse.access_token;
      localStorage.setItem('accessToken', accessToken);
      isSignedIn = true;

      const profile = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }).then(r => r.json());

      userEmail = profile.email;
      localStorage.setItem('userEmail', userEmail);
      fileId = localStorage.getItem(`essayFileId_${userEmail}`);

      // update the Sign-In button text
  const signInBtn = document.getElementById('googleSignIn');
  if (signInBtn) {
    signInBtn.innerHTML = '✅ Signed In';
  }
      showLoadingMessage('🔄 Restoring your saved essay…');
      await loadFromDrive();
      hideLoadingMessage();
      startAutoSave();
      setupEnhancedMonitoring();
    }
  });
  tokenClient.requestAccessToken();
}

// 5) Drive file load/create
async function loadFromDrive() {
  try {
    if (!fileId) {
      const query = "name = 'EssayToolSave.json' and trashed = false";
      const res = await gapiRequest(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`);
      if (res.files?.length) {
        fileId = res.files[0].id;
        localStorage.setItem(`essayFileId_${userEmail}`, fileId);
      }
    }
    if (fileId) {
      const content = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      ).then(r => r.json());
      populateFieldsFromJSON(content);
    } else {
      await createDriveFile();
    }
  } catch {
    await createDriveFile();
  }
}

function populateFieldsFromJSON(data) {
  const defaultClaim = "Make a clear statement that shows your position on the topic. This is not a full sentence.";
  Object.entries(data).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (!el || el.getAttribute('contenteditable')!=='true') return;
    if (id==='claim-box' && value.includes(defaultClaim)) {
      localStorage.removeItem('claim-box');
      return;
    }
    el.innerText = value;
    localStorage.setItem(id, value);
  });
}

async function createDriveFile() {
  const metadata = { name:'EssayToolSave.json', mimeType:'application/json' };
  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{
      method:'POST', headers:{
        Authorization:`Bearer ${accessToken}`,
        'Content-Type':'application/json; charset=UTF-8'
      }, body:JSON.stringify(metadata)
    }
  ).then(r=>r.json());
  fileId = res.id;
  localStorage.setItem(`essayFileId_${userEmail}`,fileId);
}

// 6) Auto-save & debounce
function saveToDriveNow() {
  if (!fileId||!accessToken) return;
  const data={};
  document.querySelectorAll('[contenteditable="true"]').forEach(el=>data[el.id]=el.innerText);
  fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,{
      method:'PATCH', headers:{Authorization:`Bearer ${accessToken}`, 'Content-Type':'application/json'},
      body:JSON.stringify(data)
    }
  );
}
const debouncedSaveToDrive = (fn,delay=500)=>(...a)=>{clearTimeout(fn._t);fn._t=setTimeout(()=>fn(...a),delay)};
const startAutoSave=()=>setInterval(saveToDriveNow,60000);

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
  const finalText = document.getElementById('essay-final')?.innerText.trim() || '';
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
  if (!confirm('👋 Really sign out and clear local work?')) return;

  // Clear saved credentials
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userEmail');

  // Clear on-page content
  observedIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '';
    localStorage.removeItem(id);
  });

  // Reset Sign-In button
  const signInBtn = document.getElementById('googleSignIn');
  if (signInBtn) {
    signInBtn.innerText = '🔐 Sign In';
  }

  // Reset Sign-Out button
  const signOutBtn = document.getElementById('googleSignOut');
  if (signOutBtn) {
    signOutBtn.innerText = '🚪 Signed Out';
  }

  // Reload the page after a short delay
  setTimeout(() => {
    location.reload();
  }, 300);
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
