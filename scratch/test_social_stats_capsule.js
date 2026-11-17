const fs = require('fs');
const path = require('path');

console.log('=== FISH TALES SOCIAL MEDIA STATS CAPSULE TEST SUITE ===\n');

let allPassed = true;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    allPassed = false;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

const indexPath = path.join(__dirname, '..', 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const cssPath = path.join(__dirname, '..', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const otherPages = ['aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];

// 1. Placement & Uniqueness verification
console.log('--- 1. Testing Placement, Uniqueness & Page Scope ---');
const sectionMatches = [...indexContent.matchAll(/class=["'][^"']*social-stats-section[^"']*["']/g)];
assert(sectionMatches.length === 1, `index.html contains EXACTLY ONE .social-stats-section (found: ${sectionMatches.length})`);

const capsuleMatches = [...indexContent.matchAll(/class=["'][^"']*social-stats-capsule[^"']*["']/g)];
assert(capsuleMatches.length === 1, `index.html contains EXACTLY ONE .social-stats-capsule (found: ${capsuleMatches.length})`);

const visibleHeadingMatches = [...indexContent.matchAll(/<p[^>]*class=["'][^"']*social-stats-heading[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi)];
assert(visibleHeadingMatches.length === 1, `index.html contains EXACTLY ONE .social-stats-heading element (found: ${visibleHeadingMatches.length})`);

// Verify it is placed immediately after #hero and before #categories
const heroStartIndex = indexContent.indexOf('hero-cinematic');
const heroEndIndex = indexContent.indexOf('</section>', heroStartIndex);
const statsSectionTagIndex = indexContent.indexOf('<section class="social-stats-section"');
const categoriesStartIndex = indexContent.indexOf('id="categories"');

assert(heroEndIndex < statsSectionTagIndex, 'Stats capsule is placed AFTER hero section');
assert(statsSectionTagIndex < categoriesStartIndex, 'Stats capsule is placed BEFORE categories section');

// Verify no intervening sections between hero and stats capsule
const betweenHeroAndStats = indexContent.slice(heroEndIndex + '</section>'.length, statsSectionTagIndex);
assert(!betweenHeroAndStats.includes('<section'), 'No other section between hero and stats capsule');

// Ensure not placed in any other page
otherPages.forEach(page => {
  const content = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
  assert(!content.includes('social-stats-section'), `${page} does NOT contain stats capsule (homepage only)`);
});

// 2. Content verification
console.log('\n--- 2. Testing Stats Capsule Content ---');
const hasHeading = /JOIN\s+THE\s+FISH\s+TALES\s+COMMUNITY/i.test(indexContent);
assert(hasHeading, 'Heading "JOIN THE FISH TALES COMMUNITY" is present');

const EXPECTED_PLATFORMS = [
  {
    name: 'YouTube',
    count: '19K',
    label: 'Subscribers',
    url: 'https://youtube.com/@fishtales__1?si=zSvzHKCZ6J3ARKKo'
  },
  {
    name: 'Instagram',
    count: '13K',
    label: 'Followers',
    url: 'https://www.instagram.com/fishtalesssss?psln=MWVmMjZsdDJxejEwMQ=='
  },
  {
    name: 'Facebook',
    count: '11.5K',
    label: 'Followers',
    url: 'https://www.facebook.com/share/1QX5z9KkRQ/'
  }
];

EXPECTED_PLATFORMS.forEach(p => {
  assert(indexContent.includes(p.url), `${p.name} exact URL present: ${p.url}`);
  assert(indexContent.includes(p.count), `${p.name} count "${p.count}" present`);
  assert(indexContent.includes(p.label), `${p.name} label "${p.label}" present`);
});

// Check links have target="_blank" and rel="noopener noreferrer"
const statsSectionMatch = indexContent.match(/<section[^>]*class=["'][^"']*social-stats-section[^"']*["'][\s\S]*?<\/section>/i);
assert(statsSectionMatch !== null, 'Found social-stats-section block in index.html');

if (statsSectionMatch) {
  const sectionHTML = statsSectionMatch[0];
  const linkMatches = [...sectionHTML.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)];
  assert(linkMatches.length === 3, `Section contains exactly 3 links (found: ${linkMatches.length})`);

  linkMatches.forEach(lm => {
    const fullTag = lm[0];
    const href = lm[1];
    assert(/target=["']_blank["']/i.test(fullTag), `Link [${href}] has target="_blank"`);
    assert(/rel=["'][^"']*noopener\s+noreferrer[^"']*["']/i.test(fullTag), `Link [${href}] has rel="noopener noreferrer"`);
  });

  // Check SVG icons
  const svgMatches = [...sectionHTML.matchAll(/<svg[^>]*>/gi)];
  assert(svgMatches.length === 3, `Section contains exactly 3 SVG icons (found: ${svgMatches.length})`);

  // Check dividers
  const dividerMatches = [...sectionHTML.matchAll(/class=["'][^"']*social-stat-divider[^"']*["']/gi)];
  assert(dividerMatches.length === 2, `Section contains exactly 2 dividers between 3 items (found: ${dividerMatches.length})`);
}

// 3. CSS verification
console.log('\n--- 3. Testing CSS Styles in style.css ---');
assert(cssContent.includes('.social-stats-section'), 'CSS contains .social-stats-section');
assert(cssContent.includes('.social-stats-capsule'), 'CSS contains .social-stats-capsule');
assert(cssContent.includes('.social-stat-item'), 'CSS contains .social-stat-item');
assert(cssContent.includes('.social-stat-item:hover'), 'CSS contains .social-stat-item:hover');
assert(cssContent.includes('.social-stat-item:active'), 'CSS contains .social-stat-item:active (tap feedback)');
assert(cssContent.includes('.social-stat-divider'), 'CSS contains .social-stat-divider');
assert(cssContent.includes('.social-stats-heading'), 'CSS contains .social-stats-heading');

// Mobile query verification
const mobileQueryIndex = cssContent.indexOf('@media (max-width: 768px)');
const mobileCSS = cssContent.slice(mobileQueryIndex);
assert(mobileCSS.includes('.social-stats-section'), 'Mobile CSS includes .social-stats-section');
assert(mobileCSS.includes('.social-stats-capsule'), 'Mobile CSS includes .social-stats-capsule');
assert(mobileCSS.includes('.social-stat-item'), 'Mobile CSS includes .social-stat-item');
assert(mobileCSS.includes('.social-stat-count'), 'Mobile CSS includes .social-stat-count');
assert(mobileCSS.includes('.social-stat-label'), 'Mobile CSS includes .social-stat-label');

// 4. Hero integrity check
console.log('\n--- 4. Checking Hero Section Integrity ---');
assert(indexContent.includes('hero-cinematic'), 'Hero section has class hero-cinematic');
assert(indexContent.includes('hero-artwork-desktop'), 'Desktop hero artwork intact');
assert(indexContent.includes('hero-artwork-mobile'), 'Mobile hero artwork intact');
assert(indexContent.includes('EXPLORE OUR COLLECTION'), 'CTA Explore Our Collection button intact');
assert(indexContent.includes('DISCOVER MORE'), 'CTA Discover More button intact');

console.log('\n=== RESULT ===');
if (allPassed) {
  console.log('🎉 ALL TESTS PASSED! Social media stats capsule is perfectly integrated and verified.');
} else {
  console.error('❌ SOME CHECKS FAILED.');
  process.exit(1);
}
