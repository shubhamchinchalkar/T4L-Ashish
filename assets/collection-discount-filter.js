// assets/collection-discount-filter.js
// Improved front-end discount-range filter for collection pages.
// Tries data-discount -> sale badge -> Was/Now price parsing.
// Set DEBUG = true to see product parse logs in DevTools.

(function () {
  var DEBUG = false;

  function q(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function getNumberFromString(s) {
    if (!s) return null;
    // remove newlines/spaces
    s = String(s).replace(/\s+/g, '');
    // find the first number-like token (supports 1,234.56 or 1234,56 etc)
    var m = s.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/);
    if (!m) return null;
    var numStr = m[1];
    // If both '.' and ',' present -> assume comma thousands (e.g. "1,234.56")
    if (numStr.indexOf('.') > -1 && numStr.indexOf(',') > -1) {
      numStr = numStr.replace(/,/g, '');
    } else if (numStr.indexOf(',') > -1 && numStr.indexOf('.') === -1) {
      // comma as decimal separator -> convert to dot
      numStr = numStr.replace(/,/g, '.');
    } else {
      // leave as-is (likely "1234.56" or "1234")
    }
    var val = parseFloat(numStr);
    return isNaN(val) ? null : val;
  }

  function parseDiscountPercent(gridItem) {
    try {
      // 1) explicit data-discount (ideal)
      var dataEl = gridItem.querySelector('[data-discount]');
      if (dataEl) {
        var d = parseFloat(dataEl.getAttribute('data-discount'));
        if (!isNaN(d)) {
          if (DEBUG) console.log('data-discount ->', d, gridItem);
          return Math.round(d);
        }
      }

      // 2) badge text (many themes have different class names)
      var badgeSelectors = [
        '.price__badge-sale', '.badge.price__badge-sale', '.badge_sale', '.product-badge',
        '.badge--sale', '.badge--save', '.save-badge', '.sale-badge', '.price-badge',
        '.badge', '.product-card-badge'
      ];
      for (var i = 0; i < badgeSelectors.length; i++) {
        var b = gridItem.querySelector(badgeSelectors[i]);
        if (b) {
          var txt = (b.textContent || b.innerText || '').trim();
          var m = txt.match(/(\d{1,3})/);
          if (m) {
            if (DEBUG) console.log('badge ->', m[1], gridItem);
            return parseInt(m[1], 10);
          }
        }
      }

      // 3) fallback - search text like "Save 35%" anywhere in the card
      var allText = (gridItem.textContent || gridItem.innerText || '');
      var saveMatch = allText.match(/save(?:\s*up\s*to)?\s*[:\s]*?(\d{1,3})/i);
      if (saveMatch) {
        if (DEBUG) console.log('saveMatch ->', saveMatch[1], gridItem);
        return parseInt(saveMatch[1], 10);
      }

      // 4) Try to compute from Was / Now prices
      // Common selector candidates for "was" / "compare at" and "current" price
      var wasSelectors = ['.price__was', '.price--compare', '.price--was', '.was-price', '.price__compare', '.price-item--compare-at', '.price--old', '.price__old', '.compare-price', '.price--compare-at'];
      var nowSelectors = ['.price__sale', '.price--sale', '.price__price', '.price--current', '.product-price', '.price-item--regular', '.price', '.price--main', '.money'];

      var was = null, now = null;

      // try targeted nodes first
      for (var i = 0; i < nowSelectors.length; i++) {
        var nod = gridItem.querySelector(nowSelectors[i]);
        if (nod) {
          var found = getNumberFromString(nod.textContent || nod.innerText);
          if (found !== null) now = found;
          // don't break — keep searching for better nodes; but keep first valid
          if (now !== null) break;
        }
      }
      for (var j = 0; j < wasSelectors.length; j++) {
        var wn = gridItem.querySelector(wasSelectors[j]);
        if (wn) {
          var f = getNumberFromString(wn.textContent || wn.innerText);
          if (f !== null) {
            was = f;
            break;
          }
        }
      }

      // If not found, try to extract "Was £X" anywhere in the card text
      if (was === null) {
        var wasRegex = /was\s*[\£\$\€]?\s*([\d.,]+)/i;
        var wm = allText.match(wasRegex);
        if (wm) was = getNumberFromString(wm[1]);
      }
      // If now not found, try to find the last currency-like number in the card (often current price)
      if (now === null) {
        // prefer numbers with a currency symbol near them
        var moneyRegex = /[\£\$\€]?\s*([\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?]+)/g;
        var mm = allText.match(/[\d,.]+/g);
        if (mm && mm.length) {
          // choose the first or last? We'll try to pick the smallest numeric value (sale price normally lower)
          var nums = mm.map(function (s) { return getNumberFromString(s); }).filter(Boolean);
          if (nums.length) {
            // choose the minimum number (sale price typically lower than list)
            now = Math.min.apply(null, nums);
          }
        }
      }

      if (was !== null && now !== null && was > now) {
        var pct = Math.round(((was - now) / was) * 100);
        if (DEBUG) console.log('calc percent ->', pct, 'was', was, 'now', now, gridItem);
        return pct;
      }

    } catch (e) {
      if (DEBUG) console.error(e);
    }
    return null;
  }

  function applyRange(min, max, gridItems, productGrid) {
    var anyVisible = false;
    gridItems.forEach(function (item) {
      var percent = parseDiscountPercent(item);
      // show only items with computed percent within the range
      if (percent !== null && percent >= min && percent <= max) {
        item.style.display = '';
        anyVisible = true;
      } else {
        item.style.display = 'none';
      }
    });

    var note = q('.t4l-filter-note', productGrid.parentNode);
    if (!note) {
      note = document.createElement('div');
      note.className = 't4l-filter-note';
      note.textContent = 'No matching products are visible on this page. Use pagination to see additional products.';
      productGrid.parentNode.insertBefore(note, productGrid.nextSibling);
    }
    note.style.display = anyVisible ? 'none' : '';
  }

  function clearFilter(gridItems) {
    gridItems.forEach(function (item) { item.style.display = ''; });
    var note = q('.t4l-filter-note');
    if (note) note.style.display = 'none';
  }

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    var hero = q('.collection-hero__inner') || q('.collection-hero') || q('.page-width') || q('main');
    if (!hero) return;

    var productGrid = q('.product-grid') || q('.grid.product-grid') || q('.collection-products') || q('.collection-grid') || q('.collection__products') || q('section[role="main"] .grid');
    if (!productGrid) return;

    // Collect grid items (cover common variants)
    var gridItems = qa('.product-grid .grid__item, .grid.product-grid .grid__item', productGrid);
    if (!gridItems.length) {
      gridItems = qa('.grid__item, .product-card, .product-item, .grid__cell', productGrid);
    }

    // find banner buttons within hero
    var banners = qa('.t4l-discount-banner', hero);
    if (!banners.length) return;

    banners.forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        var isClear = btn.dataset.clear === 'true';
        var min = parseInt(btn.dataset.min, 10) || 0;
        var max = parseInt(btn.dataset.max, 10) || 999;

        if (isClear) {
          clearFilter(gridItems);
          banners.forEach(function (b) { b.classList.remove('t4l-active'); b.setAttribute('aria-pressed', 'false'); });
          history.replaceState(null, '', location.pathname + location.search);
          return;
        }

        var already = btn.classList.contains('t4l-active');
        banners.forEach(function (b) { b.classList.remove('t4l-active'); b.setAttribute('aria-pressed', 'false'); });

        if (already) {
          clearFilter(gridItems);
          history.replaceState(null, '', location.pathname + location.search);
        } else {
          btn.classList.add('t4l-active');
          btn.setAttribute('aria-pressed', 'true');
          applyRange(min, max, gridItems, productGrid);
          try { history.replaceState(null, '', location.pathname + location.search + '#discount=' + min + '-' + max); } catch (e) {}
        }
      }, false);
    });

    // Auto-apply if hash present
    if (location.hash && location.hash.indexOf('discount=') > -1) {
      var m = location.hash.match(/discount=(\d+)-(\d+)/);
      if (m) {
        var min0 = parseInt(m[1], 10), max0 = parseInt(m[2], 10);
        var found = banners.find(function (b) { return parseInt(b.dataset.min, 10) === min0 && parseInt(b.dataset.max, 10) === max0; });
        if (found) { found.click(); }
      }
    }

    if (DEBUG) {
      // quick diagnostics: print computed discount for each item
      console.group('T4L discount diagnostics');
      gridItems.forEach(function (it, idx) {
        try {
          var pct = parseDiscountPercent(it);
          var title = (it.querySelector('h3, .product-card__title, .card__heading, .product-title') || {}).innerText || 'item#' + idx;
          console.log(title.trim().slice(0, 60), '=>', pct);
        } catch (e) {}
      });
      console.groupEnd();
    }

  });

})();
