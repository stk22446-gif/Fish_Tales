const fs = require('fs');
const path = require('path');

console.log('=== VERIFYING SEARCH MODAL RENDERING & FIX FOR SVG CODE BUG ===\n');

const files = ['index.html', 'aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];
let errors = [];

files.forEach(f => {
  const content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

  // Check 1: No raw SVG attribute strings without <svg
  if (content.match(/<div class="search-overlay-bar">\s*class="search-bar-icon"/)) {
    errors.push(`${f}: Found raw attributes without opening <svg tag in search-overlay-bar!`);
  } else {
    console.log(`✓ ${f}: No raw SVG attribute text in search-overlay-bar`);
  }

  // Check 2: search-bar-icon is a proper <svg element
  const svgMatch = content.match(/<svg[^>]*class="search-bar-icon"[^>]*>[\s\S]*?<\/svg>/);
  if (!svgMatch) {
    errors.push(`${f}: Missing proper <svg class="search-bar-icon"> element`);
  } else {
    console.log(`✓ ${f}: Proper <svg class="search-bar-icon"> element is present`);
  }

  // Check 3: searchOverlayInput has proper placeholder
  if (!content.includes('id="searchOverlayInput"') || !content.includes('placeholder="Search fish, isopods, tarantulas..."')) {
    errors.push(`${f}: Input missing id="searchOverlayInput" or placeholder="Search fish, isopods, tarantulas..."`);
  } else {
    console.log(`✓ ${f}: Search input has id="searchOverlayInput" and required placeholder`);
  }

  // Check 4: Heading is "Search Living Catalogue"
  if (!content.includes('Search Living Catalogue')) {
    errors.push(`${f}: Missing heading "Search Living Catalogue"`);
  } else {
    console.log(`✓ ${f}: Heading "Search Living Catalogue" is present`);
  }

  // Check 5: Close button is present
  if (!content.includes('class="search-overlay-close"') || !content.includes('closeSearchOverlay()')) {
    errors.push(`${f}: Missing close button in search modal`);
  } else {
    console.log(`✓ ${f}: Close button with closeSearchOverlay() is present`);
  }

  // Check 6: Clear button is present
  if (!content.includes('id="searchOverlayClear"') || !content.includes('clearSearchOverlayInput()')) {
    errors.push(`${f}: Missing clear button in search modal`);
  } else {
    console.log(`✓ ${f}: Clear button with clearSearchOverlayInput() is present`);
  }
});

// Check 7: Verify script.js empty state text
const scriptContent = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
if (!scriptContent.includes('Search Fish Tales Living Catalogue')) {
  errors.push('script.js: Missing empty state title "Search Fish Tales Living Catalogue"');
} else {
  console.log('✓ script.js: Empty state title "Search Fish Tales Living Catalogue" is present');
}

if (!scriptContent.includes('Type species name, strain or category — Betta, Guppy, Molly, Shrimps, Isopods, Tarantulas, or Living Aquariums.')) {
  errors.push('script.js: Missing empty state description text');
} else {
  console.log('✓ script.js: Empty state description text is present');
}

// Check 8: Verify style.css rules
const cssContent = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
if (!cssContent.includes('.search-overlay-bar') || !cssContent.includes('.search-bar-icon')) {
  errors.push('style.css: Missing .search-overlay-bar or .search-bar-icon styles');
} else {
  console.log('✓ style.css: .search-overlay-bar and .search-bar-icon styles present');
}

console.log('\n================== RESULT ==================');
if (errors.length === 0) {
  console.log('🎉 ALL CHECKS PASSED! No raw SVG attributes, input is properly enclosed, and empty state is clean.');
  process.exit(0);
} else {
  console.error(`❌ FAILED with ${errors.length} errors:`);
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}
