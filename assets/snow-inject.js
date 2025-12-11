/* Snow image applied to top-right of search bar (desktop + mobile) */

(function(){

  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Snow.png?v=1765459385";

  // Desktop + Mobile selectors
  var selectors = [
    'form[action="/search"]',
    '#SearchForm',
    '.search-bar',
    '.site-header__search',
    '.header__search',
    '.header__inline-search',
    '.search-modal__form',
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
    var computed = window.getComputedStyle(target);
    if (computed.position === "static"){
      target.style.position = "relative";
    }
    target.appendChild(createOverlay());
  }

  function findTarget(){
    for (var i = 0; i < selectors.length; i++){
      var el = document.querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  // Try multiple times because mobile search loads late
  let attempts = 0;
  function tryAttach(){
    let target = findTarget();
    if (target){
      applySnow(target);
    } else if (attempts < 10){
      attempts++;
      setTimeout(tryAttach, 300);
    }
  }

  document.addEventListener("DOMContentLoaded", tryAttach);

})();
