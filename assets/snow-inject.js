/* Instant Snow Overlay — Loads With No Delay
   Updated to handle mobile search bar wrappers and attach overlay to the input wrapper on small screens.
*/

(function () {

  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Snow.png?v=1765459385";

  var selectors = [
    '.field',
    'form[action="/search"] .field',
    '.search-modal__form .field',
    '.search-bar',
    '.site-header__search',
    '.header__search',
    '.search-form',

    /* Added for Mobile Search Bars */
    '.search-bar__input-wrapper',
    '.search-header__wrapper',
    '.header__mobile-search',
    '.search-container',
    '.mobile-search'
  ];

  function createOverlay() {
    var wrap = document.createElement("div");
    wrap.className = "snow-overlay-container";
    var img = document.createElement("img");
    img.src = SNOW_IMAGE;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    wrap.appendChild(img);
    return wrap;
  }

  function applySnow(target) {
    if (!target) return;

    // If the search bar has "static" positioning,
    // switch to "relative" so the overlay can be absolutely positioned inside.
    if (window.getComputedStyle(target).position === "static") {
      target.style.position = "relative";
    }

    // For mobile screens, try to attach the overlay directly to the input's parent
    if (window.innerWidth < 768) {
      var input = target.querySelector('input[type="search"], input[type="text"], input');
      if (input) {
        var inputWrap = input.parentElement || input;
        if (window.getComputedStyle(inputWrap).position === "static") {
          inputWrap.style.position = "relative";
        }
        if (!inputWrap.querySelector(".snow-overlay-container")) {
          inputWrap.appendChild(createOverlay());
        }
        return; // done — we attached to the input wrapper
      }
    }

    // Fallback: attach to the target container
    if (!target.querySelector(".snow-overlay-container")) {
      target.appendChild(createOverlay());
    }
  }

  function observeForSearchBar() {
    const observer = new MutationObserver(() => {
      const target = selectors
        .map(sel => document.querySelector(sel))
        .find(el => el);

      if (target) {
        applySnow(target);
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Also run immediately in case DOM already loaded
    document.addEventListener("DOMContentLoaded", function () {
      const immediateTarget = selectors
        .map(sel => document.querySelector(sel))
        .find(el => el);
      if (immediateTarget) {
        applySnow(immediateTarget);
        observer.disconnect();
      }
    });
  }

  observeForSearchBar();

})();
