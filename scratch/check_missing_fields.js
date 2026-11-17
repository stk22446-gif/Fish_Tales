const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('script.js', 'utf8');
const sandbox = {
  window: {},
  document: { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: () => {} },
  location: { search: '' },
  navigator: { userAgent: '' }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const products = sandbox.window.PRODUCTS;
products.forEach(p => {
  if (!p.overview || !p.careRequirements || !p.habitatSetup || !p.didYouKnow) {
    console.log('Missing some field:', p.id, {
      overview: !!p.overview,
      care: !!p.careRequirements,
      habitat: !!p.habitatSetup,
      dyk: !!p.didYouKnow
    });
  }
});
