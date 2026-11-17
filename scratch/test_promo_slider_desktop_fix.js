const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('=== FISH TALES — PROMOTIONAL AUTO-SLIDER DESKTOP FIX TEST ===\n');

// 1. Mock DOM
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
const mockSlides = [mockSlide0, mockSlide1, mockSlide2];

const mockDot0 = createMockElement('d0', 'promo-dot active');
mockDot0.dataset.slide = '0';
const mockDot1 = createMockElement('d1', 'promo-dot');
mockDot1.dataset.slide = '1';
const mockDot2 = createMockElement('d2', 'promo-dot');
mockDot2.dataset.slide = '2';
const mockDots = [mockDot0, mockDot1, mockDot2];

const mockTrack = createMockElement('promoSliderTrack');
const mockContainer = createMockElement('promoSliderContainer');
mockContainer.querySelectorAll = (sel) => {
  if (sel === '.promo-slide') return mockSlides;
  if (sel === '.promo-dot') return mockDots;
  return [];
};

let activeIntervals = new Map();
let nextTimerId = 1;

const domMock = {
  document: {
    readyState: 'complete',
    hidden: false,
    _listeners: {},
    addEventListener: (type, fn) => {
      if (!domMock.document._listeners[type]) domMock.document._listeners[type] = [];
      domMock.document._listeners[type].push(fn);
    },
    dispatchEvent: (type, evt = {}) => {
      if (domMock.document._listeners[type]) domMock.document._listeners[type].forEach(fn => fn(evt));
    },
    getElementById: (id) => {
      if (id === 'promoSliderContainer') return mockContainer;
      if (id === 'promoSliderTrack') return mockTrack;
      return null;
    },
    querySelectorAll: () => []
  },
  window: {
    _listeners: {},
    addEventListener: (type, fn) => {
      if (!domMock.window._listeners[type]) domMock.window._listeners[type] = [];
      domMock.window._listeners[type].push(fn);
    },
    dispatchEvent: (type, evt = {}) => {
      if (domMock.window._listeners[type]) domMock.window._listeners[type].forEach(fn => fn(evt));
    }
  },
  setInterval: (cb, ms) => {
    const id = nextTimerId++;
    activeIntervals.set(id, { cb, ms });
    return id;
  },
  clearInterval: (id) => {
    activeIntervals.delete(id);
  }
};

const scriptCode = fs.readFileSync('script.js', 'utf8');

const sandbox = {
  window: null,
  document: domMock.document,
  setInterval: domMock.setInterval,
  clearInterval: domMock.clearInterval,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  localStorage: { getItem: () => null, setItem: () => {} },
  location: { search: '', pathname: '/index.html' },
  navigator: { userAgent: '' },
  addEventListener: domMock.window.addEventListener,
  dispatchEvent: domMock.window.dispatchEvent
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(scriptCode, sandbox);

console.log('1. Testing initialization:');
sandbox.window.initPromoSlider();
assert.strictEqual(activeIntervals.size, 1, 'Exactly one timer must be active after init');
console.log('  ✓ Autoplay timer successfully started');

console.log('2. Testing idempotency (multiple init calls must not duplicate timers):');
sandbox.window.initPromoSlider();
sandbox.window.initPromoSlider();
assert.strictEqual(activeIntervals.size, 1, 'Multiple init calls must NOT create duplicate timers');
console.log('  ✓ Idempotency guard prevents duplicate timers');

console.log('3. Testing 3-second interval loop (0 -> 1 -> 2 -> 0):');
const timerEntry = [...activeIntervals.values()][0];
assert.strictEqual(timerEntry.ms, 3000, 'Autoplay interval must be 3000ms');

timerEntry.cb(); // 0 -> 1
assert(mockSlide1.classList.contains('active'), 'Slide 1 must be active');
timerEntry.cb(); // 1 -> 2
assert(mockSlide2.classList.contains('active'), 'Slide 2 must be active');
timerEntry.cb(); // 2 -> 0
assert(mockSlide0.classList.contains('active'), 'Slide 0 must be active (loop back)');
console.log('  ✓ 3000ms autoplay interval & infinite looping verified');

console.log('4. Testing desktop hover pause and resume:');
mockContainer.dispatchEvent('mouseenter');
assert.strictEqual(activeIntervals.size, 0, 'Hovering must pause autoplay (clear interval)');
mockContainer.dispatchEvent('mouseleave');
assert.strictEqual(activeIntervals.size, 1, 'Mouseleave must resume autoplay timer');
console.log('  ✓ Hover pause and resume verified');

console.log('5. Testing manual dot navigation:');
mockDot1.dispatchEvent('click');
assert(mockSlide1.classList.contains('active'), 'Dot 1 click must activate Slide 1');
assert.strictEqual(activeIntervals.size, 1, 'Autoplay must continue after dot click');
console.log('  ✓ Dot click advances slide and continues autoplay');

console.log('6. Testing visibility change (tab hidden / visible):');
domMock.document.hidden = true;
domMock.document.dispatchEvent('visibilitychange');
assert.strictEqual(activeIntervals.size, 0, 'Tab hidden must pause autoplay');

domMock.document.hidden = false;
domMock.document.dispatchEvent('visibilitychange');
assert.strictEqual(activeIntervals.size, 1, 'Tab visible must resume autoplay');
console.log('  ✓ Tab visibility handling verified');

console.log('\nAll checks passed in test script setup.');
