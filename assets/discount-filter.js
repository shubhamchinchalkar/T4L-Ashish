// discount-filter.js
(function () {
  function parseQuery() {
    var q = {};
    var s = window.location.search.replace(/^\?/, '');
    if (!s) return q;
    s.split('&').forEach(function (pair) {
      var parts = pair.split('=');
      q[decodeURIComponent(parts[0])] = parts[1] ? decodeURIComponent(parts[1]) : '';
    });
    return q;
  }

  function getDiscountFromCard(card) {
    try {
      // the theme renders a badge: .price__badge-sale > span (e.g. "32%")
      var badgeSpan = card.querySelector('.price__badge-sale span');
      if (badgeSpan) {
        // strip non-digits
        var n = badgeSpan.textContent.replace(/[^\d]/g, '');
        var v = parseInt(n, 10);
        if (!isNaN(v)) return v;
      }

      // fallback: try to compute from DOM compare/price if available
      var salePriceEl = card.querySelector('.price-item--sale.exc_vat_price, .price-item--sale');
      var compareEl = card.querySelector('s.price-item--regular');
      if (salePriceEl && compareEl) {
        var saleText = salePriceEl.textContent || '';
        var compareText = compareEl.textContent || '';
        var parseMoney = function (t) { return Number(t.replace(/[^0-9\.\-]/g, '')) || 0; };
        var sale = parseMoney(saleText);
        var compare = parseMoney(compareText);
        if (compare > 0) {
          return Math.round(((compare - sale) / compare) * 100);
        }
      }
    } catch (e) {
      // ignore and return 0
    }
    return 0;
  }

  function updateProductCount(visibleCount) {
    var desktop = document.querySelector('#ProductCountDesktop');
    var mobile = document.querySelector('#ProductCountMobile');
    if (desktop) {
      // preserve original i18n by replacing digits only; simpler: set plain text
      desktop.textContent = visibleCount + ' products';
    }
    if (mobile) {
      mobile.textContent = visibleCount + ' products';
    }
  }

  function applyDiscountFilter(rangeStr) {
    if (!rangeStr) return;
    var parts = rangeStr.split('-');
    if (parts.length !== 2) return;
    var min = parseInt(parts[0], 10);
    var max = parseInt(parts[1], 10);
    if (isNaN(min) || isNaN(max)) return;

    // product cards: try to select the nearest root card wrappers
    var cardWrappers = Array.from(document.querySelectorAll('.card-wrapper, .product-card, .grid__item'));
    if (!cardWrappers.length) {
      // fallback: select product list items
      cardWrappers = Array.from(document.querySelectorAll('[data-product-id], .product-list-item'));
    }

    var visible = 0;
    cardWrappers.forEach(function (card) {
      var discount = getDiscountFromCard(card);
      if (discount >= min && discount <= max) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    updateProductCount(visible);
  }

  // Run on DOM ready. Also observe changes in case collection grid is added after load.
  document.addEventListener('DOMContentLoaded', function () {
    var q = parseQuery();
    if (q.discount) {
      // expected format: "0-25" or "26-35" or "36-50"
      applyDiscountFilter(q.discount);
    }

    // MutationObserver: if collection grid is rendered later, re-run filter
    var observer = new MutationObserver(function () {
      var q2 = parseQuery();
      if (q2.discount) {
        applyDiscountFilter(q2.discount);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // If user clicks banners while on the page (link to same page with query), re-run filter on popstate
    window.addEventListener('popstate', function () {
      var q2 = parseQuery();
      if (q2.discount) {
        applyDiscountFilter(q2.discount);
      } else {
        // restore all
        Array.from(document.querySelectorAll('.card-wrapper, .product-card, .grid__item, [data-product-id]')).forEach(function (el) {
          el.style.display = '';
        });
      }
    });
  });
})();
