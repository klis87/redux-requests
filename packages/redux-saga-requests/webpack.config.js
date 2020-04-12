module.exports = {
  output: {
    library: 'ReduxSagaRequests',
    libraryTarget: 'umd',
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
  externals: {
    reselect: {
      commonjs: 'reselect',
      commonjs2: 'reselect',
      amd: 'reselect',
      root: 'Reselect',
    },
  },
  devtool: 'source-map',
};
