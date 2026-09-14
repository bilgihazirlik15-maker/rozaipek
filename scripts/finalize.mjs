import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('dist');
const report=JSON.parse(await fs.readFile('reports/mirror.json','utf8'));
const externals=new Map();
async function localize(url){
  url=url.replaceAll('&amp;','&');
  if(externals.has(url))return externals.get(url);
  const u=new URL(url.startsWith('//')?'https:'+url:url);
  const file='assets/external/'+crypto.createHash('sha256').update(u.href).digest('hex').slice(0,16)+(u.hostname==='fonts.googleapis.com'?'.css':path.extname(u.pathname)||'.bin');
  externals.set(url,file);
  const res=await fetch(u);if(!res.ok)throw new Error(`${res.status} ${url}`);
  let body=Buffer.from(await res.arrayBuffer());
  if(u.hostname==='fonts.googleapis.com'){
    let css=body.toString();
    for(const m of css.matchAll(/url\(([^)]+)\)/g)){
      const asset=await localize(m[1].replace(/^["']|["']$/g,''));
      css=css.replace(m[0],`url(${path.posix.basename(asset)})`);
    }
    body=Buffer.from(css);
  }
  await fs.mkdir(path.dirname(path.join(root,file)),{recursive:true});await fs.writeFile(path.join(root,file),body);
  return file;
}
const fixes={
  '/eng/eng/':'/eng/index.html','/eng/eng/contact.html':'/eng/contact.html',
  '/eng/iletisim.html':'/eng/contact.html','/eng/products/01-single-button-model.html':'/eng/products/gr01-single-button-model.html'
};
const pages=report.files.filter(x=>x.type.includes('text/html'));
const index=[];
for(const p of pages){
  const file=path.join(root,p.file);let s=await fs.readFile(file,'utf8');
  for(const m of s.matchAll(/href="(\/\/fonts.googleapis.com[^"]+)"/g)){
    const local=await localize(m[1]);s=s.replaceAll(m[1],path.posix.relative(path.posix.dirname(p.file),local));
  }
  s=s.replace(/\b(href|src)="([^"]+)"/g,(all,attr,raw)=>{
    if(/^(#|data:|mailto:|tel:|javascript:)/.test(raw))return all;
    const u=new URL(raw,'https://local/'+p.file);
    if(!['local','www.rozaipek.com','rozaipek.com'].includes(u.hostname))return all;
    const dest=fixes[u.pathname];
    return dest?`${attr}="${path.posix.relative(path.posix.dirname(p.file),dest.slice(1))}"`:all;
  });
  s=s.replace(/(<a\b[^>]*(?:id="offcanvas-toggler"|class="close-offcanvas")[^>]*href=")[^"]*/g,'$1#');
  s=s.replace(/(<li class="sp-menu-item sp-has-child"><a\s+href=")[^"]*/g,'$1#');
  s=s.replace(/("csrf.token"\s*:\s*")[^"]+/g,'$1static-copy');
  s=s.replace(/<input[^>]+name="[a-f0-9]{32}"[^>]*>/g,'');
  const runtime=path.posix.relative(path.posix.dirname(p.file),'assets/local-search.js');
  if(!s.includes('local-search.js'))s=s.replace('</body>',`<script src="${runtime}" defer></script>\n</body>`);
  await fs.writeFile(file,s);
  const title=(s.match(/<title>(.*?)<\/title>/s)||[])[1]||p.file;
  const article=s.match(/<article\b[\s\S]*?<\/article>/)?.[0]||s.match(/<div id="sp-page-builder"[\s\S]*?<footer/)?.[0]||'';
  const text=article.replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<style\b[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  index.push({title,path:p.file,text:text.slice(0,12000)});
}
for(const p of report.files.filter(x=>x.type.includes('text/css'))){
  const f=path.join(root,p.file);let s=await fs.readFile(f,'utf8');s=s.replaceAll('../fonts/fonts/Pe-icon-7-stroke.eot','../fonts/Pe-icon-7-stroke.eot');await fs.writeFile(f,s);
}
await fs.writeFile(path.join(root,'assets/search-index.json'),JSON.stringify(index));
await fs.writeFile('reports/adjustments.json',JSON.stringify({localizedFonts:[...externals.values()],fixedSourceLinks:fixes,staticSearch:true,externalVideoDependency:'YouTube; two source video slots have no video ID and are preserved as in source.'},null,2));
console.log(`Prepared ${pages.length} pages and ${externals.size} local font assets.`);
await import('./align-home.mjs');
