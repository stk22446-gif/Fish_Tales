// scratch/test_whatsapp_order_message.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('Testing WhatsApp Order Message formatting in script.js...');

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

const products = mockWindow.PRODUCTS;
assert(Array.isArray(products) && products.length > 0, 'PRODUCTS array must exist');

// Extract buildWhatsAppOrderMessage function directly from script.js
const extractFuncMatch = scriptCode.match(/function buildWhatsAppOrderMessage\([\s\S]*?\n  \}/);
assert(extractFuncMatch, 'buildWhatsAppOrderMessage must be found');

const extractHelperMatch = scriptCode.match(/function getProductAndVariantDisplay\([\s\S]*?\n  \}/);
assert(extractHelperMatch, 'getProductAndVariantDisplay must be found');

const testScript = `
${extractHelperMatch[0]}
${extractFuncMatch[0]}
const CartManager = mockWindow.CartManager;
buildWhatsAppOrderMessage(orderDetails);
`;

// Test 1: Guppy + Gold Dumbo Ear Guppy (User's specific prompt examples)
const order1 = {
  orderId: 'FT-20261118-001',
  date: '18/11/2026',
  time: '07:25 PM',
  items: [
    {
      id: 'guppy-1',
      name: 'Red Lace Guppy',
      price: 250,
      quantity: 2
    },
    {
      id: 'guppy-2',
      name: 'Gold Dumbo Ear Guppy',
      price: 280,
      quantity: 1
    }
  ],
  subtotal: (250 * 2) + (280 * 1), // 500 + 280 = 780
  customer: {
    fullName: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul@example.com',
    address: '123 Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  }
};

const evalContext1 = vm.createContext({ mockWindow, orderDetails: order1 });
const msg1 = vm.runInContext(testScript, evalContext1);

console.log('\n--- Test 1 WhatsApp Message (Guppies) ---');
console.log(msg1);

assert(msg1.includes('Red Lace Guppy × 2 (₹250)'), 'Must format Red Lace Guppy × 2 (₹250)');
assert(msg1.includes('Gold Dumbo Ear Guppy × 1 (₹280)'), 'Must format Gold Dumbo Ear Guppy × 1 (₹280)');
assert(!msg1.includes('Variant:'), 'Must NOT contain any "Variant:" line');
assert(!msg1.includes('Unit Price:'), 'Must NOT contain any separate "Unit Price:" line');
assert(msg1.includes('Product Subtotal: ₹780'), 'Must keep Product Subtotal in summary');
assert(msg1.includes('Shipping: To be confirmed (Live transit fee)'), 'Must keep Shipping in summary');
assert(msg1.includes('Final Total: ₹780 (Shipping confirmation pending)'), 'Must keep Final Total in summary');

// Test 2: Multi-category order (Isopods, Tarantula, Combo Pack, Molly, Betta)
const order2 = {
  orderId: 'FT-20261118-002',
  date: '18/11/2026',
  time: '07:26 PM',
  items: [
    {
      id: 'iso-1',
      name: 'Cubaris Murina Orange',
      price: 60,
      quantity: 5 // Isopod min order is 5
    },
    {
      id: 'tar-1',
      name: 'Chilean Rose Tarantula',
      price: 2500,
      quantity: 1
    },
    {
      id: 'combo-1',
      name: 'Isopod House Kit',
      price: 799,
      quantity: 2
    },
    {
      id: 'molly-1',
      name: 'Golden Molly',
      price: 90,
      quantity: 3
    }
  ],
  subtotal: (60 * 5) + (2500 * 1) + (799 * 2) + (90 * 3), // 300 + 2500 + 1598 + 270 = 4668
  customer: {
    fullName: 'Ananya Rao',
    mobile: '9123456789',
    email: '',
    address: '45 Lake View Road',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033'
  }
};

const evalContext2 = vm.createContext({ mockWindow, orderDetails: order2 });
const msg2 = vm.runInContext(testScript, evalContext2);

console.log('\n--- Test 2 WhatsApp Message (Multi-category) ---');
console.log(msg2);

assert(msg2.includes('Cubaris Murina Orange × 5 (₹60)'), 'Isopod unit price must be ₹60, not total ₹300');
assert(msg2.includes('Chilean Rose Tarantula × 1 (₹2,500)'), 'Tarantula unit price must be ₹2,500');
assert(msg2.includes('Isopod House Kit × 2 (₹799)'), 'Kit unit price must be ₹799, not total ₹1,598');
assert(msg2.includes('Golden Molly × 3 (₹90)'), 'Molly unit price must be ₹90, not total ₹270');
assert(!msg2.includes('Variant:'), 'Must NOT contain any "Variant:" line');
assert(!msg2.includes('Unit Price:'), 'Must NOT contain any separate "Unit Price:" line');
assert(msg2.includes('Product Subtotal: ₹4,668'), 'Must keep Product Subtotal in summary');
assert(msg2.includes('Final Total: ₹4,668 (Shipping confirmation pending)'), 'Must keep Final Total in summary');

console.log('\n✅ ALL WhatsApp format tests passed successfully!');
