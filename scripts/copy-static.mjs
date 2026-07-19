import { copyFileSync, cpSync, mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('dist/consent/v1', { recursive: true });
copyFileSync('src/consent.css', 'dist/consent/v1/consent.css');
cpSync('public/demo', 'dist/demo', { recursive: true });
writeFileSync('dist/CNAME', 'assets.asopi.tech\n');
