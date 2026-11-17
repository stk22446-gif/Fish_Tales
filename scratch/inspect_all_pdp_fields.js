const fs = require('fs');
// Load script.js in a vm or mock
const code = fs.readFileSync('script.js', 'utf8');
const vm = require('vm');
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
console.log('Total products:', products.length);

const careReqKeys = new Set();
const habitatKeys = new Set();
const specKeys = new Set();
let habitatStringCount = 0;
let habitatObjectCount = 0;

products.forEach(p => {
  if (p.specs) Object.keys(p.specs).forEach(k => specKeys.add(k));
  if (p.careRequirements && typeof p.careRequirements === 'object') {
    Object.keys(p.careRequirements).forEach(k => careReqKeys.add(k));
  }
  if (typeof p.habitatSetup === 'string') {
    habitatStringCount++;
  } else if (p.habitatSetup && typeof p.habitatSetup === 'object') {
    habitatObjectCount++;
    Object.keys(p.habitatSetup).forEach(k => habitatKeys.add(k));
  }
});

console.log('Specs keys:', Array.from(specKeys));
console.log('CareRequirements keys:', Array.from(careReqKeys));
console.log('HabitatSetup object keys:', Array.from(habitatKeys));
console.log('Habitat setups: ' + habitatObjectCount + ' objects, ' + habitatStringCount + ' strings');
