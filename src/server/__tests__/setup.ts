// This will run before each test file
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock timers for all tests
jest.useFakeTimers();
