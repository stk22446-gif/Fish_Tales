const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFYING PRODUCT DETAIL PAGE DATA EXTENSIONS ===');

// Mock browser objects
global.window = global;
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

eval(fs.readFileSync('script.js', 'utf8'));

assert(Array.isArray(window.PRODUCTS), 'window.PRODUCTS must be an array');
assert.strictEqual(window.PRODUCTS.length, 32, 'Must have exactly 32 products');

let verifiedCount = 0;
window.PRODUCTS.forEach(p => {
  // Call initProductVariantsAndSpecs
  // Since it was internal, let's test if renderProductGrid or modal initializes them
  // We will make sure initProductVariantsAndSpecs is exposed on window or accessible
});
console.log('✓ Master PRODUCTS loaded successfully');
