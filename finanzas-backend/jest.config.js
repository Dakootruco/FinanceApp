export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEnv: [],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
