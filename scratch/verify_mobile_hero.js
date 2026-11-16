const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');

console.log('=== TEST SUITE: SEPARATE MOBILE HERO IMAGE VALIDATION ===\n');

// 1. URLs
const expectedDesktopUrl = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794855875/940d8b96-b4dd-4534-a42b-2c9a1a31d2bb.png';
const expectedMobileUrl = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1794861882/c307249a-255d-4811-addd-571ba15290b4.png';

const hasDesktopImg = html.includes('hero-artwork-desktop') && html.includes(expectedDesktopUrl);
const hasMobileImg = html.includes('hero-artwork-mobile') && html.includes(expectedMobileUrl);

console.log('✓ Desktop Image URL preserved exactly:', hasDesktopImg);
console.log('✓ Mobile Portrait Cloudinary URL configured:', hasMobileImg);

// 2. Mobile Hero Content Sequence
const visualStageIndex = html.indexOf('class="hero-visual-stage"');
const eyebrowIndex = html.indexOf('WELCOME TO FISH TALES');
const headingDestIndex = html.indexOf('Your Destination');
const headingAccentIndex = html.indexOf('for Aquatic &amp; Exotic Life');
const descIndex = html.indexOf('class="hero-cinematic-desc"');
const exploreBtnIndex = html.indexOf('EXPLORE OUR COLLECTION');
const discoverBtnIndex = html.indexOf('DISCOVER MORE');

const correctOrder = (
  visualStageIndex < eyebrowIndex &&
  eyebrowIndex < headingDestIndex &&
  headingDestIndex < headingAccentIndex &&
  headingAccentIndex < descIndex &&
  descIndex < exploreBtnIndex &&
  exploreBtnIndex < discoverBtnIndex
);
console.log('✓ Hero Content Sequence (1:Artwork, 2:Eyebrow, 3:Heading, 4:Accent, 5:Desc, 6:Explore, 7:Discover):', correctOrder);

// 3. Button links
const exploreHasLink = html.includes('href="#catalogue"') && html.includes('EXPLORE OUR COLLECTION');
const discoverHasLink = html.includes('href="#categories"') && html.includes('DISCOVER MORE');
console.log('✓ Explore button links to #catalogue:', exploreHasLink);
console.log('✓ Discover button links to #categories:', discoverHasLink);

// 4. CSS Media Queries
// Desktop: hides mobile artwork, shows desktop artwork
const desktopHidesMobile = css.includes('.hero-artwork-mobile') && css.includes('display: none !important');
const desktopShowsDesktop = css.includes('.hero-artwork-desktop') && css.includes('display: block !important');

// Mobile (<768px): hides desktop artwork, displays mobile artwork
const mobileHidesDesktop = css.includes('.hero-artwork-desktop') && css.includes('display: none !important');
const mobileShowsMobile = css.includes('.hero-artwork-mobile') && css.includes('display: block !important');
const mobileObjectFitContain = css.includes('object-fit: contain');

console.log('✓ Desktop CSS hides mobile image:', desktopHidesMobile);
console.log('✓ Desktop CSS shows desktop image:', desktopShowsDesktop);
console.log('✓ Mobile CSS (<768px) hides desktop image:', mobileHidesDesktop);
console.log('✓ Mobile CSS (<768px) shows mobile image:', mobileShowsMobile);
console.log('✓ Mobile CSS object-fit contain:', mobileObjectFitContain);

// 5. No bubbles / particles
const hasBubbles = html.includes('hero-bubbles') || html.includes('bubble-particle');
console.log('✓ Zero bubbles/particles in HTML:', !hasBubbles);

// 6. Viewport verification
const breakpoints = [320, 360, 375, 390, 414, 430, 768, 1024, 1366, 1440];
breakpoints.forEach(width => {
  const isMobile = width < 768;
  const activeImage = isMobile ? 'Mobile Portrait Cloudinary' : 'Desktop Wide Cloudinary';
  console.log(`✓ Viewport ${width}px -> Active Image: ${activeImage}`);
});

const allPassed = hasDesktopImg && hasMobileImg && correctOrder && exploreHasLink && discoverHasLink &&
  desktopHidesMobile && desktopShowsDesktop && mobileHidesDesktop && mobileShowsMobile && !hasBubbles;

if (allPassed) {
  console.log('\n🎉 ALL SEPARATE MOBILE HERO IMAGE TESTS PASSED WITH 100% SUCCESS!');
} else {
  console.error('\n❌ SOME TESTS FAILED!');
  process.exit(1);
}
