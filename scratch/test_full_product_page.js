const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — FULL PRODUCT DETAIL PAGE (PDP) SUITE ===\n');

// 1. Verify product.html file presence and structure
console.log('1. Verifying product.html structure...');
assert(fs.existsSync('product.html'), 'product.html must exist');
const productHtml = fs.readFileSync('product.html', 'utf8');

assert(productHtml.includes('id="pdpMain"'), 'product.html must contain #pdpMain container');
assert(productHtml.includes('src="script.js"'), 'product.html must include script.js');
assert(productHtml.includes('href="style.css"'), 'product.html must include style.css');
assert(productHtml.includes('class="site-header"'), 'product.html must contain sticky header');
assert(productHtml.includes('class="site-footer"'), 'product.html must contain footer');
assert(productHtml.includes('id="cartDrawer"'), 'product.html must contain cart drawer');
assert(productHtml.includes('id="searchOverlay"'), 'product.html must contain search overlay');
console.log('  ✓ product.html contains all required layout containers and assets');

// 2. Mock DOM environment for script.js
console.log('\n2. Testing renderProductDetailPage() in DOM simulation...');

const scriptCode = fs.readFileSync('script.js', 'utf8');

function createDomMock(queryString = '') {
  let innerPdp = '';
  const elements = {};

  const doc = {
    readyState: 'complete',
    title: '',
    body: { dataset: { pageCategory: 'product' }, style: {} },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        className: '',
        innerHTML: '',
        textContent: '',
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        style: {},
        appendChild(child) {},
        remove() {},
        addEventListener() {}
      };
      return el;
    },
    querySelectorAll: (sel) => {
      if (sel === '.filter-tab, .filter-pill') return [];
      return [];
    },
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
      if (id === 'cartCount') return { textContent: '0', dataset: {} };
      if (id === 'cartDrawerItems') return { innerHTML: '', dataset: {} };
      if (id === 'cartDrawerSubtotal') return { textContent: '₹0', dataset: {} };
      if (id === 'toastContainer') return { appendChild: () => {}, dataset: {} };
      if (id === 'hamburger') return { dataset: {}, removeAttribute: () => {}, setAttribute: () => {}, getAttribute: () => null, addEventListener: () => {}, querySelectorAll: () => [] };
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
          classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
          },
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
      href: 'product.html' + queryString,
      search: queryString,
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

  return { win, doc, ls, getPdpHtml: () => innerPdp };
}

// 3. Test Guppy Product Detail Page
console.log('\n3. Testing Guppy PDP (guppy-red-lace)...');
const envGuppy = createDomMock('?id=guppy-red-lace');
envGuppy.win.renderProductDetailPage();
const guppyHtml = envGuppy.getPdpHtml();

assert(guppyHtml.includes('Red Lace Guppy'), 'Must include product title');
assert(guppyHtml.includes('Poecilia reticulata'), 'Must include scientific name');
assert(guppyHtml.includes('Select Pair'), 'Must include unit label "Select Pair"');
assert(guppyHtml.includes('₹250'), 'Must include price ₹250');
assert(guppyHtml.includes('pdp-breadcrumbs'), 'Must include breadcrumbs');
assert(guppyHtml.includes('aquarium-fish.html'), 'Breadcrumb must link to aquarium-fish.html');
assert(guppyHtml.includes('pdp-gallery-col'), 'Must include gallery column');
assert(guppyHtml.includes('pdp-info-col'), 'Must include info column');
assert(guppyHtml.includes('pdpSectionOverview'), 'Must include Overview section');
assert(guppyHtml.includes('pdpSectionCare'), 'Must include Care section');
assert(guppyHtml.includes('pdpSectionHabitat'), 'Must include Habitat section');
assert(guppyHtml.includes('pdpSectionFacts'), 'Must include Did You Know? section');
assert(guppyHtml.includes('YOU MAY ALSO LIKE'), 'Must include related products section');
assert(!guppyHtml.includes('Minimum order for Isopods is 5 pieces'), 'Guppy must NOT have isopod min order notice');
console.log('  ✓ Guppy PDP rendered with all required sections');

// 4. Test Isopods Product Detail Page (Minimum Quantity Rule: 5 pieces)
console.log('\n4. Testing Isopod PDP (cubaris-murina-glacier)...');
const envIsopod = createDomMock('?id=cubaris-murina-glacier');
envIsopod.win.renderProductDetailPage();
const isopodHtml = envIsopod.getPdpHtml();

