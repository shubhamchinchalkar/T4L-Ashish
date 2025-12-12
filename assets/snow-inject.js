/* This script adds a snow image on top of the search bar on both mobile and desktop */

(function(){                 // Start a self-running function so the code doesn't leak into global scope

  // This stores the link to the snow image we want to use
  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Snow.png?v=1765459385";

  // This list contains different search bar selectors used by different Shopify themes
  var selectors = [
    '.field',                              // Mobile search field
    'form[action="/search"] .field',       // Backup option
    '.search-modal__form .field',          // Mobile search form inside modal
    '.search-bar',                         // Desktop search bar
    '.site-header__search',                // Another desktop search selector
    '.header__search',                     // Another possible header search
    '.search-form'                         // Generic search form selector
  ];

  // Function to create the snow overlay element
  function createOverlay(){
    var wrap = document.createElement("div"); // Make a <div> that will hold the snow image
    wrap.className = "snow-overlay-container"; // Give the div a class name for CSS

    var img = document.createElement("img"); // Create an <img> element
    img.src = SNOW_IMAGE;                    // Set the snow image URL
    img.alt = "";                            // Empty alt because it's just decoration
    img.setAttribute("aria-hidden", "true"); // Hide it from screen readers for accessibility

    wrap.appendChild(img); // Put the image inside the div
    return wrap;           // Return the completed snow overlay element
  }

  // Function that puts the snow overlay onto the search bar
  function applySnow(target){
    var computed = window.getComputedStyle(target); // Get the target's current CSS styles
    if (computed.position === "static"){            // If the position is static
      target.style.position = "relative";           // Change it to relative (needed for overlay)
    }

    // This prevents adding another snow overlay if one already exists
    if (!target.querySelector('.snow-overlay-container')) { 
      target.appendChild(createOverlay());          // Add the snow overlay to the search bar
    }
  }

  // Function to loop through selectors and find the search bar
  function findTarget(){
    for (var i = 0; i < selectors.length; i++){     // Loop through each selector
      var el = document.querySelector(selectors[i]); // Try to find an element matching the selector
      if (el) return el;                             // If found, return it immediately
    }
    return null;                                     // If none found, return null
  }

  // Setup retry system because mobile search bars sometimes load late
  let attempts = 0;                                   // Count how many times we tried
  function tryAttach(){
    let target = findTarget();                        // Try finding the search bar
    if (target){                                      // If found
      applySnow(target);                              // Put snow on it
    } else if (attempts < 15){                        // If not yet found, but still under attempt limit
      attempts++;                                     // Increase attempt count
      setTimeout(tryAttach, 200);                     // Try again after 200 milliseconds
    }
  }

  // Run tryAttach once the page finishes loading
  document.addEventListener("DOMContentLoaded", tryAttach);

})(); // End of the self-running function
