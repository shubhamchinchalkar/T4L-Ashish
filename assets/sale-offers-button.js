(() => {
  const SALE_TEXT = 'Sale & Offers';
  const SALE_URL = 'https://tiles4less.co.uk/collections/sale'; // 👈 update with your Sale collection handle

  const navSelectors = [
    '.header__inline-menu > ul', // Desktop nav
    '.site-nav > ul',            // Some themes use this
    '.menu-drawer__menu > ul',   // Mobile drawer
    '.mobile-nav > ul'           // Legacy mobile nav
  ];

  // Normalize text
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function addSaleToNav(nav) {
    if (!nav) return;

    // Prevent duplicates
    const exists = Array.from(nav.querySelectorAll('a')).some(
      (a) => norm(a.textContent) === norm(SALE_TEXT)
    );
    if (exists) return;

    // Create <li><a>
    const newLi = document.createElement('li');
    newLi.className = 'list-menu__item';

    const newLink = document.createElement('a');
    newLink.className =
      'header__menu-item list-menu__item link link--text focus-inset sale-offers-btn';
    newLink.textContent = SALE_TEXT;
    newLink.href = SALE_URL;
    newLink.setAttribute('data-sale-offers', '');

    newLi.appendChild(newLink);

    // Try to place after "Accessories"
    const accessories = Array.from(nav.querySelectorAll('a')).find(
      (a) => norm(a.textContent) === 'accessories'
    );
    if (accessories) {
      const liRef = accessories.closest('li');
      liRef.after(newLi);
    } else {
      // fallback → add to end
      nav.appendChild(newLi);
    }
  }

  function run() {
    navSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((nav) => addSaleToNav(nav));
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Observe dynamic changes (mobile drawer, sticky header, etc.)
  const mo = new MutationObserver(() => run());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
