import https from 'node:https';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve('dist');
const origin = 'https://www.rozaipek.com/';
const records = new Map();
const failures = [];
const internal = u => /^(www\.)?rozaipek\.com$/.test(u.hostname);
const decode = s => s.replaceAll('&amp;', '&');
function target(u) {
  if (!internal(u)) return 'assets/external/' + crypto.createHash('sha256').update(u.href).digest('hex').slice(0,16) + (u.hostname === 'fonts.googleapis.com' ? '.css' : path.extname(u.pathname) || '.bin');
  let p = decodeURIComponent(u.pathname).replace(/^\/+/, '');
  if (!p || p.endsWith('/')) p += 'index.html';
  return p;
}
function get(u, redirects = 0) {
  return new Promise((resolve, reject) => {
    // Only the public source host has an expired certificate. No credentials are sent.
    const req = https.get(u, {rejectUnauthorized: !internal(u), headers: {'User-Agent':'Mozilla/5.0', 'Accept-Encoding':'identity'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects < 8) {
        res.resume(); return resolve(get(new URL(res.headers.location,u), redirects+1));
      }
      const parts=[]; res.on('data', x=>parts.push(x)); res.on('end',()=>resolve({status:res.statusCode, type:res.headers['content-type']||'', data:Buffer.concat(parts)}));
    });
    req.setTimeout(25000,()=>req.destroy(new Error('timeout'))); req.on('error',reject);
  });
}
function add(raw, base, kind='asset') {
  if (!raw || /^(#|data:|mailto:|tel:|javascript:)/i.test(raw)) return;
  let u; try { u = new URL(decode(raw),base); } catch { return; }
  if (!['https:','http:'].includes(u.protocol)) return;
  if (!internal(u) && !['fonts.googleapis.com','fonts.gstatic.com'].includes(u.hostname)) return;
  if (internal(u) && /\/(administrator|component\/search)\b/.test(u.pathname)) return;
  u.protocol='https:'; u.hash='';
  if(internal(u)) { u.hostname='www.rozaipek.com'; u.search=''; }
  const key=u.href;
  if (!records.has(key)) records.set(key,{url:key,file:target(u),kind,state:'pending'});
  return records.get(key);
}
function refs(text, base, css=false) {
  if (!css) {
    for (const m of text.matchAll(/\b(href|src|data-src|data-original|poster)\s*=\s*(["'])(.*?)\2/gi)) {
      const raw=m[3]; const ext=raw.split(/[?#]/)[0];
      const kind=m[1].toLowerCase()==='href' && (!path.extname(ext) || /\.html?$/.test(ext)) ? 'page':'asset';
      add(raw,base,kind);
    }
  }
  for (const m of text.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) add(m[2],base);
}
add(origin,origin,'page');
while ([...records.values()].some(r=>r.state==='pending')) {
  const batch=[...records.values()].filter(r=>r.state==='pending').slice(0,6);
  await Promise.all(batch.map(async r=>{
    r.state='loading';
    try {
      let res=await get(new URL(r.url));
      if(res.status!==200) throw new Error('HTTP '+res.status);
      r.type=res.type; r.data=res.data; r.state='done';
      if(/text\/html|text\/css/.test(res.type)) refs(res.data.toString('utf8'),r.url,/text\/css/.test(res.type));
      console.log(res.status,r.file,res.data.length);
    } catch(e) {r.state='failed'; failures.push({url:r.url,error:e.message});console.log('FAILED',r.url,e.message);}
  }));
  if(records.size>1800) throw new Error('Unexpected crawl size');
}
function rewrite(raw, r) {
  if (/^(#|data:|mailto:|tel:|javascript:)/i.test(raw)) return raw;
  let u;try {u=new URL(decode(raw),r.url);}catch{return raw;}
  const hash=u.hash;u.hash='';u.protocol='https:';
  if(internal(u)){u.hostname='www.rozaipek.com';u.search='';}
  let entry=records.get(u.href);
  if(entry?.state==='failed' && u.pathname.startsWith('/products/')) entry=records.get('https://www.rozaipek.com/eng'+u.pathname);
  if(entry?.state!=='done') return raw;
  let rel=path.posix.relative(path.posix.dirname(r.file),entry.file);
  return (rel||path.posix.basename(entry.file))+hash;
}
await fs.mkdir(root,{recursive:true});
for(const r of records.values()) {
  if(r.state!=='done')continue;
  let content=r.data;
  if(/text\/html|text\/css/.test(r.type)) {
    let s=content.toString('utf8');
    if(/text\/html/.test(r.type)) {
      s=s.replace(/<base\b[^>]*>/gi,'');
      s=s.replace(/<link\b[^>]*rel="search"[^>]*>/gi,'');
      s=s.replace(/\b(href|src|data-src|data-original|poster)\s*=\s*(["'])(.*?)\2/gi,(all,a,q,v)=>`${a}=${q}${rewrite(v,r)}${q}`);
      // Do not report visits to the source site's analytics account.
      s=s.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/gi,'');
      s=s.replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/gi,'');
    }
    s=s.replace(/url\(\s*(["']?)(.*?)\1\s*\)/gi,(all,q,v)=>`url(${q}${rewrite(v,r)}${q})`);
    content=Buffer.from(s);
  }
  const dest=path.resolve(root,r.file);
  if(!dest.startsWith(root+path.sep))throw new Error('Invalid path');
  await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,content);
}
await fs.mkdir('reports',{recursive:true});
await fs.writeFile('reports/mirror.json',JSON.stringify({source:origin,capturedAt:new Date().toISOString(),files:[...records.values()].filter(r=>r.state==='done').map(({url,file,type})=>({url,file,type})),failures},null,2));
console.log(JSON.stringify({saved:[...records.values()].filter(r=>r.state==='done').length,failures:failures.length}));
