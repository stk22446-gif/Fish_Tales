const fs = require('fs');

['index.html', 'script.js', 'style.css'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  ['slider', 'promo', 'carousel', 'banner'].forEach(k => {
    let count = 0;
    let idx = 0;
    while ((idx = content.toLowerCase().indexOf(k, idx)) !== -1) {
      count++;
      idx += k.length;
    }
    if (count > 0) {
      console.log(`${f} contains '${k}': ${count} times`);
    }
  });
});
