// Setup file for Jest tests
import { connection } from 'mongoose';

// Mock console.error and console.warn to reduce test noise
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// Close mongoose connection after all tests
afterAll(async () => {
  await connection.close();
});

// Dummy test to avoid "must contain at least one test" error
describe('Setup', () => {
  it('should setup test environment', () => {
    expect(true).toBe(true);
  });
});