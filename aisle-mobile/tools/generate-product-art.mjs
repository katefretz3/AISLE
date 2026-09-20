// Draws one 256px PNG for every catalogue item.
//
//   npm run art
//
// The taxonomy is the input, so an item added there gets a picture on the next
// run and the app can never reference an image that does not exist. Output is
// deterministic: the same taxonomy always produces byte-identical files.
import {Resvg} from '@resvg/resvg-js';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,unlinkSync} from 'node:fs';
import {fileURLToPath,URL} from 'node:url';
import {join} from 'node:path';
import {renderSvg} from './product-art.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
const outDir=join(root,'public','images','products');
mkdirSync(outDir,{recursive:true});

// Read the item rows straight out of taxonomy.ts rather than importing it, so
// this script stays free of a TypeScript build step.
const source=readFileSync(join(root,'src','lib','taxonomy.ts'),'utf8');
const rows=[...source.matchAll(/\{id:'([^']+)',name:'((?:[^'\\]|\\.)*)'.*?art:\{template:'([^']+)',colour:'([^']+)',accent:'([^']+)'\}/g)]
 .map(([,id,name,template,colour,accent])=>({id,name,template,colour,accent}));

if(!rows.length)throw new Error('No catalogue items found in taxonomy.ts');

const written=new Set();
for(const row of rows){
 const svg=renderSvg(row.template,row.colour,row.accent);
 const png=new Resvg(svg,{fitTo:{mode:'width',value:256},background:'rgba(0,0,0,0)'}).render().asPng();
 writeFileSync(join(outDir,`${row.id}.png`),png);
 written.add(`${row.id}.png`);
}

// A neutral placeholder for list items the shopper typed that match no product.
const placeholder=renderSvg('bag','#c9cfc6','#9aa79c');
writeFileSync(join(outDir,'custom-item.png'),new Resvg(placeholder,{fitTo:{mode:'width',value:256},background:'rgba(0,0,0,0)'}).render().asPng());
written.add('custom-item.png');

// Drop art for items that no longer exist, so the folder always mirrors the
// taxonomy exactly.
let removed=0;
for(const file of readdirSync(outDir)){
 if(file.endsWith('.png')&&!written.has(file)){unlinkSync(join(outDir,file));removed+=1;}
}

console.log(`${rows.length} product images written, ${removed} stale removed, ${written.size} files in ${outDir}`);
