module.exports = {
  transform: {
    '^.+\\.jsx?$': './wrapper.js',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/packages/(?:.+?)/lib/',
  ],
};
