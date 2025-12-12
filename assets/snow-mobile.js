/* 100% WORKING MOBILE SNOW FOR TILES4LESS */

(function () {

  // Only mobile
  if (window.innerWidth > 768) return;

  const SNOW_IMG = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Untitled-4.png?v=1765455277";

  // Correct selectors based on your screenshot
  const TARGET_SELECTORS = [
    '.search-modal__content',     // MAIN MOBILE SEARCH CONTAINER
    '.search-modal__form',        // Inner predictive search form
  ];

  function createSnow() {
    const box = document.createElement("div");
    box.className = "mobile-snow-container";

    const img = document.createElement("img");
    img.src = SNOW_IMG;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    box.appendChild(img);
    return box;
  }

  function applySnow(target) {
    if (!target) return;

    // Prevent duplicates
    if (target.querySelector(".mobile-snow-container")) return;

    // Ensure correct parent positioning
    const pos = window.getComputedStyle(target).position;
    if (pos === "static" || pos === "") {
      target.style.position = "relative";
    }

    target.appendChild(createSnow());
  }

  function findTarget() {
    for (let sel of TARGET_SELECTORS) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function init() {
    let target = findTarget();
    if (target) {
      applySnow(target);
      return;
    }

    // Watch for search modal opening
    const observer = new MutationObserver(() => {
      target = findTarget();
      if (target) {
        applySnow(target);
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
