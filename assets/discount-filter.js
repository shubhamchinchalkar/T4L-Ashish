// assets/discount-filter.js
(function(){
  'use strict';

  // Helpers
  function parseRange(rangeStr) {
    if (!rangeStr || rangeStr === 'all') return null;
    var parts = rangeStr.split('-').map(function(s){ return parseInt(s,10); });
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
    return { min: parts[0], max: parts[1] };
  }

  function getDiscountPercent(price, compare) {
    // price & compare are numeric (cents). If no compare or compare <= price: 0%
    price = Number(price) || 0;
    compare = Number(compare) || 0;
    if (!compare || compare <= price) return 0;
    return Math.round(( (compare - price) / compare ) * 100);
  }

  function findProductCards() {
    // Select elements that have the data attributes we injected
    return Array.prototype.slice.call(document.querySelectorAll('[data-price][data-compare]'));
  }

  function applyFilter(range) {
    var cards = findProductCards();
    // If range === null -> show all
    if (!range) {
      cards.forEach(function(el){ el.closest('.card-wrapper') && el.closest('.card-wrapper').classList.remove('discount-hidden'); el.style.display=''; });
      return;
    }
    cards.forEach(function(el){
      var price = el.getAttribute('data-price') || '0';
      var compare = el.getAttribute('data-compare') || '0';
      var pct = getDiscountPercent(price, compare);
      var wrapper = el.closest('.card-wrapper') || el;
      if (pct >= range.min && pct <= range.max) {
        wrapper.classList.remove('discount-hidden');
        wrapper.style.display = '';
      } else {
        wrapper.classList.add('discount-hidden');
        // hide via display so layout shrinks gracefully
        wrapper.style.display = 'none';
      }
    });
  }

  function clearPressedState(banners) {
    banners.forEach(function(b){ b.setAttribute('aria-pressed','false'); });
  }

  function onBannerClick(e) {
    var button = e.currentTarget;
    var rangeStr = button.getAttribute('data-discount-range');
    var range = parseRange(rangeStr);
    // set aria state
    var banners = Array.prototype.slice.call(document.querySelectorAll('.discount-banner'));
    clearPressedState(banners);
    button.setAttribute('aria-pressed', 'true');
    applyFilter(range);
    // update url param without reload
    try {
      var url = new URL(window.location.href);
      if (!range) {
        url.searchParams.delete('discount');
      } else {
        url.searchParams.set('discount', rangeStr);
      }
      window.history.replaceState({}, '', url.toString());
    } catch(err){}
  }

  function initFromUrl() {
    var url = new URL(window.location.href);
    var param = url.searchParams.get('discount');
    if (!param) return;
    var target = document.querySelector('.discount-banner[data-discount-range="' + param + '"]');
    if (target) {
      target.click();
    } else {
      // If a matching banner not present, try parse and filter directly
      var parsed = parseRange(param);
      if (parsed) {
        applyFilter(parsed);
        // mark none pressed
        var banners = Array.prototype.slice.call(document.querySelectorAll('.discount-banner'));
        clearPressedState(banners);
      }
    }
  }

  function init() {
    // attach CSS & event handlers when DOM ready
    var banners = Array.prototype.slice.call(document.querySelectorAll('.discount-banner'));
    if (banners.length === 0) return;

    banners.forEach(function(b){
      b.addEventListener('click', onBannerClick);
    });

    // If products are added later via ajax/infinite scroll, reapply filter
    var observerConfig = { childList: true, subtree: true };
    var container = document.querySelector('main') || document.body;
    var currentRangeParam = (new URL(window.location.href)).searchParams.get('discount');

    var observer = new MutationObserver(function(mutations){
      // small debounce
      if (window._discountFilterTimeout) clearTimeout(window._discountFilterTimeout);
      window._discountFilterTimeout = setTimeout(function(){
        if (currentRangeParam) {
          initFromUrl();
        } else {
          // if a button is currently pressed apply that
          var pressed = document.querySelector('.discount-banner[aria-pressed="true"]');
          if (pressed) {
            var r = parseRange(pressed.getAttribute('data-discount-range'));
            applyFilter(r);
          }
        }
      }, 120);
    });
    observer.observe(container, observerConfig);

    // init on load from url param if present
    initFromUrl();
  }

  // Dom ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
