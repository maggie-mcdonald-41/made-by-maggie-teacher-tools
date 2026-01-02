// reading-google-auth.js
// Shared Google Identity wrapper for reading practice + teacher dashboard
// ✅ Button-based GIS flow (no One Tap prompt), resilient + single-init.

(function () {
  const AUTH_STORAGE_KEY = "rp_last_google_user";

  let currentUser = null;
  const listeners = [];

  let googleAuthInitialized = false;
  let initInProgress = false;


// Visible container where we render the official GIS button.
// You should have <div id="rp-gsi-button-container"></div> in your modal.
const INTERNAL_BTN_CONTAINER_ID = "rp-gsi-button-container";

  function notifyListeners() {
    listeners.forEach((fn) => {
      try {
        fn(currentUser);
      } catch (e) {
        console.warn("[RP_AUTH] Listener error:", e);
      }
    });
  }

  function persistUser(user) {
    currentUser = user;
    try {
      if (user) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("[RP_AUTH] Could not persist user:", e);
    }
    notifyListeners();
  }

  function decodeJwtResponse(token) {
    try {
      const parts = token.split(".");
      if (parts.length < 2) {
        console.warn("[RP_AUTH] Invalid ID token format");
        return null;
      }

      let payload = parts[1];

      // Convert from URL-safe Base64
      payload = payload.replace(/-/g, "+").replace(/_/g, "/");

      // Add padding if needed
      const pad = payload.length % 4;
      if (pad === 2) payload += "==";
      else if (pad === 3) payload += "=";
      else if (pad === 1) {
        console.warn("[RP_AUTH] Unexpected base64 payload length");
        return null;
      }

      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      console.warn("[RP_AUTH] Failed to decode ID token:", e);
      return null;
    }
  }

  function handleCredentialResponse(response) {
    if (!response || !response.credential) {
      console.warn("[RP_AUTH] No credential in response");
      return;
    }

    const decoded = decodeJwtResponse(response.credential);
    if (!decoded) return;

    const user = {
      email: decoded.email || "",
      name: decoded.name || "",
      picture: decoded.picture || "",
      sub: decoded.sub || ""
    };

    console.log("[RP_AUTH] Signed in as:", user.email || "(no email)");
    persistUser(user);
  }

function ensureButtonContainer() {
  let el = document.getElementById(INTERNAL_BTN_CONTAINER_ID);
  if (el) return el;

  // Create it if missing (fallback), but ideally this exists in your modal HTML.
  el = document.createElement("div");
  el.id = INTERNAL_BTN_CONTAINER_ID;
  document.body.appendChild(el);
  return el;
}


  function renderOfficialGoogleButton() {
    // Render the official button into the hidden container so we can “click” it
    const container = ensureButtonContainer();

    // Clear previous render if any (prevents duplicates)
    container.innerHTML = "";

    google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill"
    });
  }

  // --- Public: init ---
  function initGoogleAuth() {
    // Hard guard: init only once
    if (googleAuthInitialized || initInProgress) return;

    initInProgress = true;

    const attemptInit = () => {
      // Wait for Google Identity script to be ready
      if (!window.google || !google.accounts || !google.accounts.id) {
        console.warn("[RP_AUTH] Google Identity script not loaded yet. Retrying in 200ms...");
        setTimeout(attemptInit, 200);
        return;
      }

      if (!window.GOOGLE_CLIENT_ID) {
        console.error("[RP_AUTH] Missing global window.GOOGLE_CLIENT_ID; cannot initialize Google Auth.");
        initInProgress = false;
        return;
      }

      console.log("[RP_AUTH] Initializing Google Auth with client:", window.GOOGLE_CLIENT_ID);

      try {
        google.accounts.id.initialize({
          client_id: window.GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse

          // NOTE: We are intentionally NOT calling google.accounts.id.prompt()
          // This keeps us out of One Tap/FedCM prompt mode and uses button flow.
        });

        renderOfficialGoogleButton();

        googleAuthInitialized = true;
        initInProgress = false;
        console.log("[RP_AUTH] Google Auth initialized (button flow).");
      } catch (e) {
        initInProgress = false;
        console.error("[RP_AUTH] Failed to initialize Google Auth:", e);
      }
    };

    attemptInit();
  }

  // --- Public: "Sign in" ---
  // Keeps your existing RP_AUTH.promptSignIn() API, but now triggers the button flow.
function promptSignIn() {
  // In button-flow mode, we DO NOT auto-click anything.
  // We simply ensure the official button is rendered and visible for the user to click.
  if (!googleAuthInitialized) {
    console.warn("[RP_AUTH] Google Auth not initialized yet; initializing...");
    initGoogleAuth();
    return;
  }

  // Re-render in case the modal was reopened and container got cleared.
  try {
    renderOfficialGoogleButton();
  } catch (e) {
    console.error("[RP_AUTH] Could not render Google button:", e);
    alert("Google sign-in isn't ready yet. Please refresh the page and try again.");
  }
}


function signOut() {
  console.log("[RP_AUTH] Signing out (local clear only).");
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {}
  persistUser(null);
}


  function onAuthChange(listener) {
    if (typeof listener === "function") {
      listeners.push(listener);
      listener(currentUser);
    }
  }

  // Expose a single global used by teacher-dashboard.js and script.js
  window.RP_AUTH = {
    initGoogleAuth,
    promptSignIn,
    signOut,
    onAuthChange,
    getCurrentUser: () => currentUser
  };

  // Backwards-compatible: allow RP_AUTH.currentUser reads
  Object.defineProperty(window.RP_AUTH, "currentUser", {
    get() {
      return currentUser;
    }
  });

// Restore a user immediately on load if present
// Restore a user immediately on load if present (teacher/dashboard only; disable in student mode)
try {
  if (window.RP_AUTH_DISABLE_RESTORE) {
    console.log("[RP_AUTH] Restore disabled (student mode).");
  } else {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        console.log("[RP_AUTH] Restoring cached user:", parsed.email);

        // ✅ Restore for UX + scoping (matches your old behavior)
        persistUser(parsed);

        // Optional: attempt to initialize auth so a real credential can refresh later
        // (does NOT show One Tap prompt)
        initGoogleAuth();
      }
    }
  }
} catch (e) {
  console.warn("[RP_AUTH] Could not read cached user:", e);
}


})();
