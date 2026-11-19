const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — PROMOTIONAL AUTO-SLIDER TEST SUITE ===\n');

// 1. Verify index.html HTML markup & Section Order
console.log('1. Verifying HTML markup & section placement in index.html:');
const html = fs.readFileSync('index.html', 'utf8');

assert(html.includes('id="promoSliderSection"'), 'index.html must have #promoSliderSection');
assert(html.includes('id="promoSliderContainer"'), 'index.html must have #promoSliderContainer');
assert(html.includes('id="promoSliderTrack"'), 'index.html must have #promoSliderTrack');
assert(html.includes('id="promoSliderDots"'), 'index.html must have #promoSliderDots');

const heroPos = html.indexOf('id="hero"');
const sliderPos = html.indexOf('id="promoSliderSection"');
const pillarsPos = html.indexOf('id="categories"');

assert(heroPos !== -1, 'Hero section must exist');
assert(sliderPos !== -1, 'Slider section must exist');
assert(pillarsPos !== -1, 'Four Main Pillars section must exist');
assert(heroPos < sliderPos, 'Hero must be before Promotional Auto Slider');
assert(sliderPos < pillarsPos, 'Promotional Auto Slider must be immediately above Four Main Pillars');
console.log('  ✓ Section Order verified: Hero -> Promotional Auto Slider -> Four Main Pillars');

// 2. Verify Exact 4 Cloudinary Image URLs in Exact Order
console.log('\n2. Verifying the 4 exact Cloudinary URLs and order:');
const expectedUrls = [
  'https://res.cloudinary.com/pv8lnpft/image/upload/v1795035735/8d7fcd64-8ba8-491f-994f-7cf708171c94.png', // Slide 1: Isopod House Kit
  'https://res.cloudinary.com/pv8lnpft/image/upload/v1795035895/6c4b9b82-cca6-43e8-93e1-24706ffd4412.png', // Slide 2: Half Cube Aquarium Kit
  'https://res.cloudinary.com/pv8lnpft/image/upload/v1794949621/42c4770a-f56f-44a1-af1d-6dff23ee4223.png', // Slide 3: Shrimp Colony Offer
  'https://res.cloudinary.com/pv8lnpft/image/upload/v1795036241/154502ad-b5bb-43ba-b232-38ed49c89ad6.png'  // Slide 4: Featured Living Realm Promotion
];

const pos1 = html.indexOf(expectedUrls[0]);
const pos2 = html.indexOf(expectedUrls[1]);
const pos3 = html.indexOf(expectedUrls[2]);
const pos4 = html.indexOf(expectedUrls[3]);

assert(pos1 !== -1, 'Slide 1 URL must be present');
assert(pos2 !== -1, 'Slide 2 URL must be present');
assert(pos3 !== -1, 'Slide 3 URL must be present');
assert(pos4 !== -1, 'Slide 4 URL must be present');
assert(pos1 < pos2, 'Slide 1 must precede Slide 2');
assert(pos2 < pos3, 'Slide 2 must precede Slide 3');
assert(pos3 < pos4, 'Slide 3 must precede Slide 4');
console.log('  ✓ Slide 1: Isopod House Kit present and first');
console.log('  ✓ Slide 2: Half Cube Aquarium Kit present and second');
console.log('  ✓ Slide 3: Shrimp Colony Offer present and third');
console.log('  ✓ Slide 4: 4th Slide image present and fourth');

// 3. Verify CSS in style.css
console.log('\n3. Verifying CSS styling in style.css:');
const css = fs.readFileSync('style.css', 'utf8');

assert(css.includes('.promo-slider-section'), 'CSS has .promo-slider-section');
assert(css.includes('.promo-slider-container'), 'CSS has .promo-slider-container');
assert(css.includes('.promo-slider-track'), 'CSS has .promo-slider-track');
assert(css.includes('.promo-slide'), 'CSS has .promo-slide');
assert(css.includes('.promo-slide.active'), 'CSS has .promo-slide.active');
assert(css.includes('.promo-slide-img'), 'CSS has .promo-slide-img');
assert(css.includes('.promo-slider-dots'), 'CSS has .promo-slider-dots');
assert(css.includes('.promo-dot'), 'CSS has .promo-dot');
assert(css.includes('.promo-dot.active'), 'CSS has .promo-dot.active');

