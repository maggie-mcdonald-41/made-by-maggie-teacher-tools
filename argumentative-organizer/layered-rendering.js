// === layered-rendering.js ===

function renderPreviewSafely(text, highlights, container) {
  const runonSpans = highlights.filter(h => h.isRunon);
  const wordHighlights = highlights.filter(h => !h.isRunon);

  // === Render base text with individual word highlights ===
  const merged = new Map();
  wordHighlights.forEach(({ word, offset, type, title }) => {
    const key = `${offset}-${word}`;
    if (!merged.has(key)) {
      merged.set(key, {
        word,
        offset,
        types: new Set(),
        titles: new Set()
      });
    }
    const entry = merged.get(key);
    entry.types.add(type);
    entry.titles.add(title);
  });

  const sorted = [...merged.values()].sort((a, b) => a.offset - b.offset);
  let lastIndex = 0;
  let baseHtml = "";

  sorted.forEach(({ word, offset, types, titles }) => {
    if (offset < lastIndex) return;

    const tooltip = escapeHtml([...titles].join(" • "));
    const classList = [...types].join(" ");

    baseHtml += escapeHtml(text.slice(lastIndex, offset));
    baseHtml += `<mark class="highlight ${classList}" data-type="${classList}" title="${tooltip}">${escapeHtml(word)}</mark>`;
    lastIndex = offset + word.length;
  });

  baseHtml += escapeHtml(text.slice(lastIndex));

  // === Insert base into a wrapper for layering ===
  container.innerHTML = `
    <div class="highlight-layer-wrapper" style="position: relative;">
      <div class="base-layer">${baseHtml}</div>
      <div class="overlay-layer" style="position: absolute; inset: 0; pointer-events: none;"></div>
    </div>
  `;

  // === Render run-on spans separately into overlay ===
  const overlay = container.querySelector(".overlay-layer");
  runonSpans.forEach(({ offset, endOffset, title }) => {
    const spanText = escapeHtml(text.slice(offset, endOffset));
    const span = document.createElement("span");
    span.className = "underline-highlight";
    span.title = escapeHtml(title);
    span.textContent = spanText;
    span.style.position = "absolute";
    span.dataset.range = `${offset}-${endOffset}`;
    overlay.appendChild(span);
  });

  // === Match position and width after DOM is rendered
  requestAnimationFrame(() => {
    const baseText = container.querySelector(".base-layer").innerText;
    overlay.querySelectorAll("span[data-range]").forEach(span => {
      const [start, end] = span.dataset.range.split("-").map(Number);
      const rangeText = baseText.slice(start, end);
      const fake = document.createElement("span");
      fake.style.visibility = "hidden";
      fake.style.whiteSpace = "pre-wrap";
      fake.textContent = baseText.slice(0, start);
      document.body.appendChild(fake);
      const offsetLeft = fake.offsetWidth;
      fake.textContent = rangeText;
      const width = fake.offsetWidth;
      fake.remove();
      span.style.left = `${offsetLeft}px`;
      span.style.width = `${width}px`;
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
