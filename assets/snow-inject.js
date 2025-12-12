/* Instant Snow Overlay — Loads With No Delay
   This script automatically adds a snow image on top of your search bar.
   It works on desktop, mobile, and across all Shopify themes.
*/

(function () {  
  // This starts an Immediately Invoked Function Expression (IIFE).
  // It keeps all our code inside a private function so it does not interfere with other scripts.


  //  The link to your snow image stored on Shopify CDN
  var SNOW_IMAGE = "https://cdn.shopify.com/s/files/1/0250/6198/2261/files/Snow.png?v=1765459385";


  //  These are the different possible search bar elements used by various Shopify themes.
  // Shopify themes all structure the search bar differently, so we check each selector
  // until we find which one actually exists on your website.

  var selectors = [

    '.field',
    // Many themes wrap the search input inside a <div class="field">

    'form[action="/search"] .field',
    // Search bar inside a form that sends data to /search

    '.search-modal__form .field',
    // Search bar inside a modal popup (used in many mobile layouts)

    '.search-bar',
    // Some themes use this class for the entire search component

    '.site-header__search',
    // Newer Shopify themes (like Dawn) often use this class for the header search box

    '.header__search',
    // Older themes commonly used this for header search

    '.search-form'
    // Generic backup — catches any search form with custom naming
  ];


  // -----------------------------------------------------
  // FUNCTION 1: Create the snow overlay element
  // -----------------------------------------------------
  function createOverlay() {

    var wrap = document.createElement("div"); 
    // Create an empty <div> which will hold the snow image

    wrap.className = "snow-overlay-container"; 
    // Add a class so our CSS can style it

    var img = document.createElement("img"); 
    // Create an <img> element for the snow image

    img.src = SNOW_IMAGE; 
    // Set the image source URL

    img.alt = ""; 
    // Decorative image → empty alt for accessibility

    img.setAttribute("aria-hidden", "true");
    // Screen readers should ignore this image

    wrap.appendChild(img); 
    // Put the <img> inside the <div>

    return wrap; 
    // Return the whole finished overlay element
  }


  // -----------------------------------------------------
  // FUNCTION 2: Attach snow overlay to the search bar
  // -----------------------------------------------------
  function applySnow(target) {

    if (!target) return; 
    // If target is not found, stop

    // If the search bar has "static" positioning,
    // we change it to "relative" so the snow image can sit on top of it.
    if (window.getComputedStyle(target).position === "static") {
      target.style.position = "relative";
    }

    // Prevent adding duplicate snow images.
    // Only add snow if it does NOT already exist.
    if (!target.querySelector(".snow-overlay-container")) {
      target.appendChild(createOverlay());
    }
  }


  // -----------------------------------------------------
  // FUNCTION 3: Detect search bar instantly using MutationObserver
  // -----------------------------------------------------
  function observeForSearchBar() {

    // MutationObserver watches for changes in the webpage (DOM)
    const observer = new MutationObserver(() => {

      // Try each selector and return the first one that exists on the page
      const target = selectors
        .map(sel => document.querySelector(sel)) // Test selector
        .find(el => el);                         // Keep the first match

      if (target) { 
        applySnow(target);      // Add snow on it
        observer.disconnect();  // Stop watching — job done
      }
    });

    // Start watching the entire webpage for new elements
    observer.observe(document.documentElement, {
      childList: true, // Detect added/removed elements
      subtree: true    // Check inside all HTML levels
    });
  }


  // -----------------------------------------------------
  // RUN THE OBSERVER IMMEDIATELY
  // -----------------------------------------------------
  observeForSearchBar();


})(); // End of self-running function
