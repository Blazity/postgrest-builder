const { resolve } = require("path");
const { isCI } = require("ci-info");

module.exports = {
  reporters: ["default"],
  haste: {
    enableSymlinks: true,
  },
  moduleNameMapper: {
    "^~/(.*)": `<rootDir>/src/$1`,
  },
  testEnvironment: "jsdom",
  testMatch: ["**/*.test.ts"],
  coverageProvider: "v8",
  reporters: ["default"],
  watchman: false,
  ci: true,
  transform: {
    ".tsx|ts$": ["ts-jest"],
  },
};
