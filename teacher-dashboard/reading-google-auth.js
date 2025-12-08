// reading-google-auth.js
// Shared Google Identity wrapper for reading practice + teacher dashboard

(function () {
  const AUTH_STORAGE_KEY = "rp_last_google_user";

  let currentUser = null;
  const listeners = [];
  let googleAuthInitialized = false;

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
    if (!decoded) {
      return;
    }

    const user = {
      email: decoded.email || "",
      name: decoded.name || "",
      picture: decoded.picture || "",
      sub: decoded.sub || ""
    };

    console.log("[RP_AUTH] Signed in as:", user.email || "(no email)");
    persistUser(user);
  }

  function initGoogleAuth() {
    // Wait for Google Identity script to be ready
    if (!window.google || !google.accounts || !google.accounts.id) {
      console.warn("[RP_AUTH] Google Identity script not loaded yet. Retrying in 200ms...");
      setTimeout(initGoogleAuth, 200);
      return;
    }

    if (!window.GOOGLE_CLIENT_ID) {
      console.error("[RP_AUTH] Missing global window.GOOGLE_CLIENT_ID; cannot initialize Google Auth.");
      return;
    }

    google.accounts.id.initialize({
      client_id: window.GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
      // itp_support: true, // optional for Safari
    });

    googleAuthInitialized = true;
    console.log("[RP_AUTH] Google Auth initialized.");
  }

  function promptSignIn() {
    // If not initialized yet, try to init and then retry the prompt shortly
    if (!googleAuthInitialized) {
      console.warn("[RP_AUTH] Google Auth not initialized yet; attempting init before prompt...");
      initGoogleAuth();

      // Give initGoogleAuth a moment to attach once the GIS script is ready
      setTimeout(() => {
        if (!googleAuthInitialized) {
          console.warn("[RP_AUTH] Still no Google Auth after retry; aborting prompt.");
          return;
        }
        google.accounts.id.prompt();
      }, 300);

      return;
    }

    // Normal case: already initialized
    google.accounts.id.prompt();
  }

  function signOut() {
    // Best-effort revoke; if google isn't ready, just clear locally
    const email = currentUser?.email || "";
    const doClear = () => {
      console.log("[RP_AUTH] Signing out user:", email || "(no email)");
      persistUser(null);
    };

    if (window.google && google.accounts && google.accounts.id && email) {
      google.accounts.id.revoke(email, doClear);
    } else {
      doClear();
    }
  }

  function onAuthChange(listener) {
    if (typeof listener === "function") {
      listeners.push(listener);
      // Fire immediately with current state if available
      listener(currentUser);
    }
  }

  // Expose a single global used by teacher-dashboard.js and script.js
  window.RP_AUTH = {
    initGoogleAuth,
    promptSignIn,
    signOut,
    onAuthChange,
    // Preferred: explicit getter
    getCurrentUser: () => currentUser
  };

  // Backwards-compatible: allow RP_AUTH.currentUser reads
  Object.defineProperty(window.RP_AUTH, "currentUser", {
    get() {
      return currentUser;
    }
  });

  // Try to restore a user immediately on load (in case they signed
  // in from another page already in this domain)
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        currentUser = parsed;
        notifyListeners();
      }
    }
  } catch (e) {
    console.warn("[RP_AUTH] Could not restore user on load:", e);
  }
})();
