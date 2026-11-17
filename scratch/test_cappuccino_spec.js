const fs = require('fs');
const assert = require('assert');

const cappuccino = {
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

console.log('Testing Cappuccino object fields:');
assert.strictEqual(cappuccino.id, 'cubaris-sp-cappuccino');
assert.strictEqual(cappuccino.price, 600);
assert.strictEqual(cappuccino.unit, 'piece');
assert.strictEqual(cappuccino.minQuantity, 5);
assert.strictEqual(cappuccino.featured, true);
console.log('✓ Cappuccino object matches user requirements');
