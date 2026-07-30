module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    './test/setup.js'
  ],
  setupFilesAfterEnv: ['./test/setup.js'],
  testTimeout: 15000,
};