assert(isopodHtml.includes('Cubaris Murina Glacier'), 'Must include product title');
assert(isopodHtml.includes('Cubaris murina var. Glacier'), 'Must include scientific name');
assert(isopodHtml.includes('isopods.html'), 'Breadcrumb must link to isopods.html');
assert(isopodHtml.includes('Select Quantity (pieces)'), 'Must include unit label with pieces');
assert(isopodHtml.includes('Minimum order for Isopods is 5 pieces'), 'Must include isopod minimum notice');
assert(isopodHtml.includes('id="pdpQty">5<'), 'Default quantity for isopod must be 5');
assert(isopodHtml.includes('Subtotal:'), 'Must show subtotal');
console.log('  ✓ Isopod PDP rendered with 5 min qty and isopod-specific rules');

// 5. Test Tarantula Product Detail Page
console.log('\n5. Testing Tarantula PDP (chilean-rose-hair)...');
const envTarantula = createDomMock('?id=chilean-rose-hair');
envTarantula.win.renderProductDetailPage();
const tarantulaHtml = envTarantula.getPdpHtml();

assert(tarantulaHtml.includes('Chilean Rose Hair'), 'Must include tarantula name');
assert(tarantulaHtml.includes('Grammostola rosea'), 'Must include tarantula scientific name');
assert(tarantulaHtml.includes('tarantulas.html'), 'Breadcrumb must link to tarantulas.html');
assert(tarantulaHtml.includes('id="pdpQty">1<'), 'Default quantity for tarantula must be 1');
console.log('  ✓ Tarantula PDP rendered correctly');

// 6. Test Combo Pack Product Detail Page
console.log('\n6. Testing Combo Kit PDP (half-cube-aquarium-kit)...');
const envCombo = createDomMock('?id=half-cube-aquarium-kit');
envCombo.win.renderProductDetailPage();
const comboHtml = envCombo.getPdpHtml();

assert(comboHtml.includes('Half Cube Aquarium Kit'), 'Must include combo name');
assert(comboHtml.includes('combo-packs.html'), 'Breadcrumb must link to combo-packs.html');
assert(comboHtml.includes('Included in Complete Kit:'), 'Must include kit checklist');
console.log('  ✓ Combo Kit PDP rendered with kit items');

// 7. Test Card Click Handlers in renderProductGrid
console.log('\n7. Verifying card click handlers navigate to product.html...');
assert(scriptCode.includes('navigateToProduct'), 'script.js defines navigateToProduct');
assert(scriptCode.includes("navigateToProduct('${product.id}')"), 'renderProductGrid cards call navigateToProduct');
console.log('  ✓ Product cards wired to navigateToProduct');

// 8. Verify Mobile Ordering CSS
console.log('\n8. Verifying Mobile Layout CSS ordering rules in style.css...');
const styleCode = fs.readFileSync('style.css', 'utf8');
assert(styleCode.includes('@media (max-width: 860px)'), 'style.css contains @media (max-width: 860px)');
assert(styleCode.includes('.pdp-gallery-col {\n    order: 1'), 'Mobile gallery has order: 1');
assert(styleCode.includes('.pdp-info-col {\n    order: 2'), 'Mobile info col has order: 2');
assert(styleCode.includes('.pdp-scientific-name {\n    order: 1'), 'Mobile scientific name order: 1');
assert(styleCode.includes('.pdp-title {\n    order: 2'), 'Mobile title order: 2');
assert(styleCode.includes('.pdp-badges-row {\n    order: 3'), 'Mobile badges order: 3');
assert(styleCode.includes('.pdp-price-box {\n    order: 4'), 'Mobile price order: 4');
assert(styleCode.includes('.pdp-description {\n    order: 5'), 'Mobile description order: 5');
assert(styleCode.includes('.pdp-qty-section {\n    order: 8'), 'Mobile qty section order: 8');
assert(styleCode.includes('.pdp-action-buttons {\n    order: 9'), 'Mobile action buttons order: 9');
console.log('  ✓ Mobile stacking hierarchy verified in CSS');

console.log('\n🎉 ALL PRODUCT DETAIL PAGE (PDP) TESTS PASSED WITH 100% SUCCESS!');
