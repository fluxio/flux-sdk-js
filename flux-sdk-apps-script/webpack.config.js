'use strict';

const path = require('path');
const webpack = require('webpack');

const config = {
  env: process.env.NODE_ENV,
  debug: process.env.NODE_ENV !== 'production',
};

const webpackConfig = {
  debug: config.debug,
  devtool: 'sourcemap',
  output: {
    library: 'FluxSdk',
    libraryTarget: 'umd',
  },
  resolve: {
    fallback: path.join(__dirname, 'node_modules'),
  },
  resolveLoader: {
    fallback: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [{
      test: /\.js$/,
      include: [path.join(__dirname, 'src'), /node_modules\/(jws|jwa|qs)/],
      loaders: ['babel'],
    }, {
      test: /\.json$/,
      loader: 'json',
    }],
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(config.env),
    }),
  ],
};

if (!config.debug) {
  webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false,
    },
  }));
}

module.exports = webpackConfig;
