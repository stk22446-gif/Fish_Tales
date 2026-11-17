const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — ISOPODS MINIMUM ORDER QUANTITY TEST SUITE ===\n');

const scriptCode = fs.readFileSync('script.js', 'utf8');

// Mock DOM environment
let modalHtml = '';
let cartStorage = [];
let toasts = [];

const domMock = {
  window: {},
  document: {
    body: { dataset: { pageCategory: 'all' }, style: {} },
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
      if (id === 'modalQty') return domMock._modalQtyElement;
      if (id === 'modalQtyTotal') return domMock._modalQtyTotalElement;
      if (id === 'toastContainer') return { appendChild: (el) => { toasts.push(el); } };
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

domMock._modalQtyElement = { textContent: '1' };
domMock._modalQtyTotalElement = { textContent: '' };

const fn = new Function('window', 'document', 'localStorage', scriptCode);
fn(domMock.window, domMock.document, domMock.localStorage);

console.log('--- 1. Testing Modal Default Quantity & Display for Isopods ---');
// Cubaris Murina Glacier (Isopod, unit price ₹70)
domMock.window.openProductModal('cubaris-murina-glacier');
assert(modalHtml.includes('id="modalQty">5</span>'), 'Isopod modal must default quantity to 5');
assert(modalHtml.includes('id="modalQtyTotal">₹350</span>'), 'Isopod modal total must default to ₹350 (5 × ₹70)');
assert(modalHtml.includes('/ piece'), 'Isopod price unit displayed as / piece');
console.log('  ✓ Cubaris Murina Glacier defaults to quantity: 5, total: ₹350 (5 × ₹70)');

// Armadillidium Gestroi (Isopod, unit price ₹120)
domMock.window.openProductModal('armadillidium-gestroi');
assert(modalHtml.includes('id="modalQty">5</span>'), 'Isopod modal must default quantity to 5');
assert(modalHtml.includes('id="modalQtyTotal">₹600</span>'), 'Isopod modal total must default to ₹600 (5 × ₹120)');
console.log('  ✓ Armadillidium Gestroi defaults to quantity: 5, total: ₹600 (5 × ₹120)');

console.log('\n--- 2. Testing Modal Quantity Stepper Boundaries for Isopods ---');
// Simulate stepper with Glacier Isopod (unit price ₹70)
domMock._modalQtyElement.textContent = '5';
domMock._modalQtyTotalElement.textContent = '₹350';

// Attempt to decrease below 5
domMock.window.updateModalQty(-1, 'cubaris-murina-glacier');
assert.strictEqual(domMock._modalQtyElement.textContent, 5, 'Minus button cannot decrease below 5');
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹350', 'Total price remains ₹350');
console.log('  ✓ Minus button blocked from going below 5 (remains at 5, total ₹350)');

// Increase quantity to 6
domMock.window.updateModalQty(1, 'cubaris-murina-glacier');
assert.strictEqual(domMock._modalQtyElement.textContent, 6, 'Plus button increments to 6');
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹420', 'Total price updates to ₹420 (6 × ₹70)');
console.log('  ✓ Plus button increments to 6 (Total: ₹420)');

// Increase quantity to 10
domMock.window.updateModalQty(4, 'cubaris-murina-glacier');
assert.strictEqual(domMock._modalQtyElement.textContent, 10, 'Plus button increments to 10');
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹700', 'Total price updates to ₹700 (10 × ₹70)');
console.log('  ✓ Plus button increments to 10 (Total: ₹700)');

// Decrease back to 5
domMock.window.updateModalQty(-5, 'cubaris-murina-glacier');
assert.strictEqual(domMock._modalQtyElement.textContent, 5, 'Minus button decreases back to 5');
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹350', 'Total price updates to ₹350');
console.log('  ✓ Minus button decrements back to 5 (Total: ₹350)');

console.log('\n--- 3. Testing Other Categories Minimum Quantity (Must Remain 1) ---');
// Guppy (unit price ₹250)
domMock.window.openProductModal('guppy-red-lace');
assert(modalHtml.includes('id="modalQty">1</span>'), 'Guppy modal must default quantity to 1');
assert(modalHtml.includes('id="modalQtyTotal">₹250</span>'), 'Guppy modal total must default to ₹250');
domMock._modalQtyElement.textContent = '1';
domMock._modalQtyTotalElement.textContent = '₹250';
domMock.window.updateModalQty(-1, 'guppy-red-lace');
assert.strictEqual(domMock._modalQtyElement.textContent, 1, 'Guppy minimum is 1');
console.log('  ✓ Guppy Fish starts at 1, minimum remains 1');

// Golden Molly
domMock.window.openProductModal('molly-golden');
assert(modalHtml.includes('id="modalQty">1</span>'), 'Molly modal must default quantity to 1');
console.log('  ✓ Molly Fish starts at 1, minimum remains 1');

// Betta Fish
domMock.window.openProductModal('show-grade-betta');
assert(modalHtml.includes('id="modalQty">1</span>'), 'Betta modal must default quantity to 1');
console.log('  ✓ Betta Fish starts at 1, minimum remains 1');

// Shrimps
domMock.window.openProductModal('shrimp-crystal-red');
assert(modalHtml.includes('id="modalQty">1</span>'), 'Shrimp modal must default quantity to 1');
console.log('  ✓ Crystal Red Shrimp starts at 1, minimum remains 1');

// Tarantulas
domMock.window.openProductModal('chilean-rose-hair');
assert(modalHtml.includes('id="modalQty">1</span>'), 'Tarantula modal must default quantity to 1');
console.log('  ✓ Chilean Rose Hair Tarantula starts at 1, minimum remains 1');

// Combo Kits
domMock.window.openProductModal('isopod-house-kit');
assert(modalHtml.includes('id="modalQty">1</span>'), 'Combo kit modal must default quantity to 1');
console.log('  ✓ Isopod House Kit (Combo) starts at 1, minimum remains 1');

console.log('\n--- 4. Testing Cart Validation for Isopods ---');
cartStorage = [];

// Try to add Isopods with quantity 1 (e.g. bypassing modal or quick add)
domMock.window.addToCartById('cubaris-murina-glacier', 1);
assert.strictEqual(cartStorage.length, 1);
assert.strictEqual(cartStorage[0].baseId, 'cubaris-murina-glacier');
assert.strictEqual(cartStorage[0].quantity, 5, 'Cart automatically enforces minimum quantity 5 for Isopods');
assert.strictEqual(cartStorage[0].price, 70);
console.log('  ✓ Adding 1 isopod is automatically corrected to minimum 5 in cart');

// Try CartManager.update to reduce quantity below 5
domMock.window.CartManager.update(cartStorage[0].id, 4);
assert.strictEqual(cartStorage[0].quantity, 5, 'CartManager.update cannot reduce isopod quantity below 5');
domMock.window.CartManager.update(cartStorage[0].id, 1);
assert.strictEqual(cartStorage[0].quantity, 5, 'CartManager.update cannot reduce isopod quantity to 1');
console.log('  ✓ CartManager.update prevents isopod quantity from going below 5');

// Update to 8 pieces
domMock.window.CartManager.update(cartStorage[0].id, 8);
assert.strictEqual(cartStorage[0].quantity, 8, 'CartManager.update allows increasing to 8');
let total = cartStorage[0].price * cartStorage[0].quantity;
assert.strictEqual(total, 560, 'Line total calculated correctly: 8 × ₹70 = ₹560');
console.log('  ✓ Cart quantity increases normally to 8 (Line total: ₹560)');

// Test removing item entirely (qty = 0 removes item)
domMock.window.CartManager.update(cartStorage[0].id, 0);
assert.strictEqual(cartStorage.length, 0, 'Quantity 0 removes item normally');
console.log('  ✓ Quantity 0 removes item normally from cart');

console.log('\n--- 5. Testing Other Product Cart Quantities (Can be 1) ---');
domMock.window.addToCartById('guppy-red-lace', 1);
assert.strictEqual(cartStorage.length, 1);
assert.strictEqual(cartStorage[0].quantity, 1, 'Guppy fish allowed with quantity 1');

domMock.window.addToCartById('shrimp-crystal-red', 2);
assert.strictEqual(cartStorage.length, 2);
assert.strictEqual(cartStorage[1].quantity, 2, 'Shrimp allowed with quantity 2');
domMock.window.CartManager.update(cartStorage[1].id, 1);
assert.strictEqual(cartStorage[1].quantity, 1, 'Shrimp allowed to be updated to 1');
console.log('  ✓ Non-isopod products function normally with minimum quantity 1 in cart');

console.log('\n--- 6. Testing WhatsApp Modal Enquire for Isopods ---');
domMock.window.openProductModal('cubaris-murina-glacier');
domMock._modalQtyElement.textContent = '7'; // Customer selected 7
let openedUrl = '';
domMock.window.open = (url) => { openedUrl = url; };
domMock.window.directModalWhatsAppEnquire('cubaris-murina-glacier');

assert(openedUrl.includes('Quantity%3A%207') || decodeURIComponent(openedUrl).includes('Quantity: 7'), 'WhatsApp enquiry includes selected quantity 7');
assert(openedUrl.includes('Total%20Value%3A%20%E2%82%B9490') || decodeURIComponent(openedUrl).includes('Total Value: ₹490'), 'WhatsApp enquiry includes total ₹490 (7 × ₹70)');
console.log('  ✓ Direct WhatsApp enquire correctly reflects selected isopod quantity (7) and total (₹490)');

console.log('\n🎉 ALL ISOPODS MINIMUM ORDER QUANTITY TESTS PASSED WITH 100% SUCCESS!');
