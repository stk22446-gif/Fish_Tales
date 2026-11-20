const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — TEST BETTA GENDER VARIANTS ===\n');

// 1. Setup minimal DOM mock
let capturedPdpHtml = '';
let capturedCartHtml = '';
let storage = {};

const mockDocument = {
  getElementById: (id) => {
    if (id === 'productDetailContent' || id === 'pdpMain') {
      return {
        set innerHTML(html) {
          capturedPdpHtml = html;
        },
        get innerHTML() {
          return capturedPdpHtml;
        }
      };
    }
    if (id === 'cartDrawerItems') {
      return {
        set innerHTML(html) {
          capturedCartHtml = html;
        },
        get innerHTML() {
          return capturedCartHtml;
        }
      };
    }
    if (id === 'cartDrawerSubtotal' || id === 'pdpQty' || id === 'pdpQtyTotal' || id === 'pdpUnitPrice' || id === 'pdpPriceUnit') {
      return { textContent: '', style: {} };
    }
    if (id === 'pdpAddToCartBtn' || id === 'pdpDirectWhatsAppBtn' || id === 'pdpQtyMinus' || id === 'pdpQtyPlus') {
      return { addEventListener: () => {} };
    }
    return null;
  },
  querySelectorAll: (selector) => {
    return [];
  },
  title: '',
  body: { classList: { add: () => {}, remove: () => {}, toggle: () => {} }, style: {} },
  addEventListener: () => {}
};

const mockLocalStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { storage = {}; }
};

global.window = {
  location: { search: '', pathname: '/product.html' },
  localStorage: mockLocalStorage,
  document: mockDocument,
  addEventListener: () => {},
  showToast: () => {},
  open: () => {}
};
global.document = mockDocument;
global.localStorage = mockLocalStorage;

// Load script.js
require('../script.js');

const PRODUCTS = window.PRODUCTS;
const CartManager = window.CartManager;
const isBettaProduct = window.isBettaProduct;
const initProductVariantsAndSpecs = window.initProductVariantsAndSpecs;

console.log('1. Verifying all Betta products in central catalogue:');
const bettaProducts = PRODUCTS.filter(p => p.subCategory === 'betta');
assert(bettaProducts.length >= 4, `Expected at least 4 Betta products, got ${bettaProducts.length}`);

bettaProducts.forEach(p => {
  // Check directly on raw product object BEFORE initProductVariantsAndSpecs
  assert(Array.isArray(p.variants) && p.variants.length === 2, `${p.name} must have its own variants array directly on raw object`);
  assert.strictEqual(p.variants[0].name, 'Male');
  assert.strictEqual(p.variants[0].price, 499);
  assert.strictEqual(p.variants[1].name, 'Female');
  assert.strictEqual(p.variants[1].price, 499);

  initProductVariantsAndSpecs(p);
  assert(isBettaProduct(p), `${p.name} must be detected as Betta product`);
  assert.strictEqual(p.price, 499, `${p.name} must be priced at ₹499`);
  assert.strictEqual(p.unit, 'piece', `${p.name} unit must be 'piece'`);
  console.log(`✓ ${p.name} (${p.id}): Stored directly in script.js with Male ₹499 & Female ₹499`);
});

console.log('\n2. Verifying PDP Gender Selection UI rendering:');
bettaProducts.forEach(p => {
  window.location.search = `?id=${p.id}`;
  window.renderProductDetailPage();
  assert(capturedPdpHtml.includes('pdp-gender-section'), `PDP for ${p.id} must include pdp-gender-section`);
  assert(capturedPdpHtml.includes('Male'), `PDP for ${p.id} must include Male option`);
  assert(capturedPdpHtml.includes('Female'), `PDP for ${p.id} must include Female option`);
  assert(capturedPdpHtml.includes('₹499'), `PDP for ${p.id} must display ₹499`);
  console.log(`✓ PDP for ${p.id}: Gender selector renders cleanly with Male and Female at ₹499`);
});

console.log('\n3. Verifying Cart Addition of Male & Female variants:');
CartManager.clear();
const testBetta = PRODUCTS.find(p => p.id === 'black-samurai-plakat-betta');
assert(testBetta, 'Must find black-samurai-plakat-betta');

