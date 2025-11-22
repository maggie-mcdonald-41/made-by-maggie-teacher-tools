// reading-google-auth.js
// Lightweight Google Identity wrapper for Reading Trainer + Teacher Dashboard
// Scopes: openid email profile (non-sensitive)

const GOOGLE_CLIENT_ID = "780192379486-tje7g4n83knjptkubsf8ur1g1rqb5ta6.apps.googleusercontent.com";
(function () {
  let currentUser = null;
  const listeners = new Set();

  function notifyListeners() {
    listeners.forEach((fn) => {
      try {
        fn(currentUser);
      } catch (e) {
        console.error("Auth listener error:", e);
      }
    });
  }

  function onAuthChange(cb) {
    if (typeof cb === "function") {
      listeners.add(cb);
      // Fire once with current state
      cb(currentUser);
    }
  }

  function signOut() {
    currentUser = null;
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.disableAutoSelect();
    }
    notifyListeners();
  }

  // Called by GIS when sign-in succeeds
  function handleCredentialResponse(response) {
    try {
      // ID token is a JWT. We'll decode it client-side for basic profile.
      const idToken = response.credential;
      const payload = JSON.parse(atob(idToken.split(".")[1] || ""));

      currentUser = {
        idToken,
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture || "",
      };

      // Persist a lightweight "who" for nicer fallback keys later
      try {
        localStorage.setItem("rp_last_google_user", JSON.stringify({
          sub: currentUser.sub,
          email: currentUser.email,
          name: currentUser.name
        }));
      } catch (_) {}

      notifyListeners();
    } catch (e) {
      console.error("Failed to decode Google ID token:", e);
    }
  }

  function initGoogleAuth() {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("[RP_AUTH] Missing GOOGLE_CLIENT_ID.");
      return;
    }

    if (!window.google || !google.accounts || !google.accounts.id) {
      console.warn("[RP_AUTH] Google Identity script not loaded yet.");
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse
    });

    // We won't use One Tap, just button-based sign-in.
    // Teachers/students will click our own buttons which call prompt().
  }

  function promptSignIn() {
    if (!window.google || !google.accounts || !google.accounts.id) {
      alert("Google sign-in is not ready yet. Please try again in a moment.");
      return;
    }
    google.accounts.id.prompt(); // Opens the Google account chooser
  }

  // Expose globally
  window.RP_AUTH = {
    initGoogleAuth,
    promptSignIn,
    signOut,
    onAuthChange,
    get currentUser() {
      return currentUser;
    }
  };
})();
