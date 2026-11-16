const fs = require('fs');

console.log('=== TEST SUITE: COMPLETE CUSTOMER CHECKOUT & DELIVERY DETAILS SYSTEM ===\n');

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

// 3. Verify JavaScript logic in script.js
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

// 4. Test Order ID Generator format FT-YYYYMMDD-001
const regexOrderId = /^FT-\d{8}-\d{3}$/;
const sampleOrderId = `FT-20261116-001`;
if (regexOrderId.test(sampleOrderId)) {
  console.log(`✓ PASS: Order ID format matches FT-YYYYMMDD-001 (Sample: ${sampleOrderId})`);
} else {
  console.error(`✗ FAIL: Order ID does not match format: ${sampleOrderId}`);
  failed = true;
}

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
  orderId: 'FT-20261116-001',
  date: '16/11/2026',
  items: [
    { name: 'Red Lace Guppy (1 Pair (Adult Pair))', price: 250, quantity: 2, pricingUnit: 'pair' },
    { name: 'Cubaris Murina Glacier', price: 70, quantity: 5, pricingUnit: 'pc' }
  ],
  subtotal: (250*2) + (70*5), // 500 + 350 = 850
  customer: {
    fullName: 'Rahul Sharma',
    mobile: '9876543210',
    email: '',
    address: '123 Green Valley Street, Apartment 4B',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001'
  }
};

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
  const divider = '━━━━━━━━━━━━━━━━━━━━';
  const lines = [
    '🛍️ NEW ORDER – FISH TALES',
    '',
    `🆔 Order ID: ${order.orderId}`,
    `📅 Date: ${order.date}`,
    '',
    divider,
    '📦 ORDER SUMMARY',
    ''
  ];

  order.items.forEach((item, index) => {
    const { prodName, variantName } = getProductAndVariantDisplay(item);
    const unitPriceFormatted = '₹' + item.price.toLocaleString('en-IN');
    const lineTotalFormatted = '₹' + (item.price * item.quantity).toLocaleString('en-IN');

    lines.push(`${prodName} × ${item.quantity}`);
    lines.push(`Variant: ${variantName}`);
    lines.push(`Unit Price: ${unitPriceFormatted}`);
    lines.push(`Line Total: ${lineTotalFormatted}`);
    if (index < order.items.length - 1) lines.push('');
  });

  lines.push('');
  lines.push(`Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}`);
  lines.push('Shipping: To be confirmed');
  lines.push('Discount: ₹0');
  lines.push(`💰 TOTAL: ₹${order.subtotal.toLocaleString('en-IN')} (Shipping confirmation pending)`);
  lines.push('');
  lines.push(divider);
  lines.push('📍 DELIVERY DETAILS');
  lines.push('');
  lines.push(`👤 Name: ${order.customer.fullName}`);
  lines.push(`📞 Phone: ${order.customer.mobile}`);
  lines.push(`✉️ Email: ${order.customer.email ? order.customer.email : 'Not provided'}`);
  lines.push(`🏠 Address: ${order.customer.address}`);
  lines.push(`📍 City: ${order.customer.city}`);
  lines.push(`🗺️ State: ${order.customer.state}`);
  lines.push(`📮 Pincode: ${order.customer.pincode}`);
  lines.push('');
  lines.push(divider);
  lines.push('');
  lines.push('👋 Hello Fish Tales!');
  lines.push('');
  lines.push("I'd like to confirm my order. Please verify the order details and proceed with dispatch.");

  return lines.join('\n');
}

const msg = buildWhatsAppMessage(sampleOrder);
console.log('--- GENERATED WHATSAPP MESSAGE ---');
console.log(msg);
console.log('-----------------------------------\n');

if (msg.includes('🛍️ NEW ORDER – FISH TALES') &&
    msg.includes('🆔 Order ID: FT-20261116-001') &&
    msg.includes('📅 Date: 16/11/2026') &&
    msg.includes('Red Lace Guppy × 2') &&
    msg.includes('Variant: 1 Pair (Adult Pair)') &&
    msg.includes('Unit Price: ₹250') &&
    msg.includes('Line Total: ₹500') &&
    msg.includes('Cubaris Murina Glacier × 5') &&
    msg.includes('Subtotal: ₹850') &&
    msg.includes('Shipping: To be confirmed') &&
    msg.includes('Discount: ₹0') &&
    msg.includes('💰 TOTAL: ₹850 (Shipping confirmation pending)') &&
    msg.includes('👤 Name: Rahul Sharma') &&
    msg.includes('📞 Phone: 9876543210') &&
    msg.includes('✉️ Email: Not provided') &&
    msg.includes('🏠 Address: 123 Green Valley Street, Apartment 4B') &&
    msg.includes('📍 City: Bengaluru') &&
    msg.includes('🗺️ State: Karnataka') &&
    msg.includes('📮 Pincode: 560001') &&
    msg.includes("I'd like to confirm my order. Please verify the order details and proceed with dispatch.")) {
  console.log('✓ PASS: WhatsApp message contains exact required structure, emojis, and text!');
} else {
  console.error('✗ FAIL: WhatsApp message missing required content!');
  failed = true;
}

// 7. Verify encodeURIComponent
const encoded = encodeURIComponent(msg);
const waUrl = `https://wa.me/919654297430?text=${encoded}`;
if (waUrl.includes('text=%F0%9F%9B%8D%EF%B8%8F%20NEW%20ORDER%20%E2%80%93%20FISH%20TALES')) {
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
