const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — TEST AQUARIUM "ALL PRODUCTS" FILTER FIX ===\n');

// 1. Read files
const aquariumHtml = fs.readFileSync('aquarium-fish.html', 'utf8');
const scriptCode = fs.readFileSync('script.js', 'utf8');

// Verify aquarium-fish.html markup
console.log('1. Verifying aquarium-fish.html markup:');
assert(aquariumHtml.includes('<body data-page-category="aquarium">'), 'body must have data-page-category="aquarium"');
assert(aquariumHtml.includes('<main data-page-category="aquarium">'), 'main must have data-page-category="aquarium"');
assert(aquariumHtml.includes('id="catalogue"'), '#catalogue must exist');
assert(aquariumHtml.includes('id="productGrid"'), '#productGrid must exist');
assert(aquariumHtml.includes('onclick="filterAquariumCategory(\'all\')"'), 'All Products button must have onclick="filterAquariumCategory(\'all\')"');
assert(!aquariumHtml.includes('Discover Our Collection'), 'aquarium-fish.html must NOT contain "Discover Our Collection"');
console.log('  ✓ Markup structure verified.\n');

// 2. Setup mock browser DOM environment
console.log('2. Testing JavaScript Filter Logic & Interaction:');

let lastScrolledTo = null;
let lastNavigatedTo = null;

class MockElement {
  constructor(id = '', tag = 'div', classes = '') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.className = classes;
    this.classList = {
      _classes: new Set(classes ? classes.split(' ') : []),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c, state) => {
        if (state === undefined) state = !this.classList.contains(c);
        if (state) this.classList.add(c);
        else this.classList.remove(c);
      }
    };
    this.dataset = {};
    this.innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.children = [];
    this.attributes = {};
  }
  getAttribute(attr) { return this.attributes[attr] || null; }
  setAttribute(attr, val) { this.attributes[attr] = val; }
  hasAttribute(attr) { return attr in this.attributes; }
  getBoundingClientRect() { return { top: 250, bottom: 800, height: 550 }; }
  querySelectorAll(sel) { return []; }
  addEventListener(event, fn) {}
}

const mockGrid = new MockElement('productGrid');
const mockResultCount = new MockElement('resultCount');
const mockActiveCategoryIndicator = new MockElement('activeCategoryIndicator');
const mockCatalogSearch = new MockElement('catalogSearch', 'input');
const mockCatalogSort = new MockElement('catalogSort', 'select');
const mockCatalogueSection = new MockElement('catalogue', 'section');

// Filter tabs
const filterTabs = [
  { filter: 'all', category: 'all', text: 'All Products' },
  { filter: 'aquarium', category: 'aquarium', text: 'Aquarium' },
  { filter: 'betta', category: 'betta', text: 'Betta Fish' },
  { filter: 'guppy', category: 'guppy', text: 'Guppy' },
  { filter: 'molly', category: 'molly', text: 'Molly' },
  { filter: 'shrimps', category: 'shrimps', text: 'Shrimps' },
  { filter: 'combos', category: 'combos', text: 'Combo Packs' },
].map(item => {
  const el = new MockElement('', 'button', 'filter-pill filter-tab');
  el.dataset.filter = item.filter;
  el.dataset.category = item.category;
  el.setAttribute('onclick', `filterAquariumCategory('${item.filter}')`);
  el.textContent = item.text;
  return el;
});

const mockElements = {
  productGrid: mockGrid,
  resultCount: mockResultCount,
  activeCategoryIndicator: mockActiveCategoryIndicator,
  catalogSearch: mockCatalogSearch,
  catalogSort: mockCatalogSort,
  catalogue: mockCatalogueSection,
};

let activeNavKey = 'aquarium';

