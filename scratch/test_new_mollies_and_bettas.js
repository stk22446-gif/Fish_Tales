const fs = require('fs');
const assert = require('assert');

const scriptCode = fs.readFileSync('script.js', 'utf8');

// Mock DOM environment
let storage = {};
const mockLocalStorage = {
  getItem: (k) => storage[k] || '[]',
  setItem: (k, v) => { storage[k] = String(v); },
  clear: () => { storage = {}; }
};

let capturedCartHtml = '';
let capturedPdpHtml = '';

const mockDoc = {
  body: { dataset: { pageCategory: 'aquarium' }, style: {} },
  createElement: () => ({ className: '', innerHTML: '', classList: { add: () => {} }, appendChild: () => {}, remove: () => {} }),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: (id) => {
    if (id === 'cartDrawerItems') {
      return { set innerHTML(h) { capturedCartHtml = h; }, get innerHTML() { return capturedCartHtml; } };
    }
    if (id === 'pdpMain') {
      return { set innerHTML(h) { capturedPdpHtml = h; }, get innerHTML() { return capturedPdpHtml; } };
    }
    return {
      textContent: '', innerHTML: '', value: '', dataset: {},
      removeAttribute: () => {}, setAttribute: () => {}, getAttribute: () => null,
      appendChild: () => {}, querySelectorAll: () => [],
      classList: { toggle: () => {}, add: () => {}, remove: () => {} },
      addEventListener: () => {}
    };
  },
  addEventListener: () => {}
};

const mockWin = {
  location: { search: '' }
};

const fn = new Function('window', 'document', 'localStorage', scriptCode);
fn(mockWin, mockDoc, mockLocalStorage);

const PRODUCTS = mockWin.PRODUCTS;

console.log('=== VERIFYING NEW BALLOON MOLLIES & BETTA PRODUCTS ===\n');

// 1. Verify 3 Balloon Mollies
const mollies = [
  { id: 'molly-blue-eye-platinum-white-lyretail-balloon', name: 'Blue Eye Platinum White Lyre Tail Balloon Molly', price: 3000, unit: 'pair' },
  { id: 'molly-crystal-eye-zebra-lyretail-balloon', name: 'Crystal Eye Zebra Lyre Tail Balloon Molly', price: 3500, unit: 'pair' },
  { id: 'molly-platinum-white-round-tail-balloon', name: 'Platinum White Round Tail Balloon Molly', price: 2000, unit: 'pair' }
];

mollies.forEach(m => {
  const p = PRODUCTS.find(prod => prod.id === m.id);
  assert(p, `Must find ${m.id}`);
  assert.strictEqual(p.category, 'aquarium');
  assert.strictEqual(p.categoryName, 'Aquarium & Fish');
  assert.strictEqual(p.subCategory, 'molly');
  assert.strictEqual(p.name, m.name);
  assert.strictEqual(p.price, m.price);
  assert.strictEqual(p.unit, m.unit);
  assert.strictEqual(p.minQuantity, 1);
  assert(typeof p.image === 'string', 'Image must be string');
  assert.strictEqual(p.specs, undefined, 'Deprecated specs must be removed');
  assert(p.size && p.size.length > 0, 'Must have standalone size field');
  console.log(`✓ ${m.name}: ₹${m.price}/${m.unit} verified`);
});

// 2. Verify 3 Betta Products
const bettas = [
  { id: 'betta-avatar-stardust-plakat', name: 'Avatar Stardust — Plakat Variety' },
  { id: 'betta-rgg-ironman-halfmoon-plakat', name: 'RGG Ironman — Halfmoon Plakat Variety' },
  { id: 'betta-pure-white-crowntail', name: 'Pure White Crowntail' }
];

bettas.forEach(b => {
  const p = PRODUCTS.find(prod => prod.id === b.id);
  assert(p, `Must find ${b.id}`);
  assert.strictEqual(p.category, 'aquarium');
  assert.strictEqual(p.categoryName, 'Aquarium & Fish');
  assert.strictEqual(p.subCategory, 'betta');
  assert.strictEqual(p.name, b.name);
  assert.strictEqual(p.price, null, 'Price must not be fabricated/invented');
  assert.strictEqual(p.unit, 'piece');
  assert(typeof p.image === 'string', 'Image must be string');
  assert.strictEqual(p.specs, undefined, 'Deprecated specs must be removed');
  assert(p.size && p.size.length > 0, 'Must have standalone size field');
  console.log(`✓ ${b.name}: Unpriced / Price on Request verified (no fabricated price)`);
});

// 3. Test Product Detail Pages (PDP)
[...mollies, ...bettas].forEach(item => {
  mockWin.location.search = `?id=${item.id}`;
  mockWin.renderProductDetailPage();
  assert(capturedPdpHtml.includes(item.name), `PDP must display ${item.name}`);
  if (item.price) {
    assert(capturedPdpHtml.includes(`₹${item.price.toLocaleString('en-IN')}`), `PDP must display price for ${item.name}`);
  } else {
    assert(capturedPdpHtml.includes('Price on Request'), `PDP must display Price on Request for unpriced ${item.name}`);
    assert(!capturedPdpHtml.includes('₹0'), `PDP must not show ₹0 for ${item.name}`);
  }
  console.log(`✓ PDP for ${item.id} rendered accurately`);
});

// 4. Test Add to Cart & Cart Drawer
mockWin.CartManager.clear();
mockWin.addToCartById('molly-blue-eye-platinum-white-lyretail-balloon', 1);
mockWin.addToCartById('betta-avatar-stardust-plakat', 1);

let cartItems = mockWin.CartManager.getItems();
assert.strictEqual(cartItems.length, 2);
assert.strictEqual(mockWin.CartManager.getTotal(), 3000); // 3000 + 0

mockWin.renderCartDrawerItems(cartItems, 3000);
assert(capturedCartHtml.includes('Blue Eye Platinum White Lyre Tail Balloon Molly'));
assert(capturedCartHtml.includes('Avatar Stardust — Plakat Variety'));
assert(capturedCartHtml.includes('Price on Request'));
console.log('✓ Cart Drawer handles priced and unpriced items cleanly');

// 5. Test WhatsApp Order Generation
const orderMsg = mockWin.buildWhatsAppOrderMessage({
  orderId: 'FT-TEST-9999',
  date: '19/11/2026',
  time: '12:00 PM',
  items: cartItems,
  subtotal: 3000,
  customer: { fullName: 'Anita Roy', mobile: '9876543210', email: '', address: '45 Lake View', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' }
});

assert(orderMsg.includes('Blue Eye Platinum White Lyre Tail Balloon Molly × 1 Pair — ₹3,000'));
assert(orderMsg.includes('Avatar Stardust — Plakat Variety × 1 Pcs — Price on Request'));
console.log('✓ WhatsApp Order Message formatted correctly:');
console.log('   - ' + orderMsg.split('\n').filter(l => l.includes('×')).join('\n   - '));

console.log('\n🎉 ALL NEW BALLOON MOLLIES & BETTA PRODUCTS VERIFIED WITH 100% SUCCESS!');
process.exit(0);
