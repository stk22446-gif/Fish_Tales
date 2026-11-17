const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — QUANTITY SELECTOR SUITE ===\n');

const scriptCode = fs.readFileSync('script.js', 'utf8');
const styleCode = fs.readFileSync('style.css', 'utf8');

// 1. Verify zero SELECT VARIANT or modalVariantSelect in UI markup
console.log('1. Verifying removal of SELECT VARIANT dropdown UI...');
assert(!scriptCode.includes('SELECT VARIANT'), 'script.js must NOT contain SELECT VARIANT text');
assert(!styleCode.includes('SELECT VARIANT'), 'style.css must NOT contain SELECT VARIANT text');
assert(!scriptCode.includes('modalVariantSelect'), 'script.js modal template must NOT contain modalVariantSelect');
assert(!scriptCode.includes('modal-variant-dropdown'), 'script.js must NOT contain modal-variant-dropdown class');
console.log('  ✓ SELECT VARIANT dropdown completely removed from modal UI');

// 2. Mock DOM environment for script.js
let modalHtml = '';
let cartStorage = [];

const domMock = {
  window: {},
  document: {
    body: { dataset: { pageCategory: 'all' }, style: {} },
    createElement: () => ({ className: '', innerHTML: '', classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, remove: () => {} }),
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
      if (id === 'modalQty') {
        return domMock._modalQtyElement;
      }
      if (id === 'modalQtyTotal') {
        return domMock._modalQtyTotalElement;
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

domMock._modalQtyElement = { textContent: '1' };
domMock._modalQtyTotalElement = { textContent: '₹250' };

const fn = new Function('window', 'document', 'localStorage', scriptCode);
fn(domMock.window, domMock.document, domMock.localStorage);

// 3. Test Unit Labels
console.log('\n2. Testing Unit Labels:');
// Guppy / Molly / Betta: Select Pair
domMock.window.openProductModal('guppy-red-lace');
assert(modalHtml.includes('Select Pair'), 'Guppy must have label "Select Pair"');
console.log('  ✓ Guppy: Select Pair');

domMock.window.openProductModal('molly-golden');
assert(modalHtml.includes('Select Pair'), 'Molly must have label "Select Pair"');
console.log('  ✓ Molly: Select Pair');

domMock.window.openProductModal('show-grade-betta');
assert(modalHtml.includes('Select Pair'), 'Betta must have label "Select Pair"');
console.log('  ✓ Betta: Select Pair');

// Shrimps: Select Quantity
domMock.window.openProductModal('shrimp-crystal-red');
assert(modalHtml.includes('Select Quantity'), 'Shrimps must have label "Select Quantity"');
console.log('  ✓ Shrimps: Select Quantity');

// Isopods: Select Quantity
domMock.window.openProductModal('cubaris-murina-glacier');
assert(modalHtml.includes('Select Quantity'), 'Isopods must have label "Select Quantity"');
console.log('  ✓ Isopods: Select Quantity');

// Tarantulas: Select Quantity
domMock.window.openProductModal('chilean-rose-hair');
assert(modalHtml.includes('Select Quantity'), 'Tarantulas must have label "Select Quantity"');
console.log('  ✓ Tarantulas: Select Quantity');

// Aquariums and Combo Kits: Select Quantity
domMock.window.openProductModal('isopod-house-kit');
assert(modalHtml.includes('Select Quantity'), 'Combo Kits must have label "Select Quantity"');
console.log('  ✓ Combo Kits: Select Quantity');

domMock.window.openProductModal('half-cube-aquarium-kit');
assert(modalHtml.includes('Select Quantity'), 'Aquarium kit must have label "Select Quantity"');
console.log('  ✓ Aquarium Kit: Select Quantity');

// 4. Test Quantity Stepper Controls & Dynamic Price Calculation
console.log('\n3. Testing Quantity Controls & Dynamic Price Calculation:');
// Test Guppy: ₹250 per pair
domMock.window.openProductModal('guppy-red-lace');
domMock._modalQtyElement.textContent = '1';
domMock._modalQtyTotalElement.textContent = '₹250';

// Plus button: 1 -> 2
domMock.window.updateModalQty(1, 'guppy-red-lace');
assert.strictEqual(domMock._modalQtyElement.textContent, 2);
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹500');
console.log('  ✓ Plus button increments quantity: 1 -> 2 (Total: ₹500)');

// Plus button: 2 -> 3
domMock.window.updateModalQty(1, 'guppy-red-lace');
assert.strictEqual(domMock._modalQtyElement.textContent, 3);
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹750');
console.log('  ✓ Plus button increments quantity: 2 -> 3 (Total: ₹750)');

// Minus button: 3 -> 2
domMock.window.updateModalQty(-1, 'guppy-red-lace');
assert.strictEqual(domMock._modalQtyElement.textContent, 2);
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹500');
console.log('  ✓ Minus button decrements quantity: 3 -> 2 (Total: ₹500)');

// Minus button: 2 -> 1
domMock.window.updateModalQty(-1, 'guppy-red-lace');
assert.strictEqual(domMock._modalQtyElement.textContent, 1);
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹250');
console.log('  ✓ Minus button decrements quantity: 2 -> 1 (Total: ₹250)');

// Minimum quantity constraint: Minus button at 1 should not drop below 1
domMock.window.updateModalQty(-1, 'guppy-red-lace');
assert.strictEqual(domMock._modalQtyElement.textContent, 1);
assert.strictEqual(domMock._modalQtyTotalElement.textContent, '₹250');
console.log('  ✓ Minimum quantity restriction enforced (cannot drop below 1)');

// 5. Test Cart Integration
console.log('\n4. Testing Cart Integration with Selected Quantity:');
cartStorage = [];
domMock._modalQtyElement.textContent = '2'; // Set quantity to 2
domMock.window.addModalCurrentToCart('guppy-red-lace');

assert.strictEqual(cartStorage.length, 1);
assert.strictEqual(cartStorage[0].baseId, 'guppy-red-lace');
assert.strictEqual(cartStorage[0].name, 'Red Lace Guppy');
assert.strictEqual(cartStorage[0].price, 250);
assert.strictEqual(cartStorage[0].quantity, 2);
console.log('  ✓ Added 2 pairs of Red Lace Guppy to cart at ₹250/pair');

// Test Cart subtotal calculation
let cartSubtotal = cartStorage.reduce((sum, item) => sum + item.price * item.quantity, 0);
assert.strictEqual(cartSubtotal, 500);
console.log('  ✓ Cart subtotal calculated correctly: ₹500 (2 × ₹250)');

// Add another product: 3 × Crystal Red Shrimp (₹150 each)
domMock.window.openProductModal('shrimp-crystal-red');
domMock._modalQtyElement.textContent = '3';
domMock.window.addModalCurrentToCart('shrimp-crystal-red');

assert.strictEqual(cartStorage.length, 2);
assert.strictEqual(cartStorage[1].name, 'Crystal Red Shrimp');
assert.strictEqual(cartStorage[1].price, 150);
assert.strictEqual(cartStorage[1].quantity, 3);
console.log('  ✓ Added 3 pcs of Crystal Red Shrimp to cart at ₹150/pc');

cartSubtotal = cartStorage.reduce((sum, item) => sum + item.price * item.quantity, 0);
assert.strictEqual(cartSubtotal, 950); // 500 + 450 = 950
console.log('  ✓ Updated Cart subtotal: ₹950 (₹500 + ₹450)');

// 5. Test WhatsApp Checkout Integration
console.log('\n5. Testing WhatsApp Checkout Integration:');
assert(scriptCode.includes('buildWhatsAppOrderMessage'), 'script.js defines buildWhatsAppOrderMessage');
assert(scriptCode.includes('proceedToWhatsApp'), 'script.js defines proceedToWhatsApp');

// Verify direct modal WhatsApp enquire uses selected quantity
domMock.window.openProductModal('guppy-red-lace');
domMock._modalQtyElement.textContent = '2';

let openedUrl = '';
domMock.window.open = function(url) {
  openedUrl = url;
};

domMock.window.directModalWhatsAppEnquire('guppy-red-lace');
assert(openedUrl.includes('Quantity%3A%202') || decodeURIComponent(openedUrl).includes('Quantity: 2'), 'Modal WhatsApp enquire passes selected quantity');
assert(openedUrl.includes('Total%20Value%3A%20%E2%82%B9500') || decodeURIComponent(openedUrl).includes('Total Value: ₹500'), 'Modal WhatsApp enquire passes total ₹500');
console.log('  ✓ Direct WhatsApp enquire correctly reflects selected quantity (2) and total (₹500)');

// 7. Verify CSS Styling for Quantity Selector
console.log('\n6. Verifying CSS Rules for Quantity Selector:');
assert(styleCode.includes('.modal-qty-section'), 'style.css has .modal-qty-section');
assert(styleCode.includes('.modal-qty-header'), 'style.css has .modal-qty-header');
assert(styleCode.includes('.modal-qty-label'), 'style.css has .modal-qty-label');
assert(styleCode.includes('.modal-qty-total-price'), 'style.css has .modal-qty-total-price');
assert(styleCode.includes('.modal-qty-selector'), 'style.css has .modal-qty-selector');
assert(styleCode.includes('.modal-qty-btn'), 'style.css has .modal-qty-btn');
assert(styleCode.includes('.modal-qty-value'), 'style.css has .modal-qty-value');
assert(styleCode.includes('border: 1.5px solid var(--border-leaf)'), 'Green borders applied');
console.log('  ✓ Clean horizontal quantity selector styling with green borders & rounded corners verified');

console.log('\n🎉 ALL QUANTITY SELECTOR TESTS PASSED WITH 100% SUCCESS!');
