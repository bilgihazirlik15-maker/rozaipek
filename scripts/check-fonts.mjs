import fs from 'node:fs/promises';

export async function missingGlyphs(file) {
  const b = await fs.readFile(file);
  let cmap;
  for (let i=0; i<b.readUInt16BE(4); i++) {
    const p=12+i*16;
    if (b.toString('ascii',p,p+4)==='cmap') cmap=b.readUInt32BE(p+8);
  }
  if (cmap===undefined) throw new Error(`Missing cmap: ${file}`);
  const tables=[];
  for(let i=0;i<b.readUInt16BE(cmap+2);i++) {
    const p=cmap+4+i*8, platform=b.readUInt16BE(p), encoding=b.readUInt16BE(p+2);
    if(platform===0 || (platform===3 && [1,10].includes(encoding))) tables.push(cmap+b.readUInt32BE(p+4));
  }
  function has(cp) {
    return tables.some(t=>{
      const format=b.readUInt16BE(t);
      if(format===12) {
        for(let i=0;i<b.readUInt32BE(t+12);i++) {
          const p=t+16+i*12, start=b.readUInt32BE(p), end=b.readUInt32BE(p+4);
          if(cp>=start&&cp<=end) return b.readUInt32BE(p+8)+cp-start!==0;
        }
      }
      if(format===4 && cp<=65535) {
        const n=b.readUInt16BE(t+6)/2, ends=t+14, starts=ends+2*n+2, deltas=starts+2*n, offsets=deltas+2*n;
        for(let i=0;i<n;i++) {
          if(cp<b.readUInt16BE(starts+2*i)||cp>b.readUInt16BE(ends+2*i)) continue;
          const delta=b.readInt16BE(deltas+2*i), offset=b.readUInt16BE(offsets+2*i);
          if(!offset) return ((cp+delta)&65535)!==0;
          const glyph=b.readUInt16BE(offsets+2*i+offset+2*(cp-b.readUInt16BE(starts+2*i)));
          return glyph!==0&&((glyph+delta)&65535)!==0;
        }
      }
      return false;
    });
  }
  return [...'ÇĞİÖŞÜçğıöşü'].filter(c=>!has(c.codePointAt(0)));
}
if(process.argv[1]?.endsWith('check-fonts.mjs')) {
  const files=process.argv.slice(2);
  if(!files.length) files.push(...['raleway','raleway-italic','open-sans','open-sans-italic'].map(n=>`dist/assets/fonts/${n}.ttf`));
  for(const file of files) {
    const missing=await missingGlyphs(file);
    console.log(`${file}: ${missing.length?'missing '+missing.join(' '):'all Turkish characters present'}`);
    if(missing.length) process.exitCode=1;
  }
}
