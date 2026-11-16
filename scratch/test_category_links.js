const fs = require('fs');

console.log('--- Verifying Category Card Links in index.html ---');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<a\s+href="([^"]+)"\s+class="category-card"/g;
let match;
const links = [];
while ((match = regex.exec(html)) !== null) {
  links.push(match[1]);
}

console.log('Extracted Category Card Links:', links);
const expected = ['aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];

if (JSON.stringify(links) === JSON.stringify(expected)) {
  console.log('✓ PASS: All 4 category links match expected relative URLs exactly.');
} else {
  console.error('✗ FAIL: Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(links));
  process.exit(1);
}

expected.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✓ PASS: Target file exists: ${file} (${fs.statSync(file).size} bytes)`);
  } else {
    console.error(`✗ FAIL: Missing target file: ${file}`);
    process.exit(1);
  }
});

// Check style.css
const css = fs.readFileSync('style.css', 'utf8');
if (css.includes('.category-card') && css.includes('cursor: pointer;') && css.includes('text-decoration: none;') && css.includes('transform: scale(1.05);')) {
  console.log('✓ PASS: style.css has pointer cursor, text-decoration none, and image hover zoom effect.');
} else {
  console.error('✗ FAIL: Missing required styles in style.css');
  process.exit(1);
}

console.log('--- All Category Link Checks Passed Successfully! ---');
