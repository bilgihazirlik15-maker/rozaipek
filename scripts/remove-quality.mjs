import fs from 'node:fs/promises';
import path from 'node:path';

async function removeLinks(dir) {
  for (const entry of await fs.readdir(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await removeLinks(file);
    else if (entry.name.endsWith('.html')) {
      const html = await fs.readFile(file, 'utf8');
      const updated = html.replace(/<li\b[^>]*>\s*<a\b[^>]*href="(?:\.\.\/)?quality\.html"[^>]*>\s*Quality\s*<\/a>\s*<\/li>/g, '');
      const cleaned = updated.replace(/<a\b[^>]*href="(?:\.\.\/)?quality\.html"[^>]*>\s*Quality\s*<\/a>\s*(?:<br\s*\/?>)?/g, '');
      if (cleaned !== html) await fs.writeFile(file, cleaned);
    }
  }
}
await removeLinks('dist/eng');
await fs.rm('dist/eng/quality.html', {force:true});
const indexFile = 'dist/assets/search-index.json';
const index = JSON.parse(await fs.readFile(indexFile, 'utf8'));
await fs.writeFile(indexFile, JSON.stringify(index.filter(page => page.path !== 'eng/quality.html')));
console.log('Removed Quality page, desktop/mobile menu links and search entry.');
