/* assets/snow.js - safe, namespaced snow injection for search input (ash-snow) */
(function(){
  if (window.__ash_snow_loaded) return;
  window.__ash_snow_loaded = true;

  // selectors to try (covers many themes)
  var selectors = [
    'input[type="search"]',
    'input[name="q"]',
    'input[name="search"]',
    '.search-input input',
    '.header__search input',
    '.site-header .search input',
    '.search-field',
    '#search input',
    '.searchbox input'
  ];

  function findSearchInput() {
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) return el;
    }
    return null;
  }

  // Create flakes with randomized properties
  function createFlake(over) {
    var flake = document.createElement('div');
    flake.className = 'ash-snow-flake';
    // randomize size
    var s = (Math.random() * 0.9 + 0.4).toFixed(2); // 0.4 - 1.3
    flake.style.width = (s * 0.6) + 'rem';
    flake.style.height = (s * 0.6) + 'rem';

    // random left offset in percent
    var left = Math.random() * 100;
    flake.style.left = left + '%';

    // randomize animation duration and delay — combined per-flake using multiple animations:
    // We'll give fall duration (5s - 14s), wobble duration (3s - 8s), fade timing (same as fall).
    var fallDuration = (Math.random() * 9 + 5).toFixed(2) + 's';
    var wobbleDuration = (Math.random() * 5 + 3).toFixed(2) + 's';
    var delay = (Math.random() * 4).toFixed(2) + 's';

    flake.style.animationDuration = fallDuration + ', ' + wobbleDuration + ', ' + fallDuration;
    flake.style.animationDelay = delay + ', ' + delay + ', ' + delay;

    // subtle opacity variance
    flake.style.opacity = (Math.random() * 0.4 + 0.7).toFixed(2);

    // append to overlay
    over.appendChild(flake);

    // remove flake after its fall completes (approx duration + delay)
    var removeAfter = parseFloat(fallDuration) + parseFloat(delay) + 1.0;
    setTimeout(function(){
      if (flake && flake.parentNode) flake.parentNode.removeChild(flake);
    }, removeAfter * 1000 + 500);
  }

  function startSnowForOverlay(over, intensity) {
    intensity = intensity || 8; // how many flakes per cycle
    var cycleTime = 1400; // spawn check interval ms
    var running = true;

    var interval = setInterval(function(){
      if (!running) return;
      // spawn a small random number of flakes each tick (0..intensity)
      var spawn = Math.max(1, Math.round(Math.random() * intensity));
      for (var i = 0; i < spawn; i++) {
        createFlake(over);
      }
    }, cycleTime);

    // keep a method to stop if needed
    return function stop() {
      running = false;
      clearInterval(interval);
    };
  }

  function attachSnowToInput(inputEl) {
    if (!inputEl) return;
    // ensure parent is positioned so overlay absolute positioning works
    var wrapper = inputEl.parentElement;
    if (!wrapper) return;

    // if the search markup is complicated (e.g., input wrapped by several elements) try to use a higher-level container if it exists
    // prefer a container with class containing "search" or "header"
    var candidate = wrapper;
    var foundBetter = false;
    for (var p=0; p<4; p++) {
      if (!candidate) break;
      var cls = candidate.className || '';
      if (typeof cls === 'string' && (cls.toLowerCase().indexOf('search') !== -1 || cls.toLowerCase().indexOf('header') !== -1)) {
        wrapper = candidate; foundBetter = true; break;
      }
      candidate = candidate.parentElement;
    }

    // ensure wrapper has positioning that allows overlay absolute placement
    var computed = window.getComputedStyle(wrapper);
    if (computed.position === 'static' || !computed.position) {
      wrapper.style.position = 'relative';
    }

    // do not add twice
    if (wrapper.querySelector('.ash-snow-overlay')) return;

    var overlay = document.createElement('div');
    overlay.className = 'ash-snow-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    // place overlay as first child so visually it sits above input (z-index handles order)
    wrapper.insertBefore(overlay, wrapper.firstChild);

    // start snow: intensity scales with width
    var width = wrapper.offsetWidth || inputEl.offsetWidth || 200;
    var intensity = Math.max(4, Math.round(width / 60)); // small screens ~4, larger ~8-12

    // start and keep a reference in case the element is removed/replaced by theme JS
    var stopFn = startSnowForOverlay(overlay, intensity);

    // observe wrapper removal to stop timers
    var mo = new MutationObserver(function(muts){
      // if overlay is no longer in DOM, stop interval and disconnect
      if (!document.body.contains(overlay)) {
        stopFn();
        mo.disconnect();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // return stop handle
    return { overlay: overlay, stop: stopFn };
  }

  // Main runner: wait for DOM ready and then try to attach. Use MutationObserver to catch late inserted search fields.
  function init() {
    var attached = false;
    function tryAttach() {
      if (attached) return;
      var el = findSearchInput();
      if (el) {
        attachSnowToInput(el);
        attached = true;
      }
    }
    tryAttach();

    // If not found immediately, watch for the element being added later
    if (!attached && typeof MutationObserver !== 'undefined') {
      var obs = new MutationObserver(function(){
        tryAttach();
        if (attached) obs.disconnect();
      });
      obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
