// Imports: Dependencies
const path = require('path');
require('babel-register');

const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const sass = require('sass');

// Webpack Configuration
const config = {

  // Entry
  entry: './src/index.js',
  // Output
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
  },

  // Plugins
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyPlugin([
      { from: 'src/index.html', to: 'index.html' },
      { from: 'src/public/', to: 'public/' },
    ]),
    new MiniCssExtractPlugin({
      filename: './style.css',
    }),
  ],

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
      // SASS Files
      {
        test: [/.css$|.scss$/],
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              implementation: sass,
            },
          },
        ],
      },
    ],
  },

  // Dev Server
  devServer: {
    contentBase: './dist',
    hot: process.env.NODE_ENV !== 'production' || process.env.NODE_ENV !== 'staging',
    port: 8080,
  },
  // Development Tools (Map Errors To Source File)
  devtool: 'source-map',
};
// Exports
module.exports = config;
