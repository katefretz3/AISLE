// Fetch a real, generic photograph for every catalogue item.
//
//   npm run photos              # Openverse (no key needed)
//   PEXELS_API_KEY=… npm run photos --  --source=pexels
//   UNSPLASH_ACCESS_KEY=… npm run photos --  --source=unsplash
//   npm run photos -- --only=blueberries,milk --force
//
// Each item's `photo` field in taxonomy.ts is already a brand-free search
// phrase ("hazelnut spread", not "Nutella"), because the app wants a picture of
// the food rather than of a company's packaging. Results whose title or creator
// looks like a brand name are rejected.
//
// Output:
//   public/images/photos/<id>.jpg     square, 512px, centre-cropped
//   public/images/photos/credits.json attribution for every photo kept
//   src/lib/photo-manifest.json       ids that have a photo
//
// Items without a photo keep their generated illustration, so a partial run is
// always safe and the app never shows a gap.
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {fileURLToPath,URL} from 'node:url';
import {join} from 'node:path';
import sharp from 'sharp';

const root=fileURLToPath(new URL('..',import.meta.url));
const photoDir=join(root,'public','images','photos');
const SIZE=512;

const arg=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const flag=name=>process.argv.includes(`--${name}`);
const source=arg('source')??'openverse';
const only=arg('only')?.split(',').map(s=>s.trim()).filter(Boolean);
const limit=Number(arg('limit')??0)||Infinity;

// A photo of a labelled package is not what we want; reject obvious branding.
const BRANDY=/\b(logo|brand|packaging|advertis|storefront|shop front|billboard|label|trademark)\b/i;

function items(){
 const src=readFileSync(join(root,'src','lib','taxonomy.ts'),'utf8');
 return [...src.matchAll(/\{id:'([^']+)',name:'((?:[^'\\]|\\.)*)'.*?photo:'([^']*)'/g)]
  .map(([,id,name,photo])=>({id,name:name.replace(/\\'/g,"'"),photo}))
  .filter(i=>!only||only.includes(i.id));
}

// ---- sources ---------------------------------------------------------------
// Each returns {url, title, creator, licence, source, page} or null.
const SOURCES={
 // No API key. Commercial-use, modification-allowed results only.
 async openverse(query){
  const url='https://api.openverse.org/v1/images/?'+new URLSearchParams({
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
 // Needs PEXELS_API_KEY. Pexels licence allows commercial use; credit is polite
 // rather than required, and is recorded anyway.
 async pexels(query){
  const key=process.env.PEXELS_API_KEY;
  if(!key)throw new Error('PEXELS_API_KEY is not set');
  const res=await fetch('https://api.pexels.com/v1/search?'+new URLSearchParams({query,per_page:'5',orientation:'square'}),
   {headers:{Authorization:key}});
  if(!res.ok)throw new Error(`Pexels HTTP ${res.status}`);
  const body=await res.json();
  const hit=(body.photos??[]).find(p=>!BRANDY.test(p.alt??''));
  return hit?{url:hit.src.large,title:hit.alt||query,creator:hit.photographer,
   licence:'Pexels licence',source:'Pexels',page:hit.url}:null;
 },
 // Needs UNSPLASH_ACCESS_KEY.
 async unsplash(query){
  const key=process.env.UNSPLASH_ACCESS_KEY;
  if(!key)throw new Error('UNSPLASH_ACCESS_KEY is not set');
  const res=await fetch('https://api.unsplash.com/search/photos?'+new URLSearchParams({query,per_page:'5',orientation:'squarish'}),
   {headers:{Authorization:`Client-ID ${key}`}});
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
 if(!/^image\/(jpeg|png|webp)/.test(type))throw new Error(`unexpected content-type ${type}`);
 const buffer=Buffer.from(await res.arrayBuffer());
 if(buffer.byteLength>12_000_000)throw new Error('image too large');
 return buffer;
}

async function main(){
 const find=SOURCES[source];
 if(!find){console.error(`Unknown --source=${source}. Use openverse, pexels or unsplash.`);process.exit(2);}
 mkdirSync(photoDir,{recursive:true});
 const creditsPath=join(photoDir,'credits.json');
 const credits=existsSync(creditsPath)?JSON.parse(readFileSync(creditsPath,'utf8')):{};

 const all=items();
 const todo=all.filter(i=>flag('force')||!existsSync(join(photoDir,`${i.id}.jpg`))).slice(0,limit);
 console.log(`${all.length} items, ${todo.length} to fetch from ${source}`);

 let ok=0,missed=0;
 for(const [n,item] of todo.entries()){
  try{
   const hit=await find(item.photo);
   if(!hit){missed+=1;console.log(`  ·  ${item.id}: no usable result for "${item.photo}"`);continue;}
   const buffer=await download(hit.url);
   await sharp(buffer).rotate()
    .resize(SIZE,SIZE,{fit:'cover',position:'attention'})
    .jpeg({quality:82,mozjpeg:true})
    .toFile(join(photoDir,`${item.id}.jpg`));
   credits[item.id]={...hit,query:item.photo,fetchedAt:new Date().toISOString()};
   ok+=1;
   console.log(`  ✓  ${item.id}  ←  ${hit.source}: ${hit.title} (${hit.creator}, ${hit.licence})`);
  }catch(error){
   missed+=1;
   console.log(`  ✗  ${item.id}: ${error instanceof Error?error.message:'failed'}`);
  }
  // Be a good citizen with public APIs.
  if(n<todo.length-1)await new Promise(r=>setTimeout(r,source==='openverse'?600:250));
 }

 writeFileSync(creditsPath,JSON.stringify(credits,null,1)+'\n');
 const have=readdirSync(photoDir).filter(f=>f.endsWith('.jpg')).map(f=>f.replace(/\.jpg$/,'')).sort();
 writeFileSync(join(root,'src','lib','photo-manifest.json'),JSON.stringify(have,null,1)+'\n');
 console.log(`\n${ok} fetched, ${missed} skipped. ${have.length} of ${all.length} items now have a photo.`);
 console.log('Items without one keep their generated illustration.');
}
main();
