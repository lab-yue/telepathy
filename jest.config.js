module.exports = {
  preset: 'ts-jest',
  bail: true,
  verbose: true,
  testTimeout: 10000,
  collectCoverageFrom: ['./src/*.{ts,tsx}', '!**/node_modules/**']
};
