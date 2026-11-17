const fs = require('fs');
const js = fs.readFileSync('script.js', 'utf8');
js.split('\n').forEach((line, i) => {
  if (line.includes('DOMContentLoaded') || line.includes('window.onload') || line.includes('initSearch')) {
    console.log(`${i + 1}: ${line.trim()}`);
  }
});
