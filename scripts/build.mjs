import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { zipSync, strToU8, unzipSync } from 'fflate';
const root = fileURLToPath(new URL('../', import.meta.url));
const release = resolve(root, 'release');
const game = JSON.parse(await readFile(resolve(root, 'sources/game.json'), 'utf8'));
const walk = nodes => nodes.flatMap(n => [n, ...walk(n.children || [])]);
const pieces = walk(game.children);
if (pieces.length !== 181) throw new Error(`Expected 181 pieces, found ${pieces.length}`);
const required = new Set();
for (const p of pieces) {
  if (p.position.some(v => v !== null && Math.abs(v * 1000 - Math.round(v * 1000)) > 1e-8)) throw new Error(`Unrounded position: ${p.src}`);
  if (p.src.includes('/cards/') && JSON.stringify(p.size) !== JSON.stringify([0.0635, .0003, .09525])) throw new Error(`Incorrect card size: ${p.src}`);
  required.add(p.src);
}
const safe = path => {
  const absolute = resolve(release, path.replace(/^\//, ''));
  if (!absolute.startsWith(release + '/')) throw new Error(`Invalid resource path: ${path}`);
  return absolute;
};
for (const path of [...required]) {
  const model = JSON.parse(await readFile(safe(path), 'utf8'));
  for (const entry of [...(model.images || []), ...(model.buffers || [])]) {
    if (entry.uri && !entry.uri.startsWith('data:')) required.add(entry.uri.replace(/^\//, ''));
  }
}
const files = [], contents = {};
const media = {'.gltf':'model/gltf+json','.avif':'image/avif','.webp':'image/webp','.svg':'image/svg+xml','.bin':'application/octet-stream'};
for (const path of [...required].sort()) {
  const data = await readFile(safe(path));
  contents[path] = data;
  files.push({path, bytes:data.length, sha256:createHash('sha256').update(data).digest('hex'), mediaType:media[path.slice(path.lastIndexOf('.'))] || 'application/octet-stream'});
}
const license = await readFile(resolve(root, 'LICENSE.md'));
contents['LICENSE.md'] = license;
files.push({path:'LICENSE.md', bytes:license.length, sha256:createHash('sha256').update(license).digest('hex'), mediaType:'text/markdown'});
const metadata = JSON.parse(await readFile(join(release, 'release.json'), 'utf8'));
metadata.game = game; metadata.files = files;
contents['release.json'] = strToU8(JSON.stringify(metadata));
contents['package.json'] = strToU8(JSON.stringify({name:'Taifa',main:'release.json'}));
const zip = zipSync(Object.fromEntries(Object.entries(contents).map(([p,b])=>[p,[b,{mtime:new Date('2026-01-01T00:00:00Z')}]])),{level:9});
const check = unzipSync(zip);
for (const [path,data] of Object.entries(contents)) if (!Buffer.from(check[path]).equals(Buffer.from(data))) throw new Error(`ZIP mismatch: ${path}`);
for (const target of [release]) {
  for (const [path, data] of Object.entries(contents)) {const dest=join(target,path);await mkdir(resolve(dest,'..'),{recursive:true});await writeFile(dest,data);}
}
await writeFile(resolve(root, 'dist/taifa.probability.zip'), zip);
console.log(`Verified ${pieces.length} pieces and ${files.length} resource hashes; ZIP ${(zip.length/1e6).toFixed(2)} MB.`);
