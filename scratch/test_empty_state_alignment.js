const fs = require('fs');
const path = require('path');

console.log('=== TESTING SEARCH EMPTY-STATE ICON ALIGNMENT ===\n');

const cssPath = path.join(__dirname, '..', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const scriptPath = path.join(__dirname, '..', 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

let errors = [];

// 1. Verify CSS rules for .search-overlay-empty
console.log('1. Checking .search-overlay-empty CSS rules...');
const emptyContainerMatch = cssContent.match(/\.search-overlay-empty[^{]*\{([\s\S]*?)\}/);
if (!emptyContainerMatch) {
  errors.push('Missing .search-overlay-empty rule in style.css');
} else {
  const css = emptyContainerMatch[1];
  const reqs = [
    { prop: 'display: flex', pattern: /display:\s*flex/ },
    { prop: 'flex-direction: column', pattern: /flex-direction:\s*column/ },
    { prop: 'align-items: center', pattern: /align-items:\s*center/ },
    { prop: 'justify-content: center', pattern: /justify-content:\s*center/ },
    { prop: 'text-align: center', pattern: /text-align:\s*center/ }
  ];

  reqs.forEach(r => {
    if (!r.pattern.test(css)) {
      errors.push(`.search-overlay-empty missing required CSS property: ${r.prop}`);
    } else {
      console.log(`  ✓ .search-overlay-empty has ${r.prop}`);
    }
  });
}

// 2. Verify CSS rules for .search-empty-icon
console.log('\n2. Checking .search-empty-icon CSS rules...');
const iconMatch = cssContent.match(/\.search-empty-icon[^{]*\{([\s\S]*?)\}/);
if (!iconMatch) {
  errors.push('Missing .search-empty-icon rule in style.css');
} else {
  const css = iconMatch[1];
  const iconReqs = [
    { prop: 'display: block', pattern: /display:\s*block/ },
    { prop: 'margin-left: auto', pattern: /margin-left:\s*auto/ },
    { prop: 'margin-right: auto', pattern: /margin-right:\s*auto/ },
    { prop: 'align-self: center', pattern: /align-self:\s*center/ },
    { prop: 'margin-bottom (spacing)', pattern: /margin-bottom:\s*[0-9.]+(rem|px)/ }
  ];

  iconReqs.forEach(r => {
    if (!r.pattern.test(css)) {
      errors.push(`.search-empty-icon missing required CSS property: ${r.prop}`);
    } else {
      console.log(`  ✓ .search-empty-icon has ${r.prop}`);
    }
  });
}

// 3. Verify script.js template markup for empty state
console.log('\n3. Checking script.js empty-state template structure...');
if (!scriptContent.includes('class="search-empty-icon"')) {
  errors.push('script.js empty-state SVG missing class="search-empty-icon"');
} else {
  console.log('  ✓ Empty-state SVG has class="search-empty-icon"');
}

if (!scriptContent.includes('align-self:center') && !scriptContent.includes('align-self: center')) {
  errors.push('script.js empty-state SVG missing inline align-self: center reinforcement');
} else {
  console.log('  ✓ Empty-state SVG reinforced with inline centering');
}

if (!scriptContent.includes('Search Fish Tales Living Catalogue')) {
  errors.push('script.js missing heading "Search Fish Tales Living Catalogue"');
} else {
  console.log('  ✓ Heading "Search Fish Tales Living Catalogue" present');
}

if (!scriptContent.includes('Type species name, strain or category — Betta, Guppy, Molly, Shrimps, Isopods, Tarantulas, or Living Aquariums.')) {
  errors.push('script.js missing description text');
} else {
  console.log('  ✓ Description text present');
}

// 4. Verify search input icon inside the input is NOT affected
console.log('\n4. Verifying search input icon remains intact...');
if (!cssContent.includes('.search-bar-icon')) {
  errors.push('Missing .search-bar-icon for the input icon');
} else {
  console.log('  ✓ .search-bar-icon for input remains distinct and intact');
}

// Final Summary
console.log('\n================== RESULT ==================');
if (errors.length === 0) {
  console.log('🎉 ALL CHECKS PASSED! Empty-state magnifying glass icon, heading and description are perfectly centered.');
  process.exit(0);
} else {
  console.error(`❌ FAILED with ${errors.length} errors:`);
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}
