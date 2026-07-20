import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
mkdirSync('dist/consent/v1', { recursive: true });
cpSync('public/demo', 'dist/demo', { recursive: true });
writeFileSync('dist/CNAME', 'assets.asopi.tech\n');
const license = readFileSync('node_modules/vanilla-cookieconsent/LICENSE', 'utf8');
writeFileSync('dist/consent/v1/THIRD_PARTY_LICENSES.txt', `vanilla-cookieconsent\nVersion: 3.1.0\nLicense: MIT\nCopyright: Orest Bida\n\n${license}`);
