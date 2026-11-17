const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
const start = js.indexOf('Extended product information sections');
console.log(js.slice(start - 20, start + 3000));
