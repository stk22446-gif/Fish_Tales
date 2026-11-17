const fs = require('fs');

let script = fs.readFileSync('script.js', 'utf8');
const productsNoVariants = JSON.parse(fs.readFileSync('scratch/products_no_variants.json', 'utf8'));

console.log('Total products without variants:', productsNoVariants.length);

// Format PRODUCTS as JS string with unquoted keys
let productsJs = 'const PRODUCTS = [\n';
productsNoVariants.forEach((p, idx) => {
  productsJs += '    {\n';
  const keys = Object.keys(p);
  keys.forEach((k, kIdx) => {
    const val = JSON.stringify(p[k], null, 6).trim();
    productsJs += `      ${k}: ${val}${kIdx < keys.length - 1 ? ',' : ''}\n`;
  });
  productsJs += '    }' + (idx < productsNoVariants.length - 1 ? ',' : '') + '\n';
});
productsJs += '  ];\n';

// Replace PRODUCTS array in script.js
const startIndex = script.indexOf('/* ── 3. Master Product Catalogue (Standardized Schema) ───── */');
const endIndex = script.indexOf('/* ── 4. Cart State Management (localStorage) ────────────── */');

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

const before = script.substring(0, startIndex);
const after = script.substring(endIndex);

let newScript = before + '/* ── 3. Master Product Catalogue (Standardized Schema) ───── */\n  ' + productsJs + '\n  ' + after;

// Write to script.js
fs.writeFileSync('script.js', newScript, 'utf8');
console.log('Updated PRODUCTS array in script.js (variants removed)');
