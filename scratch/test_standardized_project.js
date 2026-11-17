const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — COMPLETE STANDARDIZATION & VERIFICATION TEST ===\n');

// 1. Read script.js and extract PRODUCTS
const scriptCode = fs.readFileSync('script.js', 'utf8');
const productsMatch = scriptCode.match(/const PRODUCTS = (\[[\s\S]*?\]);\s*\/\* ── 4\./);
assert(productsMatch, 'Must find PRODUCTS in script.js');
const PRODUCTS = eval(productsMatch[1]);

console.log(`1. Total master products: ${PRODUCTS.length}`);
assert.strictEqual(PRODUCTS.length, 32, 'Must have exactly 32 products');

// 2. Validate exact 19 keys in exact order for all 32 products (variants removed)
console.log('\n2. Verifying 19 standardized keys in exact order:');
const requiredKeys = [
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
  'featured'
];

const seenIds = new Set();

PRODUCTS.forEach((p, idx) => {
  assert(!seenIds.has(p.id), `Duplicate product ID detected: ${p.id}`);
  seenIds.add(p.id);

  const keys = Object.keys(p);
  assert.strictEqual(keys.length, 19, `Product ${p.id} must have exactly 19 keys`);
  for (let i = 0; i < 19; i++) {
    assert.strictEqual(
      keys[i],
      requiredKeys[i],
      `Product ${p.id} key #${i} mismatch: got "${keys[i]}", expected "${requiredKeys[i]}"`
    );
  }

  // Type checks
  assert(typeof p.id === 'string' && p.id.length > 0);
  assert(typeof p.category === 'string' && p.category.length > 0);
  assert(typeof p.categoryName === 'string' && p.categoryName.length > 0);
  assert(typeof p.subCategory === 'string' && p.subCategory.length > 0);
  assert(typeof p.name === 'string' && p.name.length > 0);
  assert(typeof p.subtitle === 'string');
  assert(typeof p.image === 'string' && p.image.length > 0);
  assert(Array.isArray(p.images));
  assert(typeof p.video === 'string');
  assert(typeof p.description === 'string' && p.description.length > 0);
  assert(typeof p.specs === 'object' && p.specs !== null);
  assert(typeof p.price === 'number' && p.price > 0);
  assert(typeof p.unit === 'string' && p.unit.length > 0);
  assert(typeof p.minQuantity === 'number' && p.minQuantity >= 1);
  assert(typeof p.featured === 'boolean');
});
console.log('  ✓ Every single product contains all 19 fields in exact specified order');
console.log('  ✓ Zero duplicate IDs found (32 unique products)');

// 3. Category & SubCategory validation
console.log('\n3. Verifying category and subCategory rules:');
const molly = PRODUCTS.find(p => p.id === 'molly-golden');
assert(molly && molly.category === 'aquarium' && molly.subCategory === 'molly');
console.log('  ✓ Golden Molly: category="aquarium", subCategory="molly"');

const betta = PRODUCTS.find(p => p.id === 'show-grade-betta');
assert(betta && betta.category === 'aquarium' && betta.subCategory === 'betta');
console.log('  ✓ Betta Fish: category="aquarium", subCategory="betta"');

const guppy = PRODUCTS.find(p => p.id === 'guppy-red-lace');
assert(guppy && guppy.category === 'aquarium' && guppy.subCategory === 'guppy');
console.log('  ✓ Guppy Fish: category="aquarium", subCategory="guppy"');

const shrimp = PRODUCTS.find(p => p.id === 'shrimp-crystal-red');
assert(shrimp && shrimp.category === 'aquarium' && shrimp.subCategory === 'shrimps');
console.log('  ✓ Shrimps: category="aquarium", subCategory="shrimps"');

const isopod = PRODUCTS.find(p => p.id === 'armadillidium-gestroi');
assert(isopod && isopod.category === 'isopods' && isopod.subCategory === 'isopods');
console.log('  ✓ Isopods: category="isopods", subCategory="isopods"');

const tarantula = PRODUCTS.find(p => p.id === 'mexican-red-knee');
assert(tarantula && tarantula.category === 'tarantulas' && tarantula.subCategory === 'tarantulas');
console.log('  ✓ Tarantulas: category="tarantulas", subCategory="tarantulas"');

const isopodKit = PRODUCTS.find(p => p.id === 'isopod-house-kit');
assert(isopodKit && isopodKit.category === 'combo' && isopodKit.subCategory === 'isopod-kit');
console.log('  ✓ Isopod House Kit: category="combo", subCategory="isopod-kit"');

const aquariumKit = PRODUCTS.find(p => p.id === 'half-cube-aquarium-kit');
assert(aquariumKit && aquariumKit.category === 'combo' && aquariumKit.subCategory === 'aquarium-kit');
console.log('  ✓ Half Cube Aquarium Kit: category="combo", subCategory="aquarium-kit"');

