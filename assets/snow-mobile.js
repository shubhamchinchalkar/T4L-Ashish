/* FORCE SNOW ON MOBILE SEARCH BAR ONLY */

(function () {

  // Run ONLY on mobile
  if (window.innerWidth > 767) return;

  // Your snow image
  const SNOW_IMG = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Untitled-4.png?v=1765455277";

  // MOBILE SEARCH BAR TARGETS (Tiles4Less specific)
  const MOBILE_TARGET_SELECTORS = [
    'form.search-bar__form',  
    '.search-modal__form .field',
    '.header__search',
    '.site-header__search',
    '.search-bar',
    '.field'
  ];

  function insertSnow(target) {
    if (!target) return;
    if (target.querySelector('.mobile-snow-container')) return;

    // Ensure parent can position absolute children
    const pos = window.getComputedStyle(target).position;
    if (pos === 'static' || pos === '') {
      target.style.position = 'relative';
    }

    const box = document.createElement('div');
    box.className = 'mobile-snow-container';

    const img = document.createElement('img');
    img.src = SNOW_IMG;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    box.appendChild(img);
    target.appendChild(box);
  }

  function findSearchBar() {
    for (let s of MOBILE_TARGET_SELECTORS) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    return null;
  }

  function init() {
    let target = findSearchBar();
    if (target) {
      insertSnow(target);
      return;
    }

    // If search bar loads later — watch until found
    const obs = new MutationObserver(() => {
      target = findSearchBar();
      if (target) {
        insertSnow(target);
        obs.disconnect();
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
