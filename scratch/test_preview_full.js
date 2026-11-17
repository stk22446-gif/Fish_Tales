const fs = require('fs');
const assert = require('assert');

const scriptCode = fs.readFileSync('scratch/script_preview.js', 'utf8');

// Mock DOM
global.window = global;
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: (id) => {
    return {
      id,
      textContent: '',
      innerHTML: '',
      value: '',
      dataset: {},
      removeAttribute: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      style: {},
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      querySelectorAll: () => [],
      addEventListener: () => {}
    };
  }
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

eval(scriptCode);

console.log('Testing script_preview.js:');
assert.strictEqual(window.PRODUCTS.length, 32, 'Must have 32 products');

// Test Cappuccino
const cap = window.PRODUCTS.find(p => p.id === 'cubaris-sp-cappuccino');
assert(cap, 'Must find Cappuccino');
assert.strictEqual(cap.price, 600);
assert.strictEqual(cap.unit, 'piece');
assert.strictEqual(cap.minQuantity, 5);
assert.strictEqual(cap.featured, true);
assert.deepStrictEqual(cap.variants, []);

console.log('✓ Cappuccino validated');

// Test 20 fields for all 32 products
const REQUIRED_20_KEYS = [
  'id',
  'category',
  'categoryName',
  'subCategory',
  'name',
  'subtitle',
  'image',
  'images',
  'video',
  'description',
  'price',
  'unit',
  'minQuantity',
  'specs',
  'overview',
  'careRequirements',
  'habitatSetup',
  'didYouKnow',
  'variants',
  'featured'
];

window.PRODUCTS.forEach((p, idx) => {
  const keys = Object.keys(p);
  assert.strictEqual(keys.length, 20, `Product ${p.id} must have 20 keys, has ${keys.length}`);
  keys.forEach((k, i) => {
    assert.strictEqual(k, REQUIRED_20_KEYS[i], `Product ${p.id} key ${i} must be ${REQUIRED_20_KEYS[i]}, got ${k}`);
  });
});

console.log('✓ All 32 products have exact 20 keys in order!');