// 4. Test In-Browser Runtime Execution & Filtering
console.log('\n4. Testing in-memory DOM execution of script.js:');
let renderedCards = '';
let resultCountText = '';
let activeBadgeText = '';

function createMockDom(pageCat) {
  renderedCards = '';
  resultCountText = '';
  activeBadgeText = '';

  return {
    window: {},
    document: {
      body: { dataset: { pageCategory: pageCat }, style: {} },
      createElement: () => ({ className: '', innerHTML: '', classList: { add: () => {} }, appendChild: () => {}, remove: () => {} }),
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: (id) => {
        if (id === 'productGrid') {
          return {
            set innerHTML(html) { renderedCards = html; },
            get innerHTML() { return renderedCards; }
          };
        }
        if (id === 'resultCount') {
          return {
            set innerHTML(html) { resultCountText = html; },
            get innerHTML() { return resultCountText; }
          };
        }
        if (id === 'activeCategoryIndicator') {
          return {
            set textContent(txt) { activeBadgeText = txt; },
            get textContent() { return activeBadgeText; }
          };
        }
        return {
          textContent: '',
          innerHTML: '',
          value: '',
          dataset: {},
          removeAttribute: () => {},
          setAttribute: () => {},
          getAttribute: () => null,
          appendChild: () => {},
          querySelectorAll: () => [],
          classList: { toggle: () => {}, add: () => {}, remove: () => {} },
          addEventListener: () => {}
        };
      },
      addEventListener: () => {}
    },
    localStorage: {
      getItem: () => '[]',
      setItem: () => {}
    }
  };
}

// Test Aquarium Page sub-filters
console.log('\n  A. Aquarium & Fish Page Sub-Filters:');
const domAquarium = createMockDom('aquarium');
const fnAquarium = new Function('window', 'document', 'localStorage', scriptCode);
fnAquarium(domAquarium.window, domAquarium.document, domAquarium.localStorage);

const aqFilters = [
  { filter: 'all', count: 17, checkName: 'Golden Molly' },
  { filter: 'aquarium', count: 1, checkName: 'Half Cube Aquarium Kit' },
  { filter: 'betta', count: 1, checkName: 'Show Grade Betta Fish' },
  { filter: 'guppy', count: 13, checkName: 'Red Lace Guppy' },
  { filter: 'molly', count: 1, checkName: 'Golden Molly' },
  { filter: 'shrimps', count: 1, checkName: 'Crystal Red Shrimp' },
  { filter: 'combos', count: 1, checkName: 'Half Cube Aquarium Kit' }
];

aqFilters.forEach(({ filter, count, checkName }) => {
  domAquarium.window.filterAquariumCategory(filter);
  const cardCount = (renderedCards.match(/class="product-card"/g) || []).length;
  console.log(`    Filter [${filter.padEnd(8)}]: rendered ${cardCount} cards (expected ${count}), contains "${checkName}": ${renderedCards.includes(checkName)}`);
  assert.strictEqual(cardCount, count, `Filter "${filter}" must render ${count} cards`);
  assert(renderedCards.includes(checkName), `Filter "${filter}" must include "${checkName}"`);
});

// Test Index.html filters
console.log('\n  B. Index.html Category Filters:');
const domIndex = createMockDom('all');
const fnIndex = new Function('window', 'document', 'localStorage', scriptCode);
fnIndex(domIndex.window, domIndex.document, domIndex.localStorage);

const homeFilters = [
  { cat: 'all', count: 32 },
  { cat: 'aquarium', count: 17 },
  { cat: 'isopods', count: 7 },
  { cat: 'tarantulas', count: 6 },
  { cat: 'combos', count: 3 }
];

homeFilters.forEach(({ cat, count }) => {
  domIndex.window.filterByCategory(cat);
  const cardCount = (renderedCards.match(/class="product-card"/g) || []).length;
  console.log(`    Home filter [${cat.padEnd(10)}]: rendered ${cardCount} cards (expected ${count})`);
  assert.strictEqual(cardCount, count, `Home category "${cat}" must render ${count} cards`);
});

// Test Dedicated pages
console.log('\n  C. Dedicated Pages Initialization:');
['isopods', 'tarantulas', 'combo'].forEach(page => {
  const domPage = createMockDom(page);
  const fnPage = new Function('window', 'document', 'localStorage', scriptCode);
  fnPage(domPage.window, domPage.document, domPage.localStorage);
  domPage.window.renderProductGrid();
  const cardCount = (renderedCards.match(/class="product-card"/g) || []).length;
  const expected = (page === 'isopods') ? 7 : (page === 'tarantulas') ? 6 : 3;
  console.log(`    Page [${page}.html]: rendered ${cardCount} cards (expected ${expected})`);
  assert.strictEqual(cardCount, expected);
});

console.log('\n🎉 ALL 32 PRODUCT OBJECTS STANDARDIZED & VERIFIED WITH 100% SUCCESS!');
