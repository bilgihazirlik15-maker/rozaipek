import fs from 'node:fs/promises';

const file = 'dist/video.html';
let html = await fs.readFile(file, 'utf8');
const start = html.indexOf('<div id="sp-page-builder"');
if (start < 0) throw new Error('Video content container not found');
let depth = 0, end;
for (const tag of html.slice(start).matchAll(/<\/?div\b[^>]*>/g)) {
  depth += tag[0].startsWith('</') ? -1 : 1;
  if (depth === 0) { end = start + tag.index + tag[0].length; break; }
}
if (!end) throw new Error('Video content container is unbalanced');
const videos = [
  {id: 'pSY_82GOqXo', title: 'Roza İpek Shorts videosu', ratio: '9/16', width: 360},
  {id: 'e_ZNJJ2G0vk', title: 'Roza İpek ürün videosu', ratio: '16/9', width: 720},
];
const content = videos.map(video => `
  <div class="sppb-video-block sppb-embed-responsive" style="position:relative;width:100%;max-width:${video.width}px;aspect-ratio:${video.ratio};padding:0;margin:0 auto;">
    <iframe class="sppb-embed-responsive-item" src="https://www.youtube.com/embed/${video.id}?rel=0" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
  </div>`).join('\n');
html = html.slice(0, start) + `<div id="sp-page-builder" class="sp-page-builder sppb-article-page-wrapper"><div class="page-content"><section class="sppb-section"><div class="sppb-row-container" style="display:flex;flex-direction:column;gap:40px;padding-top:20px;padding-bottom:40px;">${content}\n</div></section></div></div>` + html.slice(end);
await fs.writeFile(file, html);
console.log('Shorts first, existing video below; empty video blocks removed.');
