const fs = require('fs');
const path = require('path');

console.log('=== FISH TALES LOGO HOVER EFFECT TEST SUITE ===\n');

let allPassed = true;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    allPassed = false;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

const cssPath = path.join(__dirname, '..', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 1. Inspect desktop .brand-logo-img normal state
console.log('--- 1. Testing Desktop Normal State ---');
const brandLogoNormalMatch = cssContent.match(/\.brand-logo-img\s*\{([^}]+)\}/);
assert(brandLogoNormalMatch !== null, 'Found .brand-logo-img CSS block');

if (brandLogoNormalMatch) {
  const block = brandLogoNormalMatch[1];
  assert(block.includes('width: 52px') && block.includes('height: 52px'), 'Logo dimensions preserved (52px x 52px)');
  assert(/transition:[^;]*(300ms|0\.3s)/i.test(block), 'Smooth transition of ~300ms configured in .brand-logo-img');
  assert(!block.includes('grayscale(100%)'), 'Grayscale is NOT forced on normal state (full colour preserved)');
}

// 2. Inspect desktop hover state
console.log('\n--- 2. Testing Desktop Hover State ---');
const hoverMatch = cssContent.match(/(\.nav-brand:hover\s+\.brand-logo-img[^{]*)\{([^}]+)\}/);
assert(hoverMatch !== null, 'Found .nav-brand:hover .brand-logo-img selector');

if (hoverMatch) {
  const hoverBlock = hoverMatch[2];
  assert(hoverBlock.includes('grayscale(0%)') || hoverBlock.includes('filter: none'), 'Hover restores original full natural colours (filter: grayscale(0%))');
  assert(!hoverBlock.includes('filter: blur') && !hoverBlock.includes('box-shadow: 0 0'), 'No extra glows or excessive shadows added');
}

// 3. Inspect mobile behaviour
console.log('\n--- 3. Testing Mobile Behaviour (<= 768px) ---');
const mobileQueryIndex = cssContent.indexOf('@media (max-width: 768px)');
const mobileCSS = cssContent.slice(mobileQueryIndex);
const mobileLogoMatch = mobileCSS.match(/\.brand-logo-img\s*\{([^}]+)\}/);
assert(mobileLogoMatch !== null, 'Found .brand-logo-img in mobile media query');

if (mobileLogoMatch) {
  const block = mobileLogoMatch[1];
  assert(block.includes('filter: none'), 'Mobile keeps logo in original colours without requiring tap');
  assert(!block.includes('grayscale(100%)'), 'Mobile does NOT force grayscale');
}

// 4. Desktop Protection
console.log('\n--- 4. Checking Desktop Header Layout Protection ---');
const files = ['index.html', 'aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];
files.forEach(f => {
  const content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  assert(content.includes('class="brand-logo-img"'), `${f}: Logo img element preserved`);
  assert(content.includes('class="nav-brand"'), `${f}: Nav brand wrapper preserved`);
  assert(content.includes('https://res.cloudinary.com/pv8lnpft/image/upload/v1794776392/40e097e2-b06a-4e06-add4-0ffa7c8e154d.png'), `${f}: Original logo image URL unchanged`);
});

console.log('\n=== RESULT ===');
if (allPassed) {
  console.log('🎉 ALL TESTS PASSED! Logo hover colour effect successfully verified.');
} else {
  console.error('❌ SOME CHECKS FAILED.');
  process.exit(1);
}
