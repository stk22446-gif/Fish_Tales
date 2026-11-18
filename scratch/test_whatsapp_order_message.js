// scratch/test_whatsapp_order_message.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('Testing WhatsApp Order Message formatting in script.js...');

// Load script.js in a mock DOM / browser environment
const scriptCode = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

const mockWindow = {
  location: { search: '', pathname: '/' },
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
  },
  navigator: { userAgent: 'Node' },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};
mockWindow.window = mockWindow;

const context = vm.createContext(mockWindow);
vm.runInContext(scriptCode, context);

// Test products from different categories
const products = mockWindow.PRODUCTS;
assert(Array.isArray(products) && products.length > 0, 'PRODUCTS array must exist');

// Check products from various categories
const sampleGuppy = products.find(p => p.category === 'Guppies' || p.category === 'Aquarium & Fish' || (p.name && p.name.includes('Guppy')));
const sampleIsopod = products.find(p => p.category === 'Isopods');
const sampleTarantula = products.find(p => p.category === 'Tarantulas');
const sampleCombo = products.find(p => p.category === 'Combo Packs' || (p.name && p.name.includes('Kit')));

console.log('Found test products:', {
  guppy: sampleGuppy?.name,
  isopod: sampleIsopod?.name,
  tarantula: sampleTarantula?.name,
  combo: sampleCombo?.name
});

// Mock CartManager checkout flow test
const testItems = [
  {
    id: sampleGuppy ? sampleGuppy.id : 'guppy-1',
    productId: sampleGuppy ? sampleGuppy.id : 'guppy-1',
    name: 'Red Lace Guppy',
    price: 250,
    quantity: 2,
    variantId: 'pair',
    variantName: '1 Pair (Adult Pair)'
  },
  {
    id: sampleIsopod ? sampleIsopod.id : 'isopod-1',
    productId: sampleIsopod ? sampleIsopod.id : 'isopod-1',
    name: 'Cubaris Murina Orange',
    price: 60,
    quantity: 5,
    variantId: 'default',
    variantName: 'Standard / Piece'
  }
];

const testCustomer = {
  fullName: 'Rahul Sharma',
  mobile: '9876543210',
  email: 'rahul@example.com',
  address: '123 Marine Drive',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001'
};

const subtotal = (250 * 2) + (60 * 5); // 500 + 300 = 800

// In script.js, let's extract or call the WhatsApp message generator logic
// Let's test by inspecting the exact regex / execution of buildWhatsAppOrderMessage
// Notice buildWhatsAppOrderMessage is a closure inside DOMContentLoaded. Let's inspect how it is tested or invoke it directly via vm or by checking the source regex and execution.

const orderDetails = {
  orderId: 'FT-20261118-001',
  date: '18/11/2026',
  time: '07:05 PM',
  items: testItems,
  subtotal: subtotal,
  customer: testCustomer
};

// Check if buildWhatsAppOrderMessage contains 'Unit Price:' in script.js
const hasUnitPrice = scriptCode.includes('Unit Price:');
console.log('Does script.js still have any "Unit Price:" string?', hasUnitPrice);
assert.strictEqual(hasUnitPrice, false, 'script.js should NOT have any "Unit Price:" string');

// Let's also extract and run the actual buildWhatsAppOrderMessage from script.js using vm
const extractFuncMatch = scriptCode.match(/function buildWhatsAppOrderMessage\([\s\S]*?\n  \}/);
assert(extractFuncMatch, 'buildWhatsAppOrderMessage must be found');

const funcCode = `
${extractFuncMatch[0]}
function getProductAndVariantDisplay(item) {
  let prodName = item.name || 'Product';
  let variantName = item.variantName || 'Standard';
  return { prodName, variantName };
}
const CartManager = {
  formatPrice(p) { return '₹' + p; }
};
buildWhatsAppOrderMessage(orderDetails);
`;

const evalContext = vm.createContext({ orderDetails });
const msg = vm.runInContext(funcCode, evalContext);
console.log('\n--- Generated WhatsApp Message ---');
console.log(msg);
console.log('---------------------------------\n');

// Verifications
assert(!msg.includes('Unit Price'), 'Message must not contain "Unit Price"');
assert(msg.includes('Red Lace Guppy × 2'), 'Message must contain product name and quantity');
assert(msg.includes('Variant: 1 Pair (Adult Pair)'), 'Message must contain variant name');
assert(msg.includes('Cubaris Murina Orange × 5'), 'Message must contain second product name and quantity');
assert(msg.includes('Product Subtotal: ₹800'), 'Message must keep Product Subtotal');
assert(msg.includes('Shipping: To be confirmed (Live transit fee)'), 'Message must keep Shipping');
assert(msg.includes('Final Total: ₹800 (Shipping confirmation pending)'), 'Message must keep Final Total');

console.log('✅ ALL WhatsApp message tests passed successfully!');
