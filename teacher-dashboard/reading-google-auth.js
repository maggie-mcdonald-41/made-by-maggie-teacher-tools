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

  function readUserFromStorage() {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.email) return parsed;
      return null;
    } catch (e) {
      console.warn("[RP_AUTH] Could not read cached user:", e);
      return null;
    }
  }

  // Self-heal auth state when tab wakes / BFCache restores / dashboard variables drift.
  function reconcileAuthState(reason) {
    if (window.RP_AUTH_DISABLE_RESTORE) return;

    const cached = readUserFromStorage();

    // If dashboard thinks we're logged out but we have a cached user, restore + notify.
    if (!currentUser && cached) {
      console.log("[RP_AUTH] Rehydrating cached user (" + reason + "):", cached.email);
      currentUser = cached;
      notifyListeners();

      // Optional: initialize button flow in the background (no One Tap)
      if (!googleAuthInitialized && !initInProgress) {
        initGoogleAuth();
      }
      return;
    }

    // If dashboard thinks we're logged in but storage is cleared, reflect sign-out.
    if (currentUser && !cached) {
      console.log("[RP_AUTH] Storage cleared; reflecting signed-out state (" + reason + ").");
      currentUser = null;
      notifyListeners();
      return;
    }

    // If both exist but differ (rare), trust storage (single source of truth).
    if (currentUser && cached && currentUser.email !== cached.email) {
      console.log("[RP_AUTH] Detected user mismatch; syncing from storage (" + reason + ").");
      currentUser = cached;
      notifyListeners();
    }
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
    const container = ensureButtonContainer();
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
          // NOTE: Intentionally NOT calling google.accounts.id.prompt()
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
  function promptSignIn() {
    if (!googleAuthInitialized) {
      console.warn("[RP_AUTH] Google Auth not initialized yet; initializing...");
      initGoogleAuth();
      return;
    }

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

  // Expose a single global used by teacher-dashboard.js and practice scripts
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

  // ---- Initial restore (teacher/dashboard only; disable in student mode) ----
  try {
    if (window.RP_AUTH_DISABLE_RESTORE) {
      console.log("[RP_AUTH] Restore disabled (student mode).");
    } else {
      const cached = readUserFromStorage();
      if (cached) {
        console.log("[RP_AUTH] Restoring cached user:", cached.email);
        currentUser = cached;
        notifyListeners();
        initGoogleAuth(); // no One Tap; safe
      }
    }
  } catch (e) {
    console.warn("[RP_AUTH] Could not restore cached user:", e);
  }

  // ---- Keep auth state stable across idle/tab-sleep/BFCache ----
  // 1) When tab becomes visible again, reconcile from storage.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      reconcileAuthState("visibilitychange");
    }
  });

  // 2) When window refocuses, reconcile from storage.
  window.addEventListener("focus", () => {
    reconcileAuthState("focus");
  });

  // 3) When BFCache restores the page, reconcile.
  window.addEventListener("pageshow", (e) => {
    if (e && e.persisted) {
      reconcileAuthState("pageshow(bfcache)");
    } else {
      reconcileAuthState("pageshow");
    }
  });

  // 4) If another tab signs in/out, keep this tab in sync.
  window.addEventListener("storage", (e) => {
    if (e && e.key === AUTH_STORAGE_KEY) {
      reconcileAuthState("storage");
    }
  });

  // 5) Lightweight heartbeat (helps when browsers suspend timers / weird idle edge cases).
  setInterval(() => {
    reconcileAuthState("heartbeat");
  }, 60 * 1000);
})();

