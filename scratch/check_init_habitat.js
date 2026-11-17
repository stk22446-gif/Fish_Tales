const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
const start = js.indexOf('if (p.habitatSetup === undefined');
console.log(js.slice(start, start + 3000));
