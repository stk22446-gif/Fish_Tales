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

console.log('=== RUNNING FISH TALES CINEMATIC HERO TESTS ===\n');

// 1. Exact Cloudinary Image URL
const exactCloudinaryUrl = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794855875/940d8b96-b4dd-4534-a42b-2c9a1a31d2bb.png';
assert(indexHtml.includes(exactCloudinaryUrl), 'Hero contains exact Cloudinary image URL');
assert(!indexHtml.includes('video'), 'Hero contains no old video tag');

// 2. Pure Black Background & Hero Section
assert(indexHtml.includes('class="hero-cinematic" id="hero"'), 'Hero section has id="hero" and class="hero-cinematic"');
assert(styleCss.includes('.hero-cinematic {') && styleCss.includes('background-color: #000000;'), 'Hero has pure black (#000000) background');

// 3. No Card / Border Around the Image
assert(styleCss.includes('.hero-artwork-img {') && styleCss.includes('border: none !important;'), 'Hero artwork image has border: none !important');
assert(styleCss.includes('box-shadow: none !important;'), 'Hero artwork image has box-shadow: none !important');
assert(styleCss.includes('object-fit: contain;'), 'Hero artwork image preserves aspect ratio with object-fit: contain');

// 4. Centered Eyebrow Text and Decorative Lines
assert(indexHtml.includes('class="hero-cinematic-eyebrow"'), 'Contains hero eyebrow container');
assert(indexHtml.includes('WELCOME TO FISH TALES'), 'Contains eyebrow text "WELCOME TO FISH TALES"');
const eyebrowLineMatches = (indexHtml.match(/class="hero-eyebrow-line"/g) || []).length;
assert(eyebrowLineMatches === 2, `Eyebrow has decorative line on both sides (found ${eyebrowLineMatches})`);

// 5. Main Heading Typography
assert(indexHtml.includes('Your Destination'), 'Main heading includes "Your Destination"');
assert(indexHtml.includes('for Aquatic &amp; Exotic Life') || indexHtml.includes('for Aquatic & Exotic Life'), 'Main heading includes "for Aquatic & Exotic Life"');
assert(styleCss.includes('.hero-heading-destination {') && styleCss.includes('color: #FFFFFF;'), 'Heading destination is clean white');
assert(styleCss.includes('.hero-heading-accent {') && styleCss.includes('font-style: italic;'), 'Heading accent is elegant italic');

// 6. Description Text
const expectedDesc = 'Discover colorful aquarium fish, beautiful shrimps, fascinating isopods, exotic tarantulas and curated bioactive habitats.';
assert(indexHtml.includes(expectedDesc), 'Hero contains exact description text');
assert(styleCss.includes('.hero-cinematic-desc {') && styleCss.includes('max-width: 680px;'), 'Description has max-width around 700px on desktop');

// 7. Call-To-Action Buttons
assert(indexHtml.includes('EXPLORE OUR COLLECTION &rarr;') || indexHtml.includes('EXPLORE OUR COLLECTION →'), 'Primary button has text "EXPLORE OUR COLLECTION →"');
assert(indexHtml.includes('href="#catalogue"'), 'Primary button links to #catalogue');
assert(indexHtml.includes('DISCOVER MORE &#x2197;') || indexHtml.includes('DISCOVER MORE ↗'), 'Secondary button has text "DISCOVER MORE ↗"');
assert(indexHtml.includes('href="#categories"'), 'Secondary button links to #categories');
assert(styleCss.includes('.btn-hero-cinematic.btn-hero-primary {'), 'Primary button has dedicated styling');
assert(styleCss.includes('.btn-hero-cinematic.btn-hero-secondary {'), 'Secondary button has dedicated styling');

// 8. Atmospheric Glows & Environmental Lighting
assert(indexHtml.includes('hero-glow hero-glow-left'), 'Contains left atmospheric glow');
assert(indexHtml.includes('hero-glow hero-glow-right'), 'Contains right atmospheric glow');
assert(styleCss.includes('.hero-glow-left {'), 'CSS defines left green/aquatic glow');
assert(styleCss.includes('.hero-glow-right {'), 'CSS defines right green/forest glow');

// 9. Floating Aquatic Bubbles & Reduced Motion
assert(indexHtml.includes('hero-bubbles-container'), 'Contains floating bubbles container');
const bubbleCount = (indexHtml.match(/class="hero-bubble/g) || []).length;
assert(bubbleCount >= 8, `Contains at least 8 bubbles (found ${bubbleCount})`);
assert(styleCss.includes('@keyframes bubbleRise'), 'Contains bubble float animation keyframes');
assert(styleCss.includes('@media (prefers-reduced-motion: reduce)'), 'Contains prefers-reduced-motion fallback for bubbles');

// 10. Sticky Header & Hamburger Menu Integrity (Regression Check)
assert(indexHtml.includes('class="site-header"'), 'Header remains intact');
assert(styleCss.includes('position: sticky;'), 'Header remains sticky');
assert(indexHtml.includes('id="hamburger"'), 'Hamburger button remains present');
assert(indexHtml.includes('class="icon-hamburger"'), 'Dual SVG icon-hamburger remains present');
assert(indexHtml.includes('class="icon-close"'), 'Dual SVG icon-close remains present');

console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
}
