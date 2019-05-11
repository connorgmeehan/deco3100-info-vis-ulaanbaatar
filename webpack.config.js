// Imports: Dependencies
const path = require('path');
require('babel-register');

const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
// Webpack Configuration
const config = {

  // Entry
  entry: './src/index.js',
  // Output
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },
  // Loaders
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      // CSS Files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // SASS Files
      {
        test: /\.sass$/,
        use: ['style-loader', 'sass-loader'],
      },
    ],
  },

  // Dev Server
  devServer: {
    contentBase: './dist',
    hot: true,
    port: 8080,
  },

  // Plugins
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin([
      { from: 'src/index.html', to: 'index.html' },
      { from: 'src/public/', to: 'public/' },
    ]),
  ],


  // OPTIONAL
  // Reload On File Change
  watch: true,
  // Development Tools (Map Errors To Source File)
  devtool: 'source-map',
};
// Exports
module.exports = config;
