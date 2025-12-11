/* FINAL — Works for your exact Tiles4Less mobile header search bar */

(function(){

  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Snow.png?v=1765459385";

  // *** CORRECT selector for your mobile header search bar ***
  var selectors = [
    '.search-header__input-wrapper',   // MOBILE HEADER ✔
    '.field',                          // modal fallback
    '.search-modal__form .field',
    '.search-bar',
    '.header__search'
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

  // Repeated attempts because header search loads late on mobile
  let tries = 0;
  function tryAttach(){
    const target = findTarget();
    if (target){
      applySnow(target);
    } else if (tries < 20){
      tries++;
      setTimeout(tryAttach, 200);
    }
  }

  document.addEventListener("DOMContentLoaded", tryAttach);

})();
