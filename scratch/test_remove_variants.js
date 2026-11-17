const fs = require('fs');
const assert = require('assert');

// 1. Load standardized_20_products.json and remove variants
const products = JSON.parse(fs.readFileSync('scratch/standardized_20_products.json', 'utf8'));

const productsWithoutVariants = products.map(p => {
  const copy = { ...p };
  delete copy.variants;
  return copy;
});

assert.strictEqual(productsWithoutVariants.length, 32);

const EXPECTED_19_KEYS = [
  'id',
  'category',
  'categoryName',
  'subCategory',
  'name',
  'subtitle',
  'image',
  'images',
  'video',
  'description',
  'price',
  'unit',
  'minQuantity',
  'specs',
  'overview',
  'careRequirements',
  'habitatSetup',
  'didYouKnow',
  'featured'
];

productsWithoutVariants.forEach((p, idx) => {
  const keys = Object.keys(p);
  assert.strictEqual(keys.length, 19, `Product ${p.id} must have 19 keys without variants`);
  keys.forEach((k, i) => {
    assert.strictEqual(k, EXPECTED_19_KEYS[i], `Product ${p.id} key ${i} mismatch: ${k} vs ${EXPECTED_19_KEYS[i]}`);
  });
  assert(p.price > 0, `Product ${p.id} must have positive price`);
  assert(p.unit.length > 0, `Product ${p.id} must have unit`);
  assert(p.minQuantity >= 1, `Product ${p.id} must have minQuantity >= 1`);
  if (p.category === 'isopods' || p.subCategory === 'isopods') {
    assert.strictEqual(p.minQuantity, 5, `Isopod ${p.id} must have minQuantity 5`);
  }
});

console.log('✓ All 32 products successfully formatted to 19 keys (variants completely removed)!');
fs.writeFileSync('scratch/products_no_variants.json', JSON.stringify(productsWithoutVariants, null, 2), 'utf8');
