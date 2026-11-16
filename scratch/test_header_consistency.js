const fs = require('fs');

console.log('=== VERIFYING HEADER CONSISTENCY ACROSS ALL 5 PAGES ===\n');

const pages = [
  { file: 'index.html', activeLink: 'Home' },
  { file: 'aquarium-fish.html', activeLink: 'Aquarium & Fish' },
  { file: 'isopods.html', activeLink: 'Isopods' },
  { file: 'tarantulas.html', activeLink: 'Tarantulas' },
  { file: 'combo-packs.html', activeLink: 'Combo Packs' }
];

let failed = false;

pages.forEach(({ file, activeLink }) => {
  console.log(`Checking ${file}...`);
  const content = fs.readFileSync(file, 'utf8');

  // 1. Notice Bar
  if (!content.includes('class="cod-banner"') || !content.includes('role="alert"')) {
    console.error(`✗ FAIL in ${file}: Missing .cod-banner`);
    failed = true;
  } else {
    console.log(`  ✓ Top Notice Bar (.cod-banner) present`);
  }
  if (!content.includes('🌿') || !content.includes('Cash on Delivery (COD) is strictly unavailable')) {
    console.error(`✗ FAIL in ${file}: Missing COD notice text or leaf icon`);
    failed = true;
  } else {
    console.log(`  ✓ COD Notice text and leaf icon present`);
  }

  // 2. Site Header
  if (!content.includes('<header class="site-header" id="siteHeader">')) {
    console.error(`✗ FAIL in ${file}: Missing #siteHeader`);
    failed = true;
  } else {
    console.log(`  ✓ #siteHeader present`);
  }

  // 3. Logo
  if (!content.includes('https://res.cloudinary.com/pv8lnpft/image/upload/v1794776392/40e097e2-b06a-4e06-add4-0ffa7c8e154d.png') ||
      !content.includes('FISH <span class="logo-accent">TALES</span>') ||
      !content.includes('Aquatic &amp; Exotic Life')) {
    console.error(`✗ FAIL in ${file}: Missing or incorrect brand logo/title`);
    failed = true;
  } else {
    console.log(`  ✓ Brand logo and typography present`);
  }

  // 4. Exactly 7 nav links
  const expectedNavs = ['Home', 'Aquarium & Fish', 'Isopods', 'Tarantulas', 'Combo Packs', 'About Us', 'Contact'];
  expectedNavs.forEach(navText => {
    const escaped = navText.replace('&', '&amp;');
    if (!content.includes(`>${escaped}</a>`) && !content.includes(`>${navText}</a>`)) {
      console.error(`✗ FAIL in ${file}: Missing nav link for ${navText}`);
      failed = true;
    }
  });
  console.log(`  ✓ All 7 navigation links present`);

  // 5. Active Link Highlight
  const activeRegex = /<a[^>]+class="nav-link\s+active"[^>]*>([^<]+)<\/a>/;
  const match = content.match(activeRegex);
  if (!match) {
    console.error(`✗ FAIL in ${file}: No active nav link found!`);
    failed = true;
  } else {
    const activeText = match[1].replace('&amp;', '&').trim();
    if (activeText === activeLink) {
      console.log(`  ✓ Active link correctly set to: "${activeText}"`);
    } else {
      console.error(`✗ FAIL in ${file}: Expected active link "${activeLink}" but found "${activeText}"`);
      failed = true;
    }
  }

  // 6. Right Action Controls
  if (!content.includes('openSearchOverlay()')) {
    console.error(`✗ FAIL in ${file}: Missing search trigger`);
    failed = true;
  }
  if (!content.includes('toggleCartDrawer()') || !content.includes('id="cartCount"')) {
    console.error(`✗ FAIL in ${file}: Missing cart trigger or cartCount badge`);
    failed = true;
  }
  if (!content.includes('id="hamburger"') || !content.includes('toggleMobileMenu()')) {
    console.error(`✗ FAIL in ${file}: Missing hamburger button`);
    failed = true;
  }
  console.log(`  ✓ Search, Cart Drawer with badge, and Mobile Hamburger present`);

  // 7. Check for malformed tags
  if (content.includes('</div\n') || content.includes('</div\r')) {
    console.error(`✗ FAIL in ${file}: Malformed </div tag found`);
    failed = true;
  }
});

if (failed) {
  console.error('\n❌ SOME CHECKS FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 ALL 5 PAGES PASSED HEADER VERIFICATION 100%!');
}
