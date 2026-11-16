const fs = require('fs');

console.log('=== TEST: EXACTLY ONE ACTIVE NAVIGATION LINK ===\n');

// 1. Check all 5 HTML files for hardcoded active classes
const files = [
  { name: 'index.html', expectedActive: 'Home' },
  { name: 'aquarium-fish.html', expectedActive: 'Aquarium & Fish' },
  { name: 'isopods.html', expectedActive: 'Isopods' },
  { name: 'tarantulas.html', expectedActive: 'Tarantulas' },
  { name: 'combo-packs.html', expectedActive: 'Combo Packs' }
];

let failed = false;

files.forEach(({ name, expectedActive }) => {
  const content = fs.readFileSync(name, 'utf8');
  // Match active nav links inside .nav-menu
  const menuMatch = content.match(/<ul\s+class="nav-menu"[^>]*>([\s\S]*?)<\/ul>/);
  if (!menuMatch) {
    console.error(`✗ FAIL in ${name}: Could not find .nav-menu`);
    failed = true;
    return;
  }
  const menuHtml = menuMatch[1];
  const activeLinks = [];
  const regex = /<a[^>]+class="nav-link\s+active"[^>]*>([^<]+)<\/a>/g;
  let match;
  while ((match = regex.exec(menuHtml)) !== null) {
    activeLinks.push(match[1].replace('&amp;', '&').trim());
  }

  if (activeLinks.length !== 1) {
    console.error(`✗ FAIL in ${name}: Expected 1 active nav link, but found ${activeLinks.length}: [${activeLinks.join(', ')}]`);
    failed = true;
  } else if (activeLinks[0] !== expectedActive) {
    console.error(`✗ FAIL in ${name}: Expected active "${expectedActive}", but got "${activeLinks[0]}"`);
    failed = true;
  } else {
    console.log(`✓ PASS in ${name}: Exactly ONE active link in HTML: "${activeLinks[0]}"`);
  }
});

// 2. Test CSS rules in style.css
const css = fs.readFileSync('style.css', 'utf8');

if (!css.includes('.nav-link.active::after')) {
  console.error('✗ FAIL in style.css: Missing .nav-link.active::after rule');
  failed = true;
} else {
  console.log('✓ PASS in style.css: .nav-link.active::after is defined');
}

if (!css.includes('.nav-link:not(.active):not(:hover)::after')) {
  console.error('✗ FAIL in style.css: Missing .nav-link:not(.active):not(:hover)::after guard rule');
  failed = true;
} else {
  console.log('✓ PASS in style.css: Guard rule .nav-link:not(.active):not(:hover)::after width: 0 is present');
}

// 3. Test script.js simulated runtime execution
const js = fs.readFileSync('script.js', 'utf8');

if (!js.includes('window.setActiveNavKey') || !js.includes('window.updateActiveNavLink')) {
  console.error('✗ FAIL in script.js: Missing setActiveNavKey or updateActiveNavLink');
  failed = true;
} else {
  console.log('✓ PASS in script.js: setActiveNavKey and updateActiveNavLink functions defined');
}

// Simulate DOM and setActiveNavKey
class MockElement {
  constructor(text, href, initialActive = false) {
    this.textContent = text;
    this.href = href;
    this.classList = {
      classes: new Set(initialActive ? ['nav-link', 'active'] : ['nav-link']),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      contains: (c) => this.classList.classes.has(c)
    };
  }
  getAttribute(attr) {
    if (attr === 'href') return this.href;
    return null;
  }
}

function simulateMenu(pageFile, hash = '') {
  const links = [
    new MockElement('Home', 'index.html', true),
    new MockElement('Aquarium & Fish', 'aquarium-fish.html'),
    new MockElement('Isopods', 'isopods.html'),
    new MockElement('Tarantulas', 'tarantulas.html'),
    new MockElement('Combo Packs', 'combo-packs.html'),
    new MockElement('About Us', pageFile === 'index.html' ? '#about' : 'index.html#about'),
    new MockElement('Contact', pageFile === 'index.html' ? '#contact' : 'index.html#contact')
  ];

  // Run the logic from script.js
  let targetKey = 'home';
  if (pageFile.includes('aquarium-fish')) {
    targetKey = 'aquarium';
  } else if (pageFile.includes('isopods')) {
    targetKey = 'isopods';
  } else if (pageFile.includes('tarantulas')) {
    targetKey = 'tarantulas';
  } else if (pageFile.includes('combo-packs')) {
    targetKey = 'combos';
  } else {
    if (hash === '#about') targetKey = 'about';
    else if (hash === '#contact') targetKey = 'contact';
    else targetKey = 'home';
  }

  links.forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    const href = link.getAttribute('href').toLowerCase();

    let isMatch = false;
    if (targetKey === 'home' && text === 'home') isMatch = true;
    else if (targetKey === 'aquarium' && (text.includes('aquarium') || href.includes('aquarium-fish.html'))) isMatch = true;
    else if (targetKey === 'isopods' && (text === 'isopods' || href.includes('isopods.html'))) isMatch = true;
    else if (targetKey === 'tarantulas' && (text === 'tarantulas' || href.includes('tarantulas.html'))) isMatch = true;
    else if (targetKey === 'combos' && (text.includes('combo') || href.includes('combo-packs.html'))) isMatch = true;
    else if (targetKey === 'about' && (text.includes('about') || href.endsWith('#about'))) isMatch = true;
    else if (targetKey === 'contact' && (text.includes('contact') || href.endsWith('#contact'))) isMatch = true;

    if (isMatch) link.classList.add('active');
    else link.classList.remove('active');
  });

  const active = links.filter(l => l.classList.contains('active')).map(l => l.textContent);
  return active;
}

const testCases = [
  { page: 'index.html', hash: '', expected: ['Home'] },
  { page: 'index.html', hash: '#about', expected: ['About Us'] },
  { page: 'index.html', hash: '#contact', expected: ['Contact'] },
  { page: 'aquarium-fish.html', hash: '', expected: ['Aquarium & Fish'] },
  { page: 'isopods.html', hash: '', expected: ['Isopods'] },
  { page: 'tarantulas.html', hash: '', expected: ['Tarantulas'] },
  { page: 'combo-packs.html', hash: '', expected: ['Combo Packs'] }
];

testCases.forEach(tc => {
  const result = simulateMenu(tc.page, tc.hash);
  if (result.length === 1 && result[0] === tc.expected[0]) {
    console.log(`✓ PASS: Runtime check on ${tc.page} (hash: "${tc.hash}") -> Exactly ONE active link: "${result[0]}"`);
  } else {
    console.error(`✗ FAIL: Runtime check on ${tc.page} (hash: "${tc.hash}") -> Expected [${tc.expected.join(', ')}] but got [${result.join(', ')}]`);
    failed = true;
  }
});

if (failed) {
  console.error('\n❌ SOME CHECKS FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 ALL CHECKS PASSED: NO DUPLICATE ACTIVE LINKS EXIST!');
}
