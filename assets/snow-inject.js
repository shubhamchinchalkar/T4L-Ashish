(function(){

  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Snow.png?v=1765459385";

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

  function attachToField(){
    const input = document.querySelector("#Search-In-Modal");
    if (!input) return false;

    const field = input.closest(".field");
    if (!field) return false;

    // Make sure field is positioned
    const style = window.getComputedStyle(field);
    if (style.position === "static"){
      field.style.position = "relative";
    }

    // Prevent duplicates
    if (!field.querySelector(".snow-overlay-container")){
      field.appendChild(createOverlay());
    }

    return true;
  }

  // Retry until the search bar exists
  let tries = 0;
  function waitForSearch(){
    if (attachToField()) return;

    if (tries < 50){
      tries++;
      setTimeout(waitForSearch, 200);
    }
  }

  document.addEventListener("DOMContentLoaded", waitForSearch);
})();
