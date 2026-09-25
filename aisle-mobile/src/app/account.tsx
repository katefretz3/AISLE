"use client";
// Account settings.
//
// One page for everything about the household, in the order someone would
// actually think about it: who you are, how many of you, what you can spend,
// where you shop, what you will not eat, and what the app is allowed to
// remember. Each section is a card with the same header shape, so the page
// scans as a list of decisions rather than a wall of inputs.
//
// The destructive controls sit at the bottom, visually separated and behind a
// confirmation, because erasing a year of shopping history by mis-tap is not a
// recoverable mistake — there is no account and no server copy.
import {useMemo,useState} from 'react';
import {AlertTriangle,ArrowRight,Bus,Car,Check,CheckCheck,ChevronRight,Footprints,Heart,LockKeyhole,MapPin,Pin,ReceiptText,RotateCcw,Scale,ShieldCheck,Sparkles,Tag,Trash2,User,Users,Wallet,X} from 'lucide-react';
import {AlertDialog,AlertDialogContent,AlertDialogTitle,AlertDialogDescription,AlertDialogAction,AlertDialogCancel,AlertDialogFooter} from '@/components/ui/alert-dialog';
import {Switch} from '@/components/ui/switch';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {StoreLogo} from '@/components/store-logo';
import LocationMap from '@/components/location-map';
import {cityLocation,ontarioCities} from '@/lib/locations';
import {allergenOptions,dietaryOptions,money,priorityLabels,productById,stores,type Preferences,type UserState} from '@/lib/catalog';
import {cadenceDays,perShopBudget} from '@/lib/agent';
import {DOCUMENTS} from '@/lib/legal';
import './account.css';

type Props={
 state:UserState;
 saveStatus:string;
 onPrefs:(patch:Partial<Preferences>)=>void;
 onCommit:(update:(state:UserState)=>UserState)=>void;
 onEditFood:()=>void;
 onReplaySetup:()=>void;
 onLegal:(docId:string)=>void;
 appVersion:string;
};

const SECTIONS=[
 {id:'profile',label:'Profile',icon:User},
 {id:'household',label:'Household',icon:Users},
 {id:'budget',label:'Budget',icon:Wallet},
 {id:'location',label:'Location',icon:MapPin},
 {id:'dietary',label:'Dietary',icon:ShieldCheck},
 {id:'learning',label:'Learning & data',icon:Sparkles},
] as const;

const BUDGET_MIN=10,BUDGET_MAX=2000;
const toggle=(list:string[],value:string)=>list.includes(value)?list.filter(v=>v!==value):[...list,value];
const plural=(n:number,one:string,many=`${one}s`)=>`${n} ${n===1?one:many}`;

