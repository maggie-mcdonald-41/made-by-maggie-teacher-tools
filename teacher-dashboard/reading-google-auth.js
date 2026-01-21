// reading-google-auth.js
// Shared Google Identity wrapper for reading practice + teacher dashboard
// ✅ Button-based GIS flow (no One Tap prompt), resilient + single-init.
// ✅ Supports per-page container via window.RP_GSI_CONTAINER_ID

(function () {
  const AUTH_STORAGE_KEY = "rp_last_google_user";

  let currentUser = null;
  const listeners = [];

  let googleAuthInitialized = false;
  let initInProgress = false;
  let renderedOnce = false;

  // Default container (student modal)
  const DEFAULT_CONTAINER_ID = "rp-gsi-button-container";
  // Restore behavior:
  // "auto"     = restore currentUser immediately (teacher dashboard)
  // "explicit" = do NOT restore currentUser until user clicks sign-in (student/shared devices)
  // "off"      = never restore
  const RESTORE_MODE = String(window.RP_AUTH_RESTORE_MODE || "auto").toLowerCase();

  function getContainerId() {
    // Allow a per-page override:
    // <script>window.RP_GSI_CONTAINER_ID = "some-id";</script>
    return (
      (window.RP_GSI_CONTAINER_ID && String(window.RP_GSI_CONTAINER_ID)) ||
      DEFAULT_CONTAINER_ID
    );
  }

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

    if (!currentUser && cached) {
      // In explicit mode, we do NOT auto-rehydrate the user.
      if (RESTORE_MODE === "explicit" || RESTORE_MODE === "off") {
        return;
      }

      console.log("[RP_AUTH] Rehydrating cached user (" + reason + "):", cached.email);
      currentUser = cached;
      notifyListeners();

      // Optional: init button flow in background (no One Tap)
      if (!googleAuthInitialized && !initInProgress) {
        initGoogleAuth();
      }
      return;
    }


    if (currentUser && !cached) {
      console.log("[RP_AUTH] Storage cleared; reflecting signed-out state (" + reason + ").");
      currentUser = null;
      notifyListeners();
      return;
    }

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

      let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");

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

  function getButtonContainerElement() {
    const id = getContainerId();
    if (!id) return null;

    const el = document.getElementById(id);
    return el || null;
  }

  function renderOfficialGoogleButton() {
    const container = getButtonContainerElement();

    // IMPORTANT: do NOT auto-create a container in <body>
    // because that causes “nothing happened” confusion.
    if (!container) {
      console.warn(
        `[RP_AUTH] Cannot render button. Missing container #${getContainerId()}.`
      );
      return false;
    }

    container.innerHTML = "";

    // Render the official GIS button
    google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill"
    });

    renderedOnce = true;
    return true;
  }

  // --- Public: init ---
  function initGoogleAuth() {
    if (googleAuthInitialized || initInProgress) return;

    initInProgress = true;

    const maxTries = 30; // ~6 seconds @ 200ms
    let tries = 0;

    const attemptInit = () => {
      tries++;

      // Wait for Google Identity script
      if (!window.google || !google.accounts || !google.accounts.id) {
        if (tries >= maxTries) {
          console.error("[RP_AUTH] Google Identity script not loaded. Giving up.");
          initInProgress = false;
          return;
        }
        // quiet-ish retry
        setTimeout(attemptInit, 200);
        return;
      }

      if (!window.GOOGLE_CLIENT_ID) {
        console.error("[RP_AUTH] Missing window.GOOGLE_CLIENT_ID; cannot initialize Google Auth.");
        initInProgress = false;
        return;
      }

      try {
        console.log("[RP_AUTH] Initializing Google Auth with client:", window.GOOGLE_CLIENT_ID);

        google.accounts.id.initialize({
          client_id: window.GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
          // NOTE: We intentionally do NOT call google.accounts.id.prompt()
          // to avoid One Tap/FedCM prompt mode.
        });

        googleAuthInitialized = true;
        initInProgress = false;

        // If the container exists, render immediately.
        // If not, that's okay: promptSignIn() can render later when UI is visible.
        renderOfficialGoogleButton();

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
        // If we're in explicit restore mode and a cached user exists,
    // adopt it ONLY after the user intentionally clicks sign-in.
    if (!currentUser && RESTORE_MODE === "explicit") {
      const cached = readUserFromStorage();
      if (cached) {
        console.log("[RP_AUTH] Explicit restore accepted by click:", cached.email);
        currentUser = cached;
        notifyListeners();
      }
    }
    // If GIS isn't ready yet, kick init (safe)
    if (!googleAuthInitialized) {
      initGoogleAuth();
      // also try render shortly after in case container appears (modal opens)
      setTimeout(() => {
        try {
          if (window.google && google.accounts && google.accounts.id) {
            renderOfficialGoogleButton();
          }
        } catch (_) {}
      }, 50);
      return;
    }

    // Re-render the official button (common when opening modal)
    try {
      const ok = renderOfficialGoogleButton();
      if (!ok) {
        alert("Google sign-in isn't ready yet. Please open the sign-in box and try again.");
      }
    } catch (e) {
      console.error("[RP_AUTH] Could not render Google button:", e);
      alert("Google sign-in isn't ready yet. Please refresh the page and try again.");
    }
  }

  function signOut() {
    console.log("[RP_AUTH] Signing out (local clear + disableAutoSelect).");

    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}

    // Tell GIS not to auto-select the prior account (helps “stuck signed in” feeling)
    try {
      if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
      }
    } catch (e) {
      // ignore
    }

    persistUser(null);
  }

  function onAuthChange(listener) {
    if (typeof listener === "function") {
      listeners.push(listener);
      listener(currentUser);
    }
  }

  // Optional: let pages set the container at runtime
  function setButtonContainerId(id) {
    if (!id) return;
    window.RP_GSI_CONTAINER_ID = String(id);

    // If already initialized and button has been rendered before,
    // attempt a re-render into the new container.
    try {
      if (googleAuthInitialized && window.google && google.accounts && google.accounts.id) {
        renderOfficialGoogleButton();
      }
    } catch (_) {}
  }

  // Expose a single global used by teacher-dashboard.js and practice scripts
  window.RP_AUTH = {
    initGoogleAuth,
    promptSignIn,
    signOut,
    onAuthChange,
    getCurrentUser: () => currentUser,
    setButtonContainerId
  };

  // Backwards-compatible: allow RP_AUTH.currentUser reads
  Object.defineProperty(window.RP_AUTH, "currentUser", {
    get() {
      return currentUser;
    }
  });

  // ---- Initial restore ----
  try {
    if (RESTORE_MODE === "off" || window.RP_AUTH_DISABLE_RESTORE) {
      console.log("[RP_AUTH] Restore disabled.");
    } else if (RESTORE_MODE === "explicit") {
      // Keep cached user in storage but do NOT set currentUser automatically.
      const cached = readUserFromStorage();
      if (cached) {
        console.log("[RP_AUTH] Cached user available (explicit restore):", cached.email);
      }
      // Still safe to init button flow (no One Tap)
      initGoogleAuth();
    } else {
      // RESTORE_MODE === "auto"
      const cached = readUserFromStorage();
      if (cached) {
        console.log("[RP_AUTH] Restoring cached user:", cached.email);
        currentUser = cached;
        notifyListeners();
        // Safe: button-flow init, no One Tap
        initGoogleAuth();
      } else {
        initGoogleAuth();
      }
    }
  } catch (e) {
    console.warn("[RP_AUTH] Could not restore cached user:", e);
  }


  // ---- Keep auth state stable across idle/tab-sleep/BFCache ----
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      reconcileAuthState("visibilitychange");
    }
  });

  window.addEventListener("focus", () => {
    reconcileAuthState("focus");
  });

  window.addEventListener("pageshow", (e) => {
    if (e && e.persisted) {
      reconcileAuthState("pageshow(bfcache)");
    } else {
      reconcileAuthState("pageshow");
    }
  });

  window.addEventListener("storage", (e) => {
    if (e && e.key === AUTH_STORAGE_KEY) {
      reconcileAuthState("storage");
    }
  });

  setInterval(() => {
    reconcileAuthState("heartbeat");
  }, 60 * 1000);
})();

