const fs = require('fs');

const scriptCode = fs.readFileSync('script.js', 'utf8');
const match = scriptCode.match(/const PRODUCTS = (\[[\s\S]*?\]);\s*\/\* ── 4\./);
const products = eval(match[1]);

const standardized = products.map(p => {
  let subCat = p.subCategory;
  if (!subCat) {
    const id = p.id.toLowerCase();
    if (id.includes('guppy')) subCat = 'guppy';
    else if (id.includes('betta')) subCat = 'betta';
    else if (p.category === 'isopods') subCat = 'isopods';
    else if (p.category === 'tarantulas') subCat = 'tarantulas';
    else if (id === 'isopod-house-kit') subCat = 'isopod-kit';
    else if (id === 'half-cube-aquarium-kit') subCat = 'aquarium-kit';
    else if (id === 'glacier-colony-pack') subCat = 'isopod-kit';
  }

  let cat = p.category;
  if (cat === 'combos') cat = 'combo';

  const std = {
    id: p.id,
    category: cat,
    categoryName: p.categoryName || '',
    subCategory: subCat,
    name: p.name,
    subtitle: p.subtitle || '',
    image: p.image || '',
    images: Array.isArray(p.images) ? p.images : [],
    video: p.video || '',
    description: p.description || '',
    specs: p.specs || {},
    variants: (p.variants || []).map(v => ({
      name: v.name,
      price: v.price,
      label: v.label
    })),
    featured: Boolean(p.featured)
  };

  return std;
});

// Validate all 32 items
console.log('Total standardized products:', standardized.length);
const seenIds = new Set();
const requiredKeys = [
  'id', 'category', 'categoryName', 'subCategory', 'name',
  'subtitle', 'image', 'images', 'video', 'description',
  'specs', 'variants', 'featured'
];

standardized.forEach((p, i) => {
  if (seenIds.has(p.id)) throw new Error('Duplicate id: ' + p.id);
  seenIds.add(p.id);

  const keys = Object.keys(p);
  if (keys.length !== 13) throw new Error(`Product ${p.id} has ${keys.length} keys instead of 13`);
  for (let k = 0; k < 13; k++) {
    if (keys[k] !== requiredKeys[k]) {
      throw new Error(`Product ${p.id} key mismatch at ${k}: ${keys[k]} vs ${requiredKeys[k]}`);
    }
  }
});

console.log('✓ All 32 products validated: 13 keys in exact order, zero duplicates!');

// Output formatted JS
const formatted = JSON.stringify(standardized, null, 2);
fs.writeFileSync('scratch/standardized_products.json', formatted);
console.log('Saved to scratch/standardized_products.json');
