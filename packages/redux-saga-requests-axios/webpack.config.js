const webpack = require('webpack');

const DEBUG = process.env.NODE_ENV !== 'production';

module.exports = {
  output: {
    library: 'ReduxSagaRequestsAxios',
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
    axios: {
      commonjs: 'axios',
      commonjs2: 'axios',
      amd: 'axios',
      root: 'axios',
    },
  },
  devtool: 'source-map',
  plugins: [
    DEBUG
      ? new webpack.NamedModulesPlugin()
      : new webpack.HashedModuleIdsPlugin({
          hashFunction: 'sha256',
          hashDigest: 'hex',
          hashDigestLength: 20,
        }),
  ],
};
