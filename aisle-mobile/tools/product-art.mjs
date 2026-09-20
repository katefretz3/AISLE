// Parametric product illustrations.
//
// Every catalogue item names a template and two colours in taxonomy.ts; this
// file turns that into a flat 256px illustration in the style the app already
// used. Keeping the art generated (rather than collected) means a new item can
// never ship without a picture, and every picture is consistent, licence-free
// and about 3 KB.
//
// Each template returns SVG markup for a 256x256 canvas. Shapes sit roughly
// within 40..216 so nothing clips against the soft shadow.

const shade=(hex,amount)=>{
 const n=parseInt(hex.slice(1),16);
 const clamp=v=>Math.max(0,Math.min(255,Math.round(v)));
 const r=clamp(((n>>16)&255)*amount),g=clamp(((n>>8)&255)*amount),b=clamp((n&255)*amount);
 return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
};
const dark=c=>shade(c,0.78);
const light=c=>shade(c,1.18);

// --- produce -----------------------------------------------------------------
const round=(c,a)=>`
 <path d="M128 66c6-14 18-22 30-24 2 12-4 24-16 30z" fill="${a}"/>
 <rect x="124" y="58" width="7" height="26" rx="3.5" fill="${dark(a)}"/>
 <circle cx="98" cy="150" r="58" fill="${c}"/><circle cx="158" cy="150" r="58" fill="${c}"/>
 <circle cx="128" cy="144" r="60" fill="${light(c)}"/>
 <circle cx="106" cy="124" r="16" fill="#ffffff" opacity=".18"/>`;
