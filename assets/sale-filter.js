// sale-filter.js - filters on-sale collection products by discount percentage
document.addEventListener('DOMContentLoaded', function () {
  // only run on the on-sale collection page. Adjust handle if needed.
  if (!window.location.pathname.includes('/collections/on-sale')) return;

  const gridSelector = '#product-grid';
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  let activeRange = null;

  function getCards() {
    return Array.from(grid.querySelectorAll('.grid__item'));
  }

  function parsePercentFromBadge(card) {
    // price__badge-sale contains: Save Up To <span>35%</span>
    const el = card.querySelector('.price__badge-sale span');
    if (!el) return 0;
    const text = el.textContent || '';
    const m = text.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function applyFilter(min, max) {
    const cards = getCards();
    cards.forEach(card => {
      const pct = parsePercentFromBadge(card);
      // pct==0 means either not on discount or badge not present
      if (pct >= min && pct <= max) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
    activeRange = (min === null ? null : { min, max });
    // update aria-pressed on buttons
    document.querySelectorAll('.sale-filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
    if (activeRange) {
      const btn = document.querySelector('.sale-filter-btn[data-min="' + min + '"][data-max="' + max + '"]');
      if (btn) btn.setAttribute('aria-pressed', 'true');
    }
  }

  function clearFilter() {
    getCards().forEach(c => c.style.display = '');
    activeRange = null;
    document.querySelectorAll('.sale-filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
  }

  // wire up buttons
  document.querySelectorAll('.sale-filter-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const min = parseInt(this.dataset.min, 10) || 0;
      const max = parseInt(this.dataset.max, 10) || 9999;
      applyFilter(min, max);
      // scroll to product grid
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const clearBtn = document.querySelector('.sale-filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function (e) {
      e.preventDefault();
      clearFilter();
      if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // If the theme replaces products via AJAX (infinite scroll / sorting),
  // reapply the active filter whenever the grid's contents change.
  const observer = new MutationObserver(() => {
    if (activeRange) applyFilter(activeRange.min, activeRange.max);
  });
  observer.observe(grid, { childList: true, subtree: true });
});
