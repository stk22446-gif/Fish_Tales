const fs = require('fs');

const scriptCode = fs.readFileSync('script.js', 'utf8');
const match = scriptCode.match(/const PRODUCTS = (\[[\s\S]*?\]);\s*\/\* ── 4\./);
if (!match) {
  console.error('Could not find PRODUCTS');
  process.exit(1);
}

const products = eval(match[1]);
console.log('Total products loaded:', products.length);

products.forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.id} | cat: ${p.category} | subCat: ${p.subCategory} | name: ${p.name}`);
});
