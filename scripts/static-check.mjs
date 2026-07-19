import {readFileSync,readdirSync,statSync} from 'node:fs'; import {join} from 'node:path';
function walk(d){return readdirSync(d).flatMap(f=>{const p=join(d,f); return statSync(p).isDirectory()?walk(p):[p]})}
for(const f of walk('src').filter(f=>/\.ts$/.test(f))){const s=readFileSync(f,'utf8'); for(const bad of ['pushState','replaceState','popstate','MutationObserver','page_view','send_page_view','document.write','new Function','eval(']) if(s.includes(bad)) throw new Error(`${bad} in ${f}`)}
console.log('static checks passed');
