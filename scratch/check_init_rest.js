const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
const start = js.indexOf('if (p.careRequirements === undefined)');
console.log(js.slice(start, start + 3500));
