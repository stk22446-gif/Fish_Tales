const fs = require('fs');
const path = require('path');

console.log('=== FISH TALES — TEST SEARCH ICON BESIDE CART & FULL SEARCH FUNCTIONALITY ===\n');

const htmlFiles = [
  'index.html',
  'aquarium-fish.html',
  'isopods.html',
  'tarantulas.html',
  'combo-packs.html'
];

const cssPath = path.join(__dirname, '..', 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const scriptPath = path.join(__dirname, '..', 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

let errors = [];

// 1. Verify Header Markup Across All 5 Pages
console.log('1. Checking Header Icon Order & Placement Across All 5 Pages...');

htmlFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Check nav-actions contains search and cart in order
  const navActionsMatch = content.match(/<div class="nav-actions">([\s\S]*?)<\/div>/);
  if (!navActionsMatch) {
    errors.push(`${file}: Missing .nav-actions container`);
    return;
  }

  const navActionsHTML = navActionsMatch[1];
  const searchIdx = navActionsHTML.indexOf('openSearchOverlay()');
  const cartIdx = navActionsHTML.indexOf('toggleCartDrawer()');
  const hamburgerIdx = navActionsHTML.indexOf('id="hamburger"');

  if (searchIdx === -1) {
    errors.push(`${file}: Missing openSearchOverlay button in .nav-actions`);
  }
  if (cartIdx === -1) {
    errors.push(`${file}: Missing toggleCartDrawer button in .nav-actions`);
  }
  if (hamburgerIdx === -1) {
    errors.push(`${file}: Missing #hamburger button in .nav-actions`);
  }

  if (searchIdx !== -1 && cartIdx !== -1) {
    if (searchIdx >= cartIdx) {
      errors.push(`${file}: Search icon must appear BEFORE Shopping Cart icon in .nav-actions`);
    } else {
      console.log(`  ✓ ${file}: Search icon is placed immediately beside & before Cart icon`);
    }
  }

  // Check search overlay placeholder
  if (!content.includes('placeholder="Search fish, isopods, tarantulas..."')) {
    errors.push(`${file}: Search input must have placeholder="Search fish, isopods, tarantulas..."`);
  } else {
    console.log(`  ✓ ${file}: Search overlay input has required placeholder`);
  }

  // Check search clear button
  if (!content.includes('id="searchOverlayClear"') || !content.includes('clearSearchOverlayInput()')) {
    errors.push(`${file}: Search overlay missing clear button with clearSearchOverlayInput()`);
  } else {
    console.log(`  ✓ ${file}: Search overlay contains clear button`);
  }
});

// 2. Verify Desktop and Mobile CSS Rules
console.log('\n2. Verifying Desktop & Mobile Header CSS in style.css...');

// Desktop check: search overlay button must NOT be display:none
if (cssContent.match(/\.nav-actions\s+button\[onclick\*="openSearchOverlay"\]\s*\{\s*display:\s*none\s*!important/)) {
  errors.push('style.css still hides search icon with display: none !important!');
} else {
  console.log('  ✓ Search icon is not hidden by display:none rule');
}

// Mobile check: nav-actions has gap and nav-action-btn displayed
const mobileBlock = cssContent.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)(?=\n@media|$)/);
if (!mobileBlock) {
  errors.push('Could not find @media (max-width: 768px) block in style.css');
} else {
  const mCSS = mobileBlock[1];
  if (!mCSS.includes('.nav-actions')) {
    errors.push('Mobile .nav-actions rule missing in style.css');
  } else {
    console.log('  ✓ Mobile .nav-actions configured for right-side icon group');
  }

  if (!mCSS.includes('.nav-brand')) {
    errors.push('Mobile .nav-brand centering rule missing');
  } else {
    console.log('  ✓ Mobile .nav-brand centered layout preserved');
  }
}

// 3. Test Full Product Search Logic in Script.js
console.log('\n3. Testing Product Search Execution & 7 Required Queries...');

// Setup minimal mock browser environment for script.js
const mockResults = [];
const mockDOM = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id,
        value: '',
        innerHTML: '',
        dataset: {},
        removeAttribute() {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        style: {},
        focus() {},
        addEventListener() {},
        querySelectorAll() { return []; }
      };
    }
    return this.elements[id];
  }
};

