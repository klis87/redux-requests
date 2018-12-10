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
    '@redux-saga/delay-p': {
      commonjs: '@redux-saga/delay-p',
      commonjs2: '@redux-saga/delay-p',
      amd: '@redux-saga/delay-p',
    },
    'redux-saga/effects': {
      commonjs: 'redux-saga/effects',
      commonjs2: 'redux-saga/effects',
      amd: 'redux-saga/effects',
      root: 'ReduxSaga.effects',
    },
    'redux-saga': {
      commonjs: 'redux-saga',
      commonjs2: 'redux-saga',
      amd: 'redux-saga',
      root: 'ReduxSaga',
    },
  },
  devtool: 'source-map',
};
