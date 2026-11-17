const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — ALL 32 PRODUCTS PDP DYNAMIC RENDERING VERIFICATION ===\n');

const scriptCode = fs.readFileSync('script.js', 'utf8');

const vm = require('vm');
const sandbox = {
  window: {},
  document: { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: () => {} },
  location: { search: '' },
  navigator: { userAgent: '' }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

const products = sandbox.window.PRODUCTS;
assert.strictEqual(products.length, 32, 'Must have 32 products');

let successCount = 0;

products.forEach((product, idx) => {
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
      href: `product.html?id=${product.id}`,
      search: `?id=${product.id}`,
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

  // 1. Header checks
  assert(innerPdp.includes(product.name), `Product ${product.id} must display name`);
  assert(innerPdp.includes(product.description), `Product ${product.id} must display description`);
  assert(innerPdp.includes('id="pdpAddToCartBtn"'), `Product ${product.id} must have Add to Cart`);
  assert(innerPdp.includes('id="pdpDirectWhatsAppBtn"'), `Product ${product.id} must have WhatsApp button`);
  assert(innerPdp.includes('id="pdpQty"'), `Product ${product.id} must have Quantity selector`);
  assert(innerPdp.includes('id="pdpQtyTotal"'), `Product ${product.id} must have dynamic subtotal`);

  // 2. Minimum quantity checks
  const isIsopod = product.category === 'isopods' || product.subCategory === 'isopods';
  if (isIsopod) {
    assert(innerPdp.includes('id="pdpQty">5<'), `Isopod ${product.id} must default to qty 5`);
    assert(innerPdp.includes('Minimum order for Isopods is 5 pieces'), `Isopod ${product.id} must show min notice`);
  } else {
    assert(innerPdp.includes('id="pdpQty">1<'), `Non-isopod ${product.id} must default to qty 1`);
  }

  // 3. Overview checks
  assert(innerPdp.includes('pdpSectionOverview'), `Product ${product.id} must have Overview section`);
  if (product.overview && product.overview.trim()) {
    assert(innerPdp.includes(product.overview.trim()), `Product ${product.id} must display complete overview text`);
  }

  // 4. Care requirements checks
  if (product.careRequirements && typeof product.careRequirements === 'object') {
    Object.entries(product.careRequirements).forEach(([k, val]) => {
      if (val && String(val).trim()) {
        assert(innerPdp.includes(String(val).trim()), `Product ${product.id} must display care field ${k}: ${val}`);
      }
    });
  }

  // 5. Habitat setup checks
  if (product.habitatSetup && typeof product.habitatSetup === 'object') {
    Object.entries(product.habitatSetup).forEach(([k, val]) => {
      if (val && String(val).trim()) {
        assert(innerPdp.includes(String(val).trim()), `Product ${product.id} must display habitat field ${k}: ${val}`);
      }
    });
  } else if (typeof product.habitatSetup === 'string' && product.habitatSetup.trim()) {
    assert(innerPdp.includes(product.habitatSetup.trim()), `Product ${product.id} must display habitat string`);
  }

  // 6. Did you know checks
  if (product.didYouKnow && Array.isArray(product.didYouKnow) && product.didYouKnow.length > 0) {
    product.didYouKnow.forEach((fact, fIdx) => {
      if (fact && fact.trim()) {
        assert(innerPdp.includes(fact.trim()), `Product ${product.id} must display fact ${fIdx + 1}`);
      }
    });
  }

  successCount++;
  console.log(`✓ [${idx + 1}/32] ${product.name} (${product.id}): All PDP sections & dynamic fields verified`);
});

console.log(`\n🎉 ALL ${successCount}/32 PRODUCTS PASSED PDP DYNAMIC RENDERING VERIFICATION!`);
