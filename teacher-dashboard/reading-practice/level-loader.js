// level-loader.js
(() => {
  const params = new URLSearchParams(location.search);
  const fromUrl =
    params.get("level") ||
    params.get("readingLevel") ||
    params.get("rl");

  const normalized = (fromUrl || "").toLowerCase();

  const levelKey =
    normalized === "below" || normalized === "on" || normalized === "above"
      ? normalized
      : "on";

  // Map level -> bundle file
  const bundleMap = {
    below: "levels/below-level.js",
    on: "levels/on-level.js",
    above: "levels/above-level.js"
  };

  const src = bundleMap[levelKey];

  // Helpful for debugging
  window.READING_LEVEL_KEY = levelKey;

  // OPTIONAL but helpful: persist level for refreshes
  try { localStorage.setItem("rp_level", levelKey); } catch (e) {}

  // Load the bundle file
  const s = document.createElement("script");
  s.src = src;

  s.onload = () => {
    // The bundle should set window.READING_LEVEL
    const levelObj = window.READING_LEVEL;

    if (!levelObj || typeof levelObj !== "object") {
      console.error(
        "Level bundle loaded but window.READING_LEVEL is missing/invalid.",
        { levelKey, src }
      );
      return;
    }

    // ✅ Make sure a global fallback exists for pages that check it directly
    // (Some bundles already set it; this just guarantees it’s there.)
    window.READING_LEVEL = levelObj;

    // ✅ Dispatch on next tick so deferred scripts (script.js) have attached listeners
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("reading-level:ready", { detail: window.READING_LEVEL })
      );
      console.log("[RP_LEVEL] reading-level:ready dispatched", {
        levelKey,
        src
      });
    }, 0);
  };

  s.onerror = () => {
    console.error("Failed to load level bundle:", src);
  };

  document.head.appendChild(s);
})();
