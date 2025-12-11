/* assets/snow-inject.js */

(function(){

  // Your CDN Snow Image (no need to upload to assets)
  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Untitled-4.png?v=1765455277";

  // Possible search bar containers used by themes
  var candidateSelectors = [
    'form[action="/search"]',
    '#SearchForm',
    '.search-bar',
    '.site-header__search',
    '.header__search',
    '.search',
    '.search-form'
  ];

  function createOverlay(){
    var wrap = document.createElement('div');
    wrap.className = 'snow-overlay-container';

    var img = document.createElement('img');
    img.src = SNOW_IMAGE;
    img.alt = "";
    img.setAttribute('aria-hidden', 'true');

    wrap.appendChild(img);
    return wrap;
  }

  function insertOverlay(target){
    var style = window.getComputedStyle(target);
    if (style.position === 'static'){
      target.style.position = 'relative';
    }

    target.appendChild(createOverlay());
  }

  function tryInsert(){
    for (var i=0; i<candidateSelectors.length; i++){
      var el = document.querySelector(candidateSelectors[i]);
      if (el){
        insertOverlay(el);
        return true;
      }
    }
    return false;
  }

  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(function(){
      if (!tryInsert()){
        var header = document.querySelector("header");
        if (header){ insertOverlay(header); }
      }
    }, 200);
  });

})();
