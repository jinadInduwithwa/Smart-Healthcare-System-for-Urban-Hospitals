# Testing Documentation

## Backend Testing

### Running Tests

To run the backend tests, navigate to the root directory of the project and run:

```bash
pnpm test
```

This will run all tests and generate a coverage report.

To run tests in watch mode (useful during development):

```bash
pnpm test --watch
```

To run tests with coverage:

```bash
pnpm test --coverage
```

### Test Structure

The tests are organized in the `__tests__` directory:

- `__tests__/controllers/` - Controller tests
- `__tests__/services/` - Service tests
- `__tests__/models/` - Model tests

### Writing Tests

Tests are written using Jest. Each test file should:

1. Mock any external dependencies
2. Test both success and error cases
3. Use descriptive test names
4. Follow the AAA pattern (Arrange, Act, Assert)

### Example Test

```javascript
describe('Controller Function', () => {
  it('should return expected result', async () => {
    // Arrange
    const mockData = { /* mock data */ };
    service.mockImplementation(() => mockData);
    
    // Act
    await controllerFunction(req, res, next);
    
    // Assert
    expect(res.json).toHaveBeenCalledWith({ data: mockData });
  });
});
```

## Frontend Testing

### Running Tests

To run the frontend tests, navigate to the Client directory and run:

```bash
cd Client
pnpm test
```

## Test Coverage

The project aims for comprehensive test coverage. Currently, the backend has tests for:

- Appointments controller
- All controller methods
- Success and error cases
- Edge cases and validation

The coverage report will show which lines are covered by tests and which are not.