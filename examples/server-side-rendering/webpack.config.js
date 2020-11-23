const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [
  {
    name: 'client',
    context: __dirname,
    entry: ['webpack-hot-middleware/client?reload=true', './src/client'],
    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'dist'),
      publicPath: '/',
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
      ],
    },
    devtool: 'eval-source-map',
    mode: 'development',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        filename: path.join(__dirname, 'dist', 'index.hbs'),
        template: path.join(__dirname, 'src', 'index.hbs'),
      }),
    ],
  },
  {
    name: 'server',
    context: __dirname,
    target: 'node',
    entry: './src/app-middleware',
    output: {
      filename: 'server.js',
      path: path.join(__dirname, 'dist'),
      publicPath: '/static/',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [path.join(__dirname, 'src')],
          loader: 'babel-loader',
        },
      ],
    },
    externals: [
      nodeExternals(),
      nodeExternals({
        modulesDir: path.resolve(__dirname, '../node_modules'),
      }),
    ],
    devtool: 'eval-source-map',
    mode: 'development',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('dev'),
      }),
    ],
  },
];
