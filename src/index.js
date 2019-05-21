import main from './js/main';
// eslint-disable-next-line no-unused-vars
import styles from './style/main.scss';

document.addEventListener('DOMContentLoaded', () => {
  main();
});

if (module.hot) {
  module.hot.accept('./index.js', () => {

  })
}
