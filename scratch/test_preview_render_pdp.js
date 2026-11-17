const fs = require('fs');
const assert = require('assert');

let renderedHtml = '';
let mainImgSrc = '';

global.window = global;
global.window.location = {
  href: 'product.html?id=cubaris-sp-cappuccino',
  search: '?id=cubaris-sp-cappuccino',
  pathname: '/product.html'
};
global.document = {
  title: '',
  body: { dataset: { pageCategory: 'product' }, style: {} },
  createElement: () => ({
    tagName: 'DIV',
    className: '',
    innerHTML: '',
    textContent: '',
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {},
    remove: () => {},
    addEventListener: () => {}
  }),
  querySelectorAll: () => [],
  addEventListener: () => {},
  getElementById: (id) => {
    if (id === 'pdpMain') {
      return {
        id: 'pdpMain',
        set innerHTML(val) { renderedHtml = val; },
        get innerHTML() { return renderedHtml; }
      };
    }
    if (id === 'pdpMainImg') {
      return {
        set src(v) { mainImgSrc = v; },
        get src() { return mainImgSrc; }
      };
    }
    if (id === 'toastContainer') {
      return { appendChild: () => {} };
    }
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
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

eval(fs.readFileSync('scratch/script_preview.js', 'utf8'));

console.log('Testing renderProductDetailPage for cubaris-sp-cappuccino:');
window.renderProductDetailPage();

assert(renderedHtml.includes('Cubaris sp. Cappuccino'), 'Must render Cappuccino title');
assert(renderedHtml.includes('₹600'), 'Must render unit price ₹600');
assert(renderedHtml.includes('id="pdpQty">5<'), 'Must have min quantity 5');
assert(renderedHtml.includes('₹3,000'), 'Must have subtotal ₹3,000');
assert(renderedHtml.includes('pdpSectionOverview'), 'Must have Overview section');
assert(renderedHtml.includes('pdpSectionCare'), 'Must have Care section');
assert(renderedHtml.includes('pdpSectionHabitat'), 'Must have Habitat section');
assert(renderedHtml.includes('pdpSectionFacts'), 'Must have Did You Know section');
assert(renderedHtml.includes('YOU MAY ALSO LIKE'), 'Must have related products section');

console.log('✓ Cappuccino PDP successfully rendered with all four sections and correct pricing!');

// Test adding Cappuccino to Cart
console.log('\nTesting CartManager.addById for Cappuccino:');
window.CartManager.addById('cubaris-sp-cappuccino', 5);
const items = window.CartManager.getItems();
assert.strictEqual(items.length, 1);
assert.strictEqual(items[0].baseId, 'cubaris-sp-cappuccino');
assert.strictEqual(items[0].price, 600);
assert.strictEqual(items[0].quantity, 5);
assert.strictEqual(items[0].pricingUnit, 'pieces');
console.log('✓ Successfully added Cappuccino to cart with quantity 5 and price ₹600!');
