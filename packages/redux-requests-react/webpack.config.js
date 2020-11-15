module.exports = {
  output: {
    library: 'ReduxRequestsReact',
    libraryTarget: 'umd',
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
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    redux: {
      commonjs: 'redux',
      commonjs2: 'redux',
      amd: 'redux',
      root: 'Redux',
    },
    'react-redux': {
      commonjs: 'react-redux',
      commonjs2: 'react-redux',
      amd: 'react-redux',
      root: 'ReactRedux',
    },
    '@redux-requests/core': {
      commonjs: '@redux-requests/core',
      commonjs2: '@redux-requests/core',
      amd: '@redux-requests/core',
      root: 'ReduxRequests',
    },
  },
  devtool: 'source-map',
};
