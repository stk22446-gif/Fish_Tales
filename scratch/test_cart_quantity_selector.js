const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== FISH TALES — TEST CART QUANTITY SELECTOR ===\n');

const cssContent = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf-8');

// 1. Verify desktop/base stepper styles
console.log('1. Checking desktop/base styles for .cart-item-stepper and .cart-qty-ctrl:');

// Extract base stepper rule block
const baseStepperMatch = cssContent.match(/\.cart-qty-ctrl,\s*\.cart-item-stepper\s*\{([^}]+)\}/);
assert(baseStepperMatch, '.cart-item-stepper rule block found in style.css');
const baseProps = baseStepperMatch[1];

assert(/width:\s*120px/.test(baseProps), 'Base stepper has width: 120px');
assert(/max-width:\s*120px/.test(baseProps), 'Base stepper has max-width: 120px');
assert(/height:\s*40px/.test(baseProps), 'Base stepper has height: 40px');
assert(/min-height:\s*40px/.test(baseProps), 'Base stepper has min-height: 40px');
assert(/align-self:\s*flex-start/.test(baseProps), 'Base stepper has align-self: flex-start to prevent column flex stretching');
assert(/flex-grow:\s*0/.test(baseProps), 'Base stepper has flex-grow: 0');
assert(/border:\s*1px\s+solid\s+var\(--border-leaf\)/.test(baseProps), 'Base stepper preserves border: 1px solid var(--border-leaf)');
assert(/border-radius:\s*var\(--radius-xs\)/.test(baseProps), 'Base stepper preserves border-radius: var(--radius-xs)');
assert(/background-color:\s*var\(--bg-page\)/.test(baseProps), 'Base stepper preserves background-color: var(--bg-page)');

console.log('  ✓ Base stepper has width: 120px, height: 40px, align-self: flex-start, and preserved styling.');

// 2. Verify button styles
console.log('\n2. Checking button styles for .cart-step-btn and .cart-qty-btn:');
const btnMatch = cssContent.match(/\.cart-qty-btn,\s*\.cart-step-btn\s*\{([^}]+)\}/);
assert(btnMatch, '.cart-step-btn rule block found in style.css');
const btnProps = btnMatch[1];

assert(/width:\s*38px/.test(btnProps), 'Buttons have width: 38px');
assert(/display:\s*flex/.test(btnProps), 'Buttons have display: flex');
assert(/align-items:\s*center/.test(btnProps), 'Buttons have align-items: center');
assert(/justify-content:\s*center/.test(btnProps), 'Buttons have justify-content: center');
assert(/padding:\s*0/.test(btnProps), 'Buttons remove excessive padding (padding: 0)');

console.log('  ✓ Stepper buttons are 38px wide, centered, and have zero extra padding.');

// 3. Verify quantity number value styles
console.log('\n3. Checking quantity value styles for .cart-step-val and .cart-qty-val:');
const valMatch = cssContent.match(/\.cart-qty-val,\s*\.cart-step-val\s*\{([^}]+)\}/);
assert(valMatch, '.cart-step-val rule block found in style.css');
const valProps = valMatch[1];

assert(/flex:\s*1/.test(valProps), 'Quantity value has flex: 1 for equal distribution');
assert(/display:\s*flex/.test(valProps), 'Quantity value has display: flex');
assert(/align-items:\s*center/.test(valProps), 'Quantity value has align-items: center');
assert(/justify-content:\s*center/.test(valProps), 'Quantity value has justify-content: center');
assert(/color:\s*var\(--color-primary-dark\)/.test(valProps), 'Quantity value preserves primary dark color');
assert(/font-weight:\s*700/.test(valProps), 'Quantity value preserves font-weight: 700');

console.log('  ✓ Quantity value is flex: 1, centered, and typography is preserved.');

// 4. Verify responsive mobile media query
console.log('\n4. Checking mobile media query for stepper:');
const mobileMatch = cssContent.match(/@media\s*\([^{]+\b768px\b[^{]*\{([\s\S]*?)(?=\n@media\s*\([^{]+\b480px|\Z)/);
assert(mobileMatch, 'Mobile 768px media query found in style.css');
const mobileContent = mobileMatch[1];

assert(mobileContent.includes('.cart-item-stepper'), 'Mobile query contains .cart-item-stepper');
assert(/width:\s*120px/.test(mobileContent), 'Mobile stepper maintains width: 120px');
assert(/height:\s*40px/.test(mobileContent), 'Mobile stepper maintains height: 40px');

console.log('  ✓ Mobile query ensures compact 120px by 40px dimensions on small screens.');

// 5. Test Cart Drawer Markup Integration
console.log('\n5. Verifying Cart Drawer rendering in script.js:');
const vm = require('vm');
const scriptCode = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf-8');

const storage = {};
const mockLocalStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

let capturedCartHtml = '';
const elements = {
  cartDrawerItems: {
    set innerHTML(val) { capturedCartHtml = val; },
    get innerHTML() { return capturedCartHtml; }
  },
  cartDrawerSubtotal: { textContent: '' },
  cartDrawerCheckoutBtn: {},
  cartCount: { textContent: '' }
};

const sandbox = {
  window: {
    localStorage: mockLocalStorage,
    document: {
      getElementById: (id) => elements[id] || null,
      querySelectorAll: (sel) => sel === '#cartCount' ? [elements.cartCount] : [],
      createElement: () => ({ classList: { add() {} } }),
      body: { style: {} },
      addEventListener: () => {}
    },
    setTimeout: (fn) => fn(),
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    location: { search: '', pathname: '/index.html' },
    console: console
  },
  document: null,
  localStorage: mockLocalStorage,
  setTimeout: (fn) => fn(),
  encodeURIComponent: encodeURIComponent,
  decodeURIComponent: decodeURIComponent,
  console: console
};
sandbox.document = sandbox.window.document;

vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

const CartManager = sandbox.window.CartManager;
const PRODUCTS = sandbox.window.PRODUCTS;
const sampleProd = PRODUCTS[0];

CartManager.add(sampleProd, 2);

assert(capturedCartHtml.includes('class="cart-item-stepper"'), 'Cart drawer renders .cart-item-stepper');
assert(capturedCartHtml.includes('class="cart-step-btn"'), 'Cart drawer renders .cart-step-btn');
assert(capturedCartHtml.includes('class="cart-step-val"'), 'Cart drawer renders .cart-step-val');
assert(capturedCartHtml.includes('>2<'), 'Cart drawer displays quantity 2');

console.log('  ✓ Cart drawer successfully renders .cart-item-stepper, buttons and value.');

console.log('\n=== ALL CART QUANTITY SELECTOR TESTS PASSED 100%! ===');
