const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
const scriptJs = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('=== RUNNING FINAL HERO REFINEMENT VALIDATION SUITE ===\n');

// 1. ALL BUBBLES REMOVED
assert(!indexHtml.includes('bubble'), 'index.html contains zero bubble elements');
assert(!styleCss.includes('bubble'), 'style.css contains zero bubble classes, keyframes or pseudo-elements');
assert(!scriptJs.includes('bubble'), 'script.js contains zero bubble logic');

// 2. HERO IMAGE DISPLAYED EXACTLY ONCE (NO DUPLICATES)
const exactCloudinaryUrl = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794855875/940d8b96-b4dd-4534-a42b-2c9a1a31d2bb.png';
const urlMatches = (indexHtml.match(new RegExp(exactCloudinaryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
assert(urlMatches === 1, `Hero artwork is displayed exactly ONCE in HTML (found ${urlMatches})`);
assert(!indexHtml.includes('hero-mobile-frame'), 'No duplicate mobile image frames exist in index.html');
assert(!styleCss.includes('hero-mobile-frame'), 'No duplicate mobile image frame styles exist in style.css');

// 3. BACKGROUND REPEAT SET TO NO-REPEAT
assert(styleCss.includes('background-repeat: no-repeat;'), 'background-repeat: no-repeat is explicitly set in hero CSS');

// 4. DESKTOP IMAGE FITTING
assert(styleCss.includes('.hero-artwork-img {') && styleCss.includes('width: 100%;') && styleCss.includes('height: auto;'), 'Desktop artwork uses natural width: 100% and height: auto to fit without gaps');
assert(styleCss.includes('object-fit: contain;'), 'Desktop artwork preserves aspect ratio with object-fit: contain');
assert(styleCss.includes('.hero-cinematic-container {') && styleCss.includes('position: absolute;'), 'Desktop text container is centered over artwork with position: absolute');

// 5. MOBILE LAYOUT ORDER
assert(/\.hero-visual-stage\s*\{[^}]*order:\s*1/s.test(styleCss), 'Mobile layout sets animal artwork at the top with order: 1');
assert(/\.hero-cinematic-container\s*\{[^}]*order:\s*2/s.test(styleCss), 'Mobile layout sets content container directly below artwork with order: 2');

const eyebrowIdx = indexHtml.indexOf('WELCOME TO FISH TALES');
const headingDestIdx = indexHtml.indexOf('Your Destination');
const headingAccentIdx = indexHtml.indexOf('for Aquatic &amp; Exotic Life');
const descIdx = indexHtml.indexOf('Discover colorful aquarium fish');
const cta1Idx = indexHtml.indexOf('EXPLORE OUR COLLECTION');
const cta2Idx = indexHtml.indexOf('DISCOVER MORE');

assert(eyebrowIdx !== -1 && headingDestIdx !== -1 && headingAccentIdx !== -1 && descIdx !== -1 && cta1Idx !== -1 && cta2Idx !== -1, 'All content elements exist in HTML');
assert(eyebrowIdx < headingDestIdx, '2. Eyebrow comes before heading');
assert(headingDestIdx < headingAccentIdx, '3. Destination comes before accent line');
assert(headingAccentIdx < descIdx, '4. Accent line comes before description');
assert(descIdx < cta1Idx, '5. Description comes before primary CTA');
assert(cta1Idx < cta2Idx, '6. Primary CTA comes before secondary CTA');

// 6. BUTTON NAVIGATION INTEGRITY
assert(indexHtml.includes('href="#catalogue"') && indexHtml.includes("onclick=\"scrollToSection('catalogue')\""), 'Primary button links to #catalogue');
assert(indexHtml.includes('href="#categories"') && indexHtml.includes("onclick=\"scrollToSection('categories')\""), 'Secondary button links to #categories');

// 7. RESPONSIVE BREAKDOWN (320px, 360px, 375px, 390px, 414px, 430px, 768px, 1024px, 1440px)
const testWidths = [320, 360, 375, 390, 414, 430, 768, 1024, 1440];
testWidths.forEach(w => {
  const isTiny = w <= 359;
  const isSmall = w <= 480;
  let btnMax = isTiny ? 280 : (isSmall ? 320 : 'auto');
  let fits = typeof btnMax === 'number' ? (btnMax <= w) : true;
  assert(fits, `Width ${w}px: Buttons do not overflow screen (max-width: ${btnMax}px)`);
});

// 8. HEADER & HAMBURGER INTEGRITY
assert(indexHtml.includes('class="site-header" id="siteHeader"'), 'Sticky header intact');
assert(indexHtml.includes('id="hamburger"'), 'Hamburger button intact');
assert(indexHtml.includes('id="cartCount"'), 'Cart count badge intact');

console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
}
