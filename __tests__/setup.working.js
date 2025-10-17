// Simple working setup file for Jest tests
// Mock console.error and console.warn to reduce test noise
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// Dummy test to avoid "must contain at least one test" error
describe('Setup', () => {
  it('should setup test environment', () => {
    expect(true).toBe(true);
  });
});