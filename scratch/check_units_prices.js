const fs = require('fs');

global.window = global;
global.document = { addEventListener: () => {}, querySelectorAll: () => [], getElementById: () => null };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

eval(fs.readFileSync('script.js', 'utf8'));

window.PRODUCTS.forEach(p => {
  console.log(`${p.id} | price: ${p.price} | unit: ${p.unit} | minQty: ${p.minQuantity} | cat: ${p.category} | subCat: ${p.subCategory}`);
});
