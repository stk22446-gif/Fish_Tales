const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
html.split('\n').forEach((line, i) => {
  if (line.toLowerCase().includes('promo') || line.toLowerCase().includes('banner') || line.toLowerCase().includes('slider')) {
    console.log(`${i + 1}: ${line.trim().slice(0, 100)}`);
  }
});
