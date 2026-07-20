import { existsSync, readFileSync } from 'node:fs';
for (const file of ['dist/consent/v1/consent.js', 'dist/consent/v1/consent.css', 'dist/consent/v1/THIRD_PARTY_LICENSES.txt', 'dist/CNAME']) {
  if (!existsSync(file)) throw new Error(`${file} is missing`);
}
if (readFileSync('dist/CNAME', 'utf8').trim() !== 'assets.asopi.tech') throw new Error('CNAME mismatch');
if (!readFileSync('dist/consent/v1/THIRD_PARTY_LICENSES.txt', 'utf8').includes('vanilla-cookieconsent')) throw new Error('third-party license missing');
