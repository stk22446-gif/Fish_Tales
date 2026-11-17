const fs = require('fs');
const path = require('path');

console.log('=== FISH TALES UNWANTED PROMOTIONAL BADGES REMOVAL TEST SUITE ===\n');

let allPassed = true;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    allPassed = false;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

const websiteFiles = [
  'index.html',
  'aquarium-fish.html',
  'isopods.html',
  'tarantulas.html',
  'combo-packs.html',
  'script.js',
  'style.css'
];

const prohibitedPhrases = [
  'DESKTOP KIT',
  'BUY 10, GET 1 FREE'
];

console.log('--- 1. Checking for prohibited promotional phrases across website files ---');
websiteFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  prohibitedPhrases.forEach(phrase => {
    // Check case-insensitively
    const regex = new RegExp(phrase.replace(',', '\\,'), 'i');
    const hasPhrase = regex.test(content);
    assert(!hasPhrase, `${file}: Does NOT contain "${phrase}"`);
  });
});

console.log('\n--- 2. Verifying Promotional Cards in index.html ---');
const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Ensure promo-card-media containers exist and don't contain empty badge containers
const promoMediaMatches = [...indexContent.matchAll(/<div class="promo-card-media">([\s\S]*?)<\/div>/gi)];
assert(promoMediaMatches.length === 3, `Found exactly 3 promo-card-media containers (found: ${promoMediaMatches.length})`);

promoMediaMatches.forEach((match, idx) => {
  const inner = match[1];
  assert(inner.includes('<img'), `Promo card #${idx + 1} has <img> tag`);
  assert(!inner.includes('promo-pill'), `Promo card #${idx + 1} has NO promo-pill element`);
  assert(!inner.includes('badge'), `Promo card #${idx + 1} has NO badge element`);
});

// Ensure the 3 products are intact in the promotional section
assert(indexContent.includes('Isopod House Kit'), 'Promo bundle 1 "Isopod House Kit" intact');
assert(indexContent.includes('Half Cube Aquarium Kit'), 'Promo bundle 2 "Half Cube Aquarium Kit" intact');
assert(indexContent.includes('Glacier Colony Pack'), 'Promo bundle 3 "Glacier Colony Pack" intact');

// Prices intact
assert(indexContent.includes('₹1,545'), 'Price ₹1,545 intact');
assert(indexContent.includes('₹999'), 'Price ₹999 intact');
assert(indexContent.includes('₹700'), 'Price ₹700 intact');

console.log('\n--- 3. Verifying Products in script.js ---');
const scriptContent = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

assert(scriptContent.includes('id: "isopod-house-kit"'), 'Product "isopod-house-kit" intact in script.js');
assert(scriptContent.includes('id: "half-cube-aquarium-kit"'), 'Product "half-cube-aquarium-kit" intact in script.js');
assert(scriptContent.includes('id: "glacier-colony-pack"'), 'Product "glacier-colony-pack" intact in script.js');
assert(scriptContent.includes('name: "Glacier Colony Pack"'), 'Product "glacier-colony-pack" has clean name "Glacier Colony Pack"');

console.log('\n=== RESULT ===');
if (allPassed) {
  console.log('🎉 ALL TESTS PASSED! Both promotional badges are completely removed with zero collateral damage.');
} else {
  console.error('❌ SOME CHECKS FAILED.');
  process.exit(1);
}
