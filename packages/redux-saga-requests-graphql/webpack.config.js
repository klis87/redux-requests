module.exports = {
  output: {
    library: 'ReduxSagaRequestsGraphql',
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
  // devtool: 'source-map',
};
