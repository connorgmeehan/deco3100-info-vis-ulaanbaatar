import main from './js/main';
import styles from './style/main.scss';

document.addEventListener('DOMContentLoaded', () => {
  main();
});

if (module.hot) {
  module.hot.accept('./index.js', () => {

  })
}
