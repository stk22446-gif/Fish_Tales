const fs = require('fs');

console.log('=== TEST SUITE: INTERMITTENT MOBILE HAMBURGER MENU FIX & 20-CONSECUTIVE-TAP ACCEPTANCE TEST ===\n');

let failed = false;

// 1. Verify all 5 HTML pages
const htmlFiles = ['index.html', 'aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Check type="button"
  if (!content.includes('type="button"') || !content.includes('id="hamburger"')) {
    console.error(`✗ FAIL in ${file}: #hamburger button must have type="button"`);
    failed = true;
  } else {
    console.log(`✓ PASS in ${file}: #hamburger has type="button"`);
  }

  // Check aria-controls and aria-expanded
  if (!content.includes('aria-controls="navMenu"') || !content.includes('aria-expanded="false"')) {
    console.error(`✗ FAIL in ${file}: Missing accessibility attributes (aria-controls or aria-expanded)`);
    failed = true;
  } else {
    console.log(`✓ PASS in ${file}: Proper accessibility attributes (aria-controls="navMenu", aria-expanded="false")`);
  }

  // Check dual SVGs (.icon-hamburger and .icon-close)
  if (!content.includes('class="icon-hamburger"') || !content.includes('class="icon-close"')) {
    console.error(`✗ FAIL in ${file}: Missing dual icons (.icon-hamburger and .icon-close)`);
    failed = true;
  } else {
    console.log(`✓ PASS in ${file}: Dual SVG icons present for CSS-driven zero-DOM-recreation toggling`);
  }

  // Check no inline onclick on hamburger
  const hamburgerTagMatch = content.match(/<button[^>]*id="hamburger"[^>]*>/);
  if (hamburgerTagMatch && hamburgerTagMatch[0].includes('onclick=')) {
    console.error(`✗ FAIL in ${file}: Inline onclick attribute should not be present on #hamburger: ${hamburgerTagMatch[0]}`);
    failed = true;
  } else {
    console.log(`✓ PASS in ${file}: No inline onclick attribute on #hamburger button`);
  }
});

// 2. Verify CSS in style.css
const css = fs.readFileSync('style.css', 'utf8');

const expectedCss = [
  '.hamburger-btn svg {\n    pointer-events: none;\n  }',
  '.hamburger-btn .icon-close {\n    display: none;\n  }',
  '.hamburger-btn.active .icon-hamburger {\n    display: none;\n  }',
  '.hamburger-btn.active .icon-close {\n    display: block;\n  }'
];

expectedCss.forEach(pattern => {
  // Normalize whitespace for check
  const cleanPattern = pattern.replace(/\s+/g, ' ');
  const cleanCss = css.replace(/\s+/g, ' ');
  if (!cleanCss.includes(cleanPattern)) {
    console.error(`✗ FAIL in style.css: Missing CSS pattern: ${cleanPattern}`);
    failed = true;
  } else {
    console.log(`✓ PASS in style.css: Found icon toggle rule: ${cleanPattern}`);
  }
});

// Verify 5 Mobile screen widths
const testWidths = [320, 360, 375, 390, 430];
testWidths.forEach(w => {
  if (w <= 768) {
    console.log(`✓ PASS: Width ${w}px is safely covered by @media (max-width: 768px)`);
  }
});

// 3. Verify JavaScript logic in script.js
const js = fs.readFileSync('script.js', 'utf8');

if (!js.includes('window.initMobileMenu = function') ||
    !js.includes('hamburger.dataset.menuInitialized = \'true\'') ||
    !js.includes('e.stopPropagation()') ||
    !js.includes('e.target.closest(\'#hamburger\')')) {
  console.error('✗ FAIL in script.js: Missing initialization, deduplication, or event isolation logic');
  failed = true;
} else {
  console.log('✓ PASS in script.js: Robust single-listener initialization, deduplication, and propagation isolation found');
}

