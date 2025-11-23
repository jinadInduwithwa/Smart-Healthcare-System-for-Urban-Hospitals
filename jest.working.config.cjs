module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.working.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.working.js'],
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.working.config.cjs' }]
  }
};