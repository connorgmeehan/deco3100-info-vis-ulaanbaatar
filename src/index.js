
window.init = () => {
  console.log("Hello word");
}


if (module.hot) {
  module.hot.accept('./index.js', function() {

  })
}
  