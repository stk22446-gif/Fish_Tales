const crypto = require('crypto');

function getCommonsUrl(filename) {
  const normalized = filename.replace(/ /g, '_');
  const hash = crypto.createHash('md5').update(normalized).digest('hex');
  const a = hash[0];
  const ab = hash.slice(0, 2);
  return `https://upload.wikimedia.org/wikipedia/commons/${a}/${ab}/${encodeURIComponent(normalized)}`;
}

console.log(getCommonsUrl('Caridina-cf-cantonensis-crystal-red.jpg'));
console.log(getCommonsUrl('Gold Molly 1.jpg'));
console.log(getCommonsUrl('Black molly.jpg'));
console.log(getCommonsUrl('Crystal Red Shrimp (Caridina cf. cantonensis sp. "Crystal Red").jpg'));
