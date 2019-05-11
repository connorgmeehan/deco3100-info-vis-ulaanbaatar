import main from './js/main';

document.addEventListener("DOMContentLoaded", function(event) { 
  main();
});

if (module.hot) {
  module.hot.accept('./index.js', function() {

  })
}
  