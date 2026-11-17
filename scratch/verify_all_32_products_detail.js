const fs = require('fs');
const assert = require('assert');

// Mock DOM environment to load script.js
global.window = global;
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

eval(fs.readFileSync('script.js', 'utf8'));

console.log('=== VERIFYING ALL 32 PRODUCTS IN SCRIPT.JS ===\n');

assert(Array.isArray(window.PRODUCTS), 'PRODUCTS must be an array');
assert.strictEqual(window.PRODUCTS.length, 32, 'Must have exactly 32 products');

const requiredFields = [
  'id',
  'category',
  'categoryName',
  'subCategory',
  'name',
  'subtitle',
  'image',
  'images',
  'video',
  'description',
  'price',
  'unit',
  'minQuantity',
  'specs',
  'overview',
  'careRequirements',
  'habitatSetup',
  'didYouKnow',
  'variants',
  'featured'
];

let errors = [];

window.PRODUCTS.forEach((product, idx) => {
  // Check exact 20 keys present in exact order
  const keys = Object.keys(product);
  if (keys.length !== requiredFields.length) {
    errors.push(`Product #${idx + 1} (${product.id}): expected 20 keys, got ${keys.length}`);
  }
  requiredFields.forEach((field, fIdx) => {
    if (keys[fIdx] !== field) {
      errors.push(`Product #${idx + 1} (${product.id}): key #${fIdx} is "${keys[fIdx]}", expected "${field}"`);
    }
    if (product[field] === undefined || product[field] === null) {
      errors.push(`Product #${idx + 1} (${product.id}): missing field "${field}"`);
    }
  });

  // Basic type assertions
  if (typeof product.id !== 'string' || product.id.length === 0) errors.push(`${product.id}: invalid id`);
  if (typeof product.name !== 'string' || product.name.length === 0) errors.push(`${product.id}: invalid name`);
  if (typeof product.price !== 'number' || product.price < 0) errors.push(`${product.id}: invalid price`);
  if (typeof product.minQuantity !== 'number' || product.minQuantity < 1) errors.push(`${product.id}: invalid minQuantity`);
  if (!Array.isArray(product.images)) errors.push(`${product.id}: images must be array`);
  if (!Array.isArray(product.didYouKnow)) errors.push(`${product.id}: didYouKnow must be array`);
  if (!Array.isArray(product.variants)) errors.push(`${product.id}: variants must be array`);
  if (typeof product.specs !== 'object' || product.specs === null) errors.push(`${product.id}: specs must be object`);
});

if (errors.length > 0) {
  console.error(`FAILED: ${errors.length} errors found:`);
  errors.slice(0, 15).forEach(e => console.error('  - ' + e));
  process.exit(1);
} else {
  console.log('✓ All 32 products contain complete information:');
  console.log('  - id, category, categoryName, subCategory, name, subtitle');
  console.log('  - image, images, video, description, price, unit, minQuantity');
  console.log('  - specs, overview, careRequirements, habitatSetup, didYouKnow, variants, featured');
}

// Now test that EVERY product opens correctly on product.html?id=...
console.log('\n=== TESTING PRODUCT DETAIL PAGE RENDERING FOR ALL 32 PRODUCTS ===\n');

let renderFailures = [];

window.PRODUCTS.forEach(p => {
  let renderedHtml = '';
  const domElements = {
    pdpMain: {
      set innerHTML(val) { renderedHtml = val; },
      get innerHTML() { return renderedHtml; }
    }
  };

  const mockDoc = {
    readyState: 'complete',
    title: '',
    body: { dataset: { pageCategory: 'product' }, style: {} },
    createElement: () => ({
      tagName: 'DIV',
      className: '',
      innerHTML: '',
      textContent: '',
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      addEventListener: () => {}
    }),
    querySelectorAll: () => [],
    addEventListener: () => {},
    getElementById: (id) => {
      if (domElements[id]) return domElements[id];
      domElements[id] = {
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
      return domElements[id];
    }
  };

  const mockWin = {
    location: {
      href: `product.html?id=${p.id}`,
      search: `?id=${p.id}`,
      pathname: '/product.html'
    },
    addEventListener: () => {}
  };

  // Re-run script in this context
  const fn = new Function('window', 'document', 'localStorage', fs.readFileSync('script.js', 'utf8'));
  fn(mockWin, mockDoc, { getItem: () => null, setItem: () => {}, removeItem: () => {} });

  mockWin.renderProductDetailPage();

  if (!renderedHtml.includes(p.name)) {
    renderFailures.push(`${p.id}: rendered HTML missing product name "${p.name}"`);
  }
  if (!renderedHtml.includes('pdpSectionOverview')) {
    renderFailures.push(`${p.id}: missing pdpSectionOverview`);
  }
  if (!renderedHtml.includes('pdpSectionCare')) {
    renderFailures.push(`${p.id}: missing pdpSectionCare`);
  }
  if (!renderedHtml.includes('pdpSectionHabitat')) {
    renderFailures.push(`${p.id}: missing pdpSectionHabitat`);
  }
  if (!renderedHtml.includes('pdpSectionFacts')) {
    renderFailures.push(`${p.id}: missing pdpSectionFacts`);
  }
  if (!renderedHtml.includes('YOU MAY ALSO LIKE')) {
    renderFailures.push(`${p.id}: missing related products`);
  }
  // Check price
  const formattedPrice = p.price.toLocaleString('en-IN');
  if (!renderedHtml.includes(formattedPrice)) {
    renderFailures.push(`${p.id}: rendered HTML missing base price ${formattedPrice}`);
  }
});

if (renderFailures.length > 0) {
  console.error(`FAILED: ${renderFailures.length} render failures found:`);
  renderFailures.slice(0, 10).forEach(f => console.error('  - ' + f));
  process.exit(1);
} else {
  console.log(`✓ All 32 products successfully rendered on product.html?id=PRODUCT_ID with complete data!`);
}
