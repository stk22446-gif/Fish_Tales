const fs = require('fs');
const js = fs.readFileSync('scratch/test_standardized_project.js', 'utf8');
const lines = js.split('\n');
console.log(lines.slice(0, 25).join('\n'));
