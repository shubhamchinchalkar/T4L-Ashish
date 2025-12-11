/* Snow image applied correctly to mobile & desktop search bar */

(function(){

  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Snow.png?v=1765459385";

  // Desktop + mobile selectors
  var selectors = [
    '.field',                              // MOBILE — correct container
    'form[action="/search"] .field',       // fallback
    '.search-modal__form .field',          // MOBILE
    '.search-bar',                         // desktop options
    '.site-header__search',
    '.header__search',
    '.search-form'
  ];

  function createOverlay(){
    var wrap = document.createElement("div");
    wrap.className = "snow-overlay-container";

    var img = document.createElement("img");
    img.src = SNOW_IMAGE;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    wrap.appendChild(img);
    return wrap;
  }

  function applySnow(target){
    // Ensure parent is positioned
    var computed = window.getComputedStyle(target);
    if (computed.position === "static"){
      target.style.position = "relative";
    }

    // Prevent duplicates
    if (!target.querySelector('.snow-overlay-container')) {
      target.appendChild(createOverlay());
    }
  }

  function findTarget(){
    for (var i = 0; i < selectors.length; i++){
      var el = document.querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  // Retry because mobile modal loads late
  let attempts = 0;
  function tryAttach(){
    let target = findTarget();
    if (target){
      applySnow(target);
    } else if (attempts < 15){
      attempts++;
      setTimeout(tryAttach, 200);
    }
  }

  document.addEventListener("DOMContentLoaded", tryAttach);
})();
