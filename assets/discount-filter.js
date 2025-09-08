(function () {
  function getParams() {
    const sp = new URLSearchParams(location.search);
    const min = parseInt(sp.get("min"), 10);
    const max = parseInt(sp.get("max"), 10);
    return { hasRange: !Number.isNaN(min) && !Number.isNaN(max), min, max };
  }

  function applyDiscountFilter() {
    const { hasRange, min, max } = getParams();
    const gridItems = document.querySelectorAll("#product-grid > li.grid__item");
    if (!gridItems.length) return;

    let shown = 0;

    gridItems.forEach((li) => {
      const carrier = li.querySelector(".product-card-wrapper[data-max-discount]");
      const pct = carrier ? parseFloat(carrier.getAttribute("data-max-discount") || "0") : 0;

      const keep = !hasRange || (pct >= min && pct <= max);
      li.style.display = keep ? "" : "none";
      keep && shown++;
    });

    // Optional: show a small empty-state if nothing matches
    let empty = document.querySelector(".discount-empty");
    if (!empty) {
      empty = document.createElement("div");
      empty.className = "discount-empty";
      empty.style.display = "none";
      empty.textContent = "No products found in this discount range.";
      const grid = document.getElementById("product-grid");
      if (grid && grid.parentNode) grid.parentNode.insertBefore(empty, grid);
    }
    empty.style.display = hasRange && shown === 0 ? "" : "none";

    // Highlight active chip
    document.querySelectorAll(".discount-banners a[data-range]").forEach((a) => {
      const [amin, amax] = (a.dataset.range || "").split("-").map((n) => parseInt(n, 10));
      if (hasRange && amin === min && amax === max) a.classList.add("active");
      else a.classList.remove("active");
    });

    // Update "product count" text gently (don’t touch ARIA or other elements)
    const desktop = document.getElementById("ProductCountDesktop");
    const mobile = document.getElementById("ProductCount");
    const msg = hasRange ? `Showing ${shown} products` : null;
    if (msg) {
      if (desktop) desktop.textContent = msg;
      if (mobile) mobile.textContent = msg;
    }
  }

  document.addEventListener("DOMContentLoaded", applyDiscountFilter);
  document.addEventListener("shopify:section:load", applyDiscountFilter);
})();
