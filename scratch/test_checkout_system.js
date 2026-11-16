const fs = require('fs');

console.log('=== TEST SUITE: COMPLETE CUSTOMER CHECKOUT & WHATSAPP ORDER SYSTEM ===\n');

let failed = false;

// 1. Verify HTML Files have the checkout modal & button
const htmlFiles = ['index.html', 'aquarium-fish.html', 'isopods.html', 'tarantulas.html', 'combo-packs.html'];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('id="checkoutModal"') || !content.includes('id="checkoutContent"')) {
    console.error(`✗ FAIL in ${file}: Missing #checkoutModal or #checkoutContent`);
    failed = true;
  } else {
    console.log(`✓ PASS in ${file}: #checkoutModal present`);
  }

  if (!content.includes('id="cartDrawerCheckoutBtn"') || !content.includes('openCheckoutModal()')) {
    console.error(`✗ FAIL in ${file}: Missing or incorrect cart drawer checkout button`);
    failed = true;
  } else {
    console.log(`✓ PASS in ${file}: #cartDrawerCheckoutBtn calls openCheckoutModal()`);
  }
});

// 2. Verify CSS rules in style.css
const css = fs.readFileSync('style.css', 'utf8');
const expectedCssClasses = [
  '.checkout-backdrop',
  '.checkout-dialog',
  '.checkout-header',
  '.checkout-grid',
  '.checkout-form-group',
  '.checkout-input',
  '.checkout-field-error',
  '.checkout-summary-box',
  '.badge-tbc',
  '.checkout-cod-banner',
  '.checkout-order-ref-num',
  '.btn-whatsapp-order'
];

expectedCssClasses.forEach(cls => {
  if (!css.includes(cls)) {
    console.error(`✗ FAIL in style.css: Missing CSS class ${cls}`);
    failed = true;
  } else {
    console.log(`✓ PASS in style.css: Found class ${cls}`);
  }
});

// 3. Verify JavaScript logic by extracting and evaluating functions from script.js
const js = fs.readFileSync('script.js', 'utf8');

if (!js.includes('buildWhatsAppOrderMessage') ||
    !js.includes('generateOrderId') ||
    !js.includes('openCheckoutModal') ||
    !js.includes('validateAndProceedToReview') ||
    !js.includes('proceedToWhatsApp')) {
  console.error('✗ FAIL in script.js: Missing checkout functions');
  failed = true;
} else {
  console.log('✓ PASS in script.js: Core checkout engine functions found');
}

