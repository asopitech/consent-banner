import {mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('dist/consent/v1',{recursive:true}); copyFileSync('src/styles/consent.css','dist/consent/v1/consent.css'); copyFileSync('public/CNAME','dist/CNAME');
