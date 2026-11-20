const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('Testing Automatic Cart Clearing After Successful Order...');

const scriptCode = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf-8');

// Set up mock DOM and browser environment
const storage = {};
const mockLocalStorage = {
  getItem: (key) => (key in storage ? storage[key] : null),
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

class MockElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    const classes = new Set();
    this.classList = {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c)
    };
    this.children = [];
    this._innerHTML = '';
    this._textContent = '';
    this.style = {};
    this.dataset = {};
    this.value = '';
    this.disabled = false;
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) {
    this._innerHTML = val;
    this._textContent = val.replace(/<[^>]+>/g, '');
  }
  get textContent() { return this._textContent; }
  set textContent(val) {
    this._textContent = String(val);
    this._innerHTML = String(val);
  }
  focus() {}
  setAttribute(k, v) { this[k] = v; }
  getAttribute(k) { return this[k]; }
  removeAttribute(k) { delete this[k]; }
  addEventListener() {}
  querySelectorAll() { return []; }
  querySelector() { return null; }
  appendChild(child) { this.children.push(child); }
  removeChild() {}
  remove() {}
}

const elements = {};
function getOrCreateElement(id, tag = 'div') {
  if (!elements[id]) {
    elements[id] = new MockElement(tag, id);
  }
  return elements[id];
}

// Pre-create required elements
getOrCreateElement('cartCount', 'span');
getOrCreateElement('cartDrawer', 'aside');
getOrCreateElement('cartBackdrop', 'div');
getOrCreateElement('cartDrawerItems', 'div');
getOrCreateElement('cartDrawerSubtotal', 'span');
getOrCreateElement('cartDrawerCheckoutBtn', 'button');
getOrCreateElement('checkoutModal', 'div');
getOrCreateElement('checkoutContent', 'div');
getOrCreateElement('toastContainer', 'div');

let openedUrls = [];
const mockWindow = {
  localStorage: mockLocalStorage,
  document: {
    getElementById: (id) => getOrCreateElement(id),
    querySelectorAll: (sel) => {
      if (sel === '#cartCount') {
        return [getOrCreateElement('cartCount')];
      }
      return [];
    },
    createElement: (tag) => new MockElement(tag),
    body: new MockElement('body'),
    addEventListener: () => {}
  },
  open: (url, target) => {
    openedUrls.push({ url, target });
    return { focus: () => {} };
  },
  setTimeout: (fn, delay) => { fn(); return 1; },
  encodeURIComponent: encodeURIComponent,
  decodeURIComponent: decodeURIComponent,
  location: { search: '', pathname: '/index.html' },
  console: console
};

const sandbox = {
  window: mockWindow,
  document: mockWindow.document,
  localStorage: mockLocalStorage,
  setTimeout: mockWindow.setTimeout,
  encodeURIComponent: encodeURIComponent,
  decodeURIComponent: decodeURIComponent,
  console: console
};

vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

console.log('Script loaded in VM successfully.');

const CartManager = sandbox.window.CartManager;
const PRODUCTS = sandbox.window.PRODUCTS;

// Test 1: Add products to cart
const betta = PRODUCTS.find(p => p.id === 'black-samurai-plakat-betta');
const molly = PRODUCTS.find(p => p.id === 'molly-blue-eye-platinum-white-lyretail-balloon');

assert(betta, 'Betta product exists');
assert(molly, 'Molly product exists');

CartManager.add(betta, 1, 'Male');
CartManager.add(molly, 1);

let items = CartManager.load();
assert.strictEqual(items.length, 2, 'Cart has 2 items');
assert.strictEqual(CartManager.getCount(), 2, 'Total quantity is 2');
assert(CartManager.getTotal() > 0, 'Cart total is greater than 0');
assert.strictEqual(getOrCreateElement('cartCount').textContent, '2', 'Cart badge shows 2');

console.log('✓ Test 1: Products added to cart successfully. Total count: 2, total price: ' + CartManager.getTotal());

// Test 2: Opening checkout does NOT clear the cart
sandbox.window.openCheckoutModal();
items = CartManager.load();
assert.strictEqual(items.length, 2, 'Cart items still 2 after opening checkout');
assert.strictEqual(CartManager.getCount(), 2, 'Cart quantity still 2 after opening checkout');

console.log('✓ Test 2: Opening checkout modal preserves cart.');

// Test 3: Closing checkout does NOT clear the cart
sandbox.window.closeCheckoutModal();
items = CartManager.load();
assert.strictEqual(items.length, 2, 'Cart items still 2 after closing checkout');

