const fs = require('fs');

const scriptCode = fs.readFileSync('script.js', 'utf8');
const standardizedJson = fs.readFileSync('scratch/standardized_products.json', 'utf8');

const startMarker = '/* ── 3. Master Product Catalogue (Exactly 30 Verified Items) ─ */\n  const PRODUCTS = [';
const endMarker = '  ];\n\n  /* ── 4. Cart State Management (localStorage) ────────────── */';

const startIdx = scriptCode.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not find startMarker');
  process.exit(1);
}

const endIdx = scriptCode.indexOf(endMarker, startIdx);
if (endIdx === -1) {
  console.error('Could not find endMarker');
  process.exit(1);
}

// Convert JSON to formatted JS array
const rawProducts = JSON.parse(standardizedJson);

function formatProduct(p) {
  return `    {
      id: ${JSON.stringify(p.id)},
      category: ${JSON.stringify(p.category)},
      categoryName: ${JSON.stringify(p.categoryName)},
      subCategory: ${JSON.stringify(p.subCategory)},
      name: ${JSON.stringify(p.name)},
      subtitle: ${JSON.stringify(p.subtitle)},
      image: ${JSON.stringify(p.image)},
      images: ${JSON.stringify(p.images)},
      video: ${JSON.stringify(p.video)},
      description: ${JSON.stringify(p.description)},
      specs: ${JSON.stringify(p.specs, null, 8).replace(/^ {8}/gm, '        ').replace(/\n\s*}/, '\n      }')},
      variants: ${JSON.stringify(p.variants, null, 8).replace(/^ {8}/gm, '        ').replace(/\n\s*]/, '\n      ]')},
      featured: ${p.featured}
    }`;
}

const formattedProductsJs = '/* ── 3. Master Product Catalogue (Standardized Schema) ───── */\n  const PRODUCTS = [\n' +
  rawProducts.map(formatProduct).join(',\n') + '\n  ];';

const newScriptCode = scriptCode.slice(0, startIdx) + formattedProductsJs + scriptCode.slice(endIdx + 4);

fs.writeFileSync('script.js', newScriptCode, 'utf8');
console.log('Successfully updated script.js with standardized PRODUCTS array!');
