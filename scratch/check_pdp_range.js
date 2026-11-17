const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
const start = js.indexOf('window.renderProductDetailPage = function');
const end = js.indexOf('/* ── 8. Cart Drawer Controller');
console.log('Start line:', js.slice(0, start).split('\n').length);
console.log('End line:', js.slice(0, end).split('\n').length);