assert(css.includes('object-fit: contain'), 'CSS specifies object-fit: contain');
assert(css.includes('width: 100%'), 'CSS specifies width: 100%');
assert(css.includes('height: auto'), 'CSS specifies height: auto');
assert(css.includes('opacity'), 'CSS specifies opacity transition');
console.log('  ✓ Responsive object-fit: contain, width: 100%, height: auto, and smooth fade transitions verified');

// 4. Verify JS in-memory DOM execution
console.log('\n4. Testing Slider JS Execution in simulated DOM environment:');
const scriptCode = fs.readFileSync('script.js', 'utf8');

let intervalCallback = null;
let intervalTime = 0;
let cleared = false;

// Mock DOM elements
function createMockElement(id, className = '') {
  const classes = new Set(className.split(' ').filter(Boolean));
  const listeners = {};
  const attrs = {};
  const children = [];

  return {
    id,
    className,
    dataset: {},
    children,
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (classes.has(c)) classes.delete(c);
          else classes.add(c);
        } else if (force) classes.add(c);
        else classes.delete(c);
      },
      contains: (c) => classes.has(c)
    },
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: (k) => attrs[k] || null,
    addEventListener: (type, fn) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    dispatchEvent: (type, evt = {}) => {
      if (listeners[type]) listeners[type].forEach(fn => fn(evt));
    },
    querySelectorAll: (sel) => {
      if (sel === '.promo-slide') return mockSlides;
      if (sel === '.promo-dot') return mockDots;
      return [];
    }
  };
}

const mockSlide0 = createMockElement('s0', 'promo-slide active');
const mockSlide1 = createMockElement('s1', 'promo-slide');
const mockSlide2 = createMockElement('s2', 'promo-slide');
const mockSlide3 = createMockElement('s3', 'promo-slide');
const mockSlides = [mockSlide0, mockSlide1, mockSlide2, mockSlide3];

const mockDot0 = createMockElement('d0', 'promo-dot active');
mockDot0.dataset.slide = '0';
const mockDot1 = createMockElement('d1', 'promo-dot');
mockDot1.dataset.slide = '1';
const mockDot2 = createMockElement('d2', 'promo-dot');
mockDot2.dataset.slide = '2';
const mockDot3 = createMockElement('d3', 'promo-dot');
mockDot3.dataset.slide = '3';
const mockDots = [mockDot0, mockDot1, mockDot2, mockDot3];

const mockTrack = createMockElement('promoSliderTrack');
const mockContainer = createMockElement('promoSliderContainer');
mockContainer.querySelectorAll = (sel) => {
  if (sel === '.promo-slide') return mockSlides;
  if (sel === '.promo-dot') return mockDots;
  return [];
};

const domMock = {
  document: {
    readyState: 'complete',
    addEventListener: () => {},
    getElementById: (id) => {
      if (id === 'promoSliderContainer') return mockContainer;
      if (id === 'promoSliderTrack') return mockTrack;
      return null;
    },
    querySelectorAll: () => []
  },
  window: {
    addEventListener: () => {}
  },
  setInterval: (cb, t) => {
    intervalCallback = cb;
    intervalTime = t;
    cleared = false;
    return 12345;
  },
  clearInterval: (id) => {
    cleared = true;
    intervalCallback = null;
  }
};

