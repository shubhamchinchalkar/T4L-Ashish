/* discount-filter.js
   Client-side filter for collection pages based on percent-off ranges.
   Works by reading data-price and data-compare-price attributes added to each product card element.
*/

(function () {
  function parseNumber(value) {
    if (value === null || value === undefined) return 0;
    var n = parseFloat(String(value).replace(/[^\d\.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  }

  function computeDiscountPercent(price, compare) {
    price = parseNumber(price);
    compare = parseNumber(compare);
    if (compare <= 0 || compare <= price) return 0;
    return Math.round(((compare - price) / compare) * 100);
  }

  function getAllProductCards() {
    // adjust selector if your card wrapper is different
    return Array.prototype.slice.call(document.querySelectorAll('.product-card-wrapper, .card-wrapper.product-card-wrapper'));
  }

  function updateVisibleCount() {
    var all = document.querySelectorAll('.product-count-vertical, #ProductCountDesktop');
    // We won't attempt to fully re-render the Shopify count template; just leave it.
    // Optionally you could show a small inline counter. For now do nothing.
  }

  function filterByRange(min, max) {
    var cards = getAllProductCards();
    var anyShown = false;
    cards.forEach(function (card) {
      var price = card.querySelector('[data-price]') ? card.getAttribute('data-price') : card.getAttribute('data-price');
      // If the data attrs are on inner .card element, try that:
      if (!price) {
        var inner = card.querySelector('.card');
        if (inner) {
          price = inner.getAttribute('data-price') || inner.getAttribute('data-price');
        }
      }
      var compare = card.getAttribute('data-compare-price');
      // fallback to inner .card
      if (!compare) {
        var inner2 = card.querySelector('.card');
        if (inner2) compare = inner2.getAttribute('data-compare-price');
      }

      // if still missing, try reading visible price elements (best-effort)
      if (!price) price = card.querySelector('[data-price]') ? card.querySelector('[data-price]').textContent : null;

      var percent = computeDiscountPercent(price, compare);

      if (percent >= min && percent <= max) {
        card.style.display = '';
        anyShown = true;
      } else {
        card.style.display = 'none';
      }
    });

    // Show clear button if filter active
    var clearBtn = document.getElementById('discount-clear');
    if (clearBtn) {
      clearBtn.style.display = anyShown ? '' : 'none';
      clearBtn.setAttribute('aria-hidden', anyShown ? 'false' : 'true');
    }

    updateVisibleCount();
  }

  function clearFilter() {
    var cards = getAllProductCards();
    cards.forEach(function (c) { c.style.display = ''; });
    var clearBtn = document.getElementById('discount-clear');
    if (clearBtn) {
      clearBtn.style.display = 'none';
      clearBtn.setAttribute('aria-hidden', 'true');
    }
    updateVisibleCount();
  }

  function init() {
    // attach click to discount banners
    var banners = document.querySelectorAll('.discount-banner');
    banners.forEach(function (b) {
      b.addEventListener('click', function (ev) {
        var min = parseInt(b.getAttribute('data-min') || '0', 10);
        var max = parseInt(b.getAttribute('data-max') || '0', 10);

        // set pressed state for accessibility
        banners.forEach(function(x){ x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');

        // filter
        filterByRange(min, max);

        // scroll to product grid
        var grid = document.querySelector('[data-predictive-search]') || document.querySelector('.collection-products') || document.querySelector('.main-collection-product-grid') || document.querySelector('section:has(.product-card-wrapper)');
        if (!grid) grid = document.querySelector('main') || document.body;
        // smooth scroll to grid top
        try {
          grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (e) {}
      });
    });

    var clearBtn = document.getElementById('discount-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        banners.forEach(function(x){ x.setAttribute('aria-pressed', 'false'); });
        clearFilter();
      });
    }
  }

  // wait for DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