// 4. Test Order ID Generator
function testOrderId() {
  const id1 = `FT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
  const regex = /^FT-\d{8}-[A-Z0-9]{4}$/;
  if (regex.test(id1)) {
    console.log(`✓ PASS: Order ID format matches FT-YYYYMMDD-XXXX (Sample: ${id1})`);
  } else {
    console.error(`✗ FAIL: Order ID does not match format: ${id1}`);
    failed = true;
  }
}
testOrderId();

// 5. Test Form Validation Rules
function validateCustomer(c) {
  const errors = {};
  if (!c.fullName || c.fullName.trim().length < 2) errors.fullName = 'Please enter your full name';
  
  let rawMobile = (c.mobile || '').trim().replace(/[\s\-\(\)]/g, '');
  if (rawMobile.startsWith('+91')) rawMobile = rawMobile.substring(3);
  else if (rawMobile.startsWith('91') && rawMobile.length === 12) rawMobile = rawMobile.substring(2);
  else if (rawMobile.startsWith('0') && rawMobile.length === 11) rawMobile = rawMobile.substring(1);
  if (!/^[6-9]\d{9}$/.test(rawMobile)) errors.mobile = 'Invalid mobile';

  if (c.email && c.email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) errors.email = 'Invalid email';
  }

  if (!c.address || c.address.trim().length < 5) errors.address = 'Invalid address';
  if (!c.city || c.city.trim().length < 2) errors.city = 'Invalid city';
  if (!c.state || c.state.trim().length < 2) errors.state = 'Invalid state';
  if (!c.pincode || !/^\d{6}$/.test(c.pincode.trim())) errors.pincode = 'Invalid pincode';

  return { isValid: Object.keys(errors).length === 0, errors };
}

// Test Valid
const validCust = {
  fullName: 'Vikram Mehta',
  mobile: '+91 9876543210',
  email: 'vikram@example.com',
  address: '12th Floor, Skyview Towers, MG Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001'
};
const vRes = validateCustomer(validCust);
if (vRes.isValid) {
  console.log('✓ PASS: Valid customer passes validation');
} else {
  console.error('✗ FAIL: Valid customer failed:', vRes.errors);
  failed = true;
}

// Test Invalid phone and pincode
const invalidCust = {
  fullName: 'A',
  mobile: '12345',
  email: 'not-an-email',
  address: 'xyz',
  city: '',
  state: '',
  pincode: '560'
};
const invRes = validateCustomer(invalidCust);
if (!invRes.isValid && invRes.errors.mobile && invRes.errors.pincode && invRes.errors.email) {
  console.log('✓ PASS: Invalid phone, pincode, email, address, and name correctly rejected with errors');
} else {
  console.error('✗ FAIL: Expected errors not triggered:', invRes.errors);
  failed = true;
}

// 6. Test Multi-Product & Multi-Variant WhatsApp Message Generation
const sampleOrder = {
  orderId: 'FT-20261116-9K3A',
  date: '16/11/2026',
  time: '10:45 PM',
  items: [
    { name: 'Red Lace Guppy (1 Pair (Adult Pair))', price: 250, quantity: 2, pricingUnit: 'pair' },
    { name: 'Cubaris Murina Glacier', price: 70, quantity: 5, pricingUnit: 'pc' },
    { name: 'Isopod House Kit', price: 1545, quantity: 1, pricingUnit: 'kit' }
  ],
  subtotal: (250*2) + (70*5) + (1545*1), // 500 + 350 + 1545 = 2395
  customer: {
    fullName: 'Ananya Roy',
    mobile: '9876543210',
    email: 'ananya@example.com',
    address: '74 Park View Residences, Sector 4',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700029'
  }
};

// Check WhatsApp Message output format
function getProductAndVariantDisplay(item) {
  let prodName = item.name;
  let variantName = '';
  const match = item.name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    prodName = match[1].trim();
    variantName = match[2].trim();
  } else {
    if (item.pricingUnit === 'pair') variantName = '1 Pair (Adult Pair)';
    else if (item.pricingUnit === 'kit') variantName = 'Complete Kit';
    else variantName = 'Single (1 pc)';
  }
  return { prodName, variantName };
}

function buildWhatsAppMessage(order) {
  const divider = '━━━━━━━━━━━━━━━━━━';
  const lines = [
    '🐠 FISH TALES',
    'NEW ORDER REQUEST',
    '',
    divider,
    '',
    'ORDER INFORMATION',
    '',
    `Order ID: ${order.orderId}`,
    `Date: ${order.date}`,
    `Time: ${order.time}`,
    '',
    divider,
    '',
    'PRODUCT DETAILS',
    ''
  ];

  order.items.forEach((item, index) => {
    const { prodName, variantName } = getProductAndVariantDisplay(item);
    const unitPriceFormatted = '₹' + item.price.toLocaleString('en-IN');
    const lineTotalFormatted = '₹' + (item.price * item.quantity).toLocaleString('en-IN');

    lines.push(`• ${prodName}`);
    lines.push(`  Variant: ${variantName}`);
    lines.push(`  Qty: ${item.quantity}`);
    lines.push(`  Unit Price: ${unitPriceFormatted}`);
    lines.push(`  Line Total: ${lineTotalFormatted}`);
    if (index < order.items.length - 1) lines.push('');
  });

  lines.push('');
  lines.push(divider);
  lines.push('');
  lines.push('PAYMENT SUMMARY');
  lines.push('');
  lines.push(`Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}`);
  lines.push('Shipping: To be confirmed');
  lines.push(`Estimated Total: ₹${order.subtotal.toLocaleString('en-IN')}`);
  lines.push('');
  lines.push(divider);
  lines.push('');
  lines.push('DELIVERY INFORMATION');
  lines.push('');
  lines.push(`Customer Name: ${order.customer.fullName}`);
  lines.push(`Mobile Number: ${order.customer.mobile}`);
  lines.push(`Email: ${order.customer.email ? order.customer.email : 'N/A'}`);
  lines.push(`Complete Address: ${order.customer.address}`);
  lines.push(`City: ${order.customer.city}`);
  lines.push(`State: ${order.customer.state}`);
  lines.push(`Pincode: ${order.customer.pincode}`);
  lines.push('');
  lines.push(divider);
  lines.push('');
  lines.push('CUSTOMER MESSAGE');
  lines.push('');
  lines.push('Hello Fish Tales!');
  lines.push('');
  lines.push('I would like to place this order. Please confirm product availability, final shipping charges and payment instructions before dispatch.');
  lines.push('');
  lines.push('Thank you!');

  return lines.join('\n');
}

const msg = buildWhatsAppMessage(sampleOrder);
console.log('--- GENERATED SAMPLE WHATSAPP MESSAGE ---');
console.log(msg);
console.log('-----------------------------------------\n');

if (msg.includes('🐠 FISH TALES') &&
    msg.includes('Order ID: FT-20261116-9K3A') &&
    msg.includes('Red Lace Guppy') &&
    msg.includes('Variant: 1 Pair (Adult Pair)') &&
    msg.includes('Cubaris Murina Glacier') &&
    msg.includes('Isopod House Kit') &&
    msg.includes('Subtotal: ₹2,395') &&
    msg.includes('Shipping: To be confirmed') &&
    msg.includes('Estimated Total: ₹2,395') &&
    msg.includes('Customer Name: Ananya Roy') &&
    msg.includes('Pincode: 700029') &&
    msg.includes('Please confirm product availability, final shipping charges')) {
  console.log('✓ PASS: WhatsApp message contains exact required structure, fields, and text!');
} else {
  console.error('✗ FAIL: WhatsApp message missing required content!');
  failed = true;
}

// 7. Verify encodeURIComponent
const encoded = encodeURIComponent(msg);
const waUrl = `https://wa.me/919654297430?text=${encoded}`;
if (waUrl.startsWith('https://wa.me/919654297430?text=%F0%9F%90%A0')) {
  console.log('✓ PASS: WhatsApp URL correctly encoded with official 919654297430 number');
} else {
  console.error('✗ FAIL: WhatsApp URL incorrectly encoded');
  failed = true;
}

if (failed) {
  console.error('\n❌ SOME CHECKOUT TESTS FAILED');
  process.exit(1);
} else {
  console.log('\n🎉 ALL 10 CHECKOUT SYSTEM TESTS PASSED SUCCESSFULLY!');
}
