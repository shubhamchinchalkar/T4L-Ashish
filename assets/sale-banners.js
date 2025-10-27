// sale-banners.js - small helper, safe to include
document.addEventListener('DOMContentLoaded', function () {
  // Preload banner images used in snippet to avoid FOIT
  var images = ['sale-25.png','sale-35.png','sale-50.png'];
  images.forEach(function(name){ 
    var img = new Image(); 
    img.src = Shopify ? (Shopify.routes.asset_url + name) : '/assets/' + name;
  });
});
