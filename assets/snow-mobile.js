/* FINAL – Guaranteed Working Mobile Snow For Tiles4Less */

(function () {

  // Only mobile
  if (window.innerWidth > 768) return;

  const SNOW_IMG = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Untitled-4.png?v=1765455277";

  // The exact structure from your screenshot:
  // predictive-search.search-modal__form
  //   form.search
  //     div.field.flex   <-- attach snow HERE
  const EXACT_SELECTOR = 'predictive-search.search-modal__form form .field';

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

  function applySnow() {
    const target = document.querySelector(EXACT_SELECTOR);
    if (!target) return;

    // Prevent double insertion
    if (target.querySelector('.mobile-snow-container')) return;

    // Ensure correct positioning
    if (window.getComputedStyle(target).position === "static") {
      target.style.position = "relative";
    }

    target.appendChild(createSnow());
  }

  function init() {

    // First attempt
    applySnow();

    // If search modal opens later → observe
    const obs = new MutationObserver(() => {
      applySnow();
    });

    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
