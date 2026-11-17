const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
const p = js.indexOf('"guppy-red-lace"');
console.log(js.slice(p - 10, p + 600));
