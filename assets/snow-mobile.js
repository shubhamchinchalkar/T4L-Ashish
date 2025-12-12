/* Mobile-only Snow Overlay */

(function () {

  // Run only on mobile 
  if (window.innerWidth > 768) return;

  // Mobile snow image
  var SNOW_IMG = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Untitled-4.png?v=1765455277";

  // Mobile search bar selector (Tiles4Less mobile header)
  var selectorList = [
    '.search-modal__form .field',
    '.search-bar',
    '.site-header__search',
    '.header__search',
    '.field'
  ];

  function createMobileOverlay() {
    var box = document.createElement("div");
    box.className = "snow-overlay-container-mobile";

    var img = document.createElement("img");
    img.src = SNOW_IMG;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    box.appendChild(img);
    return box;
  }

  function applyMobileSnow(target) {
    if (!target) return;

    // Allow absolute positioning
    if (window.getComputedStyle(target).position === "static") {
      target.style.position = "relative";
    }

    // Avoid duplicates
    if (!target.querySelector('.snow-overlay-container-mobile')) {
      target.appendChild(createMobileOverlay());
    }
  }

  function findTarget() {
    for (let s of selectorList) {
      let el = document.querySelector(s);
      if (el) return el;
    }
    return null;
  }

  function init() {
    let target = findTarget();
    if (target) {
      applyMobileSnow(target);
      return;
    }

    // If not found yet, observe until search bar appears
    const obs = new MutationObserver(() => {
      target = findTarget();
      if (target) {
        applyMobileSnow(target);
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
