// scratch/test_owner_whatsapp_notification.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('Testing Owner WhatsApp Order Notification format in script.js...');

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

// Extract helper & message builder directly from script.js
const extractHelperMatch = scriptCode.match(/function getProductAndVariantDisplay\([\s\S]*?\n  \}/);
assert(extractHelperMatch, 'getProductAndVariantDisplay must be found');

const extractUnitMatch = scriptCode.match(/function getOwnerProductQuantityUnit\([\s\S]*?\n  \}/);
assert(extractUnitMatch, 'getOwnerProductQuantityUnit must be found');

const extractFuncMatch = scriptCode.match(/function buildWhatsAppOrderMessage\([\s\S]*?\n  \}/);
assert(extractFuncMatch, 'buildWhatsAppOrderMessage must be found');

const testRunnerCode = `
${extractHelperMatch[0]}
${extractUnitMatch[0]}
${extractFuncMatch[0]}
const CartManager = mockWindow.CartManager;
const PRODUCTS = mockWindow.PRODUCTS;
buildWhatsAppOrderMessage(orderDetails);
`;

// Test 1: Exactly matching the user prompt's expected owner notification
console.log('\n--- Test 1: Guppies (Expected format from prompt) ---');
const order1 = {
  orderId: 'FT-20261119-001',
  date: '19/11/2026',
  time: '12:45 AM',
  items: [
    {
      id: 'guppy-red-lace',
      baseId: 'guppy-red-lace',
      name: 'Red Lace Guppy',
      price: 250,
      quantity: 1,
      unit: 'pair',
      pricingUnit: 'pair'
    },
    {
      id: 'guppy-gold-dumbo-ear',
      baseId: 'guppy-gold-dumbo-ear',
      name: 'Gold Dumbo Ear Guppy',
      price: 280,
      quantity: 2,
      unit: 'pair',
      pricingUnit: 'pair'
    }
  ],
  subtotal: (250 * 1) + (280 * 2), // 250 + 560 = 810
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
const msg1 = vm.runInContext(testRunnerCode, evalContext1);
console.log(msg1);

assert(msg1.includes('Red Lace Guppy × 1 Pair — ₹250'), 'Must match: Red Lace Guppy × 1 Pair — ₹250');
assert(msg1.includes('Gold Dumbo Ear Guppy × 2 Pair — ₹560'), 'Must match: Gold Dumbo Ear Guppy × 2 Pair — ₹560');
assert(msg1.includes('Product Subtotal: ₹810'), 'Order summary subtotal intact');
assert(msg1.includes('Shipping: To be confirmed (Live transit fee)'), 'Shipping line intact');
assert(msg1.includes('Final Total: ₹810 (Shipping confirmation pending)'), 'Final total intact');

// Test 2: Multi-category order testing:
// - Pair fish: Golden Molly
// - Individual livestock: Betta, Shrimp
// - Isopods: Cubaris Murina Orange
// - Tarantulas: Chilean Rose Hair
// - Combo kit: Isopod House Kit
console.log('\n--- Test 2: Multi-Category Order ---');
const order2 = {
  orderId: 'FT-20261119-002',
  date: '19/11/2026',
  time: '12:46 AM',
  items: [
    {
      id: 'molly-golden',
      name: 'Golden Molly',
      price: 90,
      quantity: 2,
      subCategory: 'molly',
      unit: 'pair'
    },
    {
      id: 'show-grade-betta',
      name: 'Show Grade Betta Fish',
      price: 450,
      quantity: 1,
      unit: 'piece'
    },
    {
      id: 'shrimp-crystal-red',
      name: 'Crystal Red Shrimp',
      price: 150,
      quantity: 4,
      unit: 'piece'
    },
    {
      id: 'cubaris-murina-orange',
      name: 'Cubaris Murina Orange',
      price: 60,
      quantity: 5,
      category: 'isopods',
      unit: 'piece'
    },
    {
      id: 'chilean-rose-hair',
      name: 'Chilean Rose Hair',
      price: 2500,
      quantity: 1,
      category: 'tarantulas',
      unit: 'specimen'
    },
    {
      id: 'isopod-house-kit',
      name: 'Isopod House Kit',
      price: 799,
      quantity: 2,
      category: 'combo',
      unit: 'kit'
    }
  ],
  subtotal: (90 * 2) + (450 * 1) + (150 * 4) + (60 * 5) + (2500 * 1) + (799 * 2), // 180 + 450 + 600 + 300 + 2500 + 1598 = 5628
  customer: {
    fullName: 'Priya Patel',
    mobile: '9876543211',
    email: 'priya@example.com',
    address: '45 Lake Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015'
  }
};

const evalContext2 = vm.createContext({ mockWindow, orderDetails: order2 });
const msg2 = vm.runInContext(testRunnerCode, evalContext2);
console.log(msg2);

assert(msg2.includes('Golden Molly × 2 Pair — ₹180'), 'Molly should format with Pair');
assert(msg2.includes('Show Grade Betta Fish × 1 Pcs — ₹450'), 'Betta should format with Pcs');
assert(msg2.includes('Crystal Red Shrimp × 4 Pcs — ₹600'), 'Shrimp should format with Pcs');
assert(msg2.includes('Cubaris Murina Orange × 5 Pcs — ₹300'), 'Isopod should format with Pcs');
assert(msg2.includes('Chilean Rose Hair × 1 Specimen — ₹2,500'), 'Tarantula should format with Specimen');
assert(msg2.includes('Isopod House Kit × 2 Kit — ₹1,598'), 'Combo kit should format with Kit');
assert(msg2.includes('Product Subtotal: ₹5,628'), 'Subtotal correct');

// Test 3: Customer WhatsApp message generator unchanged
console.log('\n--- Test 3: Checking Customer WhatsApp generator ---');
const customerMsg = mockWindow.CartManager.generateWhatsAppMessage();
console.log('Customer Cart WhatsApp message generator intact:', typeof mockWindow.CartManager.generateWhatsAppMessage === 'function');
assert(typeof mockWindow.CartManager.generateWhatsAppMessage === 'function');

console.log('\n✅ ALL Owner WhatsApp Order Notification tests passed with 100% success!');