const domMock = {
  window: {
    location: {
      pathname: '/aquarium-fish.html',
      href: 'http://localhost:3000/aquarium-fish.html',
      hash: ''
    },
    pageYOffset: 100,
    scrollY: 100,
    scrollTo: (opts) => {
      lastScrolledTo = opts;
    },
    setActiveNavKey: (key) => {
      activeNavKey = key;
    }
  },
  document: {
    body: {
      dataset: { pageCategory: 'aquarium' }
    },
    querySelector: (sel) => {
      if (sel === 'main') {
        const m = new MockElement('', 'main');
        m.dataset.pageCategory = 'aquarium';
        return m;
      }
      if (sel === '.category-hero-aquarium') return new MockElement();
      if (sel === '.filter-pills-row[aria-label*="Aquarium"]') return new MockElement();
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel.includes('.filter-tab') || sel.includes('.filter-pill')) {
        return filterTabs;
      }
      return [];
    },
    getElementById: (id) => mockElements[id] || null,
    addEventListener: () => {}
  },
  localStorage: {
    getItem: () => '[]',
    setItem: () => {}
  }
};

// Monitor navigation
Object.defineProperty(domMock.window.location, 'href', {
  get: () => 'http://localhost:3000/aquarium-fish.html',
  set: (val) => {
    lastNavigatedTo = val;
  }
});

// Execute script in mock context
const runContext = new Function('window', 'document', 'localStorage', scriptCode);
runContext(domMock.window, domMock.document, domMock.localStorage);

console.log('  ✓ script.js loaded cleanly in aquarium-fish page context');

// 3. Test initial state
console.log('\n3. Verifying initial aquarium state:');
domMock.window.filterAquariumCategory('all', false);

let renderedCards = (mockGrid.innerHTML.match(/class="product-card"/g) || []).length;
console.log(`  ✓ Rendered cards on 'all': ${renderedCards} (Expected 17)`);
assert.strictEqual(renderedCards, 17, 'Should display all 17 Aquarium & Fish products on initial load');
assert.strictEqual(mockActiveCategoryIndicator.textContent, 'All Products', 'Indicator should say All Products');
assert(mockResultCount.innerHTML.includes('Showing <strong>17</strong> of <strong>17</strong>'), 'Count should say Showing 17 of 17');
assert(filterTabs[0].classList.contains('active'), 'All Products tab should be active');

// 4. Test filtering subcategories: Guppy
console.log('\n4. Testing subcategory: Guppy');
domMock.window.filterAquariumCategory('guppy');
renderedCards = (mockGrid.innerHTML.match(/class="product-card"/g) || []).length;
console.log(`  ✓ Rendered cards on 'guppy': ${renderedCards} (Expected 13)`);
assert.strictEqual(renderedCards, 13, 'Guppy filter should return 13 products');
assert.strictEqual(mockActiveCategoryIndicator.textContent, 'Guppy');
assert(!filterTabs[0].classList.contains('active'), 'All Products should NOT be active when Guppy is selected');
assert(filterTabs[3].classList.contains('active'), 'Guppy tab should be active');
assert(lastScrolledTo !== null, 'Scroll should be triggered');
console.log(`  ✓ Scroll triggered to target Y: ${lastScrolledTo.top} with behavior: ${lastScrolledTo.behavior}`);

// 5. Test filtering subcategories: Betta Fish
console.log('\n5. Testing subcategory: Betta Fish');
domMock.window.filterAquariumCategory('betta');
renderedCards = (mockGrid.innerHTML.match(/class="product-card"/g) || []).length;
console.log(`  ✓ Rendered cards on 'betta': ${renderedCards} (Expected 1)`);
assert.strictEqual(renderedCards, 1, 'Betta filter should return 1 product');
assert(filterTabs[2].classList.contains('active'), 'Betta tab should be active');

// 6. Test filtering subcategories: Molly
console.log('\n6. Testing subcategory: Molly');
domMock.window.filterAquariumCategory('molly');
renderedCards = (mockGrid.innerHTML.match(/class="product-card"/g) || []).length;
console.log(`  ✓ Rendered cards on 'molly': ${renderedCards} (Expected 1)`);
assert.strictEqual(renderedCards, 1, 'Molly filter should return 1 product');
assert(filterTabs[4].classList.contains('active'), 'Molly tab should be active');

