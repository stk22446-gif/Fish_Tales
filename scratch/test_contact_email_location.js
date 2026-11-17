const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — CONTACT EMAIL & LOCATION VERIFICATION TEST ===\n');

// 1. Check for any remaining occurrences of "Bengaluru, Karnataka, India"
console.log('1. Checking for any remaining occurrences of "Bengaluru, Karnataka, India":');
const filesToCheck = [
  'index.html',
  'aquarium-fish.html',
  'isopods.html',
  'tarantulas.html',
  'combo-packs.html',
  'product.html',
  'script.js',
  'style.css',
  'README.md',
  'vercel.json'
];

let foundLocation = false;
filesToCheck.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('Bengaluru, Karnataka, India')) {
    console.error(`  ❌ Found "Bengaluru, Karnataka, India" in ${file}`);
    foundLocation = true;
  }
});
assert.strictEqual(foundLocation, false, 'No occurrences of "Bengaluru, Karnataka, India" should exist');
console.log('  ✓ Zero occurrences of "Bengaluru, Karnataka, India" found across all project files');

// 2. Check for "fishtales.exotic@gmail.com" in HTML and JS files
console.log('\n2. Verifying official email "fishtales.exotic@gmail.com":');
const expectedEmail = 'fishtales.exotic@gmail.com';
const expectedMailto = 'mailto:fishtales.exotic@gmail.com';

const htmlPages = [
  'index.html',
  'aquarium-fish.html',
  'isopods.html',
  'tarantulas.html',
  'combo-packs.html',
  'product.html'
];

htmlPages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  assert(content.includes(expectedEmail), `${page} must include ${expectedEmail}`);
  assert(content.includes(expectedMailto), `${page} must include mailto link ${expectedMailto}`);
  console.log(`  ✓ ${page} contains ${expectedEmail} and ${expectedMailto}`);
});

// Check script.js
const scriptContent = fs.readFileSync('script.js', 'utf8');
assert(scriptContent.includes(expectedEmail), `script.js must include ${expectedEmail}`);
console.log(`  ✓ script.js contains ${expectedEmail}`);

// 3. Verify no broken HTML or empty address elements
console.log('\n3. Verifying footer cleanups & semantic validity:');
htmlPages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  assert(!content.includes('<span></span>'), `${page} must not have empty span elements`);
  assert(!content.includes('<p></p>'), `${page} must not have empty paragraph elements`);
  assert(!content.includes('<div></div>'), `${page} must not have empty div elements`);
  console.log(`  ✓ ${page} footer markup is clean`);
});

console.log('\n🎉 ALL CONTACT EMAIL & LOCATION CHECKS PASSED WITH 100% SUCCESS!');
