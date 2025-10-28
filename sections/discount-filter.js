/* discount-filter.js - robust version
   - Works with or without data- attributes on product cards.
   - Detects many common theme card selectors.
   - Parses prices flexibly.
   - Re-applies filter when new cards are inserted (MutationObserver).
   - Supports ?discount=MIN-MAX in URL on load.
   - Exposes window.discountFilter API.
*/
(function () {
  'use strict';

  // --- Config: tweak selectors if your theme uses different classes ---
  var CARD_SELECTORS = [
    '.card-wrapper.product-card-wrapper',
    '.product-card-wrapper',
    '.product-card',
    '.grid__item',
    '.product-item',
    '.card--product',
    '.product-grid-item'
  ];

  // Candidate selectors inside a card for price and compare price
  var PRICE_SELECTORS = [
    '[data-price]',
    '.price',
    '.product-price',
    '.price__regular',
    '.price--current',
    '.price-item--regular',
    '.money',
    '.product-card__price'
  ];

  var COMPARE_SELECTORS = [
    '[data-compare-price]',
    '.price--compare',
    '.price__sale',
    '.price__was',
    '.price-item--compare',
    '.price--compare-at',
    '.product-card__compare-price'
  ];

  // find all product card elements
  function getAllCards() {
    for (var i = 0; i < CARD_SELECTORS.length; i++) {
      var nodes = Array.prototype.slice.call(document.querySelectorAll(CARD_SELECTORS[i]));
      if (nodes && nodes.length) {
        // return nodes but deduplicate based on uniqueness
        var unique = Array.prototype.slice.call(nodes);
        return unique;
      }
    }
    // fallback: try selecting any element that contains a money value
    return Array.prototype.slice.call(document.querySelectorAll('.grid__item, .product-list-item')) || [];
  }

  function parseNumberFromString(str) {
    if (str === null || str === undefined) return 0;
    // remove commas and non-digit/point/minus characters, but keep dots and minus
    var cleaned = String(str).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    if (!cleaned) return 0;
    var n = parseFloat(cleaned[0]);
    return isNaN(n) ? 0 : n;
  }

  function findTextContent(el, selectors) {
    if (!el) return null;
    // 1) try attributes (data-price/data-compare-price)
    for (var i = 0; i < selectors.length; i++) {
      var sel = selectors[i];
      // attribute form like [data-price]
      if (sel.charAt(0) === '[' && sel.indexOf('data-') === 1) {
        var attrName = sel.slice(1, -1);
        if (el.hasAttribute(attrName)) return el.getAttribute(attrName);
        // try on first descendant that has it
        var foundAttr = el.querySelector('[' + attrName + ']');
        if (foundAttr) return foundAttr.getAttribute(attrName);
      } else {
        // element selector
        var child = el.querySelector(sel);
        if (child) {
          var txt = child.textContent || child.innerText;
          if (txt && txt.trim()) return txt.trim();
        }
      }
    }
    // If nothing found, return null
    return null;
  }

  function computeDiscountPercentFromCard(card) {
    // Prefer attributes on the card or on inner .card element
    var priceRaw = null, compareRaw = null;

    // try direct attributes first
    if (card.hasAttribute && card.hasAttribute('data-price')) priceRaw = card.getAttribute('data-price');
    if (card.hasAttribute && card.hasAttribute('data-compare-price')) compareRaw = card.getAttribute('data-compare-price');

    // try inner .card
    if ((!priceRaw || !priceRaw.trim()) && card.querySelector) {
      var innerCard = card.querySelector('.card') || card;
      if (innerCard && innerCard.getAttribute) {
        if (innerCard.hasAttribute('data-price')) priceRaw = innerCard.getAttribute('data-price');
        if (innerCard.hasAttribute('data-compare-price')) compareRaw = innerCard.getAttribute('data-compare-price');
      }
    }

    // fallback: query common price elements
    if (!priceRaw) priceRaw = findTextContent(card, PRICE_SELECTORS);
    if (!compareRaw) compareRaw = findTextContent(card, COMPARE_SELECTORS);

    // Some themes show multiple numbers, choose the largest for compare price (best-effort)
    var price = parseNumberFromString(priceRaw);
    var compare = parseNumberFromString(compareRaw);

    // Another fallback: if compare-price missing but there is a "was" text near price
    if ((!compare || compare <= 0) && priceRaw) {
      // try to find something like 'Was £44.99'
      var wasMatch = String(priceRaw).match(/was\s*£?\s*([\d,\.]+)/i);
      if (wasMatch && wasMatch[1]) compare = parseNumberFromString(wasMatch[1]);
    }

    if (!compare || compare <= price) return 0;
    var pct = Math.round(((compare - price) / compare) * 100);
    return pct;
  }

  // apply filter: show cards that have discount between min..max (inclusive)
  function applyFilter(min, max) {
    // ensure numbers
    min = Number(min) || 0;
    max = Number(max) || 0;
    var cards = getAllCards();
    var shown = 0;

    cards.forEach(function (card) {
      try {
        var pct = computeDiscountPercentFromCard(card);
        if (pct >= min && pct <= max) {
          card.style.display = '';
          shown++;
        } else {
          card.style.display = 'none';
        }
      } catch (e) {
        // don't break everything on an error for one card
        console.error('discount-filter: error computing for a card', e);
      }
    });

    // Show/hide the clear button if exists
    var clearBtn = document.getElementById('discount-clear');
    if (clearBtn) {
      if (shown > 0) {
        clearBtn.style.display = '';
        clearBtn.setAttribute('aria-hidden', 'false');
      } else {
        clearBtn.style.display = 'none';
        clearBtn.setAttribute('aria-hidden', 'true');
      }
    }

    // Return how many shown for debugging
    return shown;
  }

  function clearFilter() {
    var cards = getAllCards();
    cards.forEach(function (c) { c.style.display = ''; });
    var clearBtn = document.getElementById('discount-clear');
    if (clearBtn) {
      clearBtn.style.display = 'none';
      clearBtn.setAttribute('aria-hidden', 'true');
    }
    // unset aria-pressed on banners
    var banners = document.querySelectorAll('.discount-banner');
    banners.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
  }

  function parseDiscountFromQuery() {
    try {
      var qs = window.location.search;
      if (!qs) return null;
      var params = new URLSearchParams(qs);
      if (!params.has('discount')) return null;
      var v = params.get('discount') || '';
      var m = v.split('-');
      if (m.length === 2) return { min: parseInt(m[0], 10), max: parseInt(m[1], 10) };
      return null;
    } catch (e) { return null; }
  }

  function initBanners() {
    var banners = document.querySelectorAll('.discount-banner');
    if (!banners || banners.length === 0) return;
    banners.forEach(function (b) {
      b.addEventListener('click', function (ev) {
        ev.preventDefault && ev.preventDefault();
        var min = parseInt(b.getAttribute('data-min') || '0', 10);
        var max = parseInt(b.getAttribute('data-max') || '0', 10);

        // aria-pressed toggling
        banners.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');

        // apply filter
        applyFilter(min, max);

        // scroll to product grid area (best-effort)
        var grid = document.querySelector('.collection-products, .collection-grid, .product-grid, .grid--products, .grid');
        if (!grid) grid = document.querySelector('main') || document.body;
        try { grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
      });
    });

    var clearBtn = document.getElementById('discount-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function (ev) {
        ev.preventDefault && ev.preventDefault();
        clearFilter();
      });
    }
  }

  var activeFilter = null;

  function applyActiveFilterIfAny() {
    if (!activeFilter) return;
    applyFilter(activeFilter.min, activeFilter.max);
  }

  // Observe DOM mutations to re-apply filter when new product cards are added (infinite scroll)
  var observer = null;
  function startObserver() {
    var grid = document.querySelector('.collection-products, .collection-grid, .product-grid, .grid--products, .grid');
    if (!grid) {
      grid = document.querySelector('main') || document.body;
    }
    if (!grid) return;

    // If already observing, disconnect first
    if (observer) observer.disconnect();

    observer = new MutationObserver(function (mutations) {
      var added = false;
      mutations.forEach(function (m) {
        if (m.addedNodes && m.addedNodes.length) added = true;
      });
      if (added && activeFilter) {
        // small timeout to let layout finish
        setTimeout(function () { applyActiveFilterIfAny(); }, 250);
      }
    });

    observer.observe(grid, { childList: true, subtree: true });
  }

  // init main
  function init() {
    initBanners();

    // apply discount from URL if present
    var fromUrl = parseDiscountFromQuery();
    if (fromUrl && Number.isFinite(fromUrl.min) && Number.isFinite(fromUrl.max)) {
      activeFilter = { min: fromUrl.min, max: fromUrl.max };
      applyFilter(activeFilter.min, activeFilter.max);
      // mark corresponding banner pressed if exists
      var banner = document.querySelector('.discount-banner[data-min="' + activeFilter.min + '"][data-max="' + activeFilter.max + '"]');
      if (banner) banner.setAttribute('aria-pressed', 'true');
    }

    // start observing for new cards
    startObserver();

    // expose API
    window.discountFilter = {
      apply: function (min, max) { activeFilter = { min: Number(min), max: Number(max) }; return applyFilter(min, max); },
      clear: function () { activeFilter = null; return clearFilter(); },
      reapply: function () { return applyActiveFilterIfAny(); },
      debug: function () { return { cards: getAllCards().length }; }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
