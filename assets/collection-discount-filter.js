// collection-discount-filter.js
// Client-side discount-range filtering for collection product grid.
// Non-destructive: hides/shows product cards by reading prices rendered in DOM.
// Works with themes which render compare_at_price and actual price inside each product card.
//
// Usage: clicking banner links like ?discount=0-25 or ?discount=26-35 activates filter.
// The script also reads a "discount" URL param on page load.

(function () {
  if (!document || !window) return;

  // Utility: parse a "£12.34" or "12.34" string to number (handles commas)
  function parsePriceString(s) {
    if (!s) return NaN;
    // keep digits and dots
    var cleaned = String(s).replace(/[^0-9.]/g, '');
    var val = parseFloat(cleaned);
    return isNaN(val) ? NaN : val;
  }

  // Parse query string for discount param "min-max"
  function getDiscountRangeFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (!params.has('discount')) return null;
      var raw = params.get('discount'); // e.g. "26-35" or "0-25"
      var parts = raw.split('-').map(function (p) { return parseInt(p, 10); });
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { min: Math.max(0, parts[0]), max: Math.max(0, parts[1]) };
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  // Find product grid items. Adjust selector to match your theme's product card container.
  function findProductCards() {
    // many themes use .product-grid .card-wrapper or .product-card-wrapper
    var containers = document.querySelectorAll('.product-grid .card-wrapper, .product-grid .product-card-wrapper, .grid .card-wrapper, .grid .card');
    if (!containers || containers.length === 0) {
      // fallback: look for any .card-wrapper
      containers = document.querySelectorAll('.card-wrapper, .product-card-wrapper, .card');
    }
    return Array.prototype.slice.call(containers);
  }

  // Given a card element, try to extract numeric compare price and current price.
  function extractPricesFromCard(card) {
    if (!card) return { compare: NaN, price: NaN };

    // Try common price selectors used in this theme:
    var selectors = [
      '.price__sale .price',        // compare price markup (sale block)
      '.price__sale .exc_vat_price',// compare price ex VAT
      '.price__regular .exc_vat_price', // actual price ex VAT (regular displayed)
      '.price__regular .inc_vat_price',
      '.price__regular .price',
      '.price .compare-at',        // fallback
      '.price .price--compare',
      '[data-compare-price]',
      '[data-price]'
    ];

    var textCompare = null;
    var textPrice = null;

    // First search for compare price elements
    var compareEl = card.querySelector('.price__sale, .price__sale .price, .price__sale .exc_vat_price, .price__sale .compare-at, .price__sale .price--compare');
    if (compareEl) {
      textCompare = compareEl.textContent || compareEl.innerText;
    } else {
      // some themes show compare price in .price__sale .price__sale maybe
      var altCompare = card.querySelector('[data-compare-price]');
      if (altCompare) textCompare = altCompare.textContent || altCompare.innerText;
    }

    // Then search for the displayed price
    var priceEl = card.querySelector('.price__regular .exc_vat_price, .price__regular .inc_vat_price, .price__regular .price, .price .price--regular, .price--regular, .price');
    if (priceEl) {
      textPrice = priceEl.textContent || priceEl.innerText;
    } else {
      // fallback: find any element with "£" inside the card but prefer later ones (displayed price)
      var els = card.querySelectorAll('*');
      for (var i = els.length - 1; i >= 0; i--) {
        var t = els[i].textContent || els[i].innerText || '';
        if (t.indexOf('£') !== -1 || /\d+\.\d{2}/.test(t)) {
          // pick the first plausible candidate from the end
          if (!textPrice) textPrice = t;
        }
      }
    }

    var compare = parsePriceString(textCompare);
    var price = parsePriceString(textPrice);

    // If compare not found or invalid, ensure compare >= price (otherwise treat as no discount)
    if (isNaN(compare) || compare <= 0 || compare <= price) {
      return { compare: NaN, price: isNaN(price) ? NaN : price };
    }
    return { compare: compare, price: price };
  }

  // Compute percentage discount (rounded)
  function computeDiscountPercent(compare, price) {
    if (!compare || !price || isNaN(compare) || isNaN(price) || compare <= price) return 0;
    var percent = ((compare - price) / compare) * 100;
    return Math.round(percent);
  }

  // Apply filter: show only those cards with discount between min..max (inclusive).
  function applyDiscountFilter(range) {
    var cards = findProductCards();
    if (!cards || cards.length === 0) return;

    var shown = 0;
    cards.forEach(function (card) {
      try {
        var p = extractPricesFromCard(card);
        var discount = computeDiscountPercent(p.compare, p.price);

        // If compare price absent -> discount == 0 (hide for >0 queries)
        var visible = true;
        if (isNaN(p.compare) || discount <= 0) {
          // treat as 0% discount
          discount = 0;
        }

        if (range && (discount < range.min || discount > range.max)) {
          visible = false;
        }

        // hide or show
        if (visible) {
          card.style.display = '';
          shown++;
        } else {
          card.style.display = 'none';
        }
      } catch (e) {
        // on error, leave the card visible
        card.style.display = '';
      }
    });

    updateProductCount(shown);
    toggleClearButton(Boolean(range));
    updateActiveBanner(range);
  }

  function updateProductCount(shownCount) {
    // Try the theme's product count element
    var countEls = document.querySelectorAll('.product-count__text, .product-count, .collection__count, .collection-count, .product-count-text');
    if (countEls && countEls.length) {
      countEls.forEach(function (el) {
        // store original in data attribute if not stored
        if (!el.dataset.originalCount) {
          el.dataset.originalCount = el.textContent.trim();
        }
        el.textContent = shownCount + ' products';
      });
      return;
    }

    // fallback: do nothing
  }

  function restoreProductCount() {
    var countEls = document.querySelectorAll('.product-count__text, .product-count, .collection__count, .collection-count, .product-count-text');
    if (countEls && countEls.length) {
      countEls.forEach(function (el) {
        if (el.dataset.originalCount) el.textContent = el.dataset.originalCount;
      });
    }
  }

  function toggleClearButton(show) {
    var btn = document.querySelector('.discount-clear-btn');
    if (!btn) return;
    btn.style.display = show ? 'inline-block' : 'none';
  }

  function updateActiveBanner(range) {
    var banners = document.querySelectorAll('.discount-banner');
    banners.forEach(function (b) {
      b.classList.remove('active-discount-banner');
      b.style.outline = '';
    });
    if (!range) return;
    var selector = '.discount-banner[data-discount-min="' + range.min + '"][data-discount-max="' + range.max + '"]';
    var active = document.querySelector(selector);
    if (active) {
      active.classList.add('active-discount-banner');
      active.style.outline = '3px solid rgba(0,0,0,0.06)';
    }
  }

  // Listen for click on banners: prevent default navigation and apply filter, and update URL using history.pushState
  function wireBannerClicks() {
    var banners = document.querySelectorAll('.discount-banner');
    banners.forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.preventDefault();
        var min = parseInt(b.getAttribute('data-discount-min'), 10);
        var max = parseInt(b.getAttribute('data-discount-max'), 10);
        if (isNaN(min) || isNaN(max)) return;
        var range = { min: min, max: max };
        // update URL param without reload
        try {
          var url = new URL(window.location.href);
          url.searchParams.set('discount', min + '-' + max);
          window.history.pushState({}, '', url.toString());
        } catch (e) { /* ignore */ }
        applyDiscountFilter(range);
        // scroll the grid into view (good UX)
        var grid = document.querySelector('.product-grid, .collection__products');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    var clear = document.querySelector('.discount-clear-btn');
    if (clear) {
      clear.addEventListener('click', function () {
        try {
          var url = new URL(window.location.href);
          url.searchParams.delete('discount');
          window.history.pushState({}, '', url.toString());
        } catch (e) {}
        // show all
        var cards = findProductCards();
        cards.forEach(function (card) { card.style.display = ''; });
        restoreProductCount();
        toggleClearButton(false);
        updateActiveBanner(null);
      });
    }

    // Handle browser back/forward navigation: reapply filter based on URL
    window.addEventListener('popstate', function () {
      var dr = getDiscountRangeFromUrl();
      applyDiscountFilter(dr);
    });
  }

  // Kick off: run on DOM ready
  function init() {
    // Defer a bit to allow theme-scripts that populate product grid to run
    setTimeout(function () {
      wireBannerClicks();
      var dr = getDiscountRangeFromUrl();
      if (dr) applyDiscountFilter(dr);
    }, 600); // 600ms gives theme a bit of time but can be adjusted
  }

  // start when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
