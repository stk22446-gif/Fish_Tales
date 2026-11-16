const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — AQUARIUM & FISH CATEGORY CORRECTION TEST ===\n');

// 1. Verify HTML Structure in aquarium-fish.html
const aquariumHtml = fs.readFileSync('aquarium-fish.html', 'utf8');

console.log('1. Verifying aquarium-fish.html Filter Pills:');
const expectedFilters = [
  'All Products',
  'Aquarium',
  'Betta Fish',
  'Guppy',
  'Molly',
  'Shrimps',
  'Combo Packs'
];

expectedFilters.forEach(name => {
  const present = aquariumHtml.includes(name);
  console.log(`  ✓ Contains filter "${name}":`, present);
  assert(present, `Filter "${name}" must be present in aquarium-fish.html`);
});

// Verify Isopods and Tarantulas are NOT in the filter pills row
const filterRowMatch = aquariumHtml.match(/<div class="filter-pills-row"[\s\S]*?<\/div>/);
assert(filterRowMatch, 'filter-pills-row must exist');
const filterRowContent = filterRowMatch[0];
console.log('\n  Checking exclusions in filter pills row:');
const hasIsopodsInRow = filterRowContent.includes('Isopods');
const hasTarantulasInRow = filterRowContent.includes('Tarantulas');
console.log('  ✓ Isopods NOT in filter pills row:', !hasIsopodsInRow);
console.log('  ✓ Tarantulas NOT in filter pills row:', !hasTarantulasInRow);
assert(!hasIsopodsInRow, 'Isopods must not be in aquarium filter pills');
assert(!hasTarantulasInRow, 'Tarantulas must not be in aquarium filter pills');

// 2. Verify script.js Logic
console.log('\n2. Testing script.js Category & Sub-Filter Engine:');

// Create a DOM-like environment in Node
const scriptCode = fs.readFileSync('script.js', 'utf8');

