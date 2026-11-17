const https = require('https');

const urls = [
  'https://res.cloudinary.com/pv8lnpft/image/upload/v1794949703/6a075120-0425-4e4f-bbc0-86de19ce4d3a.png',
  'https://res.cloudinary.com/pv8lnpft/image/upload/v1794949659/8dd7ee2e-c485-4ab0-b248-e12938751576.png',
  'https://res.cloudinary.com/pv8lnpft/image/upload/v1794949621/42c4770a-f56f-44a1-af1d-6dff23ee4223.png'
];

urls.forEach((u, i) => {
  https.get(u, res => {
    console.log(`Slide ${i + 1} status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}`);
  }).on('error', err => {
    console.error(`Slide ${i + 1} error:`, err.message);
  });
});
