/* collection-discount-filter.js
   Client-side filter for collection pages by discount % ranges.
   Works by reading data-discount attribute on product card wrappers.
   Safe: does not modify server-side collection; only hides/shows current page cards.
*/

(function () {
  if (!document) return;

  function qs(selector, ctx) { return (ctx || document).querySelector(selector); }
  function qsa(selector, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(selector)); }

  // container containing banners
  var bannersContainer = qs('.collection-discount-banners');
  if (!bannersContainer) return;

  var banners = qsa('.discount-banner', bannersContainer);
  var productCards = qsa('.product-card-wrapper, .card-wrapper.product-card-wrapper'); // be permissive

  function parseDiscount(el) {
    var v = el && el.getAttribute && el.getAttribute('data-discount');
    if (v === null || v === undefined || v === '') return 0;
    var n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  function applyFilter(min, max) {
    productCards.forEach(function (card) {
      var d = parseDiscount(card);
      var show = true;
      if (min !== null && max !== null) {
        show = (d >= min && d <= max);
      }
      // toggle
      card.style.display = show ? '' : 'none';
    });
    // if pagination shows only subset, user can navigate pages; filtering is per-page.
  }

  function clearFilter() {
    productCards.forEach(function (card) {
      card.style.display = '';
    });
    banners.forEach(function(b){
      b.setAttribute('aria-pressed','false');
      b.classList.remove('active');
    });
  }

  // Event binding
  banners.forEach(function (banner) {
    banner.addEventListener('click', function (ev) {
      var clear = banner.getAttribute('data-clear');
      if (clear === 'true') {
        clearFilter();
        return;
      }

      // read target range
      var min = banner.getAttribute('data-min');
      var max = banner.getAttribute('data-max');
      if (min === null || max === null) return;

      min = parseInt(min, 10);
      max = parseInt(max, 10);

      // set active state on banners
      banners.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed','false');
      });
      banner.classList.add('active');
      banner.setAttribute('aria-pressed','true');

      applyFilter(min, max);
      // scroll to product grid on small screens:
      var grid = document.querySelector('.main-collection-product-grid, .collection-products, .products-grid, .collection-grid');
      if (grid && window.innerWidth < 900) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Add small keyboard support: Enter / Space triggers click (but buttons already support this)
  // If wish to auto-apply when page loads with query params ?discount_min=26&discount_max=35, we can support it:
  (function checkQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      var min = params.get('discount_min');
      var max = params.get('discount_max');
      if (min && max) {
        // attempt to find a matching banner and click it.
        var found = banners.find(function(b){
          return b.getAttribute('data-min') === min && b.getAttribute('data-max') === max;
        });
        if (found) found.click();
      }
    } catch (e) { /* ignore */ }
  }());

})();
