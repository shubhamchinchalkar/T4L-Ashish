/* assets/clear-search.js
   Adds a small "clear" (×) button to search inputs if no reset exists.
   Non-invasive: it will NOT add a duplicate if your theme already has a reset button.
*/
(function () {
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    // selector picks up header/modal/inline search inputs; keep it permissive but safe
    const selector = 'input[type="search"].search__input, input[type="search"]';
    const inputs = document.querySelectorAll(selector);
    if (!inputs.length) return;

    inputs.forEach((input) => {
      // find a natural container for absolute positioning (theme uses .field)
      const container = input.closest('.field') || input.parentElement;
      if (!container) return;

      // If the theme already provides a reset button, don't add duplicate
      if (container.querySelector('button[type="reset"], .search-clear')) return;

      // create clear button
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-clear field__button hidden';
      btn.setAttribute('aria-label', 'Clear search');
      btn.setAttribute('title', 'Clear search');

      // simple accessible SVG "x" icon (keeps style neutral; inherits currentColor)
      btn.innerHTML = '<svg class="icon icon-close" viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';

      // append to the input container
      container.appendChild(btn);

      // show/hide depending on input value
      const toggle = () => {
        if (input.value && input.value.trim() !== '') {
          btn.classList.remove('hidden');
        } else {
          btn.classList.add('hidden');
        }
      };

      // wire events
      input.addEventListener('input', toggle);
      input.addEventListener('change', toggle);
      // initialize
      toggle();

      // click clears input and notifies other handlers (predictive search, etc.)
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        input.value = '';
        input.focus();
        // trigger input event so any listeners (predictive search) react
        input.dispatchEvent(new Event('input', { bubbles: true }));
        // also trigger form reset (some themes listen to reset)
        if (input.form) input.form.dispatchEvent(new Event('reset', { bubbles: true }));
        // hide the button
        toggle();
      });
    });
  });
})();
