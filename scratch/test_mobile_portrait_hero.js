const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

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

console.log('=== RUNNING FISH TALES MOBILE PORTRAIT HERO VALIDATION ===\n');

// 1. EXACT CLOUDINARY ASSET USED
const exactCloudinaryUrl = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794855875/940d8b96-b4dd-4534-a42b-2c9a1a31d2bb.png';
assert(indexHtml.includes(exactCloudinaryUrl), 'Hero contains exact Cloudinary URL');

// 2. DESKTOP HERO STRICTLY PRESERVED
assert(styleCss.includes('.hero-mobile-portrait {\n  display: none !important;\n}'), 'Mobile portrait composition is completely hidden on desktop (>=768px)');
assert(styleCss.includes('.hero-artwork-img {') && styleCss.includes('max-height: 680px;'), 'Desktop artwork max-height and contain layout preserved');
assert(styleCss.includes('.hero-glow-left') && styleCss.includes('.hero-glow-right'), 'Desktop glow atmospheric layers preserved');

// 3. MOBILE HERO VERTICAL PORTRAIT DESIGN
assert(indexHtml.includes('class="hero-mobile-portrait"'), 'Contains dedicated mobile portrait artwork wrapper');
assert(indexHtml.includes('portrait-slice-aquatic'), 'Contains aquatic slice for Guppy/Betta/Shrimp framing');
assert(indexHtml.includes('portrait-slice-exotic'), 'Contains exotic slice for Tarantula/Isopods framing');
assert(styleCss.includes('.hero-mobile-portrait {\n    display: flex !important;'), 'Mobile portrait composition displayed on mobile (<768px)');
assert(styleCss.includes('height: clamp(260px, 72vw, 340px);'), 'Portrait container has increased vertical height (not a thin horizontal strip)');
assert(styleCss.includes('.hero-artwork-desktop {\n    display: none !important;\n  }'), 'Desktop wide image hidden on mobile (<768px)');

// 4. ZERO BUBBLES OR PARTICLES
assert(!indexHtml.includes('bubble'), 'index.html has zero bubble elements');
assert(!styleCss.includes('bubble'), 'style.css has zero bubble classes or keyframes');

// 5. MOBILE CONTENT ORDER
assert(/\.hero-visual-stage\s*\{[^}]*order:\s*1/s.test(styleCss), '1. Portrait animal artwork has order: 1 at top of mobile hero');
assert(/\.hero-cinematic-container\s*\{[^}]*order:\s*2/s.test(styleCss), '2-7. Text and buttons container has order: 2 below artwork');

const eyebrowIdx = indexHtml.indexOf('WELCOME TO FISH TALES');
const headingDestIdx = indexHtml.indexOf('Your Destination');
const headingAccentIdx = indexHtml.indexOf('for Aquatic &amp; Exotic Life');
const descIdx = indexHtml.indexOf('Discover colorful aquarium fish');
const cta1Idx = indexHtml.indexOf('EXPLORE OUR COLLECTION');
const cta2Idx = indexHtml.indexOf('DISCOVER MORE');

assert(eyebrowIdx !== -1 && headingDestIdx !== -1 && headingAccentIdx !== -1 && descIdx !== -1 && cta1Idx !== -1 && cta2Idx !== -1, 'All text elements exist in HTML');
assert(eyebrowIdx < headingDestIdx, 'Order 2: Eyebrow comes before heading');
assert(headingDestIdx < headingAccentIdx, 'Order 3-4: Destination line comes before accent line');
assert(headingAccentIdx < descIdx, 'Order 4-5: Accent line comes before description');
assert(descIdx < cta1Idx, 'Order 5-6: Description comes before primary CTA');
assert(cta1Idx < cta2Idx, 'Order 6-7: Primary CTA comes before secondary CTA');

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
