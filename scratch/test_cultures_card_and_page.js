const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — CULTURES 5TH CARD & DEDICATED PAGE TEST SUITE ===\n');

// 1. Check index.html markup
console.log('1. Verifying index.html Category Cards...');
const indexHtml = fs.readFileSync('index.html', 'utf8');

// Heading must remain unchanged
assert(indexHtml.includes('Four Main Pillars'), 'Heading "Four Main Pillars" must be preserved');
assert(indexHtml.includes('Specialized Living Realms'), 'Section subtitle "Specialized Living Realms" preserved');

// Extract all category cards
const cardRegex = /<a\s+href="([^"]+)"\s+class="category-card"[\s\S]*?<\/a>/g;
const cards = [];
let match;
while ((match = cardRegex.exec(indexHtml)) !== null) {
  cards.push({
    full: match[0],
    href: match[1]
  });
}

assert.strictEqual(cards.length, 5, `Expected exactly 5 category cards, found ${cards.length}`);
console.log('  ✓ Exactly 5 category cards found in .categories-grid');

// Check order of cards
assert.strictEqual(cards[0].href, 'aquarium-fish.html', 'Card 1 must be Aquarium & Fish');
assert.strictEqual(cards[1].href, 'isopods.html', 'Card 2 must be Isopods');
assert.strictEqual(cards[2].href, 'tarantulas.html', 'Card 3 must be Tarantulas');
assert.strictEqual(cards[3].href, 'combo-packs.html', 'Card 4 must be Combo Packs');
assert.strictEqual(cards[4].href, 'culture.html', 'Card 5 must be culture.html');
console.log('  ✓ Sequence of all 5 cards verified');

// Check Cultures card content
const cultureCard = cards[4].full;
assert(cultureCard.includes('Cultures'), 'Card 5 title must be Cultures');
assert(
  cultureCard.replace(/\s+/g, ' ').includes('Live food cultures including Microworm, Vinegar Eel, Moina, and Grindal Worm for healthy growth and natural nutrition.'),
  'Card 5 description must match required text'
);
assert(
  cultureCard.includes('SHOP CULTURES') || cultureCard.includes('Shop Cultures'),
  'Card 5 button CTA must be SHOP CULTURES'
);
assert(cultureCard.includes('<svg') && cultureCard.includes('</svg>'), 'Card 5 must include arrow SVG');
assert(cultureCard.includes('live_food_cultures_category.jpg'), 'Card 5 image must use live food cultures image');
assert(fs.existsSync('live_food_cultures_category.jpg'), 'live_food_cultures_category.jpg must exist on disk');
console.log('  ✓ Card 5 content, title, description, button, and image asset verified');

// 2. Check CSS styling in style.css
console.log('\n2. Verifying style.css 5-column grid & responsive rules...');
const css = fs.readFileSync('style.css', 'utf8');

assert(
  css.includes('grid-template-columns: repeat(5, 1fr)'),
  'style.css must have repeat(5, 1fr) for desktop .categories-grid'
);
console.log('  ✓ Desktop .categories-grid configured with repeat(5, 1fr) in one balanced row');

assert(
  css.includes('.category-hero-cultures'),
  'style.css must define .category-hero-cultures'
);
console.log('  ✓ Dedicated category hero .category-hero-cultures defined');

// 3. Check culture.html dedicated page
console.log('\n3. Verifying culture.html dedicated page architecture...');
assert(fs.existsSync('culture.html'), 'culture.html must exist');
const culturePageHtml = fs.readFileSync('culture.html', 'utf8');

assert(culturePageHtml.includes('data-page-category="cultures"'), 'culture.html must have data-page-category="cultures"');
assert(culturePageHtml.includes('category-hero-cultures'), 'culture.html must have .category-hero-cultures');
assert(culturePageHtml.includes('id="productGrid"'), 'culture.html must have #productGrid');
assert(culturePageHtml.includes('id="siteHeader"'), 'culture.html must have site header');
assert(culturePageHtml.includes('id="cartDrawer"'), 'culture.html must have cart drawer');
assert(culturePageHtml.includes('id="checkoutModal"'), 'culture.html must have checkout modal');
assert(culturePageHtml.includes('script.js'), 'culture.html must load script.js');
console.log('  ✓ culture.html matches dedicated category page architecture');

// 4. Test script.js runtime rendering of cultures
console.log('\n4. Verifying script.js cultures category rendering...');
// Setup minimal browser-like DOM
global.window = global;
global.document = {
  body: { dataset: { pageCategory: 'cultures' } },
  querySelector: () => ({ dataset: { pageCategory: 'cultures' } }),
  querySelectorAll: () => [],
  getElementById: (id) => {
    if (id === 'productGrid') {
      return { innerHTML: '' };
    }
    if (id === 'resultCount') {
      return { innerHTML: '' };
    }
    if (id === 'activeCategoryIndicator') {
      return { textContent: '' };
    }
    return null;
  },
  addEventListener: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

eval(fs.readFileSync('script.js', 'utf8'));

// Verify PRODUCTS length is unchanged (no duplicate product data)
assert.strictEqual(window.PRODUCTS.length, 38, 'Master PRODUCTS array must remain exactly 38 products (no duplicates)');
console.log('  ✓ Zero duplicate product data created (PRODUCTS remains exactly 38)');

// Verify CATEGORY_NAMES has cultures
assert.strictEqual(window.CATEGORY_NAMES.cultures, 'Cultures', 'CATEGORY_NAMES must include cultures');
console.log('  ✓ CATEGORY_NAMES.cultures properly mapped');

// Verify getCurrentPageCategory on cultures page
const currentCat = window.getCurrentPageCategory();
assert.strictEqual(currentCat, 'cultures', `Expected "cultures", got "${currentCat}"`);
console.log('  ✓ getCurrentPageCategory() correctly identifies "cultures"');

// Test rendering of product grid on cultures page
const mockGrid = { innerHTML: '' };
const mockCount = { innerHTML: '' };
const mockIndicator = { textContent: '' };
global.document.getElementById = (id) => {
  if (id === 'productGrid') return mockGrid;
  if (id === 'resultCount') return mockCount;
  if (id === 'activeCategoryIndicator') return mockIndicator;
  return null;
};

window.renderProductGrid();
assert(mockGrid.innerHTML.includes('Microworm Starter Culture'), 'Rendered grid must include Microworm Starter Culture');
assert(mockGrid.innerHTML.includes('Vinegar Eel Live Culture'), 'Rendered grid must include Vinegar Eel Live Culture');
assert(mockGrid.innerHTML.includes('Moina Macrocopa Live Culture'), 'Rendered grid must include Moina Macrocopa Live Culture');
assert(mockGrid.innerHTML.includes('Grindal Worm Starter Culture'), 'Rendered grid must include Grindal Worm Starter Culture');
assert.strictEqual(mockIndicator.textContent, 'Cultures', 'Active category indicator must display "Cultures"');
console.log('  ✓ Live cultures product cards successfully rendered in #productGrid');

console.log('\n🎉 ALL CULTURES 5TH CARD & DEDICATED PAGE TESTS PASSED 100%!');
