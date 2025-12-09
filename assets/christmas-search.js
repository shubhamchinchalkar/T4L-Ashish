// assets/christmas-search.js
document.addEventListener('DOMContentLoaded', function(){
  var wrapper = document.querySelector('.xmas-search');
  if(!wrapper) return;
  var input = wrapper.querySelector('input[type="search"], input[type="text"]');
  if(!input) return;

  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      var form = input.closest('form');
      if(form) form.submit();
    }
  });
});
