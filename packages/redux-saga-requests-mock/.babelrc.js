module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: process.env.BABEL_ENV === 'es' ? false : 'commonjs',
      },
    ],
  ],
  plugins: [
    process.env.BABEL_ENV === 'coverage' && 'istanbul',
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: false,
        regenerator: true,
      },
    ],
  ].filter(Boolean),
};
