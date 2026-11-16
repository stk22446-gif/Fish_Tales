const fs = require('fs');
const https = require('https');
const http = require('http');

const script = fs.readFileSync('script.js', 'utf8');
const match = script.match(/const PRODUCTS = (\[[\s\S]*?\]);\s*\/\* ── 4\./);
if (!match) {
  console.error('Could not find PRODUCTS');
  process.exit(1);
}

const products = eval(match[1]);
console.log('Total products in PRODUCTS:', products.length);

async function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve({ status: 'invalid' });
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode, location: res.headers.location });
    });
    req.on('error', (err) => resolve({ status: 'error', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 'timeout' }); });
    req.end();
  });
}

(async () => {
  for (const p of products) {
    const res = await checkUrl(p.image);
    console.log(`${p.id} (${p.category}): ${res.status} -> ${p.image}`);
  }
})();
