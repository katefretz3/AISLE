// Fetch a real, generic photograph for every catalogue item.
//
//   npm run photos                     # try each source in turn
//   npm run photos -- --source=pexels  # or pin one
//   npm run photos -- --only=blueberries,milk --force
//   npm run photos -- --verify         # check what is on disk, fetch nothing
//   npm run photos -- --base=http://localhost:8080   # a local mirror
//   npm run photos -- --delay=250      # pause between items (0 for a mirror)
//
// Every item's `photo` field in taxonomy.ts is a brand-free phrase ("hazelnut
// spread", not "Nutella"), because the point is a picture of the food rather
// than of a company's packaging.
//
// Output, for every item:
//   public/images/photos/<id>.png       PNG, exactly CANVAS × CANVAS, nothing cropped
//   public/images/photos/credits.json   attribution for every photo kept
//   src/lib/photo-manifest.json         ids that have one
//
// Three rules the output has to satisfy, because a grid of product pictures
// falls apart if any of them slips:
//
//   Same size.   Every file is exactly CANVAS × CANVAS. Not "about", not
//                "whatever the source was" — the grid relies on it.
//   Not cropped. The image is fitted INSIDE the canvas and padded, never
//                centre-cropped. A cropped strawberry photo can lose the
//                strawberry, which defeats the entire purpose of showing one.
//   PNG.         With a transparent surround, so the padding takes the colour
//                of whatever card it sits on rather than fighting it.
//
// `--verify` re-checks all three against the files actually on disk and exits
// non-zero on any failure, so "done" is something that can be demonstrated
// rather than asserted.
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {fileURLToPath,URL} from 'node:url';
import {join} from 'node:path';
import sharp from 'sharp';

const root=fileURLToPath(new URL('..',import.meta.url));
const photoDir=join(root,'public','images','photos');

/** Every stored photo is exactly this, in both dimensions. */
export const CANVAS=512;
/** Share of the canvas the subject is allowed to fill, leaving a little air. */
const INSET=0.92;

const arg=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const flag=name=>process.argv.includes(`--${name}`);
const only=arg('only')?.split(',').map(s=>s.trim()).filter(Boolean);
const limit=Number(arg('limit')??0)||Infinity;
/** Point the whole pipeline at a mirror, which is how it gets tested offline. */
const base=arg('base')??'';
/** Pause between items. Public APIs need one; a local mirror does not. */
const delayMs=Number(arg('delay')??(base?0:600));

// A photo of a labelled package is not what we want; reject obvious branding.
const BRANDY=/\b(logo|brand|packaging|advertis|storefront|shop front|billboard|label|trademark)\b/i;

