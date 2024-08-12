// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  transformIgnorePatterns: ["/node_modules/(?!oraidex-contracts-sdk|react-day-picker)"],
  
};
