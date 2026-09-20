"use client";
// Legal screens: Terms of Use, Privacy Policy, Data sources & attribution.
//
// Long-form reading inside a product that is otherwise all cards and controls.
// The chrome is deliberately quieter than the rest of the app: one column, a
// generous measure, and no decoration competing with the text. Everything comes
// from src/lib/legal.ts, so the contents list can never drift from the body.
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,ArrowUpRight,ChevronRight,FileText,Info,ListTree,Scale,ShieldCheck,TriangleAlert} from 'lucide-react';
import {DOCUMENTS,OPERATOR,PLACEHOLDER_FIELDS,documentById,hasPlaceholders,type LegalDocument} from '@/lib/legal';
import './legal.css';

const ICONS={terms:Scale,privacy:ShieldCheck,sources:FileText} as const;
const BLURB={
 terms:'The agreement for using Aisle',
 privacy:'What happens to information about you',
 sources:'Where the data comes from, and its licences',
} as const;

/** `**bold**` is the only markup the documents use. */
function RichText({text}:{text:string}){
 const parts=text.split(/(\*\*[^*]+\*\*)/g);
 return <>{parts.map((part,i)=>part.startsWith('**')&&part.endsWith('**')
  ? <strong key={i}>{part.slice(2,-2)}</strong>
  : <span key={i}>{part}</span>)}</>;
}

export default function Legal({docId,onSelect,onBack}:{docId:string|null;onSelect:(id:string)=>void;onBack:()=>void}){
 const doc=docId?documentById(docId):null;
 return doc?<Document doc={doc} onBack={onBack} onSelect={onSelect}/>:<Index onSelect={onSelect} onBack={onBack}/>;
}

// ---------------------------------------------------------------------------
function Index({onSelect,onBack}:{onSelect:(id:string)=>void;onBack:()=>void}){
 return <div className="legal-screen">
  <div className="page-heading">
   <div>
    <span className="eyebrow">THE SMALL PRINT, PLAINLY</span>
    <h1>Legal &amp; privacy</h1>
    <p>Written to describe what this app actually does, rather than to cover every
     eventuality in the abstract. If something here does not match what you see in
     the app, the app is the bug.</p>
   </div>
   <button className="button secondary" onClick={onBack}><ArrowLeft size={16}/> Back</button>
  </div>

  {hasPlaceholders&&<PlaceholderNotice/>}

  <div className="legal-index">
   {DOCUMENTS.map(doc=>{
    const Icon=ICONS[doc.id];
    return <button key={doc.id} className="legal-card" onClick={()=>onSelect(doc.id)}>
     <span className="legal-card-icon"><Icon size={21}/></span>
     <span className="legal-card-copy">
      <strong>{doc.title}</strong>
      <small>{BLURB[doc.id]}</small>
      <em>{doc.sections.length} sections · updated {doc.lastUpdated}</em>
     </span>
     <ChevronRight size={18}/>
    </button>;
   })}
  </div>

  <section className="legal-contact card">
   <h2>Getting in touch</h2>
   <dl>
    <div><dt>General and terms</dt><dd>{OPERATOR.contactEmail}</dd></div>
    <div><dt>Privacy requests</dt><dd>{OPERATOR.privacyEmail}</dd></div>
    <div><dt>Operator</dt><dd>{OPERATOR.legalName}</dd></div>
    <div><dt>Jurisdiction</dt><dd>{OPERATOR.jurisdiction}</dd></div>
   </dl>
  </section>
 </div>;
}

