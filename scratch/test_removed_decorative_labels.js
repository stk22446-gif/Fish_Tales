const fs = require('fs');
const path = require('path');

console.log('--- TESTING REMOVAL OF DECORATIVE LABELS/BADGES ---');

const indexPath = path.join(__dirname, '..', 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

const cssPath = path.join(__dirname, '..', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

let errors = [];

// 1. Check that the 5 specified decorative labels/badges are completely removed
console.log('\n1. Verifying removal of specified decorative labels/badges...');

const prohibitedPatterns = [
  { name: '"ALL-INCLUSIVE" promo-pill badge', pattern: /<span\s+class="promo-pill">\s*All-Inclusive\s*<\/span>/i },
  { name: '"01 / AQUATIC & FISH" badge', pattern: /01\s*\/\s*AQUATIC/i },
  { name: '"02 / ISOPODS" badge', pattern: /02\s*\/\s*ISOPODS/i },
  { name: '"03 / TARANTULAS" badge', pattern: /03\s*\/\s*TARANTULAS/i },
  { name: '"04 / COMBO PACKS" badge', pattern: /04\s*\/\s*COMBO\s*PACKS/i },
  { name: 'class="category-number"', pattern: /category-number/i }
];

prohibitedPatterns.forEach(item => {
  if (item.pattern.test(indexHtml)) {
    errors.push(`Found prohibited element/text in index.html: ${item.name}`);
  } else {
    console.log(`✓ Completely removed: ${item.name}`);
  }
});

if (cssContent.includes('.category-number')) {
  errors.push('Found unused .category-number in style.css');
} else {
  console.log('✓ Removed .category-number styles from style.css');
}

// 2. Verify that Category cards remain fully intact
console.log('\n2. Verifying Category cards integrity...');
const expectedCategories = [
  { name: 'Aquarium & Fish', href: 'aquarium-fish.html' },
  { name: 'Isopods', href: 'isopods.html' },
  { name: 'Tarantulas', href: 'tarantulas.html' },
  { name: 'Combo Packs', href: 'combo-packs.html' }
];

expectedCategories.forEach(cat => {
  if (!indexHtml.includes(`href="${cat.href}"`)) {
    errors.push(`Missing link to ${cat.href}`);
  } else if (!indexHtml.includes(cat.name)) {
    errors.push(`Missing category name: ${cat.name}`);
  } else {
    console.log(`✓ Category card "${cat.name}" preserved with link to ${cat.href}`);
  }
});

// 3. Verify that Promo cards remain intact
console.log('\n3. Verifying Promo cards integrity...');
const expectedPromoPills = [
  'Desktop Kit',
  'Buy 10, Get 1 Free'
];

expectedPromoPills.forEach(pill => {
  if (!indexHtml.includes(pill)) {
    errors.push(`Unrelated promo pill was accidentally removed: ${pill}`);
  } else {
    console.log(`✓ Unrelated promo pill preserved: "${pill}"`);
  }
});

if (!indexHtml.includes('Isopod House Kit')) {
  errors.push('Missing Isopod House Kit promo card');
} else {
  console.log('✓ Isopod House Kit promo card preserved');
}

// 4. Verify other pages do not contain category-number
console.log('\n4. Verifying other pages...');
const otherPages = ['aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];
otherPages.forEach(page => {
  const pageHtml = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  if (/01\s*\/\s*AQUATIC|02\s*\/\s*ISOPODS|category-number/i.test(pageHtml)) {
    errors.push(`Found decorative badge in ${page}`);
  } else {
    console.log(`✓ Clean of decorative badges: ${page}`);
  }
});

// Final summary
console.log('\n--- TEST RESULTS SUMMARY ---');
if (errors.length === 0) {
  console.log('ALL TESTS PASSED! Specified decorative labels/badges removed cleanly with zero collateral damage.');
  process.exit(0);
} else {
  console.error(`FAILED with ${errors.length} errors:`);
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}
