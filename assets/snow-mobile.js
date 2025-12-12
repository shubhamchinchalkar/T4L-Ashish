/* FINAL – GUARANTEED WORKING MOBILE SNOW FOR TILES4LESS */

(function () {

  // Only mobile view
  if (window.innerWidth > 768) return;

  const SNOW_IMG = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Untitled-4.png?v=1765455277";

  // The ONLY reliable mobile search wrapper (outside shadow DOM)
  const MOBILE_MODAL_SELECTOR = '.search-modal__content.search-modal__content-bottom';

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

  function applySnow() {
    const modal = document.querySelector(MOBILE_MODAL_SELECTOR);
    if (!modal) return;

    // avoid duplicates
    if (modal.querySelector('.mobile-snow-container')) return;

    // ensure correct positioning
    const pos = getComputedStyle(modal).position;
    if (pos === "static" || pos === "") {
      modal.style.position = "relative";
    }

    modal.appendChild(createSnow());
  }

  function init() {
    applySnow(); // first attempt

    // observe DOM changes until search modal appears
    const observer = new MutationObserver(() => {
      applySnow();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
