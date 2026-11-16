const fs = require('fs');

console.log('=== TEST SUITE: HOMEPAGE HERO SECTION CLOUDINARY IMAGE INTEGRATION ===\n');

let failed = false;

// 1. Verify index.html contains the exact Cloudinary URL
const indexHtml = fs.readFileSync('index.html', 'utf8');
const exactUrl = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794855875/940d8b96-b4dd-4534-a42b-2c9a1a31d2bb.png';

if (!indexHtml.includes(exactUrl)) {
  console.error(`✗ FAIL: index.html does not contain the exact Cloudinary image URL: ${exactUrl}`);
  failed = true;
} else {
  console.log('✓ PASS: index.html contains the exact required Cloudinary URL');
}

// 2. Verify no overlay caption, logo or text over the hero image
if (indexHtml.includes('class="hero-photo-caption"') || indexHtml.includes('Aquascaping &amp; Living Vivaria')) {
  console.error('✗ FAIL: index.html still contains overlay caption/text on top of the hero image');
  failed = true;
} else {
  console.log('✓ PASS: No caption, logo, or text overlay on top of the hero image');
}

// 3. Verify left side heading, description, and CTA buttons are preserved
const expectedLeftElements = [
  'Explore the Wonderful World of <em>Aquatic &amp; Exotic Life</em>.',
  'Discover beautiful aquarium fish, fascinating isopods, exotic tarantulas and curated combo packs.',
  'Shop Collection',
  'Explore Categories',
  '30',
  'Verified Species &amp; Kits'
];

expectedLeftElements.forEach(elem => {
  if (!indexHtml.includes(elem)) {
    console.error(`✗ FAIL: index.html missing preserved left-side element: ${elem}`);
    failed = true;
  } else {
    console.log(`✓ PASS: Left-side hero element preserved: "${elem.substring(0, 35)}..."`);
  }
});

// 4. Verify CSS rules in style.css for object-fit: contain and pure black (#000000) background
const css = fs.readFileSync('style.css', 'utf8');

// Check desktop rules
if (!css.includes('.hero-photo-frame {\n  position: relative;\n  border-radius: var(--radius-md);\n  overflow: hidden;\n  background-color: #000000;')) {
  console.error('✗ FAIL in style.css: .hero-photo-frame missing background-color: #000000');
  failed = true;
} else {
  console.log('✓ PASS in style.css: .hero-photo-frame has pure black (#000000) background');
}

if (!css.includes('.hero-photo-img {\n  width: 100%;\n  height: 480px;\n  max-height: 520px;\n  object-fit: contain;\n  background-color: #000000;')) {
  console.error('✗ FAIL in style.css: .hero-photo-img missing object-fit: contain or background-color: #000000');
  failed = true;
} else {
  console.log('✓ PASS in style.css: .hero-photo-img has object-fit: contain and background-color: #000000');
}

// Check responsive rules in 768px media query
const mediaIndex = css.indexOf('@media (max-width: 768px)');
if (mediaIndex !== -1) {
  const mediaCss = css.substring(mediaIndex);
  if (mediaCss.includes('object-fit: contain') && mediaCss.includes('background-color: #000000')) {
    console.log('✓ PASS in style.css: Mobile (@media <= 768px) preserves object-fit: contain and pure black background');
  } else {
    console.error('✗ FAIL in style.css: Mobile media query missing object-fit: contain');
    failed = true;
  }
}

// 5. Verify other category pages are untouched
const otherPages = ['aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];
otherPages.forEach(page => {
  const content = fs.readFileSync(page, 'utf8');
  if (content.includes(exactUrl)) {
    console.error(`✗ FAIL in ${page}: Hero image should not be in category page`);
    failed = true;
  } else {
    console.log(`✓ PASS in ${page}: Untouched, category views preserved`);
  }
});

if (failed) {
  console.error('\n❌ SOME HERO IMAGE TESTS FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 ALL HERO IMAGE INTEGRATION AND BLEND TESTS PASSED SUCCESSFULLY!');
}
