const fs = require('fs');
const assert = require('assert');

const raw = fs.readFileSync('scratch/standardized_products.json', 'utf8');
const products = JSON.parse(raw);

console.log('Testing standardized products data:');
console.log('Total products:', products.length);
assert.strictEqual(products.length, 32, 'Must have 32 products');

const requiredKeys = [
  'id', 'category', 'categoryName', 'subCategory', 'name',
  'subtitle', 'image', 'images', 'video', 'description',
  'specs', 'variants', 'featured'
];

products.forEach((p, idx) => {
  const keys = Object.keys(p);
  assert.strictEqual(keys.length, 13, `Product ${p.id} must have exactly 13 keys`);
  for (let i = 0; i < 13; i++) {
    assert.strictEqual(keys[i], requiredKeys[i], `Product ${p.id} key #${i} must be ${requiredKeys[i]}`);
  }

  assert(typeof p.id === 'string' && p.id.length > 0, `Product #${idx} id must be non-empty string`);
  assert(typeof p.category === 'string' && p.category.length > 0, `Product ${p.id} category must be non-empty string`);
  assert(typeof p.categoryName === 'string' && p.categoryName.length > 0, `Product ${p.id} categoryName must be non-empty string`);
  assert(typeof p.subCategory === 'string' && p.subCategory.length > 0, `Product ${p.id} subCategory must be non-empty string`);
  assert(typeof p.name === 'string' && p.name.length > 0, `Product ${p.id} name must be non-empty string`);
  assert(typeof p.subtitle === 'string', `Product ${p.id} subtitle must be string`);
  assert(typeof p.image === 'string' && p.image.length > 0, `Product ${p.id} image must be non-empty string`);
  assert(Array.isArray(p.images), `Product ${p.id} images must be array`);
  assert(typeof p.video === 'string', `Product ${p.id} video must be string`);
  assert(typeof p.description === 'string' && p.description.length > 0, `Product ${p.id} description must be non-empty string`);
  assert(typeof p.specs === 'object' && p.specs !== null, `Product ${p.id} specs must be object`);
  assert(Array.isArray(p.variants) && p.variants.length > 0, `Product ${p.id} variants must be non-empty array`);
  assert(typeof p.featured === 'boolean', `Product ${p.id} featured must be boolean`);

  p.variants.forEach((v, vIdx) => {
    assert(typeof v.name === 'string' && v.name.length > 0, `Variant #${vIdx} of ${p.id} must have name`);
    assert(typeof v.price === 'number' && v.price > 0, `Variant #${vIdx} of ${p.id} must have positive price`);
    assert(typeof v.label === 'string' && v.label.length > 0, `Variant #${vIdx} of ${p.id} must have label`);
  });
});

console.log('✓ All 32 products passed schema & type validation!');

// Check categories distribution
const catCounts = {};
const subCatCounts = {};
products.forEach(p => {
  catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  subCatCounts[p.subCategory] = (subCatCounts[p.subCategory] || 0) + 1;
});

console.log('\nCategory breakdown:', catCounts);
console.log('SubCategory breakdown:', subCatCounts);

assert.strictEqual(catCounts.aquarium, 16);
assert.strictEqual(catCounts.isopods, 7);
assert.strictEqual(catCounts.tarantulas, 6);
assert.strictEqual(catCounts.combo, 3);

assert.strictEqual(subCatCounts.guppy, 13);
assert.strictEqual(subCatCounts.betta, 1);
assert.strictEqual(subCatCounts.molly, 1);
assert.strictEqual(subCatCounts.shrimps, 1);
assert.strictEqual(subCatCounts['aquarium-kit'], 1);
assert.strictEqual(subCatCounts['isopod-kit'], 2);
assert.strictEqual(subCatCounts.isopods, 7);
assert.strictEqual(subCatCounts.tarantulas, 6);

console.log('✓ Category and subCategory distributions are 100% correct!');
