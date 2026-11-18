// scratch/test_checkout_unboxing_policy.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('Testing Unboxing Video & Live Arrival Policy in Checkout...');

const scriptCode = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
const cssCode = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

// 1. Verify CSS styles
console.log('1. Checking CSS rules in style.css...');
assert(cssCode.includes('.checkout-unboxing-policy'), 'Must have .checkout-unboxing-policy in style.css');
assert(cssCode.includes('#FFFDF2') || cssCode.includes('#FFF8E7') || cssCode.includes('#FFF3CD'), 'Must have light cream / pale yellow background');
assert(cssCode.includes('.checkout-policy-tag.tag-video'), 'Must have tag-video styling');
assert(cssCode.includes('.checkout-policy-tag.tag-shipping'), 'Must have tag-shipping styling');
assert(cssCode.includes('word-wrap: break-word') || cssCode.includes('overflow-wrap: break-word'), 'Must have mobile word wrapping');

// 2. Verify DOM rendering in script.js
console.log('2. Checking in-memory DOM execution of renderCheckoutStep1()...');

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
      let val = 'Valid Text';
      if (id === 'checkoutMobile') val = '9876543210';
      if (id === 'checkoutPincode') val = '560001';
      return {
        classList: { add: () => {}, remove: () => {} },
        dataset: {},
        value: val,
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

// Add an item to cart and render checkout step 1
const testProduct = mockWindow.PRODUCTS[0];
mockWindow.CartManager.add(testProduct, 1);
mockWindow.renderCheckoutStep1();

const renderedHtml = innerHTMLHolder;
console.log('\n--- Step 1 Rendered Summary Snippet ---');
const summaryIndex = renderedHtml.indexOf('checkout-summary-box');
console.log(renderedHtml.substring(summaryIndex, summaryIndex + 1600));

// Verification checks
assert(renderedHtml.includes('checkout-cod-banner'), 'COD Payment Notice must be present');
assert(renderedHtml.includes('Cash on Delivery (COD) is strictly unavailable'), 'COD Notice text must be preserved');

assert(renderedHtml.includes('checkout-unboxing-policy'), 'checkout-unboxing-policy must be rendered');
assert(renderedHtml.includes('📦 IMPORTANT: UNBOXING VIDEO &amp; LIVE ARRIVAL POLICY') || renderedHtml.includes('📦 IMPORTANT: UNBOXING VIDEO & LIVE ARRIVAL POLICY'), 'Heading must match');

// Placement check: Unboxing policy must appear AFTER checkout-cod-banner inside checkout-summary-box
const codPos = renderedHtml.indexOf('checkout-cod-banner');
const policyPos = renderedHtml.indexOf('checkout-unboxing-policy');
const summaryClosePos = renderedHtml.indexOf('</div>\n      </div>\n    `');
assert(codPos !== -1 && policyPos !== -1, 'Both COD banner and policy card must be present');
assert(policyPos > codPos, 'Unboxing policy must be placed directly BELOW the Payment Notice');

// Check policy text contents
assert(renderedHtml.includes('To protect both our customers and Fish Tales, please record a clear, continuous unboxing video while opening your delivered package.'), 'Must include intro paragraph');
assert(renderedHtml.includes('Start recording before opening the sealed package.'), 'Must include bullet 1');
assert(renderedHtml.includes('Clearly show the outer packaging, shipping label and the complete unboxing process.'), 'Must include bullet 2');
assert(renderedHtml.includes('Do not pause, edit or cut the video.'), 'Must include bullet 3');
assert(renderedHtml.includes('If any live livestock arrives dead or damaged during transit, the unboxing video will be required as proof for verification.'), 'Must include bullet 4');
assert(renderedHtml.includes('Our team will review the video and verify the issue before approving a replacement.'), 'Must include bullet 5');
assert(renderedHtml.includes('Replacement Policy:'), 'Must include Replacement Policy heading');
assert(renderedHtml.includes('the replacement product will be provided free of product cost. However, the customer will need to pay the applicable delivery/shipping charges for the replacement shipment.'), 'Must include replacement policy terms');
assert(renderedHtml.includes('Please keep the unboxing video safe until your order is successfully verified.'), 'Must include closing safe video note');

// Check highlight badges
assert(renderedHtml.includes('Unboxing Video Required'), 'Must highlight Unboxing Video Required');
assert(renderedHtml.includes('Replacement Shipping Charges Applicable'), 'Must highlight Replacement Shipping Charges Applicable');

console.log('\n3. Checking Step 2 (Review step)...');
// Directly render Step 2 to verify its template
mockWindow.renderCheckoutStep2();
const renderedStep2 = innerHTMLHolder;
assert(renderedStep2.includes('checkout-unboxing-policy'), 'Step 2 review must also display the policy card');
assert(renderedStep2.includes('checkout-callout-box'), 'Step 2 payment notice preserved');

console.log('\n✅ ALL Unboxing Video & Live Arrival Policy tests passed successfully!');
