const fs = require('fs');
const css = fs.readFileSync('style.css', 'utf8');

function findRules(selector) {
  const lines = css.split('\n');
  lines.forEach((l, i) => {
    if (l.includes(selector)) {
      console.log(`${i + 1}: ${l.trim()}`);
    }
  });
}

console.log('--- social-stats-section ---');
findRules('social-stats');

console.log('--- promo-slider ---');
findRules('promo-slider');

console.log('--- categories-section ---');
findRules('categories-section');