export default function Account({state,saveStatus,onPrefs,onCommit,onEditFood,onReplaySetup,onLegal,appVersion}:Props){
 const p=state.prefs;
 // The saved state arrives asynchronously, so this field cannot seed a
 // useState from `p.budget` — that would capture the pre-load default and show
 // it forever. Instead it holds a draft only while being edited and mirrors the
 // committed value the rest of the time, which also keeps it correct when the
 // budget changes from elsewhere (an erase, or the setup flow).
 const [budgetDraft,setBudgetDraft]=useState<string|null>(null);
 const budgetText=budgetDraft??String(p.budget);
 const [forgetOpen,setForgetOpen]=useState(false);
 const [eraseOpen,setEraseOpen]=useState(false);

 const budgetValue=Number(budgetText);
 const budgetError=!budgetText.trim()?'Enter a weekly budget.'
  :!Number.isFinite(budgetValue)?'Use numbers only.'
  :budgetValue<BUDGET_MIN?`The minimum is $${BUDGET_MIN}.`
  :budgetValue>BUDGET_MAX?`The maximum is $${BUDGET_MAX}.`
  :'';

 const perShop=useMemo(()=>perShopBudget(p),[p]);
 const period=cadenceDays(p.frequency);
 const learnedCount=state.events.length;
 const boughtItems=state.trips.reduce((n,t)=>n+(t.lines?.length??0),0);
 const shelfCount=(state.shelfPrices??[]).length;
 const hasLearned=learnedCount>0||p.categoryLocks.length>0||p.excludedProducts.length>0;

 function commitBudget(next:string){
  setBudgetDraft(next);
  const value=Number(next);
  if(next.trim()&&Number.isFinite(value)&&value>=BUDGET_MIN&&value<=BUDGET_MAX)onPrefs({budget:value});
 }

 function jump(id:string){
  const el=document.getElementById(`account-${id}`);
  if(!el)return;
  el.scrollIntoView({behavior:'smooth',block:'start'});
  el.setAttribute('tabindex','-1');
  el.focus({preventScroll:true});
 }

 return <div className="account-screen">
  <div className="page-heading">
   <div>
    <span className="eyebrow">ACCOUNT SETTINGS</span>
    <h1>{p.name?`Your Aisle, ${p.name}.`:'Your Aisle.'}</h1>
    <p>Everything the app knows about your household, in one place. Changes save
     as you make them, and nothing here leaves your device.</p>
   </div>
   <span className="saved-label"><CheckCheck size={15}/>{saveStatus}</span>
  </div>

  <nav className="account-jump" aria-label="Settings sections">
   {SECTIONS.map(({id,label,icon:Icon})=>
    <button key={id} onClick={()=>jump(id)}><Icon size={15}/> {label}</button>)}
  </nav>

  {/* ---- profile ---------------------------------------------------- */}
  <Section id="profile" icon={User} title="Profile"
   description="How Aisle addresses you. There is no account and no sign-in — this is a label on this device, not an identity.">
   <div className="account-identity">
    <span className="account-avatar" aria-hidden="true">{(p.name||'A').slice(0,1).toUpperCase()}</span>
    <div>
     <strong>{p.name||'Your household'}</strong>
     <span>{p.city}, Ontario · {p.household} {p.household===1?'person':'people'}</span>
    </div>
   </div>
   <label className="field">
    <span className="field-title">Your first name <em>Optional</em></span>
    <input value={p.name} maxLength={60} placeholder="What should we call you?"
     autoComplete="given-name" onChange={e=>onPrefs({name:e.target.value})}/>
    <span className="field-help">Used only to greet you in the app.</span>
   </label>
   <p className="account-note">
    <ShieldCheck size={16}/>
    <span>Your list, preferences and receipts live in this app's private storage.
     If you uninstall the app or clear its data they are gone, and we cannot recover them.</span>
   </p>
  </Section>

  {/* ---- household -------------------------------------------------- */}
  <Section id="household" icon={Users} title="Household"
   description="How many people you shop for and how often. Together these set the size of a single shop.">
   <div className="account-grid">
    <Field label="People in your household">
     <Choice label="Household size" value={String(p.household)} onChange={v=>onPrefs({household:Number(v)})}
      options={[1,2,3,4,5,6].map(n=>({value:String(n),label:`${n} ${n===1?'person':'people'}`}))}/>
    </Field>
    <Field label="How often you shop">
     <Choice label="Shopping cadence" value={p.frequency} onChange={v=>onPrefs({frequency:v as Preferences['frequency']})}
      options={[{value:'twice-weekly',label:'Twice a week'},{value:'weekly',label:'About once a week'},{value:'fortnightly',label:'Every two weeks'}]}/>
    </Field>
   </div>
   <dl className="account-derived">
    <div><dt>Days per shop</dt><dd>{period}</dd></div>
    <div><dt>Budget per shop</dt><dd>{money(perShop)}</dd></div>
    <div><dt>Per person, per shop</dt><dd>{money(Math.round(perShop/Math.max(1,p.household)))}</dd></div>
   </dl>
  </Section>

  {/* ---- budget ----------------------------------------------------- */}
  <Section id="budget" icon={Wallet} title="Budget"
   description="What you plan to spend on groceries each week, and how Aisle should weigh price against travel.">
   <label className="field">
    <span className="field-title">Weekly grocery budget</span>
    <span className={`account-money-input${budgetError?' has-error':''}`}>
     <span aria-hidden="true">$</span>
     <input type="number" inputMode="decimal" min={BUDGET_MIN} max={BUDGET_MAX} value={budgetText}
      aria-invalid={!!budgetError} aria-describedby="budget-help"
      onChange={e=>commitBudget(e.target.value)}
      onBlur={()=>setBudgetDraft(null)}/>
     <span aria-hidden="true">CAD / week</span>
    </span>
    <span className="field-help" id="budget-help" role={budgetError?'alert':undefined}>
     {budgetError||`That is ${money(perShop)} for a ${period}-day shop.`}
    </span>
   </label>

   <fieldset className="field">
    <legend className="field-title">What matters most on a trip</legend>
    <div className="account-options">
     {(['saving','balanced','convenience'] as const).map(id=>
      <button key={id} type="button" aria-pressed={p.priority===id}
       className={`account-option${p.priority===id?' selected':''}`} onClick={()=>onPrefs({priority:id})}>
       <span><strong>{priorityLabels[id]}</strong>
        <small>{id==='saving'?'Rank by the lowest basket total.'
          :id==='balanced'?'Weigh the basket against the trip.'
          :'Favour the closest complete basket.'}</small></span>
       <span className="account-check">{p.priority===id&&<Check size={14}/>}</span>
      </button>)}
    </div>
   </fieldset>

   <label className="field">
    <span className="field-title">Only suggest a swap if it saves at least</span>
    <Choice label="Minimum swap saving" value={String(p.minimumSwapSaving)}
     onChange={v=>onPrefs({minimumSwapSaving:Number(v)})}
     options={[25,50,100,200].map(c=>({value:String(c),label:money(c)}))}/>
    <span className="field-help">Smaller savings are not worth the interruption.</span>
   </label>
  </Section>

  {/* ---- location --------------------------------------------------- */}
  <Section id="location" icon={MapPin} title="Location"
   description="Where to look for shops. Aisle covers Ontario only.">
   <div className="account-grid">
    <Field label="Your city">
     <Choice label="City" value={p.city}
      onChange={city=>onPrefs({city,area:city,neighbourhood:city,searchLocation:cityLocation(city)})}
      options={ontarioCities.map(c=>({value:c.name,label:c.name}))}/>
    </Field>
    <Field label="Baseline store for comparisons">
     <Choice label="Usual store" value={p.usualStore} onChange={v=>onPrefs({usualStore:v})}
      options={stores.map(s=>({value:s.id,label:s.name}))}/>
    </Field>
   </div>

   <fieldset className="field">
    <legend className="field-title">How you usually get there</legend>
    <div className="account-transport">
     {([{id:'drive',label:'Drive',icon:Car},{id:'walk',label:'Walk',icon:Footprints},{id:'transit',label:'Transit',icon:Bus}] as const).map(t=>
      <button key={t.id} type="button" aria-pressed={p.transport===t.id}
       className={`account-transport-choice${p.transport===t.id?' selected':''}`}
       onClick={()=>onPrefs({transport:t.id})}><t.icon size={20}/>{t.label}</button>)}
    </div>
    <span className="field-help">Distances shown are straight-line. Routes, fares and travel time are not connected.</span>
   </fieldset>

   <div className="field">
    <span className="field-title">Search area <em>{p.radius} km</em></span>
    <LocationMap city={p.city} location={p.searchLocation??cityLocation(p.city)} radius={p.radius}
     onLocation={searchLocation=>onPrefs({searchLocation})} onRadius={radius=>onPrefs({radius})}/>
   </div>

   <fieldset className="field">
    <legend className="field-title">Chains you shop at <em>{p.preferredStores.length} selected</em></legend>
    <div className="account-chains">
     {stores.map(store=>
      <button key={store.id} type="button" aria-pressed={p.preferredStores.includes(store.id)}
       className={`account-chain${p.preferredStores.includes(store.id)?' selected':''}`}
       onClick={()=>onPrefs({preferredStores:toggle(p.preferredStores,store.id)})}>
       <StoreLogo store={store}/>
       <span>{store.name}</span>
       <span className="account-check">{p.preferredStores.includes(store.id)&&<Check size={13}/>}</span>
      </button>)}
    </div>
    <span className="field-help">Preferred chains are listed first unless you have chosen closest-first.</span>
   </fieldset>

   <p className="account-note">
    <ShieldCheck size={16}/>
    <span>Only a coarse search area — roughly a 5 km cell, never your exact pin — is sent when
     looking up nearby shops. Your list and preferences never leave the device for this.</span>
   </p>
  </Section>

  {/* ---- dietary ---------------------------------------------------- */}
  <Section id="dietary" icon={ShieldCheck} title="Dietary & allergens"
   description="What Aisle should avoid suggesting. These are settings you control; nothing here is ever inferred from your behaviour.">
   <div className="account-safety">
    <AlertTriangle size={20}/>
    <div>
     <strong>Aisle cannot tell you a product is safe to eat.</strong>
     <p>Retailer catalogues carry no verified ingredient or allergen data, so these settings
      change what gets <em>suggested</em> — they are not a safety filter. Always read the label.</p>
    </div>
   </div>

   <fieldset className="field">
    <legend className="field-title">Dietary preferences <em>{p.dietary.length} selected</em></legend>
    <div className="account-chips">
     {dietaryOptions.map(option=>
      <button key={option} type="button" aria-pressed={p.dietary.includes(option)}
       className={`account-chip${p.dietary.includes(option)?' selected':''}`}
       onClick={()=>onPrefs({dietary:toggle(p.dietary,option)})}>{option}</button>)}
    </div>
    {p.dietary.length>0&&<span className="field-help">
     With a dietary preference set, new food suggestions are limited to plain produce until
     verified ingredient data is connected.</span>}
   </fieldset>

   <fieldset className="field">
    <legend className="field-title">Ingredients to avoid <em>{p.allergens.length} selected</em></legend>
    <div className="account-chips">
     {allergenOptions.map(option=>
      <button key={option} type="button" aria-pressed={p.allergens.includes(option)}
       className={`account-chip is-allergen${p.allergens.includes(option)?' selected':''}`}
       onClick={()=>onPrefs({allergens:toggle(p.allergens,option)})}>{option}</button>)}
    </div>
    {p.allergens.length>0&&<span className="field-help">
     Automatic food suggestions and swaps are paused entirely while an ingredient restriction is set.</span>}
   </fieldset>

   <ListEditor title="Protected brands" empty="No brands protected yet."
    help="Aisle will not propose a different brand for these."
    items={p.preferredBrands.map(b=>({id:b,label:b}))}
    onRemove={id=>onPrefs({preferredBrands:p.preferredBrands.filter(b=>b!==id)})}/>

   <ListEditor title="Categories kept as-is" empty="No categories locked."
    help="Swaps are never suggested inside these categories."
    items={p.categoryLocks.map(c=>({id:c,label:c}))}
    onRemove={id=>onPrefs({categoryLocks:p.categoryLocks.filter(c=>c!==id)})}/>

   <ListEditor title="Hidden products" empty="Nothing hidden."
    help="These never appear as a suggestion."
    items={p.excludedProducts.map(id=>({id,label:productById[id]?.name??id}))}
    onRemove={id=>onPrefs({excludedProducts:p.excludedProducts.filter(x=>x!==id)})}/>

   <button className="button secondary full" onClick={onEditFood}>
    Edit food preferences &amp; favourites <ArrowRight size={16}/>
   </button>
  </Section>

  {/* ---- learning & data -------------------------------------------- */}
  <Section id="learning" icon={Sparkles} title="Learning & data"
   description="What Aisle is allowed to remember, and how to erase it.">
   <div className="account-switch">
    <div>
     <strong>Suggest lower-cost equivalents</strong>
     <p>Same size, similar product. You approve every change before it reaches your list.</p>
    </div>
    <Switch aria-label="Suggest lower-cost equivalents" checked={p.substitutions}
     onCheckedChange={substitutions=>onPrefs({substitutions})}/>
   </div>
   <div className="account-switch">
    <div>
     <strong>Learn from my shopping choices</strong>
     <p>Records the matches you confirm and the purchases you enter, on this device, to order
      suggestions better. Off by default. Allergies are never inferred.</p>
    </div>
    <Switch aria-label="Learn from my shopping choices" checked={p.learning}
     onCheckedChange={learning=>onPrefs({learning})}/>
   </div>

   <div className="account-memory">
    <h3>What Aisle remembers</h3>
    <ul>
     <li><Heart size={16}/><span>{plural(p.favouriteProducts.length,'staple')} you chose</span></li>
     <li><LockKeyhole size={16}/><span>{plural(state.items.filter(i=>i.locked).length,'product')} locked on this list</span></li>
     <li><Pin size={16}/><span>{plural(p.categoryLocks.length,'category','categories')} kept as-is</span></li>
     <li><Sparkles size={16}/><span>{p.learning?`${plural(learnedCount,'recorded choice')} in use`:'Learning is off — explicit settings only'}</span></li>
     <li><CheckCheck size={16}/><span>{plural(state.trips.length,'shopping trip')} recorded</span></li>
     <li><ReceiptText size={16}/><span>{plural(boughtItems,'item')} on those receipts, with any prices you entered</span></li>
     <li><Tag size={16}/><span>{plural(shelfCount,'shelf price')} you read off a label</span></li>
    </ul>
    <p className="account-memory-note">A saved receipt records which items were in that
     shop, so Aisle can tell you what you usually buy and what you last paid. It stays on
     this device and is deleted with the receipt. Learning, above, is separate: it governs
     whether Aisle draws conclusions from your choices, not whether your receipts are kept.</p>
    <p className="account-memory-note">Prices you type off a shelf are kept apart from prices
     Aisle collected itself. They are shown as yours wherever they appear, are never counted
     towards a verified saving, and are dropped after a year because a shelf does not stay
     still that long.</p>
   </div>

   <div className="account-danger">
    <h3><AlertTriangle size={17}/> Erasing things</h3>
    <div className="account-danger-row">
     <div><strong>Forget learned preferences</strong>
      <p>Clears recorded choices, category locks and hidden products. Your explicit settings stay.</p></div>
     <button className="button danger-outline" disabled={!hasLearned} onClick={()=>setForgetOpen(true)}>
      <RotateCcw size={15}/> Forget
     </button>
    </div>
    <div className="account-danger-row">
     <div><strong>Erase everything on this device</strong>
      <p>Your list, preferences, history and receipts. There is no account and no backup, so this
       cannot be undone.</p></div>
     <button className="button danger" onClick={()=>setEraseOpen(true)}><Trash2 size={15}/> Erase</button>
    </div>
   </div>

   <button className="text-button" onClick={onReplaySetup}>Revisit the welcome setup <ArrowRight size={15}/></button>
  </Section>

  <footer className="account-footer">
   <div>
    <p className="account-footer-title"><Scale size={15}/> Legal &amp; privacy</p>
    <div className="account-footer-links">
     {DOCUMENTS.map(doc=>
      <button key={doc.id} onClick={()=>onLegal(doc.id)}>{doc.title} <ChevronRight size={14}/></button>)}
    </div>
   </div>
   <p className="account-version">Aisle {appVersion} · Ontario · Prices in CAD</p>
  </footer>

  <AlertDialog open={forgetOpen} onOpenChange={setForgetOpen}>
   <AlertDialogContent>
    <AlertDialogTitle>Forget learned preferences?</AlertDialogTitle>
    <AlertDialogDescription>
     This clears {learnedCount} recorded {learnedCount===1?'choice':'choices'}, {p.categoryLocks.length} category
     {p.categoryLocks.length===1?' lock':' locks'} and {p.excludedProducts.length} hidden
     {p.excludedProducts.length===1?' product':' products'}. Your name, household, budget, location,
     dietary settings and favourites are not affected.
    </AlertDialogDescription>
    <AlertDialogFooter>
     <AlertDialogCancel>Keep them</AlertDialogCancel>
     <AlertDialogAction onClick={()=>{
      onCommit(s=>({...s,events:[],prefs:{...s.prefs,categoryLocks:[],excludedProducts:[]}}));
      setForgetOpen(false);
     }}>Forget them</AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>

  <AlertDialog open={eraseOpen} onOpenChange={setEraseOpen}>
   <AlertDialogContent>
    <AlertDialogTitle>Erase everything on this device?</AlertDialogTitle>
    <AlertDialogDescription>
     This removes your grocery list, every preference, {state.trips.length} recorded
     {state.trips.length===1?' trip':' trips'} and any receipts you saved. Aisle has no account and
     keeps no copy, so this cannot be undone and support cannot restore it.
    </AlertDialogDescription>
    <AlertDialogFooter>
     <AlertDialogCancel>Cancel</AlertDialogCancel>
     <AlertDialogAction className="is-destructive" onClick={()=>{
      onCommit(()=>({...JSON.parse(JSON.stringify(EMPTY_STATE))}));
      setEraseOpen(false);
     }}>Erase everything</AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>
 </div>;
}

