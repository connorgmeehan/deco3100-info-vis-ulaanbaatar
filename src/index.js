import main from './js/main';

document.addEventListener('DOMContentLoaded', () => {
  main();
});

if (module.hot) {
  module.hot.accept('./index.js', () => {

  })
}
