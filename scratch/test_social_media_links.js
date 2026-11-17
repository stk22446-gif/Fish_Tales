const fs = require('fs');
const path = require('path');

console.log('=== FISH TALES SOCIAL MEDIA LINKS TEST SUITE ===\n');

const htmlFiles = [
  'index.html',
  'aquarium-fish.html',
  'isopods.html',
  'tarantulas.html',
  'combo-packs.html'
];

const cssPath = path.join(__dirname, '..', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const EXPECTED_URLS = {
  youtube: 'https://youtube.com/@fishtales__1?si=zSvzHKCZ6J3ARKKo',
  instagram: 'https://www.instagram.com/fishtalesssss?psln=MWVmMjZsdDJxejEwMQ==',
  facebook: 'https://www.facebook.com/share/1QX5z9KkRQ/'
};

let allPassed = true;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    allPassed = false;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

// 1. Verify CSS Rules
console.log('--- 1. Testing CSS Styles in style.css ---');
assert(cssContent.includes('.footer-social-section'), 'CSS contains .footer-social-section');
assert(cssContent.includes('.footer-social-links'), 'CSS contains .footer-social-links');
assert(cssContent.includes('.footer-social-btn'), 'CSS contains .footer-social-btn');
assert(cssContent.includes('.footer-social-btn:hover'), 'CSS contains .footer-social-btn hover effect');

// Check mobile tap target size >= 44px
const mobileQuery = cssContent.slice(cssContent.indexOf('@media (max-width: 768px)'));
assert(mobileQuery.includes('.footer-social-btn'), 'Mobile query targets .footer-social-btn');
assert(mobileQuery.includes('min-width: 44px') || mobileQuery.includes('width: 44px'), 'Mobile tap target width >= 44px');
assert(mobileQuery.includes('min-height: 44px') || mobileQuery.includes('height: 44px'), 'Mobile tap target height >= 44px');

// 2. Verify HTML Files
console.log('\n--- 2. Testing Social Links in All 5 HTML Files ---');
htmlFiles.forEach(file => {
  console.log(`\nChecking ${file}:`);
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check section title
  const hasTitle = /follow\s+fish\s+tales/i.test(content);
  assert(hasTitle, `${file} contains section titled "FOLLOW FISH TALES"`);

  // Check exact URLs
  assert(content.includes(EXPECTED_URLS.youtube), `${file} contains exact YouTube URL`);
  assert(content.includes(EXPECTED_URLS.instagram), `${file} contains exact Instagram URL`);
  assert(content.includes(EXPECTED_URLS.facebook), `${file} contains exact Facebook URL`);

  // Check target="_blank" and rel="noopener noreferrer" for each in footer
  const footerBlock = (content.match(/<footer[\s\S]*?<\/footer>/i) || [''])[0];
  const linksRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  const foundSocialLinks = [];

  while ((match = linksRegex.exec(footerBlock)) !== null) {
    const fullTag = match[0];
    const href = match[1];

    if (href === EXPECTED_URLS.youtube || href === EXPECTED_URLS.instagram || href === EXPECTED_URLS.facebook) {
      foundSocialLinks.push({ href, fullTag });
      const hasTargetBlank = /target=["']_blank["']/i.test(fullTag);
      const hasRel = /rel=["'][^"']*noopener\s+noreferrer[^"']*["']/i.test(fullTag);
      assert(hasTargetBlank, `${file} link [${href.split('/')[2]}] has target="_blank"`);
      assert(hasRel, `${file} link [${href.split('/')[2]}] has rel="noopener noreferrer"`);
    }
  }

  assert(foundSocialLinks.length === 3, `${file} contains exactly 3 social links (found: ${foundSocialLinks.length})`);

  // Check that no other social links exist (twitter, tiktok, snapchat, linkedin, etc.)
  const forbiddenPlatforms = ['twitter.com', 'x.com', 'tiktok.com', 'snapchat.com', 'linkedin.com', 'pinterest.com'];
  forbiddenPlatforms.forEach(platform => {
    assert(!content.toLowerCase().includes(platform), `${file} does not contain unapproved platform ${platform}`);
  });

  // Check icons (svg)
  assert(content.includes('<svg width="20" height="20"') || content.includes('<svg'), `${file} contains SVG icons for buttons`);
});

console.log('\n=== SUMMARY ===');
if (allPassed) {
  console.log('🎉 ALL TESTS PASSED! Official social media links successfully verified across all pages.');
} else {
  console.error('❌ SOME TESTS FAILED. Please review the output above.');
  process.exit(1);
}
