import fs from 'node:fs/promises';

const file = 'dist/video.html';
let html = await fs.readFile(file, 'utf8');
const firstVideo = /<div class="sppb-video-block[^\"]*"[^>]*><iframe\b[^>]*>[\s\S]*?<\/iframe><\/div>/;
if (!firstVideo.test(html)) throw new Error('First video block not found');
html = html.replace(firstVideo, '<div class="sppb-video-block sppb-embed-responsive" style="position:relative;width:100%;max-width:360px;aspect-ratio:9/16;padding:0;margin:0 auto;"><iframe class="sppb-embed-responsive-item" src="https://www.youtube.com/embed/pSY_82GOqXo?rel=0" title="Roza İpek Shorts videosu" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe></div>');
await fs.writeFile(file, html);
console.log('First video replaced with pSY_82GOqXo.');
