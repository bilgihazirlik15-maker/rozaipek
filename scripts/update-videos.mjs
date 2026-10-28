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
  {id: 'L6vBx1wLfdk', title: 'Video 1', ratio: '9/16', width: 360},
  {id: 'pSY_82GOqXo', title: 'Video 2', ratio: '9/16', width: 360},
  {id: 'lKJ_cGCHrDg', title: 'Video 3', ratio: '9/16', width: 360},
  {id: 'Jaw0NbXnhFM', title: 'Uzun Video 1', ratio: '16/9', width: 720},
  {id: '7bikmspBVTA', title: 'Uzun Video 2', ratio: '16/9', width: 720},
  {id: 'lkDAq35n6b4', title: 'Uzun Video 3', ratio: '16/9', width: 720},
];
const renderVideo = video => `
  <div style="width:100%;">
  <h2 style="text-align:center;margin:0 0 20px;">${video.title}</h2>
  <div class="sppb-video-block sppb-embed-responsive" style="position:relative;width:100%;max-width:${video.width}px;height:auto;flex-shrink:0;aspect-ratio:${video.ratio};padding:0;margin:0 auto;">
    <iframe class="sppb-embed-responsive-item" src="https://www.youtube.com/embed/${video.id}?rel=0" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
  </div></div>`;
const content = `<div class="shorts-grid">${videos.slice(0, 3).map(renderVideo).join('\n')}</div>${videos.slice(3).map(renderVideo).join('\n')}`;
html = html.slice(0, start) + `<div id="sp-page-builder" class="sp-page-builder sppb-article-page-wrapper"><div class="page-content"><section class="sppb-section"><div class="sppb-row-container" style="display:flex;flex-direction:column;gap:40px;padding-top:20px;padding-bottom:40px;">${content}\n</div></section></div></div>` + html.slice(end);
if (!html.includes('assets/video-layout.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/video-layout.css">\n</head>');
await fs.writeFile(file, html);
console.log('Three Shorts side by side, followed by three long videos in order.');
