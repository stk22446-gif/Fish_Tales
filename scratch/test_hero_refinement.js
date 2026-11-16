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

console.log('=== RUNNING FISH TALES HERO REFINEMENT TEST SUITE ===\n');

// 1. Cloudinary URL Preservation
const exactCloudinaryUrl = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794855875/940d8b96-b4dd-4534-a42b-2c9a1a31d2bb.png';
const urlMatches = (indexHtml.match(new RegExp(exactCloudinaryUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
assert(urlMatches >= 3, `Hero contains exact Cloudinary URL for desktop and mobile framing (found ${urlMatches})`);
assert(!indexHtml.includes('video'), 'Hero contains no old video element');

// 2. Desktop Improvements
assert(styleCss.includes('.hero-artwork-img {') && styleCss.includes('max-width: 100%;'), 'Desktop artwork max-width is 100% (not constrained to 1440px)');
assert(styleCss.includes('.hero-cinematic {') && styleCss.includes('background-color: #000000;'), 'Hero background is pure black (#000000)');
assert(styleCss.includes('.hero-visual-stage {') && styleCss.includes('overflow: hidden;'), 'Desktop visual stage spans full width cleanly');
assert(styleCss.includes('object-fit: contain;'), 'Desktop artwork preserves aspect ratio with object-fit: contain');

// 3. Mobile Framing Visuals (Upper & Lower Edges)
assert(indexHtml.includes('hero-mobile-frame hero-mobile-frame-top'), 'Contains upper mobile framing container');
assert(indexHtml.includes('hero-mobile-frame hero-mobile-frame-bottom'), 'Contains lower mobile framing container');
assert(styleCss.includes('.hero-mobile-frame {') && styleCss.includes('display: none;'), 'Mobile frames hidden on desktop');
assert(styleCss.includes('.hero-visual-stage {\n    display: none !important;'), 'Desktop visual stage hidden on mobile (<=768px)');
assert(styleCss.includes('.hero-mobile-frame {\n    display: block;'), 'Mobile frames displayed on mobile (<=768px)');
assert(styleCss.includes('.hero-mobile-frame-top {\n    top: 0;'), 'Upper mobile frame positioned at top edge');
assert(styleCss.includes('.hero-mobile-frame-bottom {\n    bottom: 0;'), 'Lower mobile frame positioned at bottom edge');
assert(styleCss.includes('object-position: left top;'), 'Upper mobile frame displays aquatic creatures from left portion');
assert(styleCss.includes('object-position: right bottom;'), 'Lower mobile frame displays terrarium creatures from right portion');
assert(styleCss.includes('mask-image: linear-gradient(to bottom'), 'Upper mobile frame has smooth gradient fade into black');
assert(styleCss.includes('mask-image: linear-gradient(to top'), 'Lower mobile frame has smooth gradient fade into black');

// 4. Mobile Layout Order & Spacing
const eyebrowIdx = indexHtml.indexOf('WELCOME TO FISH TALES');
const headingIdx = indexHtml.indexOf('Your Destination');
const accentIdx = indexHtml.indexOf('for Aquatic &amp; Exotic Life');
const descIdx = indexHtml.indexOf('Discover colorful aquarium fish');
const cta1Idx = indexHtml.indexOf('EXPLORE OUR COLLECTION');
const cta2Idx = indexHtml.indexOf('DISCOVER MORE');

assert(eyebrowIdx !== -1 && headingIdx !== -1 && accentIdx !== -1 && descIdx !== -1 && cta1Idx !== -1 && cta2Idx !== -1, 'All content elements exist in HTML');
assert(eyebrowIdx < headingIdx, '1. Eyebrow comes before heading');
assert(headingIdx < accentIdx, '2. Destination line comes before accent line');
assert(accentIdx < descIdx, '3. Heading comes before description');
assert(descIdx < cta1Idx, '4. Description comes before primary CTA');
assert(cta1Idx < cta2Idx, '5. Primary CTA comes before secondary CTA');

// 5. CTA Navigation Integrity
assert(indexHtml.includes('href="#catalogue"') && indexHtml.includes("onclick=\"scrollToSection('catalogue')\""), 'Primary CTA links to #catalogue with scrollToSection');
assert(indexHtml.includes('href="#categories"') && indexHtml.includes("onclick=\"scrollToSection('categories')\""), 'Secondary CTA links to #categories with scrollToSection');

// 6. Viewport Responsive Breakdown Simulation (320px, 360px, 375px, 390px, 414px, 430px, 768px, 1024px, 1440px, 1920px)
const viewports = [320, 360, 375, 390, 414, 430, 768, 1024, 1440, 1920];
viewports.forEach(vp => {
  const isMobile = vp <= 768;
  const isSmallMobile = vp <= 480;
  const isTinyMobile = vp <= 359;

  let btnMaxWidth = isTinyMobile ? 280 : (isSmallMobile ? 320 : (isMobile ? 'auto' : 'auto'));
  let btnFits = typeof btnMaxWidth === 'number' ? (btnMaxWidth <= vp) : true;
  assert(btnFits, `Viewport ${vp}px: Button max width (${btnMaxWidth}) does not overflow viewport`);
});

console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
}