const berry=(c,a)=>{
 const dots=[[92,112,26],[160,108,24],[126,142,30],[86,168,24],[158,170,26],[124,196,20]];
 return dots.map(([x,y,r],i)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${i%2?a:c}"/>
  <path d="M${x-7} ${y-r+5}l7 6 7-6" stroke="${dark(a)}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="${x-r/3}" cy="${y-r/3}" r="${r/4}" fill="#ffffff" opacity=".22"/>`).join('');
};
const strawberry=(c,a)=>`
 <path d="M128 56c-20 2-36 8-36 8 12 6 24 8 36 8s24-2 36-8c0 0-16-6-36-8z" fill="${a}"/>
 <rect x="124" y="44" width="8" height="20" rx="4" fill="${dark(a)}"/>
 <path d="M128 72c44 0 66 30 66 62 0 38-34 68-66 68s-66-30-66-68c0-32 22-62 66-62z" fill="${c}"/>
 ${[[104,112],[152,112],[128,136],[96,152],[160,152],[128,176],[104,196],[152,196]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="7" fill="${light(c)}" opacity=".85"/>`).join('')}`;
const banana=(c,a)=>`
 <path d="M58 80c0 68 40 116 108 116 22 0 34-10 34-10-10-30-18-38-34-38-42 0-72-30-72-72 0-6-36-2-36 4z" fill="${c}"/>
 <path d="M58 80c0 68 40 116 108 116 10 0 18-2 24-5-62-6-100-52-104-113-14-1-28 0-28 2z" fill="${a}"/>
 <rect x="52" y="62" width="20" height="26" rx="8" fill="${dark(a)}"/>`;
const citrus=(c,a)=>`
 <circle cx="128" cy="140" r="72" fill="${c}"/>
 <circle cx="128" cy="140" r="54" fill="${light(c)}" opacity=".5"/>
 ${Array.from({length:8},(_,i)=>`<path d="M128 140L${128+52*Math.cos(i*Math.PI/4)} ${140+52*Math.sin(i*Math.PI/4)}" stroke="${a}" stroke-width="4" opacity=".55" stroke-linecap="round"/>`).join('')}
 <path d="M128 68c8-14 22-20 34-20 0 14-10 26-24 30z" fill="#6f9f4a"/>`;
const melon=(c,a)=>`
 <path d="M34 178a94 94 0 0 1 188 0z" fill="${a}"/>
 <path d="M48 178a80 80 0 0 1 160 0z" fill="${light(a)}"/>
 <path d="M58 178a70 70 0 0 1 140 0z" fill="${c}"/>
 ${[[100,150],[128,132],[156,150],[86,168],[170,168],[128,166]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="7" fill="${dark(c)}" opacity=".6"/>`).join('')}
 <rect x="34" y="176" width="188" height="12" rx="6" fill="${dark(a)}"/>`;
const pear=(c,a)=>`
 <rect x="124" y="46" width="7" height="28" rx="3.5" fill="${dark(a)}"/>
 <path d="M138 62c10-10 24-12 32-10-2 12-14 22-28 22z" fill="${a}"/>
 <path d="M128 72c22 0 30 20 24 42-6 20 30 26 30 68 0 32-26 52-54 52s-54-20-54-52c0-42 36-48 30-68-6-22 2-42 24-42z" fill="${c}"/>
 <circle cx="104" cy="160" r="16" fill="#ffffff" opacity=".16"/>`;
const pineapple=(c,a)=>`
 ${[[128,30],[102,44],[154,44],[114,36],[142,36]].map(([x,y])=>`<path d="M${x} ${y}c-8 16-6 34 0 44 6-10 8-28 0-44z" fill="${a}"/>`).join('')}
 <rect x="70" y="80" width="116" height="136" rx="52" fill="${c}"/>
 ${Array.from({length:5},(_,r)=>Array.from({length:4},(_,k)=>`<rect x="${80+k*26}" y="${94+r*24}" width="18" height="18" rx="5" fill="${dark(c)}" opacity=".45" transform="rotate(45 ${89+k*26} ${103+r*24})"/>`).join('')).join('')}`;
const grapes=(c,a)=>{
 const rows=[[128],[110,146],[92,128,164],[110,146],[128]];
 return `<rect x="124" y="40" width="7" height="26" rx="3.5" fill="#7a5c3a"/>
  <path d="M132 54c12-10 26-10 34-6-6 12-20 18-32 14z" fill="#6f9f4a"/>`+
  rows.map((row,ri)=>row.map(x=>`<circle cx="${x}" cy="${84+ri*30}" r="19" fill="${ri%2?a:c}"/><circle cx="${x-6}" cy="${84+ri*30-6}" r="5" fill="#ffffff" opacity=".2"/>`).join('')).join('');
};
const leafy=(c,a)=>`
 <path d="M128 208c-52-6-86-44-86-88 0-26 14-46 30-52 14-6 26 4 32 18 6-20 16-32 30-32s26 14 30 32c8-14 20-22 34-16 16 8 28 26 28 52 0 44-34 80-86 86z" fill="${c}"/>
 <path d="M128 208c0-40-2-80-2-116" stroke="${light(c)}" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M126 130c-16-8-30-14-42-16M128 164c16-8 30-14 42-16" stroke="${a}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
const floret=(c,a)=>`
 <rect x="114" y="140" width="28" height="70" rx="12" fill="${a}"/>
 ${[[88,120,30],[128,100,36],[168,120,30],[104,146,28],[152,146,28],[128,140,26]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('')}
 ${[[96,112],[128,92],[160,112],[110,136],[150,136]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="${light(c)}" opacity=".6"/>`).join('')}`;
const root=(c,a)=>`
 <path d="M112 62c6-16 18-24 28-24-2 16-10 26-20 30z" fill="#6f9f4a"/>
 <path d="M144 66c-8-14-6-28 0-36 10 8 14 24 8 36z" fill="#5f8a3f"/>
 <path d="M128 76c26 0 38 16 38 34 0 34-24 106-38 106s-38-72-38-106c0-18 12-34 38-34z" fill="${c}"/>
 ${[[104,120],[150,140],[106,166],[146,186]].map(([x,y])=>`<path d="M${x} ${y}h${x<128?18:-18}" stroke="${a}" stroke-width="4" stroke-linecap="round" opacity=".6"/>`).join('')}`;
const bulb=(c,a)=>`
 <path d="M128 52c4 14 2 22-2 28h-4c-4-6-6-14-2-28z" fill="#8a9a5c"/>
 <ellipse cx="128" cy="144" rx="72" ry="66" fill="${c}"/>
 <path d="M128 78c-22 24-22 108 0 132M128 78c22 24 22 108 0 132M92 92c-10 30-10 74 0 104M164 92c10 30 10 74 0 104" stroke="${a}" stroke-width="4" fill="none" opacity=".55"/>`;
const pepper=(c,a)=>`
 <rect x="122" y="48" width="12" height="28" rx="6" fill="#7a5c3a"/>
 <path d="M104 72c10-8 38-8 48 0 6 4 10 2 14 6-6 4-12 4-18 2z" fill="${a}"/>
 <path d="M128 76c40 0 66 24 66 62 0 42-30 74-66 74s-66-32-66-74c0-38 26-62 66-62z" fill="${c}"/>
 <path d="M96 110c-8 26-8 56 2 78M160 110c8 26 8 56-2 78" stroke="${dark(c)}" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>`;
const longveg=(c,a)=>`
 <rect x="86" y="42" width="84" height="176" rx="42" fill="${c}"/>
 <rect x="102" y="60" width="18" height="140" rx="9" fill="${light(c)}" opacity=".5"/>
 <rect x="108" y="34" width="40" height="18" rx="9" fill="${a}"/>`;
const mushroom=(c,a)=>`
 <path d="M96 140h64v52c0 12-10 20-32 20s-32-8-32-20z" fill="${a}"/>
 <path d="M128 52c44 0 76 30 76 62 0 16-14 26-76 26s-76-10-76-26c0-32 32-62 76-62z" fill="${c}"/>
 <ellipse cx="102" cy="90" rx="16" ry="10" fill="#ffffff" opacity=".2"/>`;
const corn=(c,a)=>`
 <path d="M72 96c-14 40 10 100 40 114-18-40-22-90-14-118z" fill="${a}"/>
 <path d="M184 96c14 40-10 100-40 114 18-40 22-90 14-118z" fill="${a}"/>
 <rect x="94" y="44" width="68" height="168" rx="34" fill="${c}"/>
 ${Array.from({length:7},(_,r)=>Array.from({length:3},(_,k)=>`<circle cx="${110+k*18}" cy="${66+r*22}" r="7" fill="${dark(c)}" opacity=".45"/>`).join('')).join('')}`;
const avocado=(c,a)=>`
 <path d="M128 44c34 0 58 28 58 62 0 56-26 104-58 104s-58-48-58-104c0-34 24-62 58-62z" fill="${c}"/>
 <path d="M128 66c24 0 40 20 40 44 0 42-18 76-40 76s-40-34-40-76c0-24 16-44 40-44z" fill="${light(a)}"/>
 <ellipse cx="128" cy="146" rx="28" ry="32" fill="${dark(c)}"/>`;
const herb=(c,a)=>`
 <rect x="122" y="70" width="8" height="140" rx="4" fill="${a}"/>
 ${[0,1,2,3,4].map(i=>{const y=88+i*26;return `<ellipse cx="${100-i*2}" cy="${y}" rx="26" ry="13" fill="${c}" transform="rotate(-24 ${100-i*2} ${y})"/><ellipse cx="${156+i*2}" cy="${y+12}" rx="26" ry="13" fill="${light(c)}" transform="rotate(24 ${156+i*2} ${y+12})"/>`;}).join('')}
 <ellipse cx="128" cy="72" rx="16" ry="22" fill="${c}"/>`;

// --- packaging ---------------------------------------------------------------
const carton=(c,a)=>`
 <path d="M70 84l58-36 58 36v128a8 8 0 0 1-8 8H78a8 8 0 0 1-8-8z" fill="${c}"/>
 <path d="M70 84l58-36 58 36-58 22z" fill="${light(c)}"/>
 <rect x="92" y="126" width="72" height="54" rx="10" fill="${a}"/>`;
const jug=(c,a)=>`
 <rect x="172" y="104" width="34" height="56" rx="16" fill="none" stroke="${c}" stroke-width="14"/>
 <rect x="62" y="76" width="116" height="140" rx="20" fill="${c}"/>
 <rect x="104" y="40" width="34" height="44" rx="8" fill="${dark(c)}"/>
 <rect x="98" y="34" width="46" height="18" rx="7" fill="${a}"/>
 <rect x="80" y="122" width="80" height="58" rx="10" fill="${a}"/>`;
const bottle=(c,a)=>`
 <rect x="110" y="30" width="36" height="30" rx="6" fill="${dark(c)}"/>
 <path d="M112 58h32l22 34v112a12 12 0 0 1-12 12H102a12 12 0 0 1-12-12V92z" fill="${c}"/>
 <rect x="94" y="118" width="68" height="62" rx="9" fill="${a}"/>`;
const can=(c,a)=>`
 <rect x="76" y="48" width="104" height="160" rx="16" fill="${c}"/>
 <ellipse cx="128" cy="52" rx="52" ry="14" fill="${light(c)}"/>
 <rect x="76" y="104" width="104" height="56" fill="${a}"/>
 <ellipse cx="128" cy="204" rx="52" ry="12" fill="${dark(c)}" opacity=".5"/>`;
const jar=(c,a)=>`
 <rect x="86" y="40" width="84" height="26" rx="8" fill="${dark(c)}"/>
 <path d="M76 66h104a10 10 0 0 1 10 10v124a12 12 0 0 1-12 12H78a12 12 0 0 1-12-12V76a10 10 0 0 1 10-10z" fill="${c}"/>
 <rect x="84" y="112" width="88" height="66" rx="10" fill="${a}"/>`;
const tub=(c,a)=>`
 <path d="M70 84h116l-12 118a14 14 0 0 1-14 12H96a14 14 0 0 1-14-12z" fill="${c}"/>
 <rect x="60" y="62" width="136" height="28" rx="12" fill="${a}"/>
 <rect x="88" y="120" width="80" height="48" rx="10" fill="${light(c)}" opacity=".75"/>`;
const pouch=(c,a)=>`
 <path d="M80 60h96a10 10 0 0 1 10 10v130a14 14 0 0 1-14 14H84a14 14 0 0 1-14-14V70a10 10 0 0 1 10-10z" fill="${c}"/>
 <rect x="70" y="48" width="116" height="20" rx="8" fill="${dark(c)}"/>
 <rect x="94" y="112" width="68" height="56" rx="10" fill="${a}"/>`;
const bag=(c,a)=>`
 <path d="M72 76c0-10 12-18 56-18s56 8 56 18v126a14 14 0 0 1-14 14H86a14 14 0 0 1-14-14z" fill="${c}"/>
 <path d="M72 76c14 10 34 14 56 14s42-4 56-14v14c-14 10-34 14-56 14s-42-4-56-14z" fill="${dark(c)}" opacity=".45"/>
 <rect x="92" y="122" width="72" height="56" rx="10" fill="${a}"/>`;
const box=(c,a)=>`
 <rect x="74" y="44" width="108" height="170" rx="10" fill="${c}"/>
 <rect x="74" y="44" width="108" height="26" rx="10" fill="${light(c)}"/>
 <rect x="90" y="96" width="76" height="72" rx="10" fill="${a}"/>`;
const tray=(c,a)=>`
 <rect x="52" y="86" width="152" height="94" rx="14" fill="${a}"/>
 <rect x="64" y="96" width="128" height="74" rx="10" fill="${c}"/>
 <rect x="64" y="96" width="128" height="30" rx="10" fill="#ffffff" opacity=".22"/>`;
const tube=(c,a)=>`
 <rect x="112" y="34" width="32" height="26" rx="6" fill="${dark(c)}"/>
 <path d="M96 58h64l10 132a20 20 0 0 1-20 22H106a20 20 0 0 1-20-22z" fill="${c}"/>
 <rect x="100" y="112" width="56" height="52" rx="9" fill="${a}"/>`;
const roll=(c,a)=>`
 <rect x="66" y="66" width="124" height="124" rx="16" fill="${c}"/>
 <ellipse cx="128" cy="70" rx="62" ry="18" fill="${light(c)}"/>
 <ellipse cx="128" cy="70" rx="22" ry="8" fill="${a}"/>
 <path d="M190 120c0 40-28 70-62 70" stroke="${dark(c)}" stroke-width="5" fill="none" opacity=".4"/>`;
const spray=(c,a)=>`
 <path d="M150 34h22l-6 30h-16z" fill="${dark(c)}"/>
 <path d="M104 46h46v26h-46z" fill="${dark(c)}"/>
 <path d="M104 72h48l16 30v104a12 12 0 0 1-12 12h-56a12 12 0 0 1-12-12V102z" fill="${c}"/>
 <rect x="96" y="126" width="64" height="58" rx="9" fill="${a}"/>`;
const bar=(c,a)=>`
 <rect x="48" y="88" width="160" height="82" rx="12" fill="${a}"/>
 <rect x="48" y="88" width="160" height="82" rx="12" fill="${c}" opacity=".92"/>
 ${[88,128,168].map(x=>`<rect x="${x}" y="88" width="4" height="82" fill="${dark(c)}" opacity=".5"/>`).join('')}
 <rect x="48" y="88" width="160" height="22" rx="12" fill="#ffffff" opacity=".16"/>`;
const sachet=(c,a)=>`
 <rect x="94" y="52" width="68" height="22" rx="6" fill="${dark(c)}"/>
 <rect x="88" y="72" width="80" height="140" rx="14" fill="${a}"/>
 <rect x="96" y="104" width="64" height="64" rx="10" fill="${c}"/>`;
const coffeebag=(c,a)=>`
 <path d="M80 70h96v132a14 14 0 0 1-14 14H94a14 14 0 0 1-14-14z" fill="${c}"/>
 <path d="M80 70l16-22h64l16 22z" fill="${dark(c)}"/>
 <ellipse cx="128" cy="140" rx="30" ry="22" fill="${a}"/>
 <path d="M128 120c-8 10-8 30 0 40" stroke="${dark(a)}" stroke-width="4" fill="none"/>`;
const teabox=(c,a)=>`
 <rect x="74" y="66" width="108" height="140" rx="10" fill="${c}"/>
 <rect x="74" y="66" width="108" height="24" rx="10" fill="${light(c)}"/>
 <rect x="94" y="110" width="68" height="60" rx="9" fill="${a}"/>
 <path d="M160 66l22-24" stroke="${dark(c)}" stroke-width="4"/><rect x="176" y="30" width="26" height="20" rx="4" fill="${a}"/>`;
const diaper=(c,a)=>`
 <path d="M60 78h136c-10 36-14 56-14 78 0 22-26 42-54 42s-54-20-54-42c0-22-4-42-14-78z" fill="${c}"/>
 <rect x="60" y="70" width="136" height="20" rx="8" fill="${a}"/>
 <path d="M96 152c20 8 44 8 64 0" stroke="${a}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
const soapbar=(c,a)=>`
 <rect x="56" y="94" width="144" height="74" rx="30" fill="${c}"/>
 <rect x="56" y="94" width="144" height="26" rx="20" fill="#ffffff" opacity=".2"/>
 <ellipse cx="128" cy="134" rx="34" ry="18" fill="${a}" opacity=".8"/>`;
const toothbrush=(c,a)=>`
 <rect x="112" y="56" width="32" height="150" rx="16" fill="${c}"/>
 <rect x="102" y="40" width="52" height="34" rx="10" fill="${a}"/>
 ${[0,1,2,3].map(i=>`<rect x="${106+i*12}" y="30" width="8" height="18" rx="4" fill="${dark(a)}"/>`).join('')}`;

// --- bakery, dairy, meat -----------------------------------------------------
const cheese=(c,a)=>`
 <path d="M44 176l96-62 76 26v40a10 10 0 0 1-10 10H54a10 10 0 0 1-10-10z" fill="${c}"/>
 <path d="M44 176l96-62 76 26-84 24z" fill="${light(c)}"/>
 ${[[92,162],[132,170],[176,164],[110,182]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="11" ry="8" fill="${a}" opacity=".7"/>`).join('')}`;
const egg=(c,a)=>`
 <path d="M44 148h168v50a12 12 0 0 1-12 12H56a12 12 0 0 1-12-12z" fill="${a}"/>
 ${[76,128,180].map(x=>`<ellipse cx="${x}" cy="${132}" rx="28" ry="34" fill="${c}"/>`).join('')}
 <path d="M44 148h168" stroke="${dark(a)}" stroke-width="5"/>`;
const loaf=(c,a)=>`
 <path d="M50 122c0-32 34-52 78-52s78 20 78 52v70a12 12 0 0 1-12 12H62a12 12 0 0 1-12-12z" fill="${c}"/>
 <path d="M50 122c0-32 34-52 78-52s78 20 78 52c-22-16-46-24-78-24s-56 8-78 24z" fill="${light(c)}"/>
 ${[104,140,176].map(x=>`<path d="M${x} 130v62" stroke="${a}" stroke-width="5" opacity=".45" stroke-linecap="round"/>`).join('')}`;
const bun=(c,a)=>`
 <path d="M44 170c0-46 38-78 84-78s84 32 84 78z" fill="${c}"/>
 <rect x="44" y="166" width="168" height="26" rx="13" fill="${a}"/>
 ${[[96,128],[128,116],[160,128],[112,146],[146,146]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="${light(c)}"/>`).join('')}`;
const bagel=(c,a)=>`
 <path fill-rule="evenodd" d="M128 60a80 80 0 1 0 .1 0zm0 52a28 28 0 1 1-.1 0z" fill="${c}"/>
 <path fill-rule="evenodd" d="M128 74a66 66 0 1 0 .1 0zm0 40a40 40 0 1 1-.1 0z" fill="${light(c)}" opacity=".45"/>
 ${[[100,96],[156,100],[92,176],[164,172],[128,186]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="${a}" opacity=".7"/>`).join('')}`;
const tortilla=(c,a)=>`
 <ellipse cx="128" cy="176" rx="88" ry="26" fill="${a}"/>
 <ellipse cx="128" cy="156" rx="88" ry="26" fill="${c}"/>
 <ellipse cx="128" cy="134" rx="88" ry="26" fill="${light(c)}"/>
 ${[[104,128],[150,132],[128,142]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="8" ry="5" fill="${a}" opacity=".5"/>`).join('')}`;
const croissant=(c,a)=>`
 <path d="M40 168c0-46 40-80 88-80s88 34 88 80c-16 0-28-10-40-18-14-10-28-18-48-18s-34 8-48 18c-12 8-24 18-40 18z" fill="${c}"/>
 <path d="M76 140c14-12 32-18 52-18s38 6 52 18" stroke="${a}" stroke-width="5" fill="none" opacity=".6"/>
 <ellipse cx="128" cy="170" rx="88" ry="10" fill="${a}" opacity=".35"/>`;
const baguette=(c,a)=>`
 <rect x="30" y="112" width="196" height="46" rx="23" fill="${c}" transform="rotate(-18 128 135)"/>
 ${[-56,-20,16,52].map(d=>`<path d="M${128+d} ${118+d*0.32}l16-16" stroke="${a}" stroke-width="6" stroke-linecap="round"/>`).join('')}`;
const pastry=(c,a)=>`
 <path d="M76 140h104l-10 66a12 12 0 0 1-12 10H98a12 12 0 0 1-12-10z" fill="${a}"/>
 ${[92,110,128,146,164].map(x=>`<path d="M${x} 146v62" stroke="${dark(a)}" stroke-width="3" opacity=".4"/>`).join('')}
 <path d="M70 140c0-32 26-52 58-52s58 20 58 52z" fill="${c}"/>
 <circle cx="104" cy="112" r="8" fill="${light(c)}"/><circle cx="150" cy="106" r="7" fill="${light(c)}"/>`;
const pizza=(c,a)=>`
 <circle cx="128" cy="140" r="82" fill="${a}"/>
 <circle cx="128" cy="140" r="68" fill="${c}"/>
 ${[[100,112],[154,110],[128,146],[96,166],[160,162]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="13" fill="${dark(c)}"/>`).join('')}`;
const steak=(c,a)=>`
 <path d="M52 134c0-34 34-56 78-56s74 20 74 52c0 36-30 62-74 62s-78-24-78-58z" fill="${c}"/>
 <path d="M84 126c16-12 40-16 62-10" stroke="${a}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>
 <path d="M92 158c20-8 44-10 64-4" stroke="${a}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>`;
const poultry=(c,a)=>`
 <path d="M70 128c0-38 30-62 66-62 34 0 54 22 54 50 0 44-36 76-72 76-30 0-48-26-48-64z" fill="${c}"/>
 <path d="M96 116c18-12 42-14 62-6" stroke="${a}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>`;
const fillet=(c,a)=>`
 <path d="M40 148c24-38 66-56 108-56 34 0 58 14 68 30-14 30-54 56-102 56-38 0-62-14-74-30z" fill="${c}"/>
 ${[0,1,2,3].map(i=>`<path d="M${76+i*30} ${120+i*4}c10 14 12 30 8 44" stroke="${a}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".65"/>`).join('')}`;
const shrimp=(c,a)=>`
 <path d="M172 78c-56 0-96 30-96 70 0 30 24 50 54 50 24 0 40-12 40-28 0-14-10-22-24-22-10 0-16 6-16 12" fill="none" stroke="${c}" stroke-width="34" stroke-linecap="round"/>
 <path d="M172 78c-56 0-96 30-96 70" fill="none" stroke="${a}" stroke-width="10" stroke-linecap="round" opacity=".6"/>`;
const bacon=(c,a)=>[0,1,2].map(i=>`
 <path d="M40 ${92+i*38}c30-18 56 18 88 0s58 18 88 0" fill="none" stroke="${a}" stroke-width="26" stroke-linecap="round"/>
 <path d="M40 ${92+i*38}c30-18 56 18 88 0s58 18 88 0" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>`).join('');
const sausage=(c,a)=>[0,1].map(i=>`
 <rect x="${44+i*8}" y="${96+i*44}" width="168" height="40" rx="20" fill="${c}"/>
 <rect x="${44+i*8}" y="${96+i*44}" width="168" height="14" rx="7" fill="${light(c)}" opacity=".5"/>
 <rect x="${40+i*8}" y="${104+i*44}" width="12" height="24" rx="6" fill="${a}"/>`).join('');
const deli=(c,a)=>[0,1,2].map(i=>`
 <ellipse cx="${106+i*16}" cy="${170-i*26}" rx="62" ry="32" fill="${i%2?a:c}"/>
 <ellipse cx="${106+i*16}" cy="${170-i*26}" rx="40" ry="18" fill="${light(i%2?a:c)}" opacity=".45"/>`).join('');

export const TEMPLATES={
 round,berry,strawberry,banana,citrus,melon,pear,pineapple,grapes,leafy,floret,root,bulb,pepper,longveg,mushroom,corn,avocado,herb,
 carton,jug,bottle,can,jar,tub,pouch,bag,box,tray,tube,roll,spray,bar,sachet,coffeebag,teabox,diaper,soapbar,toothbrush,
 cheese,egg,loaf,bun,bagel,tortilla,croissant,baguette,pastry,pizza,steak,poultry,fillet,shrimp,bacon,sausage,deli,
};

export function renderSvg(template,colour,accent){
 const draw=TEMPLATES[template];
 if(!draw)throw new Error(`No art template named "${template}"`);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
 <defs><filter id="s" x="-25%" y="-25%" width="150%" height="150%">
  <feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#1f3b2f" flood-opacity="0.22"/>
 </filter></defs>
 <g filter="url(#s)">${draw(colour,accent)}</g>
</svg>`;
}
