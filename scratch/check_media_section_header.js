const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');

const mediaStart = css.indexOf('@media (max-width: 768px)');
const sub = css.slice(mediaStart);
const lines = sub.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.section-header') || l.includes('.section-title') || l.includes('.categories-section')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});
