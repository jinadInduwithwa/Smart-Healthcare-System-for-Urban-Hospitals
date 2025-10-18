# Report Controller Unit Tests

## Overview
This directory contains comprehensive unit tests for the Report Controller, which handles all admin report generation functionality in the Smart Healthcare System.

## Test Coverage

The test suite covers **5 main report generation endpoints** with **26 test cases**, achieving **100% code coverage** of the report controller:

### 1. Doctor Availability Report (`getDoctorAvailabilityReport`)
Tests the generation of reports showing doctor availability slots.

**Test Cases:**
- ✅ Returns doctor availability report with specified date range
- ✅ Returns doctor availability report with default date range (last 30 days) when no dates provided
- ✅ Returns empty array when no available slots are found
- ✅ Handles database errors gracefully

**What it tests:**
- Proper aggregation of availability data from doctors and users
- Date range filtering (both custom and default)
- Cache control headers
- Error handling and logging

---

### 2. Patient Check-In Report (`getPatientCheckInReport`)
Tests the generation of monthly patient check-in statistics.

**Test Cases:**
- ✅ Returns patient check-in report successfully with aggregated data
- ✅ Fills in zero values for months with no check-in data
- ✅ Returns error when startDate and endDate are missing
- ✅ Returns error for invalid date format
- ✅ Handles database errors gracefully

**What it tests:**
- Monthly aggregation of patient data
- Data gap filling (months with no data show zero visits)
- Input validation (required parameters and date format)
- Error responses with proper status codes

---

### 3. Financial Report (`getFinancialReport`)
Tests comprehensive financial reporting including revenue, transactions, payment methods, and top doctors.

**Test Cases:**
- ✅ Returns comprehensive financial report with all data sections
- ✅ Handles empty payment data gracefully (returns zeros)
- ✅ Returns error when startDate and endDate are missing
- ✅ Returns error for invalid date format
- ✅ Handles database errors gracefully

**What it tests:**
- Multiple aggregation pipelines (payment data, summary stats, payment methods, top doctors)
- Calculation of net revenue (total revenue - refunded amount)
- Data completeness for all months in range
- Proper handling of multiple payment statuses (PAID, PENDING, REFUNDED, etc.)

---

### 4. Overview Statistics (`getOverviewStats`)
Tests the dashboard overview statistics showing key metrics.

**Test Cases:**
- ✅ Returns comprehensive overview statistics successfully
- ✅ Handles zero revenue gracefully
- ✅ Uses custom date range when provided
- ✅ Handles errors gracefully

**What it tests:**
- Counting of patients, doctors, appointments, and available slots
- Revenue aggregation from payments
- Date formatting for display
- Optional date range filtering

---

### 5. Payment Dashboard (`getPaymentDashboard`)
Tests real-time payment dashboard with today, monthly, yearly, and pending payment data.

