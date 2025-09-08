/* add-to-cart-animation.js
   Minimal, safe JS to animate Add to cart buttons.
   Listens to:
     - native submit events on forms with data-type="add-to-cart-form" (theme uses this)
     - theme pubsub events: PUB_SUB_EVENTS.cartUpdate and PUB_SUB_EVENTS.cartError
   It does not change existing theme code; it only adds helper classes / small DOM nodes.
*/
(function(){
  'use strict';

  function safeQuery(el, sel) { return el ? el.querySelector(sel) : null; }

  function ensureSpinner(button) {
    if (!button) return;
    if (!button.querySelector('.atc-spinner')) {
      var s = document.createElement('span');
      s.className = 'atc-spinner';
      // keep spinner visually separate from button label text
      button.appendChild(s);
    }
  }

  function removeSpinner(button) {
    if (!button) return;
    var s = button.querySelector('.atc-spinner');
    if (s) s.remove();
  }

  function startAnimation(button) {
    if (!button) return;
    // avoid double-starting
    button.classList.remove('atc-anim--error');
    if (!button.classList.contains('atc-anim--loading')) {
      button.classList.add('atc-anim--loading');
      ensureSpinner(button);
    }
  }

  function addedAnimation(button) {
    if (!button) return;
    button.classList.remove('atc-anim--loading');
    removeSpinner(button);
    // add 'added' class and a separate class to control timing of the visible checkmark
    button.classList.add('atc-anim--added');
    // small delay so CSS transition triggers
    setTimeout(function(){
      button.classList.add('atc-anim--added-visible');
    }, 20);
    // clear added visuals after a short time so button returns to normal
    setTimeout(function(){
      button.classList.remove('atc-anim--added-visible');
      button.classList.remove('atc-anim--added');
    }, 2000);
  }

  function errorAnimation(button) {
    if (!button) return;
    button.classList.remove('atc-anim--loading');
    removeSpinner(button);
    button.classList.add('atc-anim--error');
    setTimeout(function(){
      button.classList.remove('atc-anim--error');
    }, 900);
  }

  // On submit of add-to-cart form: start animation for that submit button
  document.addEventListener('submit', function(evt){
    try {
      var form = evt.target;
      var isAddToCartForm = (form && (form.getAttribute('data-type') === 'add-to-cart-form' || form.dataset && form.dataset.type === 'add-to-cart-form'));
      if (!isAddToCartForm) return;
      var button = safeQuery(form, '[type="submit"][name="add"]') || safeQuery(form, 'button[type="submit"]') || safeQuery(form, 'input[type="submit"]');
      startAnimation(button);
    } catch (e) { /* silent */ }
  }, true);

  // Also start animation if user directly clicks an add button (fallback)
  document.addEventListener('click', function(evt){
    try {
      var btn = evt.target.closest && evt.target.closest('button[name="add"], input[name="add"], .quick-add__submit');
      if (!btn) return;
      startAnimation(btn);
    } catch (e) { /* silent */ }
  }, true);

  // Listen to theme events via pubsub (if available)
  function setupPubSubListeners() {
    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      // On successful add (published by product-form.js)
      subscribe(PUB_SUB_EVENTS.cartUpdate, function(data){
        try {
          // The pubsub payload contains productVariantId for the added variant.
          var variantId = data && (data.productVariantId || (data.cartData && data.cartData.id));
          // For safety, update any loading button in the page:
          document.querySelectorAll('.atc-anim--loading').forEach(function(btn){
            // try to match the variant id with the form input[name=id] if present
            var nearestForm = btn.closest('form');
            if (variantId && nearestForm) {
              var idInput = nearestForm.querySelector('[name="id"]');
              if (idInput && String(idInput.value) !== String(variantId)) {
                // not the same variant; skip
                return;
              }
            }
            addedAnimation(btn);
          });
        } catch (e) { /* silent */ }
      });

      // On add error
      subscribe(PUB_SUB_EVENTS.cartError, function(data){
        try {
          document.querySelectorAll('.atc-anim--loading').forEach(function(btn){
            errorAnimation(btn);
          });
        } catch (e) { /* silent */ }
      });
    }
  }

  // Some themes may not have pubsub available immediately; wait until DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
      setTimeout(setupPubSubListeners, 20);
    });
  } else {
    setTimeout(setupPubSubListeners, 20);
  }
})();
