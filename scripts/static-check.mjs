import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
const files = globSync('src/**/*.{ts,css}');
const forbidden = [/innerHTML/, /eval\(/, /new Function/, /document\.write/, /send_page_view/, /page_view/, /pushState|replaceState|popstate|MutationObserver/];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const re of forbidden) if (re.test(text)) throw new Error(`${file} contains ${re}`);
}
