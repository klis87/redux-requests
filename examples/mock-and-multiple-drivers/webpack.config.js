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
      react: path.join(__dirname, '..', 'node_modules', 'react'),
      'react-redux': path.join(
        __dirname,
        '..',
        'node_modules',
        'react-redux',
        'es',
      ),
      '@redux-requests/core': path.join(
        __dirname,
        '..',
        '..',
        'packages',
        'redux-requests',
        'es',
      ),
      '@redux-requests/react': path.join(
        __dirname,
        '..',
        '..',
        'packages',
        'redux-requests-react',
        'es',
      ),
      '@redux-requests/axios': path.join(
        __dirname,
        '..',
        '..',
        'packages',
        'redux-requests-axios',
        'es',
      ),
      '@redux-requests/mock': path.join(
        __dirname,
        '..',
        '..',
        'packages',
        'redux-requests-mock',
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
  devtool: 'eval-source-map',
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
