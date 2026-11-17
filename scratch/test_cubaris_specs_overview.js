const fs = require('fs');
const assert = require('assert');

// Test with simulated DOM for Cubaris Murina Orange
const scriptCode = fs.readFileSync('script.js', 'utf8');

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
    href: 'product.html?id=cubaris-murina-orange',
    search: '?id=cubaris-murina-orange',
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

const fn = new Function('window', 'document', 'localStorage', scriptCode);
fn(win, doc, ls);

win.renderProductDetailPage();

console.log('Testing specs in Overview:');
console.log('Bioactive Cleaners:', innerPdp.includes('Bioactive Cleaners'));
console.log('Bioactive vivarium / enclosure:', innerPdp.includes('Bioactive vivarium / enclosure'));

assert(innerPdp.includes('Bioactive Cleaners'), 'Must include specs.care');
assert(innerPdp.includes('Bioactive vivarium / enclosure'), 'Must include specs.habitat');
console.log('✓ Specs in Overview verified!');
