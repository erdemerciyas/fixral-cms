// Fenced kod bloklarının karakter uzunluğunu ölçer. Figma prompt limiti: 2000.
const fs = require('fs');

const FENCE = '`'.repeat(3);
const LIMIT = 2000;
const file = process.argv[2] || 'FIGMA-PROMPTS.md';

const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
let inBlock = false;
let buffer = [];
let heading = '';
let blockHeading = '';
let over = 0;

for (const line of lines) {
  if (line.startsWith('## ')) heading = line.slice(3).trim();

  if (line.trim().startsWith(FENCE)) {
    if (!inBlock) {
      inBlock = true;
      buffer = [];
      blockHeading = heading;
    } else {
      inBlock = false;
      const text = buffer.join('\n').trim();
      const flag = text.length > LIMIT ? 'ASIYOR' : 'ok    ';
      if (text.length > LIMIT) over++;
      console.log(`${flag} ${String(text.length).padStart(5)}  ${blockHeading}`);
    }
    continue;
  }

  if (inBlock) buffer.push(line);
}

console.log(`\n${over} blok limiti asiyor.`);
