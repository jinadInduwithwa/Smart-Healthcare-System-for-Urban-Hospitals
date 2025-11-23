#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(__dirname);

// Define the test files
const testFiles = [
  '__tests__/controllers/appointments.controller.working.test.js',
  '__tests__/controllers/consultation.controller.working.test.js',
  '__tests__/controllers/payment.controller.working.test.js',
  '__tests__/controllers/report.controller.working.test.js'
];

// Run each test file
console.log('Running working tests...');
testFiles.forEach(testFile => {
  try {
    console.log(`\nRunning ${testFile}...`);
    execSync(`npx jest --config __tests__/jest.config.cjs ${testFile}`, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`Error running ${testFile}:`, error.message);
    process.exit(1);
  }
});

console.log('\nAll working tests completed successfully!');