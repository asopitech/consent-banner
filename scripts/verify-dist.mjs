import { existsSync, readFileSync } from 'node:fs';
for (const file of ['dist/consent/v1/consent.js', 'dist/consent/v1/consent.css', 'dist/CNAME']) {
  if (!existsSync(file)) throw new Error(`${file} is missing`);
}
if (readFileSync('dist/CNAME', 'utf8').trim() !== 'assets.asopi.tech') throw new Error('CNAME mismatch');
