const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — TEST CULTURE PRODUCTS IN ALL PRODUCTS ===\n');

// 1. Setup mock browser DOM environment
let renderedCards = '';
let activeBadgeText = '';
let resultCountText = '';
let currentUrl = 'index.html';

const mockWindow = {
  location: {
    get href() { return currentUrl; },
    set href(val) { currentUrl = val; }
  }
};

const filterTabs = [
  { dataset: { category: 'all' }, classList: new Set(['active']), textContent: 'All' },
  { dataset: { category: 'aquarium' }, classList: new Set(), textContent: 'Aquarium & Fish' },
  { dataset: { category: 'isopods' }, classList: new Set(), textContent: 'Isopods' },
  { dataset: { category: 'tarantulas' }, classList: new Set(), textContent: 'Tarantulas' },
  { dataset: { category: 'combos' }, classList: new Set(), textContent: 'Combo Packs' },
  { dataset: { category: 'cultures' }, classList: new Set(), textContent: 'Cultures' }
];

filterTabs.forEach(tab => {
  tab.classList.toggle = function(cls, state) {
    if (state) this.add(cls); else this.delete(cls);
  };
  tab.classList.contains = function(cls) {
    return this.has(cls);
  };
});

const mockDocument = {
  body: { dataset: { pageCategory: 'all' }, style: {} },
  createElement: () => ({ className: '', innerHTML: '', classList: { add: () => {} }, appendChild: () => {}, remove: () => {} }),
  querySelector: () => null,
  querySelectorAll: (selector) => {
    if (selector.includes('.filter-tab') || selector.includes('.filter-pill')) {
      return filterTabs;
    }
    return [];
  },
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
      querySelectorAll: () => [],
      appendChild: () => {},
      classList: { toggle: () => {}, add: () => {}, remove: () => {} },
      addEventListener: () => {}
    };
  },
  addEventListener: () => {}
};

let cartStorage = '[]';
const mockLocalStorage = {
  getItem: () => cartStorage,
  setItem: (k, v) => { cartStorage = v; }
};

const scriptCode = fs.readFileSync('script.js', 'utf8');
const fn = new Function('window', 'document', 'localStorage', scriptCode);
fn(mockWindow, mockDocument, mockLocalStorage);

// 2. Test initial All Products rendering
console.log('1. Verifying initial "All Products" render on homepage:');
mockWindow.renderProductGrid();

const cardIds = [...renderedCards.matchAll(/data-id="([^"]+)"/g)].map(m => m[1]);
console.log(`  ✓ Total cards rendered under All Products: ${cardIds.length} (Expected 42)`);
assert.strictEqual(cardIds.length, 42, 'Must render exactly 42 products under All Products');

// Check that cultures are included
const cultureIds = ['culture-microworm', 'culture-vinegar-eel', 'culture-moina', 'culture-grindal-worm'];
cultureIds.forEach(cid => {
  assert(cardIds.includes(cid), `All Products must include Culture product "${cid}"`);
  console.log(`  ✓ Culture "${cid}" is present in All Products`);
});

// Check that no product is duplicated
const uniqueCardIds = new Set(cardIds);
assert.strictEqual(uniqueCardIds.size, cardIds.length, 'Every product ID must appear exactly once under All Products (no duplicates)');
console.log('  ✓ Zero duplicate product cards under All Products (42 unique IDs verified)');

// Check showing counter
console.log(`  ✓ Counter text: "${resultCountText}"`);
assert(resultCountText.includes('42'), 'Counter must show 42 products');

// 3. Test filtering by Cultures
console.log('\n2. Verifying Culture category filter:');
mockWindow.filterByCategory('cultures');
const cultureCardIds = [...renderedCards.matchAll(/data-id="([^"]+)"/g)].map(m => m[1]);
console.log(`  ✓ Total cards rendered under Cultures: ${cultureCardIds.length} (Expected 4)`);
assert.strictEqual(cultureCardIds.length, 4, 'Must render exactly 4 Culture products');
cultureIds.forEach(cid => {
  assert(cultureCardIds.includes(cid), `Culture filter must include "${cid}"`);
});
assert.strictEqual(activeBadgeText, 'Cultures', 'Active badge must say "Cultures"');

// 4. Test resetting back to All Products
console.log('\n3. Verifying clicking "All" resets filters and shows all products including Cultures:');
mockWindow.filterByCategory('all');
const resetCardIds = [...renderedCards.matchAll(/data-id="([^"]+)"/g)].map(m => m[1]);
assert.strictEqual(resetCardIds.length, 42, 'Must return to 42 products when All is clicked');
cultureIds.forEach(cid => {
  assert(resetCardIds.includes(cid), `Reset All Products must include "${cid}"`);
});
assert.strictEqual(activeBadgeText, 'All Products', 'Active badge must say "All Products"');
console.log('  ✓ Clicking "All" successfully displays all 42 products including Cultures');

// 5. Test PDP navigation for Culture products
console.log('\n4. Verifying product detail links for Culture products:');
cultureIds.forEach(cid => {
  mockWindow.navigateToProduct(cid);
  assert.strictEqual(currentUrl, `product.html?id=${encodeURIComponent(cid)}`, `PDP link for ${cid} must point to product.html?id=${cid}`);
});
console.log('  ✓ All 4 Culture products correctly wire to product.html?id=ID');

// 6. Test Add to Cart for Culture products
console.log('\n5. Verifying Add to Cart for Culture products:');
mockWindow.CartManager.clear();
mockWindow.CartManager.addById('culture-microworm', 2);
const cartItems = mockWindow.CartManager.load();
assert.strictEqual(cartItems.length, 1, 'Cart should contain 1 item');
assert.strictEqual(cartItems[0].id, 'culture-microworm');
assert.strictEqual(cartItems[0].name, 'Microworm Starter Culture');
assert.strictEqual(cartItems[0].price, 150);
assert.strictEqual(cartItems[0].quantity, 2);
const total = mockWindow.CartManager.calcTotal(cartItems);
assert.strictEqual(total, 300, '2 Microworm cultures at ₹150 should total ₹300');
console.log(`  ✓ Cart successfully added 2 × Microworm cultures totaling ₹${total}`);

console.log('\n🎉 ALL CULTURE PRODUCTS IN ALL PRODUCTS TESTS PASSED 100%!');
