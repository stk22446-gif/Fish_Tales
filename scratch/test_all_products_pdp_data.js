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
console.log('Checking all 32 products for PDP data:');

let countOverview = 0;
let countCare = 0;
let countHabitat = 0;
let countDyk = 0;
let countSpecs = 0;

products.forEach(p => {
  if (p.overview && p.overview.trim()) countOverview++;
  if (p.specs && Object.keys(p.specs).length > 0) countSpecs++;
  if (p.careRequirements) {
    if (typeof p.careRequirements === 'object' && Object.keys(p.careRequirements).length > 0) countCare++;
    else if (typeof p.careRequirements === 'string' && p.careRequirements.trim()) countCare++;
  }
  if (p.habitatSetup) {
    if (typeof p.habitatSetup === 'object' && Object.keys(p.habitatSetup).length > 0) countHabitat++;
    else if (typeof p.habitatSetup === 'string' && p.habitatSetup.trim()) countHabitat++;
  }
  if (p.didYouKnow && Array.isArray(p.didYouKnow) && p.didYouKnow.length > 0) countDyk++;
});

console.log(`Overview: ${countOverview}/32`);
console.log(`Specs: ${countSpecs}/32`);
console.log(`CareRequirements: ${countCare}/32`);
console.log(`HabitatSetup: ${countHabitat}/32`);
console.log(`DidYouKnow: ${countDyk}/32`);
