const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — CAPPUCCINO PDP VERIFICATION ===\n');

let innerPdp = '';
const elements = {};

const doc = {
  readyState: 'complete',
  title: '',
  body: { dataset: { pageCategory: 'product' }, style: {} },
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    innerHTML: '',
    textContent: '',
    classList: { add: () => {}, remove: () => {} },
    style: {},
    appendChild: () => {},
    remove: () => {},
    addEventListener: () => {}
  }),
  querySelectorAll: () => [],
  getElementById: (id) => {
    if (id === 'pdpMain') {
      if (!elements['pdpMain']) {
        elements['pdpMain'] = {
          id: 'pdpMain',
          set innerHTML(val) { innerPdp = val; },
          get innerHTML() { return innerPdp; }
        };
      }
      return elements['pdpMain'];
    }
    if (id === 'toastContainer') {
      return { appendChild: () => {} };
    }
    if (!elements[id]) {
      elements[id] = {
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
    return elements[id];
  },
  addEventListener: () => {}
};

const win = {
  location: {
    href: 'product.html?id=cubaris-sp-cappuccino',
    search: '?id=cubaris-sp-cappuccino',
    pathname: '/product.html'
  },
  addEventListener: () => {}
};

const ls = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

const scriptCode = fs.readFileSync('script.js', 'utf8');
const fn = new Function('window', 'document', 'localStorage', scriptCode);
fn(win, doc, ls);

// 1. Render Product Detail Page for Cappuccino
win.renderProductDetailPage();

console.log('1. Verifying Product Detail Page for Cubaris sp. Cappuccino:');
assert(innerPdp.includes('Cubaris sp. Cappuccino'), 'Must render product name');
assert(innerPdp.includes('₹600'), 'Must render price ₹600');
assert(innerPdp.includes('/ piece'), 'Must render unit / piece');
assert(innerPdp.includes('id="pdpQty">5<'), 'Must have default min quantity of 5');
assert(innerPdp.includes('₹3,000'), 'Must have calculated subtotal of ₹3,000 (5 × ₹600)');
assert(innerPdp.includes('Minimum order for Isopods is 5 pieces'), 'Must show isopod minimum order notice');
console.log('  ✓ Product name, price (₹600), min quantity (5), and subtotal (₹3,000) verified');

// 2. Verify 4 Information Sections
console.log('\n2. Verifying 4 Information Sections:');
assert(innerPdp.includes('pdpSectionOverview'), 'Section A (Overview) must be present');
assert(innerPdp.includes('Ultra-rare collector isopod exhibiting warm espresso-brown skirts'), 'Overview text rendered from description');

assert(innerPdp.includes('pdpSectionCare'), 'Section B (Care Requirements) must be present');
assert(innerPdp.includes('20°C – 26°C'), 'Care section displays temperature from specs');
assert(innerPdp.includes('Leaf litter, decaying wood, calcium'), 'Care section displays diet from specs');

assert(innerPdp.includes('pdpSectionHabitat'), 'Section C (Habitat Setup) must be present');
assert(innerPdp.includes('Bioactive vivarium / enclosure'), 'Habitat section displays habitat from specs');

assert(innerPdp.includes('pdpSectionFacts'), 'Section D (Did You Know?) must be present');
assert(innerPdp.includes('Bioactive custodial cleaners'), 'Did You Know section displays species facts');

console.log('  ✓ All 4 information sections (Overview, Care, Habitat, Did You Know) rendered cleanly');

// 3. Verify Related Products ("YOU MAY ALSO LIKE")
console.log('\n3. Verifying Related Products:');
assert(innerPdp.includes('YOU MAY ALSO LIKE'), 'Must include "YOU MAY ALSO LIKE" section');
console.log('  ✓ Related products section rendered');

// 4. Verify Cart Integration
console.log('\n4. Verifying Cart Integration:');
win.CartManager.addById('cubaris-sp-cappuccino', 5);
const cartItems = win.CartManager.getItems();
assert.strictEqual(cartItems.length, 1);
assert.strictEqual(cartItems[0].baseId, 'cubaris-sp-cappuccino');
assert.strictEqual(cartItems[0].price, 600);
assert.strictEqual(cartItems[0].quantity, 5);
assert.strictEqual(win.CartManager.getTotal(), 3000);
console.log('  ✓ Successfully added 5 pcs of Cappuccino to cart (Subtotal: ₹3,000)');

console.log('\n🎉 CAPPUCCINO PDP VERIFICATION COMPLETED WITH 100% SUCCESS!');