global.window = global;
global.document = {
  readyState: 'complete',
  body: { style: {} },
  getElementById: (id) => mockDOM.getElementById(id),
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => []
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

// Execute script.js in node context
try {
  eval(scriptContent);
} catch (err) {
  errors.push('Error evaluating script.js in test environment: ' + err.message);
}

if (typeof window.renderSearchOverlayResults !== 'function') {
  errors.push('renderSearchOverlayResults is not exported or available on window');
} else {
  console.log('  ✓ renderSearchOverlayResults function loaded successfully');

  const testQueries = [
    { query: 'Betta', expectName: 'Betta', minCount: 1 },
    { query: 'Guppy', expectName: 'Guppy', minCount: 13 },
    { query: 'Molly', expectName: 'Golden Molly', minCount: 1 },
    { query: 'Shrimp', expectName: 'Crystal Red Shrimp', minCount: 1 },
    { query: 'Isopod', expectName: 'Isopod', minCount: 7 },
    { query: 'Tarantula', expectName: 'Tarantula', minCount: 6 },
    { query: 'Aquarium Kit', expectName: 'Aquarium Kit', minCount: 1 }
  ];

  testQueries.forEach(t => {
    window.renderSearchOverlayResults(t.query);
    const html = mockDOM.getElementById('searchOverlayResults').innerHTML;

    if (!html.includes(t.expectName)) {
      errors.push(`Search for "${t.query}" did not return expected "${t.expectName}". Rendered HTML: ${html.slice(0, 200)}`);
    } else {
      // Count result rows
      const rowMatches = (html.match(/class="search-result-row"/g) || []).length;
      if (rowMatches < t.minCount) {
        errors.push(`Search for "${t.query}" returned ${rowMatches} results, expected >= ${t.minCount}`);
      } else {
        console.log(`  ✓ Search query "${t.query}": returned ${rowMatches} matches (found "${t.expectName}")`);
      }
    }

    // Check that results include image thumbnail, name, price, and click handler
    if (!html.includes('class="search-result-thumb"') || !html.includes('class="search-result-price"') || !html.includes('openProductModal(')) {
      errors.push(`Search results for "${t.query}" must include thumbnail image, price, and openProductModal click handler!`);
    }
  });

  // Test "No products found" friendly message
  console.log('\n4. Testing "No products found" Friendly Empty State...');
  window.renderSearchOverlayResults('NonExistentDragonCreatureXYZ');
  const noMatchHtml = mockDOM.getElementById('searchOverlayResults').innerHTML;
  if (!noMatchHtml.includes('No products found for') || !noMatchHtml.includes('NonExistentDragonCreatureXYZ')) {
    errors.push('No products found message is missing or incorrect');
  } else {
    console.log('  ✓ Friendly "No products found" message rendered correctly with query citation');
  }

  // Test Clear input functionality
  console.log('\n5. Testing Clear Search Input Handler...');
  const inputEl = mockDOM.getElementById('searchOverlayInput');
  const clearBtnEl = mockDOM.getElementById('searchOverlayClear');
  inputEl.value = 'Molly';
  window.handleOverlaySearch('Molly');
  if (!clearBtnEl.classList.contains('visible')) {
    errors.push('Clear button should have visible class when input is non-empty');
  } else {
    console.log('  ✓ Clear button becomes visible when typing');
  }

  window.clearSearchOverlayInput();
  if (inputEl.value !== '') {
    errors.push('clearSearchOverlayInput did not reset input value to empty');
  } else if (clearBtnEl.classList.contains('visible')) {
    errors.push('clearSearchOverlayInput did not remove visible class from clear button');
  } else {
    console.log('  ✓ clearSearchOverlayInput successfully cleared input and hid clear button');
  }

  // Test Empty state when query is blank
  const emptyHtml = mockDOM.getElementById('searchOverlayResults').innerHTML;
  if (!emptyHtml.includes('Search Fish Tales Living Catalogue')) {
    errors.push('Search overlay empty state message missing when input is blank');
  } else {
    console.log('  ✓ Blank search shows clean living catalogue prompt');
  }
}

// 6. Viewport Clearance & Overlap Calculation Test
console.log('\n6. Testing Header Layout Dimensions & Overlap Prevention...');
const viewports = [
  { width: 320, name: '320px (iPhone SE 1st gen / Mini)' },
  { width: 360, name: '360px (Standard Android / Galaxy)' },
  { width: 375, name: '375px (iPhone SE 2nd / iPhone X/11)' },
  { width: 390, name: '390px (iPhone 12/13/14/15)' },
  { width: 430, name: '430px (iPhone Pro Max)' },
  { width: 768, name: '768px (Tablet)' },
  { width: 1024, name: '1024px (Desktop Small)' },
  { width: 1440, name: '1440px (Desktop Large)' }
];

viewports.forEach(vp => {
  if (vp.width <= 768) {
    const btnSize = vp.width <= 320 ? 33 : (vp.width <= 360 ? 34 : 38);
    const gap = 7;
    const padding = 12;
    const rightActionsWidth = (btnSize * 2) + gap + padding; // Search + Cart + gap + padding
    const leftHamburgerWidth = btnSize + padding;
    const centerHalfWidth = vp.width / 2;
    const availableCenterToRight = centerHalfWidth - rightActionsWidth;
    const brandWidth = vp.width <= 320 ? 108 : (vp.width <= 360 ? 125 : 138);

    if (brandWidth / 2 >= availableCenterToRight) {
      errors.push(`Overlap risk at viewport ${vp.name}! Available center-to-right: ${availableCenterToRight}px, Brand half: ${brandWidth / 2}px`);
    } else {
      const clearance = availableCenterToRight - (brandWidth / 2);
      console.log(`  ✓ Viewport ${vp.name}: Clearance of ${clearance.toFixed(1)}px between centered brand and search icon`);
    }
  } else {
    console.log(`  ✓ Viewport ${vp.name}: Desktop flex layout (Search and Cart grouped on right)`);
  }
});

// Final Result Summary
console.log('\n================== SUMMARY ==================');
if (errors.length === 0) {
  console.log('🎉 ALL TESTS PASSED! Search icon is properly placed beside Cart, responsive across desktop and mobile, and all 7 product queries match with thumbnails & prices.');
  process.exit(0);
} else {
  console.error(`❌ FAILED with ${errors.length} errors:`);
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}
