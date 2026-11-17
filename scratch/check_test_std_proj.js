const fs = require('fs');
const js = fs.readFileSync('scratch/test_standardized_project.js', 'utf8');
const lines = js.split('\n');
console.log(lines.slice(20, 50).join('\n'));
