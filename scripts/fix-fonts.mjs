import fs from 'node:fs/promises';
const faces=[
  {css:'57bd87c1b9d30421.css',family:'Raleway',prefix:'raleway',weight:'100 900'},
  {css:'b5464e981ef07454.css',family:'Open Sans',prefix:'open-sans',weight:'300 800'}
];
for(const f of faces) {
  const css=['normal','italic'].map(style=>`@font-face {
  font-family: '${f.family}';
  font-style: ${style};
  font-weight: ${f.weight};
  font-display: swap;
  src: url('../fonts/${f.prefix}${style==='italic'?'-italic':''}.ttf') format('truetype');
}`).join('\n');
  await fs.writeFile(`dist/assets/external/${f.css}`,css+'\n');
}
async function walk(dir) {
  for(const e of await fs.readdir(dir,{withFileTypes:true})) {
    const file=`${dir}/${e.name}`;
    if(e.isDirectory()) await walk(file);
    else if(e.name.endsWith('.html')) {
      const original=await fs.readFile(file,'utf8');
      const revised=original.replace(/(assets\/external\/(?:57bd87c1b9d30421|b5464e981ef07454)\.css)(?:\?[^"']*)?/g,'$1?v=turkish-2');
      if(revised!==original) await fs.writeFile(file,revised);
    }
  }
}
await walk('dist');
