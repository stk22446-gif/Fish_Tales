const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
const idx = js.indexOf('"cubaris-murina-orange"');
const endIdx = js.indexOf('},\n    {', idx);
console.log(js.slice(idx - 20, endIdx + 1));
