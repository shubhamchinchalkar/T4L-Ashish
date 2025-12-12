/* FINAL – GUARANTEED WORKING MOBILE SNOW (CDN VERSION ONLY) */

(function () {

  // Run only on mobile
  if (window.innerWidth > 768) return;

  // ALWAYS USE CDN URL (Option B)
  const SNOW_IMG = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Untitled-4.png?v=1765455277";

  // Shopify mobile search uses a <details-modal> wrapper.
  const MODAL_SELECTORS = [
    '.search-modal__content',
    '.modal__content',
    '.search-modal',
    '[class*="modal"]',
    '[role="dialog"]'
  ];

  function createSnow() {
    const wrap = document.createElement("div");
    wrap.className = "mobile-snow-container";

    const img = document.createElement("img");
    img.src = SNOW_IMG;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    wrap.appendChild(img);
    return wrap;
  }

  function tryInject() {
    // Look for ANY visible search modal container
    const elements = document.querySelectorAll(MODAL_SELECTORS.join(","));
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();

      // must be visible (Shopify keeps inactive modals hidden)
      if (rect.width > 0 && rect.height > 0) {

        if (!el.querySelector(".mobile-snow-container")) {

          // Ensure positioning works
          const pos = getComputedStyle(el).position;
          if (pos === "static" || !pos) {
            el.style.position = "relative";
          }

          el.appendChild(createSnow());
        }
      }
    });
  }

  function observeDOM() {
    tryInject(); // first attempt

    const obs = new MutationObserver(() => tryInject());
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeDOM);
  } else {
    observeDOM();
  }

})();
