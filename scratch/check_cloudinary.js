const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const urls = html.match(/https:\/\/res\.cloudinary\.com[^\s"']+/g) || [];
console.log('Cloudinary URLs in index.html:', urls);
