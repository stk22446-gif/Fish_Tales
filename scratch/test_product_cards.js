const fs = require('fs');

console.log('=== TEST SUITE: PRODUCT CARD UI REDESIGN VALIDATION ===\n');

const scriptCode = fs.readFileSync('script.js', 'utf8');
const styleCode = fs.readFileSync('style.css', 'utf8');

// 1. SCRIPT.JS CODE ARCHITECTURE
console.log('1. SCRIPT.JS CODE ARCHITECTURE:');
const hasChooseVariantInRender = scriptCode.includes('CHOOSE VARIANT:') &&
  scriptCode.indexOf('CHOOSE VARIANT:') > scriptCode.indexOf('renderProductGrid');
console.log('  ✓ "Choose Variant" dropdown removed from renderProductGrid:', !hasChooseVariantInRender);

const hasCartIconInBtn = scriptCode.includes('card-btn-add') && scriptCode.includes('<svg') && scriptCode.includes('Add to Cart');
console.log('  ✓ Add to Cart button includes shopping cart SVG icon:', hasCartIconInBtn);

const hasDividerInCard = scriptCode.includes('card-divider') &&
  scriptCode.indexOf('card-divider') > scriptCode.indexOf('renderProductGrid');
console.log('  ✓ Divider line placed between subtitle and price:', hasDividerInCard);

// 2. STYLE.CSS BUTTON & PRICING RULES
console.log('\n2. STYLE.CSS BUTTON & PRICING RULES:');
const actionsIsColumn = styleCode.includes('.product-card-actions {') &&
  styleCode.includes('flex-direction: column');
console.log('  ✓ .product-card-actions is flex column (stacked full-width):', actionsIsColumn);

const viewBtnStyle = styleCode.includes('.card-btn-view {') &&
  styleCode.includes('border: 1.5px solid var(--border-leaf)') &&
  styleCode.includes('color: var(--color-primary-dark)');
console.log('  ✓ .card-btn-view has green border and dark green text:', viewBtnStyle);

const addBtnStyle = styleCode.includes('.card-btn-add {') &&
  styleCode.includes('background-color: var(--color-primary)') &&
  styleCode.includes('color: #FFFFFF');
console.log('  ✓ .card-btn-add has dark forest green background & white text:', addBtnStyle);

// 3. EXACT ELEMENT ORDER VERIFICATION IN RENDER TEMPLATE
console.log('\n3. EXACT CARD ELEMENT ORDER VERIFICATION:');
// Find the card template string in renderProductGrid
const renderGridStart = scriptCode.indexOf('function renderProductGrid()');
const templateStart = scriptCode.indexOf('<article class="product-card"', renderGridStart);
const templateEnd = scriptCode.indexOf('</article>', templateStart);
const cardTemplate = scriptCode.substring(templateStart, templateEnd + 10);

const posThumb = cardTemplate.indexOf('product-card-thumb');
const posCat = cardTemplate.indexOf('product-card-cat');
const posName = cardTemplate.indexOf('product-card-name');
const posSub = cardTemplate.indexOf('product-card-sub');
const posDivider = cardTemplate.indexOf('card-divider');
const posPricing = cardTemplate.indexOf('product-card-pricing');
const posViewBtn = cardTemplate.indexOf('card-btn-view');
const posAddBtn = cardTemplate.indexOf('card-btn-add');

const exactOrder = (
  posThumb < posCat &&
  posCat < posName &&
  posName < posSub &&
  posSub < posDivider &&
  posDivider < posPricing &&
  posPricing < posViewBtn &&
  posViewBtn < posAddBtn
);

console.log('  1. Product image position:', posThumb);
console.log('  2. Product category position:', posCat);
console.log('  3. Product name position:', posName);
console.log('  4. Product subtitle position:', posSub);
console.log('  5. Divider line position:', posDivider);
console.log('  6. Price display position:', posPricing);
console.log('  7. View Details button position:', posViewBtn);
console.log('  8. Add to Cart button position:', posAddBtn);
console.log('  ✓ All 8 elements in exact requested order:', exactOrder);

const hasSelectOrDropdown = cardTemplate.includes('<select') || cardTemplate.includes('card-variant-box');
console.log('  ✓ Zero <select> or variant dropdown elements in card template:', !hasSelectOrDropdown);

// 4. CHECK PRODUCT DATA PRESERVATION
console.log('\n4. UNDERLYING PRODUCT DATA PRESERVATION:');
const hasProducts = scriptCode.includes('const PRODUCTS = [');
const hasVariants = scriptCode.includes('variants: [');
console.log('  ✓ PRODUCTS array intact in script.js:', hasProducts);
console.log('  ✓ Product variants data preserved in PRODUCTS array:', hasVariants);

// 5. ALL 5 PAGES CONSISTENCY
console.log('\n5. ALL 5 PAGES LINKAGE & READINESS:');
const pages = [
  'index.html',
  'aquarium-fish.html',
  'isopods.html',
  'tarantulas.html',
  'combo-packs.html'
];

let allPagesOk = true;
pages.forEach(p => {
  const content = fs.readFileSync(p, 'utf8');
  const hasGrid = content.includes('id="productGrid"');
  const hasScript = content.includes('src="script.js"');
  const hasStyle = content.includes('href="style.css"');
  const ok = hasGrid && hasScript && hasStyle;
  if (!ok) allPagesOk = false;
  console.log(`  ✓ ${p}: #productGrid container and asset linkages verified (${ok ? 'PASS' : 'FAIL'})`);
});

const allPassed = !hasChooseVariantInRender && hasCartIconInBtn && hasDividerInCard &&
  actionsIsColumn && viewBtnStyle && addBtnStyle && exactOrder && !hasSelectOrDropdown &&
  hasProducts && hasVariants && allPagesOk;

if (allPassed) {
  console.log('\n🎉 ALL PRODUCT CARD UI REDESIGN TESTS PASSED WITH 100% SUCCESS!');
} else {
  console.error('\n❌ SOME CHECKS FAILED!');
  process.exit(1);
}
