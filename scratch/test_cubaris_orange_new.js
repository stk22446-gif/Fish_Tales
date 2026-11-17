const fs = require('fs');
const assert = require('assert');

// Test with simulated DOM for Cubaris Murina Orange
const scriptCode = fs.readFileSync('script.js', 'utf8');

const vm = require('vm');
const sandbox = {
  window: {},
  document: { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: () => {} },
  location: { search: '' },
  navigator: { userAgent: '' }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

const product = sandbox.window.PRODUCTS.find(p => p.id === 'cubaris-murina-orange');
assert(product, 'Cubaris Murina Orange must exist');

console.log('Testing product structure for Cubaris Murina Orange:');
console.log('careRequirements keys:', Object.keys(product.careRequirements));
console.log('habitatSetup keys:', Object.keys(product.habitatSetup));
console.log('didYouKnow count:', product.didYouKnow.length);
console.log('specs keys:', Object.keys(product.specs));

assert.strictEqual(Object.keys(product.careRequirements).length, 6, 'Must have 6 care fields');
assert.strictEqual(Object.keys(product.habitatSetup).length, 4, 'Must have 4 habitat fields');
assert.strictEqual(product.didYouKnow.length, 2, 'Must have 2 didYouKnow points');
assert(product.overview.length > 0, 'Overview must not be empty');
assert(product.description.length > 0, 'Description must not be empty');
console.log('✓ Product data verification passed!');
