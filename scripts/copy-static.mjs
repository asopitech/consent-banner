import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
mkdirSync('dist/consent/v1', { recursive: true });
cpSync('public/demo', 'dist/demo', { recursive: true });
writeFileSync('dist/CNAME', 'assets.asopi.tech\n');
