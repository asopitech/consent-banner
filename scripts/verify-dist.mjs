import {existsSync,readFileSync} from 'node:fs';
for (const f of ['dist/consent/v1/consent.js','dist/consent/v1/consent.css','dist/CNAME']) if(!existsSync(f)) throw new Error(`Missing ${f}`);
const js=readFileSync('dist/consent/v1/consent.js','utf8');
for (const bad of ['pushState','replaceState','popstate','MutationObserver','page_view','send_page_view','document.write','new Function','eval(']) if(js.includes(bad)) throw new Error(`Forbidden token: ${bad}`);
console.log('dist verified');
