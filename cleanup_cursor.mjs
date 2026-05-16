import { readFileSync, writeFileSync } from 'fs';

const file = 'imperiumlogin-main/imperiumlogin-main/src/components/RemixedPage.tsx';
const lines = readFileSync(file, 'utf8').split('\n');

// Remove lines 2726 through 2953 (0-indexed: 2725 to 2952)
const keepStart = lines.slice(0, 2725);  // lines 1-2725 (0-indexed 0-2724)
const keepEnd = lines.slice(2953);        // lines 2954+ (0-indexed 2953+)

const result = [...keepStart, ...keepEnd].join('\n');
writeFileSync(file, result, 'utf8');
console.log('Done! Removed lines 2726-2953. New total lines:', keepStart.length + keepEnd.length);
