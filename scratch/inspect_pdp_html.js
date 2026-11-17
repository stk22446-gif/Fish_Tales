const fs = require('fs');
const vm = require('vm');
const scriptCode = fs.readFileSync('script.js', 'utf8');

const mockMain = {
  id: 'pdpMain',
  innerHTML: '',
  querySelector: () => null,
  querySelectorAll: () => []
};

const domMock = {
  document: {
    readyState: 'complete',
    getElementById: (id) => id === 'pdpMain' ? mockMain : null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  },
  window: {
    addEventListener: () => {},
    location: { search: '?id=cubaris-murina-glacier', pathname: '/product.html' }
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  setInterval: () => {},
  clearInterval: () => {}
};
domMock.window = domMock;
vm.createContext(domMock);
vm.runInContext(scriptCode, domMock);

domMock.window.renderProductDetailPage();
const html = mockMain.innerHTML;
console.log('Total PDP HTML length:', html.length);

const factsIdx = html.indexOf('pdp-facts-card');
if (factsIdx !== -1) {
  console.log('Facts card HTML:');
  console.log(html.substring(factsIdx - 20, factsIdx + 600));
} else {
  console.log('pdp-facts-card not found!');
}
