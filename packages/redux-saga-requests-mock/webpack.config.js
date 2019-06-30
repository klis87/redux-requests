module.exports = {
  output: {
    library: 'ReduxSagaRequestsMock',
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
