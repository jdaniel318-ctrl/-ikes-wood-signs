/* Build-only: node BUILD_STORMWAKE_VENDOR.mjs /path/to/pinned-tool-folder. See DREADWATER_ART_PIPELINE.md. */

import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const release=path.dirname(fileURLToPath(import.meta.url)), here=path.resolve(process.argv[2]||path.join(release,'../build'));
const esbuild=await import(path.join(here,'node_modules/esbuild/lib/main.js'));
const pkg=JSON.parse(await readFile(path.join(here,'node_modules/three/package.json'),'utf8'));
if(pkg.version!=='0.180.0'||esbuild.version!=='0.25.10') throw Error('Unpinned vendor dependency');
await esbuild.build({stdin:{contents:"export * from 'three';",resolveDir:here,sourcefile:'stormwake-three-entry.js'},bundle:true,minify:true,format:'iife',globalName:'StormwakeThree',platform:'browser',target:'es2020',legalComments:'inline',outfile:path.join(release,'stormwake_three_vendor.js')});
const bytes=await readFile(path.join(release,'stormwake_three_vendor.js'));
const meta={schema:'stormwake-vendor-v1',name:'three',version:pkg.version,source:'https://www.npmjs.com/package/three/v/0.180.0',license:'MIT',bundler:{name:'esbuild',version:esbuild.version},bundle:'stormwake_three_vendor.js',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),runtimeNetwork:false};
await writeFile(path.join(release,'STORMWAKE_VENDOR.json'),JSON.stringify(meta,null,2)+'\n');
await writeFile(path.join(release,'STORMWAKE_THIRD_PARTY.txt'),'Three.js 0.180.0\nhttps://threejs.org/\nhttps://www.npmjs.com/package/three/v/0.180.0\nBundled locally as stormwake_three_vendor.js; no runtime CDN.\n\n'+await readFile(path.join(here,'node_modules/three/LICENSE'),'utf8'));
console.log(JSON.stringify(meta));
