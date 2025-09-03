/** @type {import('jest').Config} */
module.exports = {
  silent: true,
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  roots: ["<rootDir>/src/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  setupFilesAfterEnv: [
    "<rootDir>/src/tests/setup.ts",
    "<rootDir>/src/tests/silenceLogs.ts",
  ],
};
