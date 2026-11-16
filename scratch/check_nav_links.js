const fs = require('fs');

const files = ['index.html', 'aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];

files.forEach(file => {
  console.log(`=== ${file} ===`);
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/<a[^>]+class="nav-link[^"]*"[^>]*>[^<]+<\/a>/g) || [];
  matches.forEach(m => console.log('  ', m));
});