const vm = require('vm');
const sandbox = {
  window: domMock.window,
  document: domMock.document,
  setInterval: domMock.setInterval,
  clearInterval: domMock.clearInterval,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  localStorage: { getItem: () => null, setItem: () => {} },
  location: { search: '', pathname: '/index.html' },
  navigator: { userAgent: '' }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

// Initialize promo slider
sandbox.window.initPromoSlider();

// Verify Autoplay timer set to 3000ms
assert.strictEqual(intervalTime, 3000, 'Autoplay interval must be 3000ms');
assert(intervalCallback !== null, 'Autoplay timer must be active');
console.log('  ✓ Autoplay timer successfully initialized to 3000ms (3 seconds)');

// Test Autoplay step: 0 -> 1
intervalCallback();
assert(!mockSlide0.classList.contains('active'), 'Slide 0 must be inactive');
assert(mockSlide1.classList.contains('active'), 'Slide 1 must be active');
assert(!mockDot0.classList.contains('active'), 'Dot 0 must be inactive');
assert(mockDot1.classList.contains('active'), 'Dot 1 must be active');
console.log('  ✓ Step 1: Slide transitioned 0 -> 1');

// Test Autoplay step: 1 -> 2
intervalCallback();
assert(mockSlide2.classList.contains('active'), 'Slide 2 must be active');
assert(mockDot2.classList.contains('active'), 'Dot 2 must be active');
console.log('  ✓ Step 2: Slide transitioned 1 -> 2');

// Test Autoplay step: 2 -> 3
intervalCallback();
assert(mockSlide3.classList.contains('active'), 'Slide 3 must be active');
assert(mockDot3.classList.contains('active'), 'Dot 3 must be active');
console.log('  ✓ Step 3: Slide transitioned 2 -> 3');

// Test Infinite loop: 3 -> 0
intervalCallback();
assert(mockSlide0.classList.contains('active'), 'Slide 0 must be active after slide 3 (infinite loop)');
assert(mockDot0.classList.contains('active'), 'Dot 0 must be active after slide 3 (infinite loop)');
console.log('  ✓ Step 4: Infinite looping 3 -> 0 verified');

// Test Clickable Navigation Dots: click Dot 3
mockDot3.dispatchEvent('click');
assert(mockSlide3.classList.contains('active'), 'Clicking Dot 3 must activate Slide 3');
assert(mockDot3.classList.contains('active'), 'Clicking Dot 3 must activate Dot 3');
console.log('  ✓ Clickable Navigation Dot interaction verified (direct jump to Slide 3)');

// Test Desktop Hover: mouseenter pauses autoplay
mockContainer.dispatchEvent('mouseenter');
assert.strictEqual(cleared, true, 'Desktop hover must pause autoplay (clear interval)');
assert.strictEqual(intervalCallback, null, 'Autoplay timer must be cleared on hover');
console.log('  ✓ Desktop hover pause verified');

// Test Desktop Mouseleave: mouseleave resumes autoplay
mockContainer.dispatchEvent('mouseleave');
assert(intervalCallback !== null, 'Mouseleave must resume autoplay timer');
assert.strictEqual(intervalTime, 3000, 'Resumed autoplay timer interval must be 3000ms');
console.log('  ✓ Desktop mouseleave autoplay resume verified');

// Test Mobile Swipe Gesture: Swipe Left (next slide: 3 -> 0)
mockTrack.dispatchEvent('touchstart', { touches: [{ clientX: 200, clientY: 100 }] });
mockTrack.dispatchEvent('touchmove', { touches: [{ clientX: 120, clientY: 100 }] }); // dx = -80px (swipe left)
mockTrack.dispatchEvent('touchend');
assert(mockSlide0.classList.contains('active'), 'Swipe left must advance to next slide (3 -> 0)');
console.log('  ✓ Mobile swipe left gesture (advance next) verified');

// Test Mobile Swipe Gesture: Swipe Right (prev slide: 0 -> 3)
mockTrack.dispatchEvent('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
mockTrack.dispatchEvent('touchmove', { touches: [{ clientX: 180, clientY: 100 }] }); // dx = +80px (swipe right)
mockTrack.dispatchEvent('touchend');
assert(mockSlide3.classList.contains('active'), 'Swipe right must return to prev slide (0 -> 3)');
console.log('  ✓ Mobile swipe right gesture (return prev) verified');

console.log('\n🎉 ALL PROMOTIONAL AUTO-SLIDER TESTS PASSED WITH 100% SUCCESS!');
