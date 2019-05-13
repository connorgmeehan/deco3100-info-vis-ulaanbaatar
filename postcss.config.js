/* eslint-disable import/no-extraneous-dependencies */
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');


if (process.env.NODE_ENV === 'production') {
  module.exports = {
    plugins: [
      // More postCSS modules here if needed
      autoprefixer,
      cssnano,
    ],
  }
}
