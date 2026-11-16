const fs = require('fs');
const assert = require('assert');

const scriptCode = fs.readFileSync('script.js', 'utf8');

// Mock DOM
let modalHtml = '';
let cartStorage = [];

const domMock = {
  window: {},
  document: {
    body: { dataset: { pageCategory: 'aquarium' }, style: {} },
    createElement: () => ({ className: '', innerHTML: '', classList: { add: () => {} }, appendChild: () => {}, remove: () => {} }),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: (id) => {
      if (id === 'productModal') return { classList: { add: () => {}, remove: () => {} } };
      if (id === 'modalContent') {
        return {
          set innerHTML(html) { modalHtml = html; },
          get innerHTML() { return modalHtml; }
        };
      }
      return {
        textContent: '',
        innerHTML: '',
        value: '',
        dataset: {},
        removeAttribute: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
        querySelectorAll: () => [],
        appendChild: () => {},
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        addEventListener: () => {}
      };
    },
    addEventListener: () => {}
  },
  localStorage: {
    getItem: () => JSON.stringify(cartStorage),
    setItem: (key, val) => { cartStorage = JSON.parse(val); }
  }
};

const fn = new Function('window', 'document', 'localStorage', scriptCode);
fn(domMock.window, domMock.document, domMock.localStorage);

console.log('Testing Golden Molly Modal & Cart:');
domMock.window.openProductModal('molly-golden');
assert(modalHtml.includes('Golden Molly'), 'Modal must contain Golden Molly');
assert(modalHtml.includes('Poecilia sphenops var. Golden'), 'Modal must contain Golden Molly subtitle');
assert(modalHtml.includes('Gold_Molly_1.jpg'), 'Modal must use verified photograph');
console.log('  ✓ Golden Molly modal rendered correctly');

domMock.window.addCardVariantToCart('molly-golden');
assert.strictEqual(cartStorage.length, 1);
assert.strictEqual(cartStorage[0].name, 'Golden Molly');
assert.strictEqual(cartStorage[0].price, 180);
console.log('  ✓ Added Golden Molly to cart at ₹180');

console.log('\nTesting Crystal Red Shrimp Modal & Cart:');
domMock.window.openProductModal('shrimp-crystal-red');
assert(modalHtml.includes('Crystal Red Shrimp'), 'Modal must contain Crystal Red Shrimp');
assert(modalHtml.includes('Caridina cf. cantonensis var. Crystal Red'), 'Modal must contain Crystal Red Shrimp subtitle');
assert(modalHtml.includes('Caridina-cf-cantonensis-crystal-red.jpg'), 'Modal must use verified photograph');
console.log('  ✓ Crystal Red Shrimp modal rendered correctly');

domMock.window.addCardVariantToCart('shrimp-crystal-red');
assert.strictEqual(cartStorage.length, 2);
assert.strictEqual(cartStorage[1].name, 'Crystal Red Shrimp');
assert.strictEqual(cartStorage[1].price, 150);
console.log('  ✓ Added Crystal Red Shrimp to cart at ₹150');

console.log('\n🎉 ALL MOLLY & SHRIMP TESTS PASSED WITH 100% SUCCESS!');
