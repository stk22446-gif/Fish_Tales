const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
  const fileStream = fs.createReadStream('C:\\Users\\hp\\.gemini\\antigravity\\brain\\a8cfb2e1-05d3-4c3b-a5a5-88edd65d9f7e\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('broken product image') || line.includes('broken image')) {
      const obj = JSON.parse(line);
      console.log('Step:', obj.step_index, obj.content ? obj.content.slice(0, 300) : '');
    }
  }
}

searchTranscript();