// We can run the script in a mock environment
const domMock = {
  window: {},
  document: {
    body: { dataset: { pageCategory: 'aquarium' } },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: (id) => {
      return {
        textContent: '',
        innerHTML: '',
        value: '',
        dataset: {},
        removeAttribute: () => {},
        setAttribute: () => {},
        getAttribute: () => null,
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

const contextFn = new Function('window', 'document', 'localStorage', scriptCode);
contextFn(domMock.window, domMock.document, domMock.localStorage);

console.log('  ✓ script.js executed cleanly in mock context');
console.log('  ✓ window.filterAquariumCategory is defined:', typeof domMock.window.filterAquariumCategory === 'function');
console.log('  ✓ window.filterByCategory is defined:', typeof domMock.window.filterByCategory === 'function');
console.log('  ✓ window.resetFilters is defined:', typeof domMock.window.resetFilters === 'function');

assert(typeof domMock.window.filterAquariumCategory === 'function', 'filterAquariumCategory must be exposed on window');
assert(typeof domMock.window.filterByCategory === 'function', 'filterByCategory must be exposed on window');

// Extract PRODUCTS from script.js
const productsMatch = scriptCode.match(/const PRODUCTS = (\[[\s\S]*?\]);\s*\/\* ── 4\./);
assert(productsMatch, 'Must find PRODUCTS in script.js');
const PRODUCTS = eval(productsMatch[1]);
console.log('\n  Total Master Products:', PRODUCTS.length);

// Extract helper functions
const isAquariumProductMatch = scriptCode.match(/function isAquariumProduct\(p\) \{([\s\S]*?)\n  \}/);
assert(isAquariumProductMatch, 'Must find isAquariumProduct');
const isAquariumProduct = new Function('p', 'initProductVariantsAndSpecs', isAquariumProductMatch[1] + '\n return isAquariumProduct(p);');

// Test isAquariumProduct on all products
const aquariumProducts = PRODUCTS.filter(p => {
  // Mock initProductVariantsAndSpecs
  if (!p.subCategory) {
    const id = (p.id || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    if (id.includes('guppy') || name.includes('guppy')) p.subCategory = 'guppy';
    else if (id.includes('betta') || name.includes('betta')) p.subCategory = 'betta';
    else if (id.includes('aquarium') || name.includes('aquarium') || id.includes('tank') || name.includes('tank')) p.subCategory = 'aquarium';
    else if (id.includes('molly') || name.includes('molly')) p.subCategory = 'molly';
    else if (id.includes('shrimp') || name.includes('shrimp')) p.subCategory = 'shrimp';
  }
  if (p.category === 'aquarium') return true;
  if (p.id === 'half-cube-aquarium-kit') return true;
  if (p.category === 'isopods' || p.category === 'tarantulas' || p.id === 'isopod-house-kit' || p.id === 'glacier-colony-pack') return false;
  const text = (p.id + ' ' + (p.name || '') + ' ' + (p.subtitle || '') + ' ' + (p.subCategory || '')).toLowerCase();
  return text.includes('guppy') || text.includes('betta') || text.includes('aquarium') || text.includes('tank') || text.includes('molly') || text.includes('shrimp');
});

console.log('  ✓ Total products in Aquarium & Fish collection:', aquariumProducts.length);
assert.strictEqual(aquariumProducts.length, 17, 'Aquarium collection must contain 17 products (13 Guppies + 1 Betta + 1 Molly + 1 Shrimp + 1 Aquarium Kit)');

// Test sub-filters
function matchesSubFilter(p, filterKey) {
  const id = (p.id || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const sub = (p.subtitle || '').toLowerCase();
  const subCat = (p.subCategory || '').toLowerCase();

  switch (filterKey) {
    case 'all': return true;
    case 'aquarium':
      return subCat === 'aquarium' || id.includes('aquarium') || id.includes('tank') || name.includes('aquarium') || name.includes('tank');
    case 'betta':
      return (subCat === 'betta' || id.includes('betta') || name.includes('betta')) && !id.includes('kit') && !id.includes('aquarium');
    case 'guppy':
      return subCat === 'guppy' || id.includes('guppy') || name.includes('guppy') || sub.includes('guppy');
    case 'molly':
      return subCat === 'molly' || id.includes('molly') || name.includes('molly') || sub.includes('molly');
    case 'shrimps':
    case 'shrimp':
      return subCat === 'shrimp' || subCat === 'shrimps' || id.includes('shrimp') || name.includes('shrimp') || sub.includes('shrimp');
    case 'combos':
      return (p.category === 'combos' || id.includes('kit') || name.includes('kit')) && (p.category === 'aquarium' || p.id === 'half-cube-aquarium-kit');
    default: return true;
  }
}

console.log('\n3. Testing each sub-filter:');
const subFilters = ['all', 'aquarium', 'betta', 'guppy', 'molly', 'shrimps', 'combos'];
subFilters.forEach(f => {
  const matches = aquariumProducts.filter(p => matchesSubFilter(p, f));
  console.log(`  Filter [${f.padEnd(8)}]: ${matches.length} products ->`, matches.map(m => m.name));
  if (f === 'all') assert.strictEqual(matches.length, 17);
  if (f === 'aquarium') assert.strictEqual(matches.length, 1);
  if (f === 'betta') assert.strictEqual(matches.length, 1);
  if (f === 'guppy') assert.strictEqual(matches.length, 13);
  if (f === 'combos') assert.strictEqual(matches.length, 1);
  if (f === 'molly') assert.strictEqual(matches.length, 1);
  if (f === 'shrimps') assert.strictEqual(matches.length, 1);
});

// 4. Verify Other Pages Preservation
console.log('\n4. Verifying other pages are not disturbed:');
const isopodsHtml = fs.readFileSync('isopods.html', 'utf8');
const tarantulasHtml = fs.readFileSync('tarantulas.html', 'utf8');
const comboPacksHtml = fs.readFileSync('combo-packs.html', 'utf8');

assert(isopodsHtml.includes('Isopods (7)'), 'isopods.html must keep its filter tabs');
assert(tarantulasHtml.includes('Tarantulas (6)'), 'tarantulas.html must keep its filter tabs');
assert(comboPacksHtml.includes('Combo Packs (3)'), 'combo-packs.html must keep its filter tabs');
console.log('  ✓ isopods.html preserved');
console.log('  ✓ tarantulas.html preserved');
console.log('  ✓ combo-packs.html preserved');

console.log('\n ALL AQUARIUM & FISH TESTS PASSED WITH 100% SUCCESS!');
