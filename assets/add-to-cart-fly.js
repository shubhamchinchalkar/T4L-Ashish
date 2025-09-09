/* add-to-cart-fly.js - unobtrusive "fly to cart" animation
   Works with themes that use AJAX cart-notification/cart-drawer.
   Safe: doesn't block or override existing submit handlers.
*/
(function(){
  if (window.__addToCartFlyLoaded) return;
  window.__addToCartFlyLoaded = true;

  const cartIconSelectors = [
    '[data-cart-toggle]',
    '.js-drawer-open-cart',
    '.site-header__cart',
    '.header__cart',
    '.cart-drawer-toggle',
    '.cart-icon',
    '[data-cart-icon]',
    'a[href="/cart"]',
    '.cart-count-bubble',
    '.header-cart'
  ];

  function findCartIcon() {
    for (const s of cartIconSelectors) {
      try {
        const el = document.querySelector(s);
        if (el) return el;
      } catch(e){ /* ignore malformed selectors */ }
    }
    // fallback: top-right corner
    return document.body;
  }

  function findProductImage(form) {
    const selectors = [
      'img[data-product-featured-image]',
      'img.product__image',
      'img.product-single__photo',
      'img.featured-image',
      'img'
    ];
    // 1) find nearest product container common class candidates
    const ancestor = form.closest('.product, .product-card, .product-item, .product-single, .grid-item, .card, .card--product');
    if (ancestor) {
      const found = ancestor.querySelector(selectors.join(', '));
      if (found) return found;
    }
    // 2) try inside the form
    let found = form.querySelector(selectors.join(', '));
    if (found) return found;
    // 3) try a few siblings before the form
    let sib = form.previousElementSibling;
    while (sib) {
      found = sib.querySelector(selectors.join(', '));
      if (found) return found;
      sib = sib.previousElementSibling;
    }
    // 4) last resort: any product image close-by
    return document.querySelector(selectors.join(', '));
  }

  const lastSubmitted = {time:0, img:null};

  function onFormSubmit(e) {
    try {
      const form = e.target;
      const img = findProductImage(form);
      if (img) {
        lastSubmitted.time = Date.now();
        lastSubmitted.img = img;
      }
    } catch(err){ console.error('fly:submit', err) }
  }

  function attachToForms() {
    const forms = document.querySelectorAll('form[action^="/cart/add"], form[action*="/cart/add"]');
    forms.forEach(form => {
      if (form.__flyBound) return;
      form.addEventListener('submit', onFormSubmit, true);
      form.__flyBound = true;

      // also bind click on submit button to catch immediate clicks
      const btn = form.querySelector('[type=submit], button');
      if (btn && !btn.__flyClickBound) {
        btn.addEventListener('click', () => {
          try {
            const img = findProductImage(form);
            if (img) {
              lastSubmitted.time = Date.now();
              lastSubmitted.img = img;
            }
          } catch(e){/* ignore */}
        }, {passive:true});
        btn.__flyClickBound = true;
      }
    });
  }

  // run early and watch for dynamic content
  document.addEventListener('DOMContentLoaded', attachToForms);
  new MutationObserver(attachToForms).observe(document.body, {childList:true, subtree:true});

  const cartIcon = findCartIcon();

  function animateToCart(imgEl) {
    if (!imgEl) return;
    try {
      const imgRect = imgEl.getBoundingClientRect();
      // create a clone
      const clone = imgEl.cloneNode(true);
      clone.className = (clone.className ? clone.className + ' ' : '') + 'add-to-cart-fly-image';
      // inline styles for initial positioning
      clone.style.position = 'fixed';
      clone.style.left = imgRect.left + 'px';
      clone.style.top = imgRect.top + 'px';
      clone.style.width = imgRect.width + 'px';
      clone.style.height = imgRect.height + 'px';
      clone.style.zIndex = 99999;
      clone.style.opacity = '1';
      clone.style.pointerEvents = 'none';
      document.body.appendChild(clone);

      const targetRect = (cartIcon && cartIcon.getBoundingClientRect && cartIcon.getBoundingClientRect()) || {left: window.innerWidth-40, top: 20, width: 32, height: 32};
      const dx = (targetRect.left + targetRect.width/2) - (imgRect.left + imgRect.width/2);
      const dy = (targetRect.top + targetRect.height/2) - (imgRect.top + imgRect.height/2);

      // trigger transform on next frame
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.12)`;
        clone.style.opacity = '0.6';
      });

      // cleanup after transition ends
      clone.addEventListener('transitionend', () => {
        clone.remove();
        // small pop on cart icon if present
        try {
          if (cartIcon && cartIcon.animate) {
            cartIcon.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}], {duration:280});
          }
        } catch(e){}
      }, {once:true});

    } catch(err) { console.error('fly:animate', err) }
  }

  // Observe cart-notification wrapper for active class changes (theme uses cart-notification-wrapper)
  function observeCartNotification() {
    const wrapper = document.querySelector('.cart-notification-wrapper') || document.querySelector('.cart-drawer') || document.querySelector('cart-notification');
    if (!wrapper) return;
    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const cls = m.target.classList;
          if (cls && cls.contains('active')) {
            // trigger if we captured a form submit recently (within 4 seconds)
            if (lastSubmitted.time && (Date.now() - lastSubmitted.time) < 4000 && lastSubmitted.img) {
              animateToCart(lastSubmitted.img);
              // reset
              lastSubmitted.time = 0;
              lastSubmitted.img = null;
            }
          }
        }
      }
    });
    mo.observe(wrapper, {attributes:true, attributeFilter:['class']});
  }

  document.addEventListener('DOMContentLoaded', observeCartNotification);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    attachToForms();
    observeCartNotification();
  }
})();
