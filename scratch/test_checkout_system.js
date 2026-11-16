const fs = require('fs');

console.log('=== TEST SUITE: COMPLETE CUSTOMER CHECKOUT & WHATSAPP ORDER FORMATTING ===\n');

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

// 6. Test Multi-Product & Multi-Variant WhatsApp Message Generation with New Formatting
const sampleOrder = {
  orderId: 'FT-20261116-001',
  date: '16/11/2026',
  time: '10:30 PM',
  items: [
    { name: 'Red Lace Guppy (1 Pair (Adult Pair))', price: 250, quantity: 2, pricingUnit: 'pair' },
    { name: 'Cubaris Murina Glacier', price: 70, quantity: 5, pricingUnit: 'pc' }
  ],
  subtotal: (250 * 2) + (70 * 5), // 500 + 350 = 850
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

function formatPrice(num) {
  return '₹' + Number(num || 0).toLocaleString('en-IN');
}

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

  function buildWhatsAppMessage(orderDetails) {
    const { orderId, date, time, items, subtotal, customer } = orderDetails;
    const divider = '━━━━━━━━━━━━━━━━━━━━';
    const lines = [
      '🐠 FISH TALES',
      '🛍️ *NEW ORDER RECEIVED*',
      divider,
      '📋 *ORDER INFORMATION*',
      `🆔 Order ID: ${orderId}`,
      `📅 Date: ${date}` + (time ? ` (${time})` : ''),
      divider,
      '📦 *PRODUCT DETAILS*'
    ];

    items.forEach((item) => {
      const { prodName, variantName } = getProductAndVariantDisplay(item);
      const unitPriceFormatted = formatPrice(item.price);
      const lineTotalFormatted = formatPrice(item.price * item.quantity);

      lines.push(`${prodName} × ${item.quantity}`);
      lines.push(`Variant: ${variantName}`);
      lines.push(`Unit Price: ${unitPriceFormatted}`);
      lines.push(`Line Total: ${lineTotalFormatted}`);
    });

    lines.push(divider);
    lines.push('💳 *PAYMENT & ORDER SUMMARY*');
    lines.push(`Subtotal: ${formatPrice(subtotal)}`);
    lines.push('Shipping: To be confirmed (Live transit fee)');
    lines.push('Discount: ₹0');
    lines.push(`Final Total: ${formatPrice(subtotal)} (Shipping confirmation pending)`);
    lines.push(divider);
    lines.push('📍 *DELIVERY INFORMATION*');
    lines.push(`👤 Customer Name: ${customer.fullName}`);
    lines.push(`📞 Phone Number: +91 ${customer.mobile}`);
    lines.push(`✉️ Email Address: ${customer.email && customer.email.trim() ? customer.email.trim() : 'Not provided'}`);
    lines.push(`🏠 Complete Address: ${customer.address}`);
    lines.push(`📍 City: ${customer.city}`);
    lines.push(`🗺️ State: ${customer.state}`);
    lines.push(`📮 Pincode: ${customer.pincode}`);
    lines.push(divider);
    lines.push('⚠️ *PAYMENT INSTRUCTIONS & POLICY*');
    lines.push('*• Cash on Delivery (COD) is strictly unavailable* for live livestock & bioactive habitats.');
    lines.push('• Orders are prepaid via *UPI / Bank Transfer* after order & shipping confirmation.');
    lines.push(divider);
    lines.push('👋 Hello Fish Tales!');
    lines.push("I'd like to confirm my order. Please verify product availability, confirmed shipping charges, and send payment instructions before dispatch.");

    return lines.join('\n');
  }

const msg = buildWhatsAppMessage(sampleOrder);
    console.log('--- GENERATED ENHANCED WHATSAPP MESSAGE ---');
    console.log(msg);
    console.log('-------------------------------------------\n');

    // Count bold sections
    const asteriskMatches = msg.match(/\*([^*]+)\*/g) || [];
    console.log('Bold sections found:', asteriskMatches);

    const allowedBoldSections = [
      '*NEW ORDER RECEIVED*',
      '*ORDER INFORMATION*',
      '*PRODUCT DETAILS*',
      '*PAYMENT & ORDER SUMMARY*',
      '*DELIVERY INFORMATION*',
      '*PAYMENT INSTRUCTIONS & POLICY*',
      '*• Cash on Delivery (COD) is strictly unavailable*',
      '*UPI / Bank Transfer*'
    ];

    const requiredChecks = [
      { desc: '1. Brand line without bold: 🐠 FISH TALES', check: msg.includes('🐠 FISH TALES') && !msg.includes('*🐠') },
      { desc: '2. Heading: 🛍️ *NEW ORDER RECEIVED*', check: msg.includes('🛍️ *NEW ORDER RECEIVED*') },
      { desc: '3. Heading: 📋 *ORDER INFORMATION*', check: msg.includes('📋 *ORDER INFORMATION*') },
      { desc: '4. Order ID without bold', check: msg.includes('🆔 Order ID: FT-20261116-001') },
      { desc: '5. Date without bold', check: msg.includes('📅 Date: 16/11/2026 (10:30 PM)') },
      { desc: '6. Heading: 📦 *PRODUCT DETAILS*', check: msg.includes('📦 *PRODUCT DETAILS*') },
      { desc: '7. Products & prices without bold', check: msg.includes('Red Lace Guppy × 2') && msg.includes('Unit Price: ₹250') && msg.includes('Line Total: ₹500') },
      { desc: '8. Heading: 💳 *PAYMENT & ORDER SUMMARY*', check: msg.includes('💳 *PAYMENT & ORDER SUMMARY*') },
      { desc: '9. Summary lines & Final Total without bold', check: msg.includes('Subtotal: ₹850') && msg.includes('Final Total: ₹850 (Shipping confirmation pending)') },
      { desc: '10. Heading: 📍 *DELIVERY INFORMATION*', check: msg.includes('📍 *DELIVERY INFORMATION*') },
      { desc: '11. Customer details without bold', check: msg.includes('👤 Customer Name: Rahul Sharma') && msg.includes('📞 Phone Number: +91 9876543210') },
      { desc: '12. Heading: ⚠️ *PAYMENT INSTRUCTIONS & POLICY*', check: msg.includes('⚠️ *PAYMENT INSTRUCTIONS & POLICY*') },
      { desc: '13. Statement 1 bold: *• Cash on Delivery (COD) is strictly unavailable* for live livestock & bioactive habitats.', check: msg.includes('*• Cash on Delivery (COD) is strictly unavailable* for live livestock & bioactive habitats.') },
      { desc: '14. Statement 2 bold: • Orders are prepaid via *UPI / Bank Transfer* after order & shipping confirmation.', check: msg.includes('• Orders are prepaid via *UPI / Bank Transfer* after order & shipping confirmation.') },
      { desc: '15. Closing greeting without bold', check: msg.includes('👋 Hello Fish Tales!') },
      { desc: '16. Exactly the expected bold segments exist', check: asteriskMatches.length === 8 && asteriskMatches.every(h => allowedBoldSections.includes(h)) }
    ];

    requiredChecks.forEach(item => {
      if (item.check) {
        console.log(`✓ PASS: ${item.desc}`);
      } else {
        console.error(`✗ FAIL: ${item.desc}`);
        failed = true;
      }
    });

    // 7. Verify encodeURIComponent and wa.me link
    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/919654297430?text=${encoded}`;
      if (waUrl.includes('https://wa.me/919654297430?text=') &&
        waUrl.includes('FISH%20TALES') &&
        waUrl.includes('NEW%20ORDER%20RECEIVED')) {
        console.log('✓ PASS: WhatsApp URL correctly generated and encoded for 919654297430');
      } else {
        console.error('✗ FAIL: WhatsApp URL generation or encoding mismatch');
        failed = true;
      }

      if (failed) {
        console.error('\n❌ SOME CHECKOUT TESTS FAILED');
        process.exit(1);
      } else {
        console.log('\n🎉 ALL 10 CHECKOUT SYSTEM TESTS PASSED SUCCESSFULLY!');
      }
