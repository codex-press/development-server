const { resolve } = require('path');
const webpack = require('webpack');

module.exports = {

  context: __dirname,

  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8001',
    'webpack/hot/only-dev-server',
    './src/client/index.js',
  ],

  output: {
    filename: 'main.js',
    path: resolve(__dirname, 'build'),
    publicPath: 'http://localhost:8001/',
    pathinfo: true,
  },

  resolve: {
    modules: [resolve(__dirname, 'js'), 'node_modules'],
  },

  // devtool: 'inline-source-map',
  devtool: 'cheap-module-eval-source-map',

  devServer: {
    port: 8001,
    hot: true,
    contentBase: __dirname + '/src/client',
    publicPath: '/',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    }
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        use: [ 'babel-loader', ],
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
            options: { attrs: { class: 'webpack-styles' } },
          },
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              strictMath: true,
              strictUnits: true,
            }
          },
        ]
      }
    ],
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],

};