// ---------------------------------------------------------------------------
import {initialState} from '@/lib/catalog';
const EMPTY_STATE:UserState={...initialState(),items:[],onboarded:true};

function Section({id,icon:Icon,title,description,children}:{
 id:string;icon:typeof User;title:string;description:string;children:React.ReactNode;
}){
 return <section className="card account-section" id={`account-${id}`} aria-labelledby={`account-${id}-h`}>
  <header className="account-section-head">
   <span className="account-section-icon"><Icon size={19}/></span>
   <div>
    <h2 id={`account-${id}-h`}>{title}</h2>
    <p>{description}</p>
   </div>
  </header>
  <div className="account-section-body">{children}</div>
 </section>;
}

function Field({label,children}:{label:string;children:React.ReactNode}){
 return <label className="field"><span className="field-title">{label}</span>{children}</label>;
}

function Choice({value,onChange,options,label}:{
 value:string;onChange:(v:string)=>void;options:{value:string;label:string}[];label:string;
}){
 return <Select value={value} onValueChange={onChange}>
  <SelectTrigger aria-label={label} className="account-select"><SelectValue/></SelectTrigger>
  <SelectContent>{options.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
 </Select>;
}

function ListEditor({title,help,empty,items,onRemove}:{
 title:string;help:string;empty:string;items:{id:string;label:string}[];onRemove:(id:string)=>void;
}){
 return <div className="field">
  <span className="field-title">{title} <em>{items.length}</em></span>
  {items.length
   ? <ul className="account-taglist">{items.map(item=>
      <li key={item.id}>{item.label}
       <button type="button" aria-label={`Remove ${item.label}`} onClick={()=>onRemove(item.id)}><X size={13}/></button>
      </li>)}</ul>
   : <p className="account-empty">{empty}</p>}
  <span className="field-help">{help}</span>
 </div>;
}
