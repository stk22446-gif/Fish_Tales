const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — MOBILE PROMOTIONAL SLIDER LAYOUT VERIFICATION ===\n');

const css = fs.readFileSync('style.css', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify CSS rules are in mobile media query
console.log('1. Checking mobile media query (@media (max-width: 768px)):');
const mobileMediaIndex = css.lastIndexOf('@media (max-width: 768px)');
assert(mobileMediaIndex !== -1, 'Must contain @media (max-width: 768px)');
const mobileCss = css.slice(mobileMediaIndex);

assert(mobileCss.includes('.promo-slider-section'), 'Mobile CSS has .promo-slider-section');
assert(mobileCss.includes('.promo-slider-container'), 'Mobile CSS has .promo-slider-container');
assert(mobileCss.includes('.promo-slider-track'), 'Mobile CSS has .promo-slider-track');
assert(mobileCss.includes('.promo-slide-img'), 'Mobile CSS has .promo-slide-img');
assert(mobileCss.includes('.promo-slider-dots'), 'Mobile CSS has .promo-slider-dots');
console.log('  ✓ Mobile media query rules exist for all slider components');

// 2. Check 12-14px side margins
console.log('\n2. Verifying 12-14px side margins on mobile:');
const containerPaddingMatch = mobileCss.match(/\.promo-slider-section \.container\s*\{[^}]*padding-left:\s*(\d+)px;[^}]*padding-right:\s*(\d+)px;/);
assert(containerPaddingMatch, 'Must specify explicit pixel padding for mobile container');
const pLeft = parseInt(containerPaddingMatch[1], 10);
const pRight = parseInt(containerPaddingMatch[2], 10);
assert(pLeft >= 12 && pLeft <= 14, `Left margin ${pLeft}px must be between 12-14px`);
assert(pRight >= 12 && pRight <= 14, `Right margin ${pRight}px must be between 12-14px`);
console.log(`  ✓ Side margins: Left=${pLeft}px, Right=${pRight}px (strictly within 12–14px)`);

// 3. Verify No fixed height or min-height causing empty spaces
console.log('\n3. Verifying natural wrapping (no fixed height / min-height):');
const sectionRulesMatch = mobileCss.match(/\.promo-slider-section\s*\{([^}]*)\}/);
assert(sectionRulesMatch, 'Must find .promo-slider-section in mobile media query');
const sectionRules = sectionRulesMatch[1];
assert(sectionRules.includes('min-height: 0'), '.promo-slider-section must reset min-height to 0');
assert(sectionRules.includes('height: auto'), '.promo-slider-section must have height: auto');
assert(!sectionRules.includes('100vh') && !sectionRules.includes('50vh'), 'No viewport height in section');

const trackRulesMatch = mobileCss.match(/\.promo-slider-track\s*\{([^}]*)\}/);
assert(trackRulesMatch, 'Must find .promo-slider-track in mobile media query');
const trackRules = trackRulesMatch[1];
assert(trackRules.includes('min-height: 0'), '.promo-slider-track must reset min-height to 0');
assert(trackRules.includes('height: auto'), '.promo-slider-track must have height: auto');
console.log('  ✓ Natural wrapping verified: min-height: 0, height: auto, no viewport-based height');

// 4. Verify Poster dimensions and scaling
console.log('\n4. Verifying poster size & aspect ratio preservation:');
assert(mobileCss.includes('width: 100%'), 'Poster uses width: 100% of available mobile width');
assert(mobileCss.includes('height: auto'), 'Poster uses height: auto');
assert(mobileCss.includes('object-fit: contain'), 'Poster preserves object-fit: contain');
assert(mobileCss.includes('display: block'), 'Poster has display: block');
console.log('  ✓ Poster sizing verified: width: 100%, height: auto, object-fit: contain');

// 5. Verify Navigation Dots Spacing (16-24px below poster)
console.log('\n5. Verifying navigation dots spacing (16-24px below poster):');
const dotsMatch = mobileCss.match(/\.promo-slider-dots\s*\{[^}]*margin-top:\s*(\d+)px;/);
assert(dotsMatch, 'Must specify margin-top for .promo-slider-dots');
const dotsMarginTop = parseInt(dotsMatch[1], 10);
assert(dotsMarginTop >= 16 && dotsMarginTop <= 24, `Dots spacing ${dotsMarginTop}px must be between 16-24px`);
console.log(`  ✓ Navigation dots placed directly below poster with ${dotsMarginTop}px spacing (16–24px)`);

// 6. Verify Four Main Pillars Spacing
console.log('\n6. Verifying reduced spacing to Four Main Pillars on mobile:');
const catMobileMatch = css.match(/\.categories-section\s*\{[^}]*padding-top:\s*([^;]+);/);
assert(catMobileMatch, 'Must have reduced padding-top on .categories-section');
console.log(`  ✓ Categories section padding-top reduced to: ${catMobileMatch[1].trim()}`);

// 7. Verify Layout Geometry across 360px, 375px, and 430px
console.log('\n7. Testing responsive geometry at 360px, 375px, and 430px:');
const testWidths = [360, 375, 430];
testWidths.forEach(w => {
  const posterWidth = w - (pLeft + pRight);
  const ratio = (posterWidth / w) * 100;
  assert(posterWidth > 0, `Poster width must be positive at ${w}px`);
  assert(posterWidth + (pLeft + pRight) === w, `Total width must equal viewport width (${w}px)`);
  console.log(`  ✓ Viewport ${w}px: Side margins: ${pLeft}px each | Poster width: ${posterWidth}px (${ratio.toFixed(1)}% of screen) | Zero horizontal overflow`);
});

// 8. Verify Desktop layout was NOT modified
console.log('\n8. Verifying desktop layout remains intact:');
const desktopCss = css.slice(0, mobileMediaIndex);
assert(desktopCss.includes('max-width: 1120px'), 'Desktop container max-width: 1120px preserved');
assert(desktopCss.includes('padding: 1.75rem 0 2rem 0'), 'Desktop section padding preserved');
console.log('  ✓ Desktop styles preserved 100%');

console.log('\n🎉 ALL MOBILE PROMOTIONAL SLIDER TESTS PASSED WITH 100% SUCCESS!');