console.log('✓ Test 3: Closing checkout modal preserves cart.');

// Test 4: Validation failure on Step 1 does NOT clear the cart
sandbox.window.openCheckoutModal();
// Intentionally don't fill required inputs or fill invalid
getOrCreateElement('checkoutFullName').value = '';
getOrCreateElement('checkoutMobile').value = '123';
sandbox.window.validateAndProceedToReview();

items = CartManager.load();
assert.strictEqual(items.length, 2, 'Cart items still 2 after validation failure');
console.log('✓ Test 4: Form validation failure preserves cart.');

// Test 5: Successful validation and review step does NOT clear the cart
getOrCreateElement('checkoutFullName').value = 'Rahul Sharma';
getOrCreateElement('checkoutMobile').value = '9876543210';
getOrCreateElement('checkoutAddress').value = 'Flat 402, Green Valley Apartments, MG Road';
getOrCreateElement('checkoutCity').value = 'Bengaluru';
getOrCreateElement('checkoutState').value = 'Karnataka';
getOrCreateElement('checkoutPincode').value = '560001';

sandbox.window.validateAndProceedToReview();
items = CartManager.load();
assert.strictEqual(items.length, 2, 'Cart items still 2 on Review Step 2');
console.log('✓ Test 5: Step 2 review preserves cart.');

// Test 6: Order submission via proceedToWhatsApp():
// - Must build WhatsApp message with full details before clearing
// - Must open WhatsApp window
// - Must automatically clear the cart
// - Cart badge must be 0
// - Cart drawer must show empty state
// - localStorage must be empty array
openedUrls = [];
sandbox.window.proceedToWhatsApp();

assert.strictEqual(openedUrls.length, 1, 'WhatsApp window opened once');
assert(openedUrls[0].url.includes('wa.me/919654297430'), 'WhatsApp URL points to Fish Tales');
assert(openedUrls[0].url.includes('Rahul%20Sharma') || openedUrls[0].url.includes('Rahul+Sharma'), 'Customer name included in WhatsApp URL');
assert(openedUrls[0].url.includes('Black%20Samurai') || openedUrls[0].url.includes('Black+Samurai'), 'Betta product included in WhatsApp URL');
assert(openedUrls[0].url.includes('Male'), 'Male variant included in WhatsApp URL');
assert(openedUrls[0].url.includes('Blue%20Eye') || openedUrls[0].url.includes('Blue+Eye'), 'Molly product included in WhatsApp URL');

// Check cart state immediately after proceedToWhatsApp
const cartAfterOrder = CartManager.load();
assert.strictEqual(cartAfterOrder.length, 0, 'CartManager.load() returns 0 items');
assert.strictEqual(CartManager.getCount(), 0, 'Cart count is 0');
assert.strictEqual(CartManager.getTotal(), 0, 'Cart total is 0');
assert.strictEqual(getOrCreateElement('cartCount').textContent, '0', 'Cart badge DOM updated to 0');

// Check localStorage
const rawCartStorage = mockLocalStorage.getItem('fishtales_cart');
assert.strictEqual(rawCartStorage, '[]', 'localStorage fishtales_cart is "[]"');

// Check Cart Drawer DOM
const cartDrawerItems = getOrCreateElement('cartDrawerItems');
assert(cartDrawerItems.innerHTML.includes('Your Cart is Empty'), 'Cart drawer displays empty state');

console.log('✓ Test 6: Order submitted to WhatsApp and cart cleared automatically! Badge: 0, localStorage: [], drawer: Your Cart is Empty.');

// Test 7: Simulated page reload
// A new CartManager loading from localStorage sees 0 items
const reloadedItems = JSON.parse(mockLocalStorage.getItem('fishtales_cart'));
assert.strictEqual(reloadedItems.length, 0, 'Reloaded cart remains empty');
console.log('✓ Test 7: Simulated page reload confirms cart remains empty.');

// Test 8: Re-open WhatsApp does not fail or clear empty cart, opens the preserved WhatsApp link
const initialOpenCount = openedUrls.length;
sandbox.window.reopenWhatsAppOrder();
assert.strictEqual(openedUrls.length, initialOpenCount + 1, 'Re-opening WhatsApp opens preserved URL');
assert.strictEqual(openedUrls[openedUrls.length - 1].url, openedUrls[0].url, 'Re-opened URL matches original submitted URL');
console.log('✓ Test 8: Re-opening WhatsApp order works without error after cart is cleared.');

console.log('\nALL AUTOMATIC CART CLEARING TESTS PASSED PERFECTLY!');