// Add Male × 1
CartManager.add(testBetta, 1, 'Male');
let items = CartManager.getItems();
assert.strictEqual(items.length, 1);
assert.strictEqual(items[0].id, 'black-samurai-plakat-betta__male');
assert.strictEqual(items[0].name, 'Black Samurai Plakat Betta (Male)');
assert.strictEqual(items[0].gender, 'Male');
assert.strictEqual(items[0].price, 499);
assert.strictEqual(items[0].quantity, 1);
assert.strictEqual(CartManager.getTotal(), 499);
console.log('✓ Male × 1 added to cart: ₹499');

// Add Female × 2
CartManager.add(testBetta, 2, 'Female');
items = CartManager.getItems();
assert.strictEqual(items.length, 2, 'Male and Female must be distinct line items in cart');
assert.strictEqual(items[1].id, 'black-samurai-plakat-betta__female');
assert.strictEqual(items[1].name, 'Black Samurai Plakat Betta (Female)');
assert.strictEqual(items[1].gender, 'Female');
assert.strictEqual(items[1].price, 499);
assert.strictEqual(items[1].quantity, 2);
assert.strictEqual(CartManager.getTotal(), 1497, 'Subtotal must be 499 + 998 = 1,497');
console.log('✓ Female × 2 added to cart: ₹998 (Subtotal: ₹1,497 as specified in example)');

console.log('\n4. Verifying Cart Drawer rendering:');
CartManager.notify(items);
assert(capturedCartHtml.includes('Black Samurai Plakat Betta (Male)'), 'Cart drawer must show Male');
assert(capturedCartHtml.includes('Black Samurai Plakat Betta (Female)'), 'Cart drawer must show Female');
assert(capturedCartHtml.includes('₹499'), 'Cart drawer must show line prices');
assert(capturedCartHtml.includes('₹998'), 'Cart drawer must show line total ₹998');
console.log('✓ Cart Drawer displays separate line items with Gender and totals cleanly');

console.log('\n5. Verifying WhatsApp Order Message generation:');
const waSummary = CartManager.generateWhatsAppMessage();
assert(waSummary.includes('Black Samurai Plakat Betta (Male) – 1 pcs – ₹499'), 'WhatsApp message must include Male line');
assert(waSummary.includes('Black Samurai Plakat Betta (Female) – 2 pcs – ₹998'), 'WhatsApp message must include Female line');
assert(waSummary.includes('Subtotal: ₹1,497'), 'WhatsApp message must show Subtotal: ₹1,497');
console.log('✓ CartManager.generateWhatsAppMessage() format verified');

const detailedOrder = {
  orderId: 'FT-TEST-1234',
  date: '20-Nov-2026',
  time: '11:55 PM',
  items: items,
  subtotal: 1497,
  customer: {
    fullName: 'Test Customer',
    mobile: '9876543210',
    email: 'customer@example.com',
    address: '123 Green Aquatics',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001'
  }
};
const waDetailed = window.buildWhatsAppOrderMessage(detailedOrder);
assert(waDetailed.includes('Black Samurai Plakat Betta (Male) × 1 Pcs — ₹499'), 'Detailed WhatsApp order must include Male');
assert(waDetailed.includes('Black Samurai Plakat Betta (Female) × 2 Pcs — ₹998'), 'Detailed WhatsApp order must include Female');
assert(waDetailed.includes('Product Subtotal: ₹1,497'), 'Detailed WhatsApp order must show Product Subtotal: ₹1,497');
console.log('✓ buildWhatsAppOrderMessage() format verified with Gender variants');

console.log('\n6. Verifying non-Betta products remain completely unaffected:');
const guppy = PRODUCTS.find(p => p.id === 'red-lace-guppy');
assert.strictEqual(isBettaProduct(guppy), false);
assert.strictEqual(window.getProductQuantityLabel(guppy), 'Select Pair');

const isopod = PRODUCTS.find(p => p.id === 'armadillidium-gestroi');
assert.strictEqual(isBettaProduct(isopod), false);
assert.strictEqual(window.getProductQuantityLabel(isopod), 'Select Quantity');

console.log('✓ Guppies, Isopods, and other categories completely unaffected');

console.log('\n=== ALL BETTA GENDER VARIANT TESTS PASSED SUCCESSFULLY! ===');