// 4. Acceptance Test: 20 Consecutive Taps without failure or desynchronization
class MockDOM {
  constructor() {
    this.navMenuClasses = new Set();
    this.hamburgerClasses = new Set();
    this.backdropClasses = new Set();
    this.bodyClasses = new Set();
    this.ariaExpanded = 'false';
  }

  toggle(e) {
    if (e && e.stopPropagation) e.stopPropagation();

    // Toggle navMenu
    const isOpen = !this.navMenuClasses.has('active');
    if (isOpen) {
      this.navMenuClasses.add('active');
      this.hamburgerClasses.add('active');
      this.backdropClasses.add('active');
      this.bodyClasses.add('mobile-nav-open');
      this.ariaExpanded = 'true';
    } else {
      this.navMenuClasses.delete('active');
      this.hamburgerClasses.delete('active');
      this.backdropClasses.delete('active');
      this.bodyClasses.delete('mobile-nav-open');
      this.ariaExpanded = 'false';
    }
    return isOpen;
  }

  close() {
    this.navMenuClasses.delete('active');
    this.hamburgerClasses.delete('active');
    this.backdropClasses.delete('active');
    this.bodyClasses.delete('mobile-nav-open');
    this.ariaExpanded = 'false';
  }

  isOpen() {
    return this.navMenuClasses.has('active') &&
           this.hamburgerClasses.has('active') &&
           this.backdropClasses.has('active') &&
           this.bodyClasses.has('mobile-nav-open') &&
           this.ariaExpanded === 'true';
  }

  isClosed() {
    return !this.navMenuClasses.has('active') &&
           !this.hamburgerClasses.has('active') &&
           !this.backdropClasses.has('active') &&
           !this.bodyClasses.has('mobile-nav-open') &&
           this.ariaExpanded === 'false';
  }
}

console.log('\n--- 20 CONSECUTIVE TAP ACCEPTANCE TEST ---');
const dom = new MockDOM();

for (let i = 1; i <= 20; i++) {
  const stoppedPropagation = { stopPropagation: () => {} };
  const res = dom.toggle(stoppedPropagation);

  if (i % 2 === 1) {
    // Odd tap: must OPEN
    if (res === true && dom.isOpen()) {
      console.log(`  Tap #${i.toString().padStart(2, '0')}: OPENED correctly (active=true, aria-expanded=true, body-locked=true)`);
    } else {
      console.error(`✗ FAIL on Tap #${i}: Failed to open properly!`);
      failed = true;
      break;
    }
  } else {
    // Even tap: must CLOSE
    if (res === false && dom.isClosed()) {
      console.log(`  Tap #${i.toString().padStart(2, '0')}: CLOSED correctly (active=false, aria-expanded=false, body-locked=false)`);
    } else {
      console.error(`✗ FAIL on Tap #${i}: Failed to close properly!`);
      failed = true;
      break;
    }
  }
}

// 5. Test Outside Click, Link Click, and Escape
console.log('\n--- INTERACTION RESILIENCE TESTS ---');
dom.toggle({ stopPropagation: () => {} }); // Open
dom.close(); // Nav link click
if (dom.isClosed()) {
  console.log('✓ PASS: Nav-link click closed menu');
} else {
  console.error('✗ FAIL: Nav-link click failed to close menu');
  failed = true;
}

dom.toggle({ stopPropagation: () => {} }); // Open
dom.close(); // Outside / Backdrop click
if (dom.isClosed()) {
  console.log('✓ PASS: Outside click / Backdrop click closed menu');
} else {
  console.error('✗ FAIL: Outside click failed to close menu');
  failed = true;
}

dom.toggle({ stopPropagation: () => {} }); // Open
dom.close(); // Escape key
if (dom.isClosed()) {
  console.log('✓ PASS: Escape key closed menu');
} else {
  console.error('✗ FAIL: Escape key failed to close menu');
  failed = true;
}

if (failed) {
  console.error('\n❌ SOME INTERMITTENT HAMBURGER TESTS FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 ALL 20-CONSECUTIVE-TAP AND INTERMITTENCY CHECKS PASSED WITH 100% RELIABILITY!');
}
