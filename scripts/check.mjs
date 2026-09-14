import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve('dist');const files=[];
async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else files.push(p);}}
await walk(root);const errors=[];let refs=0;
for(const f of files){
  if(!/\.(html|css|js)$/.test(f))continue;
  const s=await fs.readFile(f,'utf8');
  if(f.endsWith('.js')){try{new vm.Script(s,{filename:f});}catch(e){errors.push(e.message);}continue;}
  const urls=[...s.matchAll(/\b(?:href|src|data-src|data-original|poster)\s*=\s*(["'])(.*?)\1/gi)].map(m=>m[2]);
  urls.push(...[...s.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)].map(m=>m[2]));
  for(let raw of urls){
    raw=raw.replaceAll('&amp;','&');if(!raw||/^(#|[a-z]+:|\/\/)/i.test(raw))continue;
    let p=decodeURIComponent(raw.split(/[?#]/)[0]);if(!p)continue;
    p=p.startsWith('/')?path.join(root,p):path.resolve(path.dirname(f),p);
    try{const st=await fs.stat(p);if(st.isDirectory())await fs.access(path.join(p,'index.html'));refs++;}catch{errors.push(`${path.relative(root,f)} -> ${raw}`);}
  }
}
const result={files:files.length,pages:files.filter(f=>f.endsWith('.html')).length,localReferences:refs,errors:[...new Set(errors)]};
await fs.writeFile('reports/validation.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
