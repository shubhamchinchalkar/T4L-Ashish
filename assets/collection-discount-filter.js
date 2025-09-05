// assets/collection-discount-filter.js
// Front-end-only discount-range filter for collection pages (Tiles4Less theme).
// Relies on the "Save Up to X%" badge already printed by the theme.

(function () {
  function q(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  document.addEventListener('DOMContentLoaded', function () {
    // Scope: try to find the collection hero wrapper where we'll attach banners
    var hero = q('.collection-hero__inner') || q('.collection-hero') || q('.page-width');
    if (!hero) return;

    // product grid (cards are inside .product-grid .grid__item)
    var productGrid = q('.product-grid') || q('.grid.product-grid') || q('.collection-products') || q('.collection-grid');
    if (!productGrid) {
      // no grid found — nothing to do
      return;
    }
    var gridItems = qa('.product-grid .grid__item, .grid.product-grid .grid__item', productGrid).length ? qa('.product-grid .grid__item, .grid.product-grid .grid__item', productGrid) : qa('.grid__item', productGrid);

    // helper: parse discount percent from a card element
    function parseDiscountPercent(gridItem) {
      try {
        // card might be inside the grid item
        var card = gridItem.querySelector('.product-card-wrapper') || gridItem;
        // try price badge created by snippets/price.liquid (text like "Save Up to 35")
        var badgeSpan = card.querySelector('.price__badge-sale span, .badge.price__badge-sale span, .badge_sale span, .badge_sale');
        if (badgeSpan) {
          var txt = (badgeSpan.textContent || badgeSpan.innerText || '').trim();
          var m = txt.match(/(\d{1,3})/);
          if (m) return parseInt(m[1], 10);
        }
        // fallback: try to find any "Save" badge text
        var other = card.querySelector('.badge_sale, .price__badge-sale');
        if (other) {
          var mtxt = (other.textContent || other.innerText || '').trim();
          var mm = mtxt.match(/(\d{1,3})/);
          if (mm) return parseInt(mm[1], 10);
        }
      } catch (e) {
        return null;
      }
      return null;
    }

    // apply filter across visible grid items
    function applyRange(min, max) {
      var anyVisible = false;
      gridItems.forEach(function (item) {
        var percent = parseDiscountPercent(item);
        if (percent !== null && percent >= min && percent <= max) {
          item.style.display = '';
          anyVisible = true;
        } else {
          // hide non-matching or non-discounted items
          item.style.display = 'none';
        }
      });

      // show a helpful note if none match on this page
      var note = q('.t4l-filter-note');
      if (!note) {
        note = document.createElement('div');
        note.className = 't4l-filter-note';
        note.textContent = 'No matching products are visible on this page. Use pagination to see additional products.';
        productGrid.parentNode.insertBefore(note, productGrid.nextSibling);
      }
      note.style.display = anyVisible ? 'none' : '';
    }

    // clear any filter
    function clearFilter() {
      gridItems.forEach(function (item) {
        item.style.display = '';
      });
      var note = q('.t4l-filter-note');
      if (note) note.style.display = 'none';
    }

    // find banners we injected (they are placed inside hero)
    var banners = qa('.t4l-discount-banner', hero);
    if (!banners.length) return;

    banners.forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        var isClear = btn.dataset.clear === 'true';
        var min = parseInt(btn.dataset.min, 10) || 0;
        var max = parseInt(btn.dataset.max, 10) || 999;

        // If this is a clear button, clear and remove active states
        if (isClear) {
          clearFilter();
          banners.forEach(function (b) { b.classList.remove('t4l-active'); b.setAttribute('aria-pressed', 'false'); });
          // remove hash
          history.replaceState(null, '', location.pathname + location.search);
          return;
        }

        // toggle same button to clear
        var already = btn.classList.contains('t4l-active');
        banners.forEach(function (b) { b.classList.remove('t4l-active'); b.setAttribute('aria-pressed', 'false'); });

        if (already) {
          clearFilter();
          history.replaceState(null, '', location.pathname + location.search);
        } else {
          btn.classList.add('t4l-active');
          btn.setAttribute('aria-pressed', 'true');
          applyRange(min, max);
          // update hash so bookmarked or reloaded page keeps filter
          try {
            history.replaceState(null, '', location.pathname + location.search + '#discount=' + min + '-' + max);
          } catch (e) { /* ignore */ }
        }
      }, false);
    });

    // If user landed with a #discount=MIN-MAX hash, apply it
    if (location.hash && location.hash.indexOf('discount=') > -1) {
      var m = location.hash.match(/discount=(\d+)-(\d+)/);
      if (m) {
        var min0 = parseInt(m[1], 10), max0 = parseInt(m[2], 10);
        var found = banners.find(function (b) { return parseInt(b.dataset.min, 10) === min0 && parseInt(b.dataset.max, 10) === max0; });
        if (found) { found.click(); }
      }
    }
  });
})();