// ---------------------------------------------------------------------------
function Document({doc,onBack,onSelect}:{doc:LegalDocument;onBack:()=>void;onSelect:(id:string)=>void}){
 const [active,setActive]=useState(doc.sections[0]?.id??'');
 const bodyRef=useRef<HTMLDivElement>(null);
 const Icon=ICONS[doc.id];
 const others=useMemo(()=>DOCUMENTS.filter(d=>d.id!==doc.id),[doc.id]);

 // Highlight the section the reader is actually in.
 useEffect(()=>{
  const headings=bodyRef.current?.querySelectorAll('section[id]');
  if(!headings?.length)return;
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(e=>e.isIntersecting)
    .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
   if(visible)setActive(visible.target.id);
  },{rootMargin:'-96px 0px -70% 0px',threshold:0});
  headings.forEach(h=>observer.observe(h));
  return ()=>observer.disconnect();
 },[doc.id]);

 function jump(id:string){
  const target=document.getElementById(id);
  if(!target)return;
  target.scrollIntoView({behavior:'smooth',block:'start'});
  setActive(id);
  // Move focus so keyboard and screen-reader users follow the jump.
  target.setAttribute('tabindex','-1');
  (target as HTMLElement).focus({preventScroll:true});
 }

 return <div className="legal-screen">
  <div className="page-heading legal-doc-heading">
   <div>
    <button className="text-button legal-back" onClick={onBack}><ArrowLeft size={15}/> All legal pages</button>
    <span className="eyebrow"><Icon size={13}/> {doc.title.toUpperCase()}</span>
    <h1>{doc.title}</h1>
    <p>{doc.summary}</p>
    <p className="legal-updated">Last updated {doc.lastUpdated} · Effective {OPERATOR.effectiveDate}</p>
   </div>
  </div>

  {hasPlaceholders&&<PlaceholderNotice/>}

  <div className="legal-layout">
   <nav className="legal-contents" aria-label={`${doc.title} contents`}>
    <p className="legal-contents-title"><ListTree size={15}/> Contents</p>
    <ol>
     {doc.sections.map(section=>
      <li key={section.id}>
       <button className={active===section.id?'is-active':''} onClick={()=>jump(section.id)}>
        {section.heading}
       </button>
      </li>)}
    </ol>
   </nav>

   <div className="legal-body" ref={bodyRef}>
    {doc.sections.map(section=>
     <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`}>
      <h2 id={`${section.id}-h`}>{section.heading}</h2>
      {section.body.map((paragraph,i)=><p key={i}><RichText text={paragraph}/></p>)}
      {section.list&&<ul>{section.list.map((entry,i)=><li key={i}><RichText text={entry}/></li>)}</ul>}
      {section.callout&&<p className="legal-callout"><TriangleAlert size={17}/><span><RichText text={section.callout}/></span></p>}
     </section>)}

    <section className="legal-end">
     <h2>Related</h2>
     <div className="legal-related">
      {others.map(other=>{
       const OtherIcon=ICONS[other.id];
       return <button key={other.id} className="legal-related-link" onClick={()=>{onSelect(other.id);window.scrollTo({top:0});}}>
        <OtherIcon size={17}/> {other.title} <ArrowUpRight size={14}/>
       </button>;
      })}
     </div>
    </section>
   </div>
  </div>
 </div>;
}

// ---------------------------------------------------------------------------
/** Shown until OPERATOR is filled in, so an unfinished document cannot ship quietly. */
function PlaceholderNotice(){
 return <div className="legal-placeholder" role="note">
  <TriangleAlert size={19}/>
  <div>
   <strong>These documents are not ready to publish.</strong>
   <p>{PLACEHOLDER_FIELDS.length} operator {PLACEHOLDER_FIELDS.length===1?'detail is':'details are'} still
    placeholder text ({PLACEHOLDER_FIELDS.join(', ')}). Fill them in
    at <code>src/lib/legal.ts</code> and have a lawyer review the wording before release.</p>
  </div>
 </div>;
}

export function LegalFooterLinks({onSelect}:{onSelect:(id:string)=>void}){
 return <p className="legal-inline-links">
  <Info size={13}/>
  {DOCUMENTS.map((doc,i)=><span key={doc.id}>
   {i>0&&<span aria-hidden="true"> · </span>}
   <button onClick={()=>onSelect(doc.id)}>{doc.title}</button>
  </span>)}
 </p>;
}
