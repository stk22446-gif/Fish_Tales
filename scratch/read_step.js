const fs = require('fs');
const readline = require('readline');

async function getStep(stepIdx) {
  const fileStream = fs.createReadStream('C:\\Users\\hp\\.gemini\\antigravity\\brain\\a8cfb2e1-05d3-4c3b-a5a5-88edd65d9f7e\\.system_generated\\logs\\transcript.jsonl');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    const obj = JSON.parse(line);
    if (obj.step_index === stepIdx) {
      console.log('Keys:', Object.keys(obj));
      console.log('Thinking:\n', (obj.thinking || '').slice(0, 500));
      break;
    }
  }
}

getStep(107);