export function items(){
 const src=readFileSync(join(root,'src','lib','taxonomy.ts'),'utf8');
 return [...src.matchAll(/\{id:'([^']+)',name:'((?:[^'\\]|\\.)*)'.*?photo:'([^']*)'/g)]
  .map(([,id,name,photo])=>({id,name:name.replace(/\\'/g,"'"),photo}))
  .filter(i=>!only||only.includes(i.id));
}

// ---- sources ---------------------------------------------------------------
// Each returns {url,title,creator,licence,source,page} or null. A source that
// throws is treated as unavailable and the next one is tried, so one dead API
// does not end the run.
const SOURCES={
 async openverse(query){
  const url=`${base||'https://api.openverse.org'}/v1/images/?`+new URLSearchParams({
   q:query,license_type:'commercial,modification',page_size:'8',
   mature:'false',aspect_ratio:'square,wide',category:'photograph',
  });
  const res=await fetch(url,{headers:{'User-Agent':'AisleOntario/1.0 (grocery catalogue)'}});
  if(!res.ok)throw new Error(`Openverse HTTP ${res.status}`);
  const body=await res.json();
  for(const hit of body.results??[]){
   if(BRANDY.test(`${hit.title??''} ${hit.creator??''}`))continue;
   if(!hit.url)continue;
   return {url:hit.url,title:hit.title??query,creator:hit.creator??'Unknown',
    licence:`${(hit.license??'').toUpperCase()} ${hit.license_version??''}`.trim(),
    source:'Openverse',page:hit.foreign_landing_url??hit.url};
  }
  return null;
 },
 async pexels(query){
  const key=process.env.PEXELS_API_KEY;
  if(!key)throw new Error('PEXELS_API_KEY is not set');
  const res=await fetch(`${base||'https://api.pexels.com'}/v1/search?`+new URLSearchParams(
   {query,per_page:'5',orientation:'square'}),{headers:{Authorization:key}});
  if(!res.ok)throw new Error(`Pexels HTTP ${res.status}`);
  const body=await res.json();
  const hit=(body.photos??[]).find(p=>!BRANDY.test(p.alt??''));
  return hit?{url:hit.src.large,title:hit.alt||query,creator:hit.photographer,
   licence:'Pexels licence',source:'Pexels',page:hit.url}:null;
 },
 async unsplash(query){
  const key=process.env.UNSPLASH_ACCESS_KEY;
  if(!key)throw new Error('UNSPLASH_ACCESS_KEY is not set');
  const res=await fetch(`${base||'https://api.unsplash.com'}/search/photos?`+new URLSearchParams(
   {query,per_page:'5',orientation:'squarish'}),{headers:{Authorization:`Client-ID ${key}`}});
  if(!res.ok)throw new Error(`Unsplash HTTP ${res.status}`);
  const body=await res.json();
  const hit=(body.results??[]).find(p=>!BRANDY.test(`${p.description??''} ${p.alt_description??''}`));
  return hit?{url:hit.urls.regular,title:hit.alt_description||query,creator:hit.user.name,
   licence:'Unsplash licence',source:'Unsplash',page:hit.links.html}:null;
 },
};

async function download(url){
 const res=await fetch(url,{headers:{'User-Agent':'AisleOntario/1.0'},redirect:'follow'});
 if(!res.ok)throw new Error(`image HTTP ${res.status}`);
 const type=res.headers.get('content-type')??'';
 if(!/^image\/(jpeg|png|webp|avif)/.test(type))throw new Error(`unexpected content-type ${type}`);
 const buffer=Buffer.from(await res.arrayBuffer());
 if(buffer.byteLength>12_000_000)throw new Error('image too large');
 return buffer;
}

/**
 * One source image → one uniform PNG tile.
 *
 * `trim` first, because stock food photography is usually a subject floating on
 * a white sweep: without it a tight crop and a loose one sit side by side in the
 * grid at visibly different scales even though both files are the same size.
 * Then `contain`, which is the whole difference between this and the version
 * that cropped — a 16:9 photo of a baguette keeps both ends.
 */
export async function normalise(buffer){
 const inner=Math.round(CANVAS*INSET);
 let subject=sharp(buffer).rotate();
 try{
  // Trim can fail on an image that is a single flat colour; that is fine.
  subject=sharp(await subject.trim({threshold:12}).toBuffer());
 }catch{subject=sharp(buffer).rotate();}
 const fitted=await subject
  .resize(inner,inner,{fit:'contain',background:{r:0,g:0,b:0,alpha:0},withoutEnlargement:false})
  .toBuffer();
 return sharp({create:{width:CANVAS,height:CANVAS,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
  .composite([{input:fitted,gravity:'centre'}])
  .png({compressionLevel:9,palette:true})
  .toBuffer();
}

/** What is on disk, and whether it satisfies all three rules. */
export async function inspect(id){
 const file=join(photoDir,`${id}.png`);
 if(!existsSync(file))return {id,ok:false,reason:'missing'};
 try{
  const meta=await sharp(file).metadata();
  if(meta.format!=='png')return {id,ok:false,reason:`format ${meta.format}`};
  if(meta.width!==CANVAS||meta.height!==CANVAS)
   return {id,ok:false,reason:`${meta.width}×${meta.height}, expected ${CANVAS}×${CANVAS}`};
  const {info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
  if(!info.size)return {id,ok:false,reason:'empty'};
  // A tile that decodes to one flat colour is a failed download, not a photo.
  const stats=await sharp(file).stats();
  const flat=stats.channels.every(c=>c.min===c.max);
  if(flat)return {id,ok:false,reason:'blank image'};
  return {id,ok:true};
 }catch(e){return {id,ok:false,reason:e instanceof Error?e.message:'unreadable'};}
}

async function verify(all){
 const results=[];
 for(const item of all)results.push(await inspect(item.id));
 const bad=results.filter(r=>!r.ok);
 const missing=bad.filter(r=>r.reason==='missing');
 console.log(`\n${results.length-bad.length} of ${all.length} items have a conforming ${CANVAS}×${CANVAS} PNG.`);
 if(bad.length){
  console.log(`\n${bad.length} not ready (${missing.length} never fetched):`);
  for(const row of bad.slice(0,25))console.log(`  ✗ ${row.id}: ${row.reason}`);
  if(bad.length>25)console.log(`  … and ${bad.length-25} more`);
 }
 return bad;
}

function writeManifest(all){
 const have=all.map(i=>i.id).filter(id=>existsSync(join(photoDir,`${id}.png`))).sort();
 writeFileSync(join(root,'src','lib','photo-manifest.json'),JSON.stringify(have,null,1)+'\n');
 return have;
}

async function main(){
 mkdirSync(photoDir,{recursive:true});
 const all=items();

 if(flag('verify')){
  const bad=await verify(all);
  writeManifest(all);
  process.exit(bad.length?1:0);
 }

 const chain=arg('source')?[arg('source')]:['openverse','pexels','unsplash'];
 for(const name of chain)if(!SOURCES[name]){
  console.error(`Unknown source "${name}". Use openverse, pexels or unsplash.`);process.exit(2);
 }
 const creditsPath=join(photoDir,'credits.json');
 const credits=existsSync(creditsPath)?JSON.parse(readFileSync(creditsPath,'utf8')):{};
 const todo=all.filter(i=>flag('force')||!existsSync(join(photoDir,`${i.id}.png`))).slice(0,limit);
 console.log(`${all.length} items, ${todo.length} to fetch. Sources in order: ${chain.join(' → ')}`);

 const dead=new Set();
 let ok=0,missed=0;
 for(const [n,item] of todo.entries()){
  let saved=false;
  for(const name of chain){
   if(dead.has(name))continue;
   try{
    const hit=await SOURCES[name](item.photo);
    if(!hit)continue;
    const png=await normalise(await download(hit.url));
    writeFileSync(join(photoDir,`${item.id}.png`),png);
    const checked=await inspect(item.id);
    if(!checked.ok)throw new Error(`rejected after writing: ${checked.reason}`);
    credits[item.id]={...hit,query:item.photo,fetchedAt:new Date().toISOString()};
    ok+=1;saved=true;
    console.log(`  ✓  ${item.id}  ←  ${hit.source}: ${hit.title} (${hit.creator}, ${hit.licence})`);
    break;
   }catch(error){
    const message=error instanceof Error?error.message:'failed';
    // A source that cannot be reached at all is retired for the rest of the run
    // rather than re-tried 557 times.
    if(/HTTP 40[357]|fetch failed|not set|ENOTFOUND|ECONNREFUSED/.test(message)){
     dead.add(name);
     console.log(`  !  ${name} unavailable (${message}); skipping it for the rest of the run`);
    }
   }
  }
  if(!saved){missed+=1;console.log(`  ✗  ${item.id}: no usable photo for "${item.photo}"`);}
  if(dead.size===chain.length){
   console.log('\nEvery source is unreachable. Stopping rather than spinning.');
   break;
  }
  if(n<todo.length-1&&delayMs>0)await new Promise(r=>setTimeout(r,delayMs));
 }

 writeFileSync(creditsPath,JSON.stringify(credits,null,1)+'\n');
 const have=writeManifest(all);
 console.log(`\n${ok} fetched, ${missed} without a photo. ${have.length} of ${all.length} items now have one.`);
 const bad=await verify(all);
 if(bad.length){
  console.log('\nRun again to fill the gaps; existing files are kept unless --force.');
  process.exit(1);
 }
 console.log('Every item has a conforming photo.');
}

if(import.meta.url===`file://${process.argv[1]}`)await main();
