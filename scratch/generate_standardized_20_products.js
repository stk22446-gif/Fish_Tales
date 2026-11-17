const fs = require('fs');

global.window = global;
global.document = { addEventListener: () => {}, querySelectorAll: () => [], getElementById: () => null };
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

eval(fs.readFileSync('script.js', 'utf8'));

const STANDARDIZED_KEYS = [
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
  'featured'
];

console.log('Total PRODUCTS in script.js:', window.PRODUCTS.length);

const cappuccinoExact = {
  id: "cubaris-sp-cappuccino",
  category: "isopods",
  categoryName: "Isopods",
  subCategory: "isopods",
  name: "Cubaris sp. Cappuccino",
  subtitle: "",
  image: "https://upload.wikimedia.org/wikipedia/commons/1/18/Cubaris_nigroflava_172816253.jpg",
  images: [],
  video: "",
  description: "Ultra-rare collector isopod exhibiting warm espresso-brown skirts and a creamy dorsal stripe reminiscent of a barista cappuccino.",
  price: 600,
  unit: "piece",
  minQuantity: 5,
  specs: {
    care: "Bioactive Cleaners",
    temp: "20°C – 26°C",
    diet: "Leaf litter, decaying wood, calcium",
    habitat: "Bioactive vivarium / enclosure"
  },
  overview: "",
  careRequirements: {},
  habitatSetup: "",
  didYouKnow: [],
  variants: [],
  featured: true
};

const updatedProducts = window.PRODUCTS.map(p => {
  if (p.id === 'cubaris-sp-cappuccino') {
    return cappuccinoExact;
  }

  window.initProductVariantsAndSpecs(p);

  const isIsopod = window.isIsopodProduct(p);
  const basePrice = (p.price !== undefined) ? p.price : (p.variants && p.variants[0] ? p.variants[0].price : 0);
  let baseUnit = p.unit || '';
  if (!baseUnit) {
    if (isIsopod) baseUnit = 'piece';
    else if (p.variants && p.variants[0]) baseUnit = (p.variants[0].label || 'item').toLowerCase();
    else baseUnit = 'piece';
  }
  const minQty = (p.minQuantity !== undefined) ? p.minQuantity : (isIsopod ? 5 : 1);

  // habitatSetup string or object
  let habitatSetup = p.habitatSetup || "";
  if (typeof habitatSetup === 'object' && Object.keys(habitatSetup).length === 0) {
    habitatSetup = "";
  }

  const obj = {
    id: p.id || "",
    category: p.category || "",
    categoryName: p.categoryName || (p.category === 'aquarium' ? 'Aquarium & Fish' : p.category === 'isopods' ? 'Isopods' : p.category === 'tarantulas' ? 'Tarantulas' : 'Combo Packs'),
    subCategory: p.subCategory || "",
    name: p.name || "",
    subtitle: p.subtitle || "",
    image: p.image || "",
    images: Array.isArray(p.images) ? p.images : [],
    video: p.video || "",
    description: p.description || "",
    price: Number(basePrice),
    unit: baseUnit,
    minQuantity: Number(minQty),
    specs: p.specs || {},
    overview: p.overview || "",
    careRequirements: p.careRequirements || {},
    habitatSetup: habitatSetup,
    didYouKnow: Array.isArray(p.didYouKnow) ? p.didYouKnow : [],
    variants: Array.isArray(p.variants) ? p.variants : [],
    featured: Boolean(p.featured)
  };

  return obj;
});

console.log('Sample updated product (guppy-red-lace):');
console.log(JSON.stringify(updatedProducts[0], null, 2));

console.log('Cappuccino product:');
console.log(JSON.stringify(updatedProducts.find(p => p.id === 'cubaris-sp-cappuccino'), null, 2));

// Verify keys for all 32 products
let allKeysMatch = true;
updatedProducts.forEach((p, idx) => {
  const keys = Object.keys(p);
  if (keys.length !== STANDARDIZED_KEYS.length) {
    console.error(`Product ${p.id} has ${keys.length} keys, expected ${STANDARDIZED_KEYS.length}`);
    allKeysMatch = false;
  }
  keys.forEach((k, i) => {
    if (k !== STANDARDIZED_KEYS[i]) {
      console.error(`Product ${p.id} key #${i} is ${k}, expected ${STANDARDIZED_KEYS[i]}`);
      allKeysMatch = false;
    }
  });
});

if (allKeysMatch) {
  console.log('✓ All 32 products match the 20-field schema exactly in specified order!');
  fs.writeFileSync('scratch/standardized_20_products.json', JSON.stringify(updatedProducts, null, 2), 'utf8');
  console.log('Saved to scratch/standardized_20_products.json');
}
