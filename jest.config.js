// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js', 
    'services/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/Tests/**/*.test.js']
};