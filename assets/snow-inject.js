/* Full-width snow overlay injection */

(function(){

  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Untitled-4.png?v=1765455277";

  var selectors = [
    'form[action="/search"]',
    '.search-bar',
    '.site-header__search',
    '.header__search',
    '.search',
    '.search-form'
  ];

  function createOverlay(){
    var wrap = document.createElement("div");
    wrap.className = "search-snow-overlay";

    var img = document.createElement("img");
    img.src = SNOW_IMAGE;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");

    wrap.appendChild(img);
    return wrap;
  }

  function applySnow(inputBox){
    var style = window.getComputedStyle(inputBox);
    if (style.position === "static") {
      inputBox.style.position = "relative";
    }

    inputBox.appendChild(createOverlay());
  }

  function findTarget(){
    for (var i = 0; i < selectors.length; i++){
      var el = document.querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(function(){
      var target = findTarget();
      if (target) applySnow(target);
    }, 150);
  });

})();
