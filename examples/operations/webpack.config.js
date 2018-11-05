const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: './src',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      'redux-saga-requests': path.join(
        __dirname,
        '..',
        '..',
        'packages',
        'redux-saga-requests',
        'es',
      ),
      'redux-saga-requests-axios': path.join(
        __dirname,
        '..',
        '..',
        'packages',
        'redux-saga-requests-axios',
        'es',
      ),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  devtool: 'eval',
  devServer: {
    port: 3000,
    inline: true,
    hot: true,
    overlay: true,
  },
  mode: 'development',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, 'dist', 'index.html'),
      template: path.join(__dirname, 'src', 'index.html'),
    }),
  ],
};
