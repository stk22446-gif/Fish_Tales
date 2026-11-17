const fs = require('fs');
const assert = require('assert');

const raw = fs.readFileSync('scratch/products_no_variants.json', 'utf8');
const products = JSON.parse(raw);

console.log('Testing standardized products data (no variants):');
console.log('Total products:', products.length);
assert.strictEqual(products.length, 32, 'Must have 32 products');

const requiredKeys = [
  'id', 'category', 'categoryName', 'subCategory', 'name',
  'subtitle', 'image', 'images', 'video', 'description',
  'price', 'unit', 'minQuantity', 'specs', 'overview',
  'careRequirements', 'habitatSetup', 'didYouKnow', 'featured'
];

products.forEach((p, idx) => {
  const keys = Object.keys(p);
  assert.strictEqual(keys.length, 19, `Product ${p.id} must have exactly 19 keys`);
  for (let i = 0; i < 19; i++) {
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
  assert(typeof p.price === 'number', `Product ${p.id} price must be number`);
  assert(typeof p.unit === 'string', `Product ${p.id} unit must be string`);
  assert(typeof p.minQuantity === 'number', `Product ${p.id} minQuantity must be number`);
  assert(typeof p.specs === 'object' && p.specs !== null, `Product ${p.id} specs must be object`);
  assert(typeof p.overview === 'string', `Product ${p.id} overview must be string`);
  assert(typeof p.careRequirements === 'object' && p.careRequirements !== null, `Product ${p.id} careRequirements must be object`);
  assert(Array.isArray(p.didYouKnow), `Product ${p.id} didYouKnow must be array`);
  assert(typeof p.featured === 'boolean', `Product ${p.id} featured must be boolean`);
});

console.log('✓ All 32 products passed schema & type validation without variants!');

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
console.log('✓ Category distribution 100% correct!');
