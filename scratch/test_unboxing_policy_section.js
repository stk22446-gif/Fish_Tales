// scratch/test_unboxing_policy_section.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('Testing Unboxing Video & Live Arrival Policy Section update...');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptCode = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

// 1. Verify Botanical Breeders section is completely removed from index.html
console.log('1. Checking removal of Botanical Breeders section...');
assert(!indexHtml.includes('Botanical Breeders &amp; Curators') && !indexHtml.includes('Botanical Breeders & Curators'), 'Botanical Breeders kicker must be removed');
assert(!indexHtml.includes('Aquatic Life &amp; Bioactive Habitats.') && !indexHtml.includes('Aquatic Life & Bioactive Habitats.'), 'Old section title must be removed');
assert(!indexHtml.includes('Fish Tales is an independent boutique exotic livestock purveyor'), 'Old description text must be removed');

// 2. Verify new Policy Section in index.html
console.log('2. Checking new Unboxing Video & Live Arrival Policy in index.html...');
assert(indexHtml.includes('IMPORTANT: UNBOXING VIDEO &amp; LIVE ARRIVAL POLICY') || indexHtml.includes('IMPORTANT: UNBOXING VIDEO & LIVE ARRIVAL POLICY'), 'Heading must be present');
assert(indexHtml.includes('Unboxing Video Required'), 'Must highlight Unboxing Video Required');
assert(indexHtml.includes('Replacement Shipping Charges Applicable'), 'Must highlight Replacement Shipping Charges Applicable');
assert(indexHtml.includes('To protect both our customers and Fish Tales, please record a clear, continuous unboxing video while opening your delivered package.'), 'Must include intro paragraph');
assert(indexHtml.includes('Start recording before opening the sealed package.'), 'Must include bullet 1');
assert(indexHtml.includes('Clearly show the outer packaging, shipping label and the complete unboxing process.'), 'Must include bullet 2');
assert(indexHtml.includes('Do not pause, edit or cut the video.'), 'Must include bullet 3');
assert(indexHtml.includes('If any live livestock arrives dead or damaged during transit, the unboxing video will be required as proof for verification.'), 'Must include bullet 4');
assert(indexHtml.includes('Our team will review the video and verify the issue before approving a replacement.'), 'Must include bullet 5');
assert(indexHtml.includes('Replacement Policy:'), 'Must include Replacement Policy heading');
assert(indexHtml.includes('the replacement product will be provided free of product cost. However, the customer will need to pay the applicable delivery/shipping charges for the replacement shipment.'), 'Must include replacement terms');
assert(indexHtml.includes('Please keep the unboxing video safe until your order is successfully verified.'), 'Must include safe video reminder');

// 3. Verify Checkout Page does NOT display the policy card
console.log('3. Checking Checkout Page in script.js (policy card removed, COD banner preserved)...');
assert(!scriptCode.includes('getUnboxingPolicyHTML'), 'getUnboxingPolicyHTML must be removed from script.js');
assert(!scriptCode.includes('checkout-unboxing-policy'), 'checkout-unboxing-policy must not be in script.js');
assert(!scriptCode.includes('IMPORTANT: UNBOXING VIDEO & LIVE ARRIVAL POLICY'), 'Policy heading must not be in script.js');
assert(scriptCode.includes('checkout-cod-banner'), 'COD Payment Notice must remain in script.js');
assert(scriptCode.includes('Cash on Delivery (COD) is strictly unavailable'), 'COD Notice text preserved');

// 4. Verify in-memory DOM rendering of checkout steps
console.log('4. Testing checkout modal rendering in memory...');
let innerHTMLHolder = '';
const mockElement = {
  get innerHTML() { return innerHTMLHolder; },
  set innerHTML(val) { innerHTMLHolder = val; },
  classList: { add: () => {}, remove: () => {} },
  value: ''
};

const mockWindow = {
  location: { search: '', pathname: '/' },
  document: {
    addEventListener: () => {},
    getElementById: (id) => {
      if (id === 'checkoutContent') return mockElement;
      return {
        classList: { add: () => {}, remove: () => {} },
        dataset: {},
        value: 'Valid',
        addEventListener: () => {},
        removeAttribute: () => {},
        querySelectorAll: () => [],
        appendChild: () => {},
        focus: () => {}
      };
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {}, dataset: {} }),
  },
  navigator: { userAgent: 'Node' },
  setTimeout: () => 1,
  clearTimeout: () => {},
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};
mockWindow.window = mockWindow;

const context = vm.createContext(mockWindow);
vm.runInContext(scriptCode, context);

mockWindow.renderCheckoutStep1();
assert(!innerHTMLHolder.includes('UNBOXING VIDEO'), 'Step 1 must NOT contain unboxing video policy');
assert(innerHTMLHolder.includes('Cash on Delivery (COD) is strictly unavailable'), 'Step 1 must contain COD notice');

mockWindow.renderCheckoutStep2();
assert(!innerHTMLHolder.includes('UNBOXING VIDEO'), 'Step 2 must NOT contain unboxing video policy');
assert(innerHTMLHolder.includes('Cash on Delivery (COD) is strictly unavailable'), 'Step 2 must contain COD notice');

// 5. Verify CSS styles for policy-section
console.log('5. Checking style.css rules for policy-section...');
assert(styleCss.includes('.policy-section'), 'style.css must have .policy-section');
assert(styleCss.includes('.policy-card'), 'style.css must have .policy-card');
assert(styleCss.includes('.policy-badge-video'), 'style.css must have .policy-badge-video');
assert(styleCss.includes('.policy-badge-shipping'), 'style.css must have .policy-badge-shipping');
assert(styleCss.includes('.policy-replacement-box'), 'style.css must have .policy-replacement-box');

console.log('\n✅ ALL Unboxing Video & Live Arrival Policy tests passed successfully!');