**Test Cases:**
- ✅ Returns payment dashboard data successfully
- ✅ Returns zero values when no data is found
- ✅ Handles partial data correctly (some periods have data, others don't)
- ✅ Handles errors gracefully

**What it tests:**
- Multiple time-based aggregations (today, month, year)
- Pending payment calculations
- Default value handling (returns zeros instead of null)

---

### 6. Cache Control Headers
**Test Cases:**
- ✅ Sets proper cache control headers for all report endpoints

**What it tests:**
- All endpoints set `Cache-Control: no-cache, no-store, must-revalidate`
- All endpoints set `Pragma: no-cache`
- All endpoints set `Expires: 0`
- Prevents 304 Not Modified responses for fresh data on every request

---

### 7. Edge Cases and Error Handling
**Test Cases:**
- ✅ Handles very large date ranges (12+ months)
- ✅ Handles single day date range
- ✅ Handles null or undefined values in query parameters

**What it tests:**
- Robustness with various date range sizes
- Edge cases in month generation logic
- Proper validation of null/undefined inputs

---

## Running the Tests

### Run all tests with coverage:
```bash
npm test
```

### Run only report controller tests:
```bash
npm test -- Tests/report.controller.test.js
```

### Run with custom timeout (useful for debugging):
```bash
npm test -- Tests/report.controller.test.js --testTimeout=10000
```

### Run in watch mode:
```bash
npm test -- --watch Tests/report.controller.test.js
```

---

## Test Structure

### Mock Setup
The tests use Jest's `unstable_mockModule` to mock:
- **Models**: `Appointment`, `Availability`, `Doctor`, `Patient`, `Payment`
- **Logger**: Winston logger for info and error logging

### Test Pattern
Each test follows the **Arrange-Act-Assert** pattern:
```javascript
it('should do something', async () => {
  // Arrange (Setup)
  mockReq.query = { startDate: '2024-01-01', endDate: '2024-01-31' };
  mockModel.aggregate.mockResolvedValue(mockData);

  // Act (Execute)
  await ReportController.method(mockReq, mockRes);

  // Assert (Verify)
  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
});
```

---

## Coverage Report

After running tests, view the coverage report:

### Terminal Output
The test output shows coverage percentages for:
- Statements
- Branches
- Functions
- Lines

### HTML Report
Open `coverage/lcov-report/index.html` in a browser for detailed visual coverage:
```bash
open coverage/lcov-report/index.html
```

---

## Key Testing Concepts Applied

### 1. **Unit Testing**
- Tests individual controller methods in isolation
- Mocks all external dependencies (database models, logger)
- Focuses on business logic, not implementation details

### 2. **Positive & Negative Testing**
- **Positive**: Tests with valid inputs and expected success scenarios
- **Negative**: Tests with invalid inputs, missing parameters, and error conditions

### 3. **Boundary Testing**
- Tests edge cases like empty arrays, zero values, null inputs
- Tests date range boundaries (single day, 12+ months)

### 4. **Error Handling**
- Verifies proper error messages and status codes
- Ensures errors are logged correctly
- Tests database failure scenarios

### 5. **Integration Points**
- Verifies response structure matches API contract
- Tests that all required fields are present in responses
- Validates data transformations and calculations

---

## Best Practices Followed

✅ **Descriptive test names** - Each test clearly states what it tests  
✅ **Isolated tests** - Each test is independent and can run in any order  
✅ **Mock reset** - `beforeEach` clears all mocks to prevent test pollution  
✅ **Comprehensive coverage** - Tests success, failure, and edge cases  
✅ **Async/await** - Proper handling of asynchronous controller methods  
✅ **Type checking** - Uses `expect.any(Object)` for dynamic data like timestamps  
✅ **Meaningful assertions** - Checks specific values, not just existence  

---

## Extending the Tests

To add new test cases:

1. **Add a new describe block** for a new method:
```javascript
describe('newReportMethod', () => {
  it('should handle new scenario', async () => {
    // Test implementation
  });
});
```

2. **Add a new test case** to existing method:
```javascript
it('should handle specific edge case', async () => {
  // Setup
  // Execute
  // Assert
});
```

3. **Update mock data** as needed for your scenario

---

## Common Issues & Solutions

### Issue: Tests timeout
**Solution**: Increase timeout with `--testTimeout=10000`

### Issue: Mocks not working
**Solution**: Ensure mocks are defined before importing the controller

### Issue: Coverage not 100%
**Solution**: Check uncovered lines in coverage report and add tests for those scenarios

---

## Dependencies

- **Jest**: Testing framework
- **@jest/globals**: Jest globals for ES modules
- **Node --experimental-vm-modules**: Required for ES module mocking

---

## Contributing

When adding new features to the report controller:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain 100% code coverage
4. Follow existing test patterns
5. Update this README if adding new test categories

---

## Summary

This test suite provides **comprehensive coverage** of the admin report generation functionality, ensuring:
- ✅ All endpoints work correctly with valid inputs
- ✅ Proper error handling for invalid inputs
- ✅ Database errors are handled gracefully
- ✅ Cache headers prevent stale data
- ✅ Edge cases are covered
- ✅ Logging works correctly for debugging

**Total: 26 test cases covering 5 report endpoints with 100% code coverage**
