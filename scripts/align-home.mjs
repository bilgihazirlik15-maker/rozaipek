import fs from 'node:fs/promises';

const file = 'dist/index.html';
let html = await fs.readFile(file, 'utf8');
const sectionPattern = /<section id="section-id-1738515770626"[\s\S]*?<\/section>/;
const section = html.match(sectionPattern)?.[0];
if (!section) throw new Error('Home product section is missing');
if (!section.includes('home-product-grid')) {
  const cards = [];
  const starts = [...section.matchAll(/<div id="sppb-addon-wrapper-[^"]+" class="sppb-addon-wrapper">/g)];
  for (const start of starts) {
    const tail = section.slice(start.index);
    let depth = 0;
    for (const tag of tail.matchAll(/<\/?div\b[^>]*>/g)) {
      depth += tag[0].startsWith('</') ? -1 : 1;
      if (!depth) { cards.push(tail.slice(0, tag.index + tag[0].length)); break; }
    }
  }
  if (cards.length !== 15) throw new Error(`Expected 15 products, found ${cards.length}`);
  // Convert the original three independent columns into shared product rows.
  const ordered = Array.from({length:5}, (_, row) => [cards[row], cards[5+row], cards[10+row]]).flat();
  html = html.replace(sectionPattern, `<section id="section-id-1738515770626" class="sppb-section"><div class="sppb-row-container"><div class="home-product-grid">${ordered.join('')}</div></div></section>`);
}
if (!html.includes('assets/home-products.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/home-products.css">\n</head>');
if (!html.includes('assets/whatsapp-support.css')) html = html.replace('</head>', '<link rel="stylesheet" href="assets/whatsapp-support.css">\n</head>');
if (!html.includes('class="whatsapp-support"')) html = html.replace('</body>', `<a class="whatsapp-support" href="https://wa.me/902128768318" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp destek hattı: +90 212 876 83 18 (yeni sekmede açılır)"><i class="fab fa-whatsapp" aria-hidden="true"></i><span>WhatsApp Destek</span></a>\n</body>`);
html = html.replace('<i class="fab fa-whatsapp" aria-hidden="true"></i>', '<img class="whatsapp-support__icon" src="assets/whatsapp.svg" width="29" height="29" alt="" aria-hidden="true">');
html = html.replace('href="assets/whatsapp-support.css"', 'href="assets/whatsapp-support.css?v=2"');
await fs.writeFile(file, html);
console.log('Home products aligned in shared rows.');
