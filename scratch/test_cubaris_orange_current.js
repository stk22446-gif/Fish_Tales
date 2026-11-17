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

console.log('Testing CURRENT renderProductDetailPage for cubaris-murina-orange:');
console.log('Includes Difficulty (Beginner to Intermediate):', innerPdp.includes('Beginner to Intermediate'));
console.log('Includes Temperature (20°C – 26°C):', innerPdp.includes('20°C – 26°C'));
console.log('Includes Humidity (60% – 80%):', innerPdp.includes('60% – 80% (moisture gradient required)'));
console.log('Includes Diet (Leaf litter, decaying wood, calcium):', innerPdp.includes('Leaf litter, decaying wood, calcium'));
console.log('Includes Lifespan (2 – 3 years):', innerPdp.includes('2 – 3 years'));
console.log('Includes Handling (Delicate live specimens):', innerPdp.includes('Delicate live specimens; observe without excessive handling'));

console.log('\nHabitat setup fields:');
console.log('Includes Enclosure:', innerPdp.includes('Ventilated acrylic, glass, or plastic container with moisture retention'));
console.log('Includes Substrate:', innerPdp.includes('Damp organic bioactive soil blend enriched with worm castings and crushed leaf litter'));
console.log('Includes Moisture Gradient:', innerPdp.includes('One moist corner with damp sphagnum moss and one drier ventilating side'));
console.log('Includes Hiding Places:', innerPdp.includes('Cork bark flats, decaying wood chunks, and natural lotus pods'));

console.log('\nDid You Know points:');
console.log('Point 1:', innerPdp.includes('Isopods are terrestrial crustaceans—not insects—and breathe using specialized pleopodal lungs'));
console.log('Point 2:', innerPdp.includes('They form the vital backbone of bioactive setups by breaking down mold, waste, and shed organic material'));

console.log('\nOverview & Description:');
console.log('Description:', innerPdp.includes('Warm apricot-orange color morph. Hardy, highly active, and quick to establish a thriving custodial colony in humid vivariums.'));
console.log('Overview:', innerPdp.includes('Cubaris Murina Orange (Cubaris murina var. Orange) is a prized terrestrial crustacean ideal as a clean-up crew'));