// 7. Test filtering subcategories: Shrimps
console.log('\n7. Testing subcategory: Shrimps');
domMock.window.filterAquariumCategory('shrimps');
renderedCards = (mockGrid.innerHTML.match(/class="product-card"/g) || []).length;
console.log(`  ✓ Rendered cards on 'shrimps': ${renderedCards} (Expected 1)`);
assert.strictEqual(renderedCards, 1, 'Shrimps filter should return 1 product');
assert(filterTabs[5].classList.contains('active'), 'Shrimps tab should be active');

// 8. Now test clicking "All Products" to reset back to full aquarium collection
console.log('\n8. Testing clicking "All Products" after subcategory selection:');
lastScrolledTo = null;
lastNavigatedTo = null;

domMock.window.filterAquariumCategory('all');

renderedCards = (mockGrid.innerHTML.match(/class="product-card"/g) || []).length;
console.log(`  ✓ Rendered cards after clicking 'All Products': ${renderedCards} (Expected 17)`);
assert.strictEqual(renderedCards, 17, 'All 17 Aquarium & Fish products must be shown');

// Check that no other categories are present
assert(!mockGrid.innerHTML.includes('Panda King'), 'Isopods must not be displayed');
assert(!mockGrid.innerHTML.includes('Cobalt Blue Tarantula'), 'Tarantulas must not be displayed');
assert(!mockGrid.innerHTML.includes('Microworm'), 'Cultures must not be displayed');
console.log('  ✓ No foreign category products (isopods, tarantulas, cultures) are shown.');

// Check tabs active states
assert(filterTabs[0].classList.contains('active'), 'All Products tab must have active class');
for (let i = 1; i < filterTabs.length; i++) {
  assert(!filterTabs[i].classList.contains('active'), `Subcategory tab "${filterTabs[i].textContent}" must NOT be active`);
}
console.log('  ✓ Active states properly reset: All Products is active, subcategories are inactive.');

// Check counts and indicators
assert.strictEqual(mockActiveCategoryIndicator.textContent, 'All Products', 'Indicator badge must say "All Products"');
assert(mockResultCount.innerHTML.includes('Showing <strong>17</strong> of <strong>17</strong> products'), 'Product count must show 17 of 17');
console.log('  ✓ Product count & indicator badge reflect 17 of 17 products.');

// Check scroll behavior
assert(lastScrolledTo !== null, 'Scroll must be triggered');
assert(lastScrolledTo.top >= 0, 'Scroll target must be valid');
assert.strictEqual(lastScrolledTo.behavior, 'smooth', 'Scroll must be smooth');
console.log(`  ✓ Smooth scroll triggered to product listing section (target Y: ${lastScrolledTo.top})`);

// Check navigation: MUST NOT have navigated away
assert.strictEqual(lastNavigatedTo, null, 'Must NOT navigate to index.html#catalogue or any other URL');
console.log('  ✓ No page navigation occurred (did NOT redirect to index.html#catalogue).');

// 9. Test filterByCategory('all') on aquarium-fish page
console.log('\n9. Testing filterByCategory("all") when called on aquarium-fish page:');
lastNavigatedTo = null;
domMock.window.filterByCategory('all');
assert.strictEqual(lastNavigatedTo, null, 'filterByCategory("all") on aquarium-fish page must NOT redirect to index.html#catalogue');
renderedCards = (mockGrid.innerHTML.match(/class="product-card"/g) || []).length;
assert.strictEqual(renderedCards, 17, 'filterByCategory("all") must show all 17 aquarium products');
console.log('  ✓ filterByCategory("all") stays on aquarium-fish page and renders all 17 aquarium products.');

// 10. Test scrollToSection('catalogue') preserves active navigation
console.log('\n10. Testing scrollToSection("catalogue") on aquarium-fish page:');
domMock.window.scrollToSection('catalogue');
assert.strictEqual(activeNavKey, 'aquarium', 'Active nav key must remain "aquarium", not revert to "home"');
console.log('  ✓ Active nav key preserved as "aquarium".');

console.log('\n ALL TESTS PASSED SUCCESSFULLY (100%)!');
