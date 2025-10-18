# Quick Test Reference Guide

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Run only report tests
npm test -- Tests/report.controller.test.js

# View coverage report
open coverage/lcov-report/index.html
```

## 📊 Test Results Summary

```
✅ 26/26 tests passing
✅ 100% code coverage of report.controller.js
✅ All 5 report endpoints tested
```

## 🧪 What's Tested

| Endpoint | Method | Tests | Status |
|----------|--------|-------|--------|
| `/api/reports/doctor-availability` | `getDoctorAvailabilityReport` | 4 | ✅ Pass |
| `/api/reports/patient-check-ins` | `getPatientCheckInReport` | 5 | ✅ Pass |
| `/api/reports/financial` | `getFinancialReport` | 5 | ✅ Pass |
| `/api/reports/overview` | `getOverviewStats` | 4 | ✅ Pass |
| `/api/reports/payment-dashboard` | `getPaymentDashboard` | 4 | ✅ Pass |
| Cache Headers | All methods | 1 | ✅ Pass |
| Edge Cases | Various | 3 | ✅ Pass |

## 🎯 Test Categories

### ✅ Success Scenarios
- Valid date ranges
- Default parameters
- Empty result sets
- Multiple data aggregations

### ❌ Error Scenarios
- Missing required parameters
- Invalid date formats
- Database errors
- Null/undefined values

### 🔧 Edge Cases
- Large date ranges (12+ months)
- Single day ranges
- Zero revenue/transactions
- Partial data availability

## 📝 Test Examples

### Example 1: Testing Success Response
```javascript
it('should return doctor availability report with date range', async () => {
  mockReq.query = { startDate: '2024-01-01', endDate: '2024-01-31' };
  mockAvailability.aggregate.mockResolvedValue(mockData);
  
  await ReportController.getDoctorAvailabilityReport(mockReq, mockRes);
  
  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalledWith({
    status: "success",
    data: { availableSlots: mockData }
  });
});
```

### Example 2: Testing Error Handling
```javascript
it('should return error when dates are missing', async () => {
  mockReq.query = {}; // No dates provided
  
  await ReportController.getPatientCheckInReport(mockReq, mockRes);
  
  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({
    status: "error",
    message: "startDate and endDate are required"
  });
});
```

### Example 3: Testing Database Errors
```javascript
it('should handle database errors gracefully', async () => {
  const error = new Error('Database connection failed');
  mockPayment.aggregate.mockRejectedValue(error);
  
  await ReportController.getFinancialReport(mockReq, mockRes);
  
  expect(mockLogger.error).toHaveBeenCalled();
  expect(mockRes.status).toHaveBeenCalledWith(500);
});
```

## 🔍 Debugging Tests

### View detailed test output:
```bash
npm test -- --verbose
```

### Run a specific test:
```bash
npm test -- Tests/report.controller.test.js -t "should return doctor availability"
```

### Run in watch mode:
```bash
npm test -- --watch
```

## 📈 Coverage Metrics

Current coverage for `report.controller.js`:
- **Statements**: 100%
- **Branches**: 97.61%
- **Functions**: 100%
- **Lines**: 100%

## 🛠️ Useful Commands

```bash
# Run tests with coverage
npm test

# Run tests without coverage (faster)
npm test -- --coverage=false

# Generate coverage report only
npm test -- --coverage --collectCoverageFrom='controllers/report.controller.js'

# Clear Jest cache
npx jest --clearCache
```

## 📚 Related Files

- **Test File**: `/Tests/report.controller.test.js`
- **Controller**: `/controllers/report.controller.js`
- **Routes**: `/routes/report.routes.js`
- **Jest Config**: `/jest.config.js`
- **Coverage Report**: `/coverage/lcov-report/index.html`

## 💡 Tips

1. **Always run tests before committing** - Ensure no regressions
2. **Check coverage report** - Identify untested code paths
3. **Write tests first (TDD)** - Define expected behavior before implementation
4. **Keep tests fast** - Use mocks instead of real database calls
5. **Test one thing per test** - Makes failures easier to debug

## 🐛 Common Errors & Fixes

### Error: "Cannot find module"
```bash
# Solution: Clear cache and reinstall
npx jest --clearCache
npm install
```

### Error: "Timeout exceeded"
```bash
# Solution: Increase timeout
npm test -- --testTimeout=10000
```

### Error: "Mock not working"
```bash
# Solution: Ensure mocks are defined before imports
# Check that jest.clearAllMocks() is in beforeEach
```

## ✨ Next Steps

1. ✅ All report tests passing
2. 🎯 Maintain 100% coverage
3. 📝 Add integration tests (optional)
4. 🔄 Add E2E tests with real database (optional)

---

**Need help?** Check the full documentation in `/Tests/README.md`
