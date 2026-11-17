const fs = require('fs');

let script = fs.readFileSync('script.js', 'utf8');

const keysToUnquote = [
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
  'variants',
  'featured',
  'label'
];

keysToUnquote.forEach(k => {
  const re = new RegExp(`"${k}":`, 'g');
  script = script.replace(re, `${k}:`);
});

fs.writeFileSync('script.js', script, 'utf8');
console.log('Unquoted keys in script.js successfully');
