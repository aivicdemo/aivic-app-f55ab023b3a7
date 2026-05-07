// Global setup for Playwright tests
global.describe = (name, fn) => {
  // Simple describe implementation for Playwright
  fn();
};

module.exports = async () => {
  // Any global setup logic can go here
};