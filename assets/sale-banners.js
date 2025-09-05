(() => {
  // Only run on the On-Sale collection
  const isOnSale = document.documentElement && document.documentElement.innerHTML.includes('data-on-sale-collection="true"');
  if (!isOnSale) return;

  const qs = new URLSearchParams(location.search);
  const offMin = parseInt(qs.get('off_min') || '0', 10);
  const offMax = parseInt(qs.get('off_max') || '0', 10);

  const within = (value, min, max) => {
    if (!max) return true;               // no filter selected
    const v = parseInt(value || '0', 10);
    return v >= (min || 1) && v <= max;  // inclusive range 1..X
  };

  const cards = Array.from(document.querySelectorAll('[data-discount]'));
  const applyFilter = (min, max) => {
    let shown = 0;
    cards.forEach(card => {
      const d = card.getAttribute('data-discount');
      const show = within(d, min, max);
      if (show) { card.removeAttribute('hidden'); shown++; }
      else { card.setAttribute('hidden', ''); }
    });

    // Show tiny helper count (non-destructive; doesn’t touch native count)
    const helper = document.querySelector('#sale-banners-results');
    if (helper) helper.textContent = max ? `Showing ${shown} product(s) — up to ${max}% off` : '';
  };

  // Preserve filter when sorting (common Shopify pattern)
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el && el.name === 'sort_by') {
      const params = new URLSearchParams(location.search);
      if (offMax) { params.set('off_max', offMax); params.set('off_min', offMin || 1); }
      params.set('sort_by', el.value);
      location.search = params.toString();
    }
  });

  // Enhance banner links so they keep existing params (except old off_* ones)
  const enhanceLinks = () => {
    const links = document.querySelectorAll('.sale-banners__btn[data-off-max], .sale-banners__clear');
    links.forEach(a => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const params = new URLSearchParams(location.search);
        params.delete('off_min'); params.delete('off_max');
        if (a.classList.contains('sale-banners__clear')) {
          // no-op: just go to base URL with all other params kept
        } else {
          params.set('off_min', '1');
          params.set('off_max', String(a.getAttribute('data-off-max')));
        }
        const url = `${location.pathname}?${params.toString()}`;
        history.replaceState({}, '', url);
        // update active state
        document.querySelectorAll('.sale-banners__btn').forEach(x => x.classList.remove('is-active'));
        if (!a.classList.contains('sale-banners__clear')) a.classList.add('is-active');
        // apply
        applyFilter(
          parseInt(params.get('off_min') || '0', 10),
          parseInt(params.get('off_max') || '0', 10)
        );
      });
    });
  };

  // Kick off
  applyFilter(offMin, offMax);
  enhanceLinks();

  // Mark the active banner (if any)
  if (offMax) {
    const active = document.querySelector(`.sale-banners__btn[data-off-max="${offMax}"]`);
    if (active) active.classList.add('is-active');
  }
})();
