/* DEBUG SCRIPT — DO NOT EDIT */

(function () {

  if (window.innerWidth > 768) return;

  console.log("%cMOBILE SEARCH DEBUG STARTED", "background: #222; color: #0f0; padding: 4px;");

  const selectors = [
    '.search-modal',
    '.search-modal__content',
    '.modal__content',
    '[class*="modal"]',
    '[id*="modal"]',
    '[role="dialog"]',
    'details-modal',
    'details-modal.header__search',
    'predictive-search',
    '.field'
  ];

  function scan() {
    console.log("----- NEW SCAN -----");

    selectors.forEach(sel => {
      const nodes = document.querySelectorAll(sel);
      nodes.forEach(n => {
        const rect = n.getBoundingClientRect();
        console.log(
          sel,
          "FOUND →", n,
          "VISIBLE →", rect.width > 0 && rect.height > 0
        );
      });
    });

    // Check active shadow roots
    const preds = document.querySelectorAll("predictive-search");
    preds.forEach(p => {
      console.log("predictive-search:", p);
      if (p.shadowRoot) {
        console.log("SHADOW ROOT FOUND:", p.shadowRoot);
        console.log("SHADOW CHILDREN:", p.shadowRoot.innerHTML);
      } else {
        console.log("NO SHADOW ROOT");
      }
    });
  }

  // Scan on load
  scan();

  // Scan when DOM changes
  const obs = new MutationObserver(() => scan());
  obs.observe(document.body, { childList: true, subtree: true });

})();
