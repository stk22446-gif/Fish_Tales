const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
const p = js.indexOf('"cubaris-sp-cappuccino"');
console.log(js.slice(p, p + 1500));
