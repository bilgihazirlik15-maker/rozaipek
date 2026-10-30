import fs from 'node:fs/promises';
import path from 'node:path';

let count = 0;
async function update(dir) {
  for (const entry of await fs.readdir(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { await update(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const relative = path.relative('dist', file).split(path.sep).join('/');
    const english = relative.startsWith('eng/');
    let html = await fs.readFile(file, 'utf8');
    let matched = false;
    html = html.replace(/<a\b[^>]*href="([^"]+)"[^>]*>\s*<img\b[^>]*src="([^"]*\/f0([12])\.png)"[^>]*>\s*<\/a>/g, (_, href, src, flag) => {
      matched = true;
      const isEnglish = flag === '1';
      const active = isEnglish === english;
      const label = isEnglish ? 'English' : 'Türkçe';
      return `<a class="language-choice${active ? ' is-active' : ''}" href="${href}" lang="${isEnglish ? 'en' : 'tr'}" aria-label="${label}" title="${label}"${active ? ' aria-current="true"' : ''}><img src="${src}" alt="${label}" /></a>`;
    });
    if (!matched) continue;
    if (!html.includes('assets/language-switcher.css')) {
      const css = path.posix.relative(path.posix.dirname(relative), 'assets/language-switcher.css');
      html = html.replace('</head>', `<link rel="stylesheet" href="${css}">\n</head>`);
    }
    await fs.writeFile(file, html);
    count++;
  }
}
await update('dist');
console.log(`Highlighted active language on ${count} pages.`);
