import { PDFParse } from 'pdf-parse';
import fs from 'fs';

const dataBuffer = fs.readFileSync(process.argv[2]);
const parser = new PDFParse({ data: dataBuffer });
const doc = await parser.load();
const info = await parser.getInfo();
const result = await parser.getText();
console.log('=== TEXT CONTENT ===');
console.log(result.text);
console.log('=== END TEXT ===');
console.log('Pages:', result.total);
console.log('=== INFO ===');
console.log(JSON.stringify(info, null, 2));
