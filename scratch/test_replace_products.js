const fs = require('fs');

const script = fs.readFileSync('script.js', 'utf8');
const productsJson = fs.readFileSync('scratch/standardized_20_products.json', 'utf8');
const productsList = JSON.parse(productsJson);

console.log(`Loaded ${productsList.length} standardized products.`);

// Generate JS string for PRODUCTS
const formattedProductsJs = 'const PRODUCTS = ' + JSON.stringify(productsList, null, 2) + ';\n';

const startMarker = '/* ── 3. Master Product Catalogue (Standardized Schema) ───── */\n  const PRODUCTS = [';
const endMarker = '/* ── 4. Cart State Management (localStorage) ────────────── */';

const startIndex = script.indexOf('/* ── 3. Master Product Catalogue (Standardized Schema) ───── */');
const endIndex = script.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

const before = script.substring(0, startIndex);
const after = script.substring(endIndex);

const newScript = before + '/* ── 3. Master Product Catalogue (Standardized Schema) ───── */\n  ' + formattedProductsJs + '\n  ' + after;

fs.writeFileSync('scratch/script_preview.js', newScript, 'utf8');
console.log('Preview written to scratch/script_preview.js');

// Validate syntax by evaluating
global.window = global;
global.document = { addEventListener: () => {}, querySelectorAll: () => [], getElementById: () => null };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

try {
  eval(newScript);
  console.log('✓ Syntax valid! window.PRODUCTS length:', window.PRODUCTS.length);
} catch (err) {
  console.error('Syntax error in newScript:', err);
  process.exit(1);
}
