// Information-architecture study: simulated card sort and tree test.
//
// WHAT THIS IS. Synthetic participants, not real ones. Each is a small model of
// how somebody might decide where a grocery item "lives", and they disagree with
// each other on purpose. The output is therefore not a prediction of real
// success rates — treat the percentages as relative, not absolute.
//
// WHAT IT IS FOR. Finding the items whose placement is contested. When four
// different mental models all walk to the wrong aisle for "frozen blueberries",
// that is a real signal about the tree, and it is one you can act on without
// recruiting anybody. Items that fail here get cross-listed or re-filed, and
// the study is re-run to confirm the fix.
//
//   node tools/ia-study.mjs            # print the report
//   node tools/ia-study.mjs --write    # also write docs/ia-study.md
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath,URL} from 'node:url';
import {join,dirname} from 'node:path';
import {conceptsOf,labelConcepts,STATE} from './ia-lexicon.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));

// ---- read the tree ---------------------------------------------------------
/**
 * Reads the tree out of taxonomy.ts.
 *
 * `sourcePath` is explicit because this module is also bundled into the test
 * run, where `import.meta.url` no longer sits next to the project and the
 * relative guess would land in node_modules.
 */
export function loadTaxonomy(sourcePath){
 const candidates=[sourcePath,join(root,'src','lib','taxonomy.ts'),
  join(process.cwd(),'src','lib','taxonomy.ts')].filter(Boolean);
 const found=candidates.find(existsSync);
 if(!found)throw new Error(`taxonomy.ts not found (looked in: ${candidates.join(', ')})`);
 const src=readFileSync(found,'utf8');
 const departments=[];
 let dept=null,aisle=null;
 for(const line of src.split('\n')){
  const d=line.match(/^ \{id:'([^']+)',name:'((?:[^'\\]|\\.)*)',edible:(true|false)/);
  if(d){dept={id:d[1],name:unq(d[2]),edible:d[3]==='true',aisles:[]};departments.push(dept);continue;}
  const a=line.match(/^  \{id:'([^']+)',name:'((?:[^'\\]|\\.)*)',departmentId:'([^']+)'/);
  if(a){aisle={id:a[1],name:unq(a[2]),items:[]};dept.aisles.push(aisle);continue;}
  const i=line.match(/^   \{id:'([^']+)',name:'((?:[^'\\]|\\.)*)',brand:'((?:[^'\\]|\\.)*)'/);
  if(i){
   const keywords=line.match(/keywords:'((?:[^'\\]|\\.)*)'/);
   const also=line.match(/alsoIn:\[([^\]]*)\]/);
   aisle.items.push({id:i[1],name:unq(i[2]),brand:unq(i[3]),keywords:keywords?unq(keywords[1]):'',
    aisleId:aisle.id,departmentId:dept.id,
    alsoIn:also?[...also[1].matchAll(/'([^']+)'/g)].map(m=>m[1]):[]});
  }
 }
 return departments;
}
const unq=s=>s.replace(/\\'/g,"'").replace(/\\\\/g,'\\');
const words=s=>s.toLowerCase().normalize('NFKD').replace(/[‘’']/g,'')
 .replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
const stem=w=>w.length>4?w.replace(/(ies|es|s)$/,''):w;

// ---- how a shopper decides -------------------------------------------------
// A participant knows what the item IS (its concepts, from the lexicon) and can
// read the labels in the tree. What they do NOT get is the item's aisle — that
// is the thing under test. Where they disagree is where a placement is genuinely
// contested: "frozen blueberries" is both a fruit and a frozen thing, and the
// tree offers a home for each reading.
const STATE_CONCEPTS=new Set(Object.keys(STATE));
const OCCASION_CONCEPTS=new Set(['breakfast','prepared','snack','candy','dessert']);

const ARCHETYPES=[
 {id:'form-first',    label:'Thinks in ingredients',        substance:3.0,state:0.7,occasion:1.0},
 {id:'storage-first', label:'Thinks fridge / freezer / shelf',substance:1.1,state:3.0,occasion:1.0},
 {id:'occasion-first',label:'Thinks in meals and moments',  substance:1.2,state:1.0,occasion:3.0},
 {id:'process-first', label:'Thinks raw vs packaged',       substance:1.5,state:2.4,occasion:0.9},
 {id:'aisle-walker',  label:'Thinks in store layout',       substance:2.0,state:1.8,occasion:1.5},
];

function weightFor(concept,person){
 if(OCCASION_CONCEPTS.has(concept))return person.occasion;
 if(STATE_CONCEPTS.has(concept))return person.state;
 return person.substance;
}

/** How well a label's meaning matches what the shopper is holding in mind. */
function conceptMatch(itemConcepts,label,person){
 const theirs=labelConcepts(label);
 let score=0;
 for(const concept of itemConcepts)if(theirs.has(concept))score+=weightFor(concept,person);
 return score;
}

/** A literal word match between the item and the label is strong evidence. */
function labelScore(itemWords,label){
 const labelWords=new Set(words(label).map(stem));
 let hits=0;
 for(const w of new Set(itemWords.map(stem)))if(labelWords.has(w))hits+=1;
 return hits*2.6;
}

// Deterministic jitter, so a run is reproducible but participants are not clones.
function noise(seed){let x=seed*2654435761%2147483647;x^=x<<13;x^=x>>>17;x^=x<<5;return ((x>>>0)%1000)/1000;}
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
const best=(list,score)=>list.reduce((a,b)=>score(b)>score(a)?b:a);

// ---- tree test -------------------------------------------------------------
// The participant sees only labels, exactly as in a real tree test: department
// names first, then the aisle names inside whichever they pick.
export function treeTest(departments,{trialsPerItem=1}={}){
 const results=[];
 for(const dept of departments)for(const aisle of dept.aisles)for(const item of aisle.items){
  const itemWords=words(`${item.name} ${item.keywords}`);
  const concepts=conceptsOf(`${item.name} ${item.keywords}`);
  const homes=new Set([item.aisleId,...(item.alsoIn??[])]);
  for(const person of ARCHETYPES){
   for(let t=0;t<trialsPerItem;t++){
    const jitter=d=>noise(hash(`${item.id}:${person.id}:${t}:${d}`))*0.6;
    const pickedDept=best(departments,d=>
     conceptMatch(concepts,d.name,person)
     +Math.max(0,...d.aisles.map(a=>conceptMatch(concepts,a.name,person)))*0.75
     +labelScore(itemWords,`${d.name} ${d.aisles.map(a=>a.name).join(' ')}`)*0.6
     +jitter(d.id));
    const pickedAisle=best(pickedDept.aisles,a=>
     conceptMatch(concepts,a.name,person)*1.4
     +labelScore(itemWords,a.name)
     +jitter(a.id));
    results.push({item,person:person.id,concepts:concepts.size,
     deptCorrect:pickedDept.id===item.departmentId,
     found:homes.has(pickedAisle.id),
     wentTo:`${pickedDept.name} › ${pickedAisle.name}`});
   }
  }
 }
 return results;
}

// ---- card sort -------------------------------------------------------------
// Open sort: each participant groups items by their own cue vocabulary. We then
// ask how often two items in the same aisle were also grouped together.
export function cardSort(departments){
 const items=departments.flatMap(d=>d.aisles.flatMap(a=>a.items));
 const perPerson=ARCHETYPES.map(person=>{
  const groups=new Map();
  for(const item of items){
   const concepts=conceptsOf(`${item.name} ${item.keywords}`);
   // The pile is named after the concept the participant weights most heavily,
   // not after any aisle, so the sort stays independent of the tree.
   let pile='unsorted',top=0;
   for(const concept of concepts){
    const w=weightFor(concept,person);
    if(w>top){top=w;pile=concept;}
   }
   if(!groups.has(pile))groups.set(pile,new Set());
   groups.get(pile).add(item.id);
  }
  return {person:person.id,groups};
 });
 const rows=[];
 for(const dept of departments)for(const aisle of dept.aisles){
  if(aisle.items.length<2)continue;
  let total=0,agreed=0;
  for(const {groups} of perPerson){
   const tally=new Map();
   for(const item of aisle.items){
    const label=[...groups].find(([,set])=>set.has(item.id))?.[0]??'unsorted';
    tally.set(label,(tally.get(label)??0)+1);
   }
   agreed+=Math.max(...tally.values());total+=aisle.items.length;
  }
  rows.push({aisle:`${dept.name} › ${aisle.name}`,size:aisle.items.length,agreement:agreed/total});
 }
 return rows.sort((a,b)=>a.agreement-b.agreement);
}

// ---- report ----------------------------------------------------------------
const pct=n=>`${(n*100).toFixed(1)}%`;
export function report(departments){
 const trials=treeTest(departments);
 const overall=trials.filter(t=>t.found).length/trials.length;
 const deptRate=trials.filter(t=>t.deptCorrect).length/trials.length;

 const byPerson=ARCHETYPES.map(p=>{
  const mine=trials.filter(t=>t.person===p.id);
  return {...p,rate:mine.filter(t=>t.found).length/mine.length};
 });

 const perItem=new Map();
 for(const t of trials){
  const row=perItem.get(t.item.id)??{item:t.item,ok:0,n:0,went:new Map()};
  row.n+=1;if(t.found)row.ok+=1;else row.went.set(t.wentTo,(row.went.get(t.wentTo)??0)+1);
  perItem.set(t.item.id,row);
 }
 const failures=[...perItem.values()].filter(r=>r.ok/r.n<0.5)
  .sort((a,b)=>a.ok/a.n-b.ok/b.n||b.n-a.n);

 const sort=cardSort(departments);
 const items=departments.flatMap(d=>d.aisles.flatMap(a=>a.items));

 const lines=[];
 lines.push('# Information architecture study');
 lines.push('');
 lines.push('> **Simulated, not real users.** Five synthetic participants, each weighting a');
 lines.push('> different categorisation cue (ingredient, storage, meal occasion, processing,');
 lines.push('> store layout). Read the percentages as relative signal, never as measured');
 lines.push('> human performance. Its job is to point at contested placements.');
 lines.push('');
 lines.push(`Generated by \`tools/ia-study.mjs\` over ${items.length} items, `+
  `${departments.length} departments, ${departments.reduce((n,d)=>n+d.aisles.length,0)} aisles.`);
 lines.push('');
 lines.push('## Tree test');
 lines.push('');
 lines.push(`- **Found in the right aisle:** ${pct(overall)} of ${trials.length} trials`);
 lines.push(`- **Right department on first choice:** ${pct(deptRate)}`);
 lines.push('');
 lines.push('| Participant model | Finds the item |');
 lines.push('|---|---|');
 for(const p of byPerson)lines.push(`| ${p.label} | ${pct(p.rate)} |`);
 lines.push('');
 lines.push(`## Contested items (${failures.length})`);
 lines.push('');
 if(!failures.length)lines.push('None: every item was found by a majority of the participant models.');
 else{
  lines.push('Most participants went somewhere other than where the item lives.');
  lines.push('');
  lines.push('| Item | Lives in | Most went to | Found |');
  lines.push('|---|---|---|---|');
  for(const f of failures.slice(0,40)){
   const went=[...f.went.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]??'—';
   lines.push(`| ${f.item.name} | ${f.item.departmentId} › ${f.item.aisleId} | ${went} | ${pct(f.ok/f.n)} |`);
  }
 }
 lines.push('');
 const noConcept=items.filter(i=>conceptsOf(`${i.name} ${i.keywords}`).size===0);
 lines.push('## Card sort agreement');
 lines.push('');
 lines.push('How consistently the participant models put an aisle\'s items in one pile.');
 lines.push('Low agreement means the aisle mixes things people think of separately.');
 lines.push('');
 lines.push('| Aisle | Items | Agreement |');
 lines.push('|---|---|---|');
 for(const r of sort.slice(0,15))lines.push(`| ${r.aisle} | ${r.size} | ${pct(r.agreement)} |`);
 lines.push('');
 lines.push('## Method, and what it cannot tell you');
 lines.push('');
 lines.push('A participant is granted correct knowledge of **what the item is** (its concepts,');
 lines.push('from `tools/ia-lexicon.mjs`, which maps words to ideas and never to departments)');
 lines.push('and then has to reach it using only the labels in the tree. So what is being');
 lines.push('measured is the labels, not the shopper.');
 lines.push('');
 lines.push(`- **Vocabulary coverage:** the lexicon characterises ${pct(1-noConcept.length/items.length)} of items. `+
  `${noConcept.length} carry no concept at all, so their trials are effectively coin flips and they `+
  `depress the score without being real navigation failures.`);
 lines.push('- **Scoring is strict.** A trial only counts as found if the participant lands on the');
 lines.push('  exact aisle. Reaching the right department and scanning from there, which is what');
 lines.push('  people actually do, is scored as a miss.');
 lines.push('- **Browse only.** Search is the primary way into a 557-item catalogue and is not');
 lines.push('  exercised here at all. These numbers are a floor on findability, not a ceiling.');
 lines.push('- **Irreducible ambiguity.** Some items are honestly two things at once — frozen');
 lines.push('  blueberries are a fruit and a frozen good. Cross-listing (`alsoIn`) resolves many,');
 lines.push('  but a residue of disagreement is the correct outcome, not a defect to tune away.');
 lines.push('');
 lines.push('Percentages are useful for comparing one revision of the tree against the next.');
 lines.push('They are not a prediction of how real people would score.');
 return {text:lines.join('\n'),overall,deptRate,failures,sort,trials:trials.length,
  coverage:1-noConcept.length/items.length};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const departments=loadTaxonomy();
 const out=report(departments);
 console.log(out.text);
 if(process.argv.includes('--write')){
  const path=join(root,'docs','ia-study.md');
  mkdirSync(dirname(path),{recursive:true});
  writeFileSync(path,out.text+'\n');
  console.error(`\nwritten to ${path}`);
 }
}
