const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('=== FISH TALES — "DID YOU KNOW?" LAYOUT FIX VERIFICATION ===\n');

// 1. Verify product.html markup
console.log('1. Verifying product.html markup:');
const productHtml = fs.readFileSync('product.html', 'utf8');

// Check that header retains the official logo
assert(productHtml.includes('class="site-header"'), 'product.html must have .site-header');
assert(productHtml.includes('class="brand-logo-img"'), 'product.html header must retain .brand-logo-img');
console.log('  ✓ Website header retains official logo');

// Check that footer uses footer-brand and footer-logo-wrap (not nav-brand or brand-logo-img)
const footerMatch = productHtml.match(/<footer[\s\S]*?<\/footer>/i);
assert(footerMatch, 'product.html must have footer');
const footerHtml = footerMatch[0];
assert(!footerHtml.includes('class="nav-brand'), 'product.html footer must NOT use .nav-brand class');
assert(!footerHtml.includes('class="brand-logo-img"'), 'product.html footer must NOT use .brand-logo-img class');
assert(footerHtml.includes('class="footer-logo-img"'), 'product.html footer must use standard .footer-logo-img');
assert(footerHtml.includes('class="footer-logo-wrap"'), 'product.html footer must use .footer-logo-wrap');
console.log('  ✓ product.html footer uses standard footer classes (no floating nav-brand)');

// 2. Verify style.css rules
console.log('\n2. Verifying style.css layout rules for Did You Know section & nav-brand scoping:');
const css = fs.readFileSync('style.css', 'utf8');

// nav-brand must be scoped to .site-header on mobile
assert(css.includes('.site-header .nav-brand'), 'style.css must scope mobile nav-brand to .site-header');

// Did You Know card and header rules
assert(css.includes('.pdp-facts-card'), 'style.css has .pdp-facts-card');
assert(css.includes('.pdp-facts-card .pdp-section-header'), 'style.css has .pdp-facts-card .pdp-section-header');
assert(css.includes('white-space: nowrap'), 'style.css ensures single-line heading via white-space: nowrap');
assert(css.includes('justify-content: flex-start'), 'style.css ensures left-alignment via justify-content: flex-start');
console.log('  ✓ Heading "💡 Did You Know?" single-line and left-aligned layout rules verified in CSS');

// 3. Test PDP rendering in simulated DOM environment
console.log('\n3. Testing PDP DOM rendering:');
const scriptCode = fs.readFileSync('script.js', 'utf8');

const mockMain = {
  id: 'pdpMain',
  innerHTML: '',
  querySelector: () => null,
  querySelectorAll: () => []
};

const domMock = {
  document: {
    readyState: 'complete',
    getElementById: (id) => id === 'pdpMain' ? mockMain : null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  window: {
    addEventListener: () => {},
    location: { search: '?id=cubaris-murina-orange', pathname: '/product.html' }
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {}
};
domMock.window = domMock;
vm.createContext(domMock);
vm.runInContext(scriptCode, domMock);

domMock.window.renderProductDetailPage();
const rendered = mockMain.innerHTML;

// Verify Did You Know section card
const factsCardMatch = rendered.match(/<article[^>]*pdp-facts-card[\s\S]*?<\/article>/i);
assert(factsCardMatch, 'pdpSectionFacts must be rendered');
const factsCard = factsCardMatch[0];

// Assert that NO logo image is present in factsCard
assert(!factsCard.includes('<img'), 'Facts card must NOT contain any <img> tag');
assert(!factsCard.includes('logo'), 'Facts card must NOT contain any logo reference');
assert(!factsCard.includes('40e097e2'), 'Facts card must NOT contain logo image url');
console.log('  ✓ No logo image present inside "Did You Know?" section');

// Verify heading structure
assert(factsCard.includes('<div class="pdp-section-header">'), 'Facts card has .pdp-section-header');
assert(factsCard.includes('<span class="pdp-section-icon">💡</span>'), 'Facts card has 💡 icon');
assert(factsCard.includes('<h2 class="pdp-section-title">Did You Know?</h2>'), 'Facts card has "Did You Know?" title');
assert(factsCard.includes('<div class="pdp-section-body">'), 'Facts card has .pdp-section-body');
assert(factsCard.includes('<ul class="pdp-facts-list">'), 'Facts card has .pdp-facts-list');
console.log('  ✓ Heading "💡 Did You Know?" and content hierarchy strictly verified');

// Verify facts content
assert(factsCard.includes('pdp-fact-item'), 'Facts list items rendered');
console.log('  ✓ Did You Know facts content preserved');

console.log('\n🎉 ALL "DID YOU KNOW?" SECTION TESTS PASSED WITH 100% SUCCESS!');
