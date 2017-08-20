const { resolve } = require('path');
const webpack = require('webpack');

module.exports = {
  context: __dirname,

  entry: './src/client/index.js',

  output: {
    filename: 'client.js',
    path: __dirname + '/build',
    publicPath: '/',
  },

  resolve: {
    modules: [resolve(__dirname, 'js'), 'node_modules'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],

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

};
