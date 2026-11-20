const fs = require('fs');
const assert = require('assert');

console.log('=== FISH TALES — TEST UNIVERSAL PRODUCT VIDEO SUPPORT ===\n');

// Mock browser DOM environment
let renderedPdp = '';
let currentUrl = 'product.html?id=betta-pure-white-crowntail';

const mockWindow = {
  location: {
    get href() { return currentUrl; },
    set href(val) { currentUrl = val; },
    get search() {
      const idx = currentUrl.indexOf('?');
      return idx >= 0 ? currentUrl.substring(idx) : '';
    }
  }
};

const mockDocument = {
  title: '',
  body: { dataset: {}, style: {} },
  createElement: () => ({ className: '', innerHTML: '', classList: { add: () => {} }, appendChild: () => {}, remove: () => {} }),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: (id) => {
    if (id === 'pdpMain') {
      return {
        set innerHTML(html) { renderedPdp = html; },
        get innerHTML() { return renderedPdp; }
      };
    }
    return {
      textContent: '',
      innerHTML: '',
      value: '',
      dataset: {},
      removeAttribute: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      querySelectorAll: () => [],
      appendChild: () => {},
      classList: { toggle: () => {}, add: () => {}, remove: () => {} },
      addEventListener: () => {}
    };
  },
  addEventListener: () => {}
};

const mockLocalStorage = {
  getItem: () => '[]',
  setItem: () => {}
};

const scriptCode = fs.readFileSync('script.js', 'utf8');
const fn = new Function('window', 'document', 'localStorage', scriptCode);
fn(mockWindow, mockDocument, mockLocalStorage);

// 1. Verify renderProductVideo function exists and is exported
console.log('1. Verifying reusable renderProductVideo function:');
assert(typeof mockWindow.renderProductVideo === 'function', 'renderProductVideo must be exposed on window');
console.log('  ✓ renderProductVideo is exposed on window and ready for reuse');

// 2. Test empty, null, undefined, invalid video fields
console.log('\n2. Testing conditional rendering for empty, null, or invalid video values:');
assert.strictEqual(mockWindow.renderProductVideo(''), '', 'Empty string must return empty string');
assert.strictEqual(mockWindow.renderProductVideo(null), '', 'null must return empty string');
assert.strictEqual(mockWindow.renderProductVideo(undefined), '', 'undefined must return empty string');
assert.strictEqual(mockWindow.renderProductVideo('   '), '', 'Whitespace must return empty string');
assert.strictEqual(mockWindow.renderProductVideo('invalid-string'), '', 'Non-URL string must return empty string');
console.log('  ✓ Zero video section rendered for empty/null/invalid video fields');

// 3. Test Pure White Crowntail (Product with live Cloudinary video)
console.log('\n3. Verifying PDP render for Betta Pure White Crowntail (id: betta-pure-white-crowntail):');
currentUrl = 'product.html?id=betta-pure-white-crowntail';
mockWindow.renderProductDetailPage();

assert(renderedPdp.includes('class="pdp-video-container"'), 'PDP must include .pdp-video-container');
assert(renderedPdp.includes('<video'), 'PDP must include <video element');
assert(renderedPdp.includes('controls'), 'Video must have controls attribute');
assert(renderedPdp.includes('playsinline'), 'Video must have playsinline attribute');
assert(renderedPdp.includes('preload="metadata"'), 'Video must have preload="metadata"');
assert(renderedPdp.includes('7f93b8d6edaec52538e950e60ad77415.mp4'), 'Video must point to Cloudinary MP4 URL');
assert(renderedPdp.includes('Pure White Crowntail'), 'Product name must be Pure White Crowntail');
console.log('  ✓ Betta Pure White Crowntail correctly renders HTML5 video player with controls, playsinline, metadata');

// 4. Test Product with image but NO video (e.g. Golden Molly)
console.log('\n4. Verifying PDP render for product without video (id: molly-golden):');
currentUrl = 'product.html?id=molly-golden';
mockWindow.renderProductDetailPage();

assert(!renderedPdp.includes('pdp-video-container'), 'Product without video must NOT render .pdp-video-container');
assert(!renderedPdp.includes('<video'), 'Product without video must NOT render <video>');
assert(renderedPdp.includes('Golden Molly'), 'Product name must be Golden Molly');
assert(renderedPdp.includes('pdpMainImg'), 'Product without video must preserve image gallery');
console.log('  ✓ Product without video preserves image gallery and renders ZERO video element');

// 5. Test Product with BOTH image AND video
console.log('\n5. Verifying product with BOTH image AND video:');
const testVideoUrl = 'https://res.cloudinary.com/pv8lnpft/video/upload/v1795046116/test_specimen.mp4';
const testImageUrl = 'https://res.cloudinary.com/pv8lnpft/image/upload/v1795039473/test_specimen.png';

const bothHtml = mockWindow.renderProductVideo(testVideoUrl, testImageUrl, 'Test Specimen');
assert(bothHtml.includes('controls'), 'Must have controls');
assert(bothHtml.includes('playsinline'), 'Must have playsinline');
assert(bothHtml.includes('preload="metadata"'), 'Must have preload="metadata"');
assert(bothHtml.includes(`poster="${testImageUrl}"`), 'Must use product existing image URL as poster');
assert(bothHtml.includes(testVideoUrl), 'Must use provided video URL');
console.log('  ✓ Product with both image and video includes poster attribute and valid stream source');

// 6. Test universal video support across different categories
console.log('\n6. Verifying universal support across all categories (Isopods, Tarantulas, Cultures, Combos):');
const categories = [
  { cat: 'isopods', id: 'armadillidium-gestroi', name: 'Armadillidium Gestroi' },
  { cat: 'tarantulas', id: 'tarantula-chilean-rose', name: 'Chilean Rose Tarantula' },
  { cat: 'cultures', id: 'culture-microworm', name: 'Microworm Starter Culture' },
  { cat: 'combos', id: 'isopod-house-kit', name: 'Isopod House Kit' }
];

categories.forEach(({ cat, id, name }) => {
  const sampleVideo = `https://res.cloudinary.com/pv8lnpft/video/upload/v123456789/${id}.mp4`;
  const rendered = mockWindow.renderProductVideo(sampleVideo, 'sample.jpg', name);
  assert(rendered.includes('<video'), `Category ${cat} must support video`);
  assert(rendered.includes(sampleVideo), `Category ${cat} must contain correct video URL`);
  console.log(`  ✓ Category "${cat}" successfully renders video with dynamic URL`);
});

// 7. Verify CSS styles in style.css
console.log('\n7. Verifying style.css video player rules:');
const css = fs.readFileSync('style.css', 'utf8');
assert(css.includes('.pdp-video-container'), 'style.css must define .pdp-video-container');
assert(css.includes('.pdp-video-wrapper'), 'style.css must define .pdp-video-wrapper');
assert(css.includes('.pdp-video-player'), 'style.css must define .pdp-video-player');
assert(css.includes('object-fit: contain'), 'style.css must use object-fit: contain to prevent video stretching/cropping');
assert(css.includes('aspect-ratio: 16 / 9'), 'style.css must enforce aspect-ratio: 16 / 9');
console.log('  ✓ style.css defines responsive .pdp-video-container, .pdp-video-player, object-fit: contain, and aspect ratio');

console.log('\n🎉 ALL UNIVERSAL PRODUCT VIDEO TESTS PASSED 100%!');
