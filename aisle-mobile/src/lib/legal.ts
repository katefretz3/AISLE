// Legal content.
//
// ⚠️  THESE ARE DRAFTS, NOT LEGAL ADVICE. They were written to describe what
// this application actually does — device-local storage, no accounts, coarse
// location only, unverified ingredient data — so a lawyer has something
// accurate to review rather than a generic template. Have them reviewed before
// you publish, and fill in OPERATOR below first.
//
// Both the Terms and the Privacy Policy are structured data rather than prose
// blobs so the screens, the contents list and any future export all read from
// one source, and so a diff shows exactly which clause changed.

/** Fill these in before release. `PLACEHOLDER` marks anything still unset. */
export const OPERATOR={
 legalName:'PLACEHOLDER — your registered business or personal legal name',
 tradingName:'Aisle',
 jurisdiction:'Ontario, Canada',
 contactEmail:'PLACEHOLDER — support@yourdomain.ca',
 privacyEmail:'PLACEHOLDER — privacy@yourdomain.ca',
 postalAddress:'PLACEHOLDER — your business mailing address',
 website:'PLACEHOLDER — https://yourdomain.ca',
 effectiveDate:'PLACEHOLDER — the date you publish',
 lastUpdated:'20 September 2026',
} as const;

export const PLACEHOLDER_FIELDS=Object.entries(OPERATOR)
 .filter(([,value])=>value.startsWith('PLACEHOLDER'))
 .map(([key])=>key);
export const hasPlaceholders=PLACEHOLDER_FIELDS.length>0;

export type LegalSection={id:string;heading:string;body:string[];list?:string[];callout?:string};
export type LegalDocument={
 id:'terms'|'privacy'|'sources';
 title:string;
 summary:string;
 lastUpdated:string;
 sections:LegalSection[];
};

const APP=OPERATOR.tradingName;

// ---------------------------------------------------------------------------
export const TERMS:LegalDocument={
 id:'terms',
 title:'Terms of Use',
 summary:`The agreement between you and ${OPERATOR.legalName} for using ${APP}. It explains what the app does, what it deliberately does not do, and where responsibility sits.`,
 lastUpdated:OPERATOR.lastUpdated,
 sections:[
  {id:'acceptance',heading:'1. Accepting these terms',
   body:[`These Terms of Use are an agreement between you and ${OPERATOR.legalName} ("we", "us"), who operate ${APP} (the "app"). By installing or using the app you accept them. If you do not accept them, please do not use the app.`,
    `If you are using the app on behalf of a household, you confirm you are allowed to accept these terms for that use.`]},

  {id:'what-it-is',heading:'2. What Aisle is, and what it is not',
   body:[`${APP} helps you plan a grocery shop. It reads price information that retailers publish publicly, matches it against the list you have written, and shows you what it found.`,
    `It is a planning tool. It is not a shop, a marketplace, or an agent acting for you. We do not sell groceries, take orders, hold stock, process payments, or arrange delivery. Nothing in the app is an offer to sell anything.`],
   callout:`Prices in the app are observations of published catalogue data at the moment they were collected. They are not quotes, not guarantees, and not confirmed prices at any particular shop.`},

  {id:'eligibility',heading:'3. Where the app works',
   body:[`The app covers grocery retailers in ${OPERATOR.jurisdiction} only. Store discovery, distances and price collection are all scoped to that province. If you use it elsewhere, it will not have useful data for you.`,
    `You must be old enough to form a binding contract where you live. The app is not directed at children.`]},

  {id:'your-data',heading:'4. Your list, your device',
   body:[`The app does not require an account. Your list, your preferences, your receipts and your shopping history are stored on your device.`,
    `Because there is no account, we cannot recover your data if you delete the app, lose the device, or clear its storage. Keeping a copy of anything you need is your responsibility.`,
    `How information is handled is described in the Privacy Policy, which forms part of these terms.`]},

  {id:'acceptable-use',heading:'5. Acceptable use',
   body:[`You agree not to:`],
   list:[`use the app for anything unlawful, or to infringe anyone else's rights`,
    `attempt to break, overload, probe or circumvent the app's security or its rate limits`,
    `scrape, resell or redistribute price data obtained through the app`,
    `reverse engineer the app except to the extent that law expressly permits`,
    `use the app to misrepresent a retailer's prices, stock or terms`]},

  {id:'prices',heading:'6. Prices, availability and retailers',
   body:[`Prices shown come from catalogues that retailers publish publicly. Retailers change prices, run promotions, restrict offers to certain locations, and sell out, all without notice to us.`,
    `Online catalogue prices are not the same as the price at a particular branch. The app says so where it shows them, and it will not direct you to a shop on the basis of an online price.`,
    `We do not control retailers and we are not responsible for their prices, their stock, their websites, their delivery terms or anything you buy from them. Your purchase is between you and the retailer.`,
    `Where the app cannot verify a price it shows nothing rather than an estimate. A gap in the app means we do not know, not that an item is unavailable.`]},

  {id:'food-safety',heading:'7. Food, ingredients and allergies',
   body:[`The app does not hold verified ingredient or allergen data. It cannot tell you that a product is safe for an allergy, free from an ingredient, or suitable for a medical diet, and it does not try to.`,
    `Dietary preferences and allergen settings change which suggestions the app offers. They are a convenience, not a safety control.`],
   callout:`Always read the product label. ${APP} is not a medical, allergy-safety or dietary-advice tool, and must not be relied on as one.`},

  {id:'ai',heading:'8. Automated matching',
   body:[`The app uses automated matching, which may include a language model, to decide which catalogue product corresponds to an item on your list. That matching can be wrong.`,
    `Matches are proposals until you confirm them, and the app shows the retailer, the product title, the pack size and a link to the source so you can check. Confirming a match is your decision.`,
    `The model is never the source of a price, a total or a distance. Those come from data the app collected and can show you.`]},

  {id:'ip',heading:'9. Intellectual property',
   body:[`The app, its interface, its artwork and its underlying software belong to us or to our licensors, and are protected by copyright and other rights. These terms do not transfer any of those rights to you.`,
    `You keep everything you create in the app — your lists, your notes, your receipts.`,
    `Third-party data used in the app remains the property of its owners and is used under the licences described on the Data sources page.`]},

  {id:'availability',heading:'10. Changes and availability',
   body:[`We may change, suspend or discontinue any part of the app, including which retailers it can read, at any time. Public data sources can be withdrawn by their owners without notice to us.`,
    `We do not promise the app will be available without interruption or free of errors.`]},

  {id:'disclaimer',heading:'11. Disclaimers',
   body:[`To the fullest extent the law allows, the app is provided "as is" and "as available", without warranties of any kind, whether express, implied or statutory, including any implied warranty of merchantability, fitness for a particular purpose, accuracy, or non-infringement.`,
    `Some jurisdictions do not allow the exclusion of certain warranties. Where that applies to you, the exclusions above apply only so far as the law permits, and nothing in these terms limits your rights under consumer protection legislation that cannot be waived.`]},

  {id:'liability',heading:'12. Limitation of liability',
   body:[`To the fullest extent the law allows, we are not liable for indirect, incidental, special, consequential or punitive damages, or for lost savings, lost profits, lost data, or the cost of substitute goods, arising from your use of the app.`,
    `Where liability cannot be excluded, our total liability to you for all claims relating to the app is limited to the greater of the amount you paid us for the app in the twelve months before the claim, or CAD $50.`,
    `Nothing here limits liability for fraud, for death or personal injury caused by negligence, or for anything else that cannot be limited by law.`]},

  {id:'indemnity',heading:'13. Your responsibility to us',
   body:[`You agree to cover our reasonable losses and legal costs if they arise from your misuse of the app or from your breach of these terms.`]},

  {id:'law',heading:'14. Governing law',
   body:[`These terms are governed by the laws of ${OPERATOR.jurisdiction} and the federal laws of Canada that apply there. The courts of ${OPERATOR.jurisdiction} have jurisdiction, without affecting any right you have to bring a claim where you live.`]},

  {id:'changes',heading:'15. Changes to these terms',
   body:[`We may update these terms. When we make a material change we will update the date at the top of this page and show a notice in the app. Continuing to use the app after a change means you accept the updated terms.`]},

  {id:'contact-terms',heading:'16. Contact',
   body:[`Questions about these terms: ${OPERATOR.contactEmail}.`,
    `${OPERATOR.legalName}, ${OPERATOR.postalAddress}.`]},
 ],
};

// ---------------------------------------------------------------------------
export const PRIVACY:LegalDocument={
 id:'privacy',
 title:'Privacy Policy',
 summary:`What ${APP} does with information about you. The short version: your list stays on your device, there is no account, and we do not run analytics or sell anything about you.`,
 lastUpdated:OPERATOR.lastUpdated,
 sections:[
  {id:'summary',heading:'1. The short version',
   body:[`${APP} is built to need as little information about you as possible.`],
   list:[`There is no account and no sign-in. We do not know who you are.`,
    `Your list, preferences, receipts and history are stored on your device, not on our servers.`,
    `We do not run analytics, advertising SDKs or tracking of any kind.`,
    `We never sell, rent or share your information.`,
    `Behavioural learning is off unless you turn it on, and you can erase it at any time.`]},

  {id:'who',heading:'2. Who is responsible',
   body:[`${OPERATOR.legalName} is responsible for the app and for the limited processing described here. You can reach us at ${OPERATOR.privacyEmail}, or by post at ${OPERATOR.postalAddress}.`]},

  {id:'on-device',heading:'3. What stays on your device',
   body:[`The following is written to your device's private app storage and is not transmitted to us:`],
   list:[`your grocery list, quantities and item locks`,
    `your preferences: name, household size, budget, cadence, city, radius, transport, preferred chains`,
    `your dietary preferences, allergen settings, excluded products and protected brands`,
    `receipt photographs you add, and the totals you enter`,
    `prices you read off a shelf and typed in: the amount, the size on the label, the shop and the date. These are your own readings, kept separate from prices Aisle collected itself, never presented as verified, and deleted automatically after a year`,
    `for each shop you save: which items were in it, their quantities, and any per-item prices you typed. This is how the app can tell you what you usually buy and what you last paid, and it is kept whether or not learning is on — it is a record of a receipt you chose to save, not an inference about you. Deleting the trip deletes it.`,
    `your shopping history and, if you turn learning on, the choices it records`,
    `cached retailer prices, which expire after 24 hours`]},

  {id:'leaves',heading:'4. What leaves your device, and why',
   body:[`Three kinds of request go out from the app. None of them carries your name, your list or your health information.`],
   list:[`**Nearby shops.** To find grocery stores near you, the app sends a coarse search area — rounded to roughly a 5 km cell, never your exact position — to an OpenStreetMap query service. It does not send your pin, your list or your preferences.`,
    `**Retailer catalogues.** The app requests publicly published product and price pages from retailer websites. These are ordinary web requests for public pages; the retailer's server sees the request and your IP address, as it would for any visit.`,
    `**Automated matching (only if enabled).** If the operator has configured a reasoning service, the app sends the item names on your list and the catalogue results it collected, so the model can decide which product matches which line. It does not send your name, location, receipts, health information or history. If no service is configured, this never happens and the app matches with built-in rules instead.`]},

  {id:'never',heading:'5. What we do not collect',
   body:[`We do not collect or receive:`],
   list:[`your name, email address, phone number or postal address`,
    `your precise location or any background location`,
    `advertising identifiers, device fingerprints or analytics events`,
    `your contacts, calendar, photos other than receipts you choose to add, or any other app's data`,
    `payment information of any kind`]},

  {id:'learning',heading:'6. Learning from your choices',
   body:[`If you turn on "Learn from my shopping choices", the app records events on your device: which retailer product you confirmed for a list item, which suggestions you dismissed, and which purchases you recorded. It uses them to order suggestions — a brand you keep choosing rises, a repeat purchase becomes a reminder.`,
    `This stays on your device. It is off by default. Turning it off stops both the recording and the use of these events immediately, and the Forget control erases them permanently along with any preferences learned from them.`,
    `Allergies and dietary restrictions are never inferred from behaviour. They are only ever what you set yourself.`]},

  {id:'receipts',heading:'7. Receipts and photographs',
   body:[`A saved shop records the store, the date, the total you entered, and the items that were on your list for that shop with any per-item prices you typed. The app reads that record back to you as your own price history and to work out how often you buy something. It never leaves your device and is not used to build a profile for anyone else.`,
    `If you add a receipt, the image is stored in the app's private storage on your device. It is not uploaded, and no text is extracted from it automatically. Totals are whatever you type in.`,
    `Camera and photo-library access is requested only when you choose to add a receipt, and you can refuse it without losing any other function.`]},

  {id:'legal-basis',heading:'8. Consent and legal basis',
   body:[`Under Canada's Personal Information Protection and Electronic Documents Act (PIPEDA), we rely on your consent, which you give by choosing to use a feature. Turning on learning, adding a receipt or allowing location are each separate, reversible choices.`,
    `Because the information described above is held on your device rather than by us, most of it is never disclosed to us at all.`]},

  {id:'retention',heading:'9. How long things are kept',
   body:[`Your data stays on your device until you delete it or uninstall the app. Cached retailer prices expire after 24 hours. Store directory results are cached for 24 hours. Learning events are capped at the most recent 200 and can be erased at any time from Account settings.`,
    `Uninstalling the app removes its private storage, including your list and receipts. We cannot recover it afterwards.`]},

  {id:'children',heading:'10. Children',
   body:[`The app is not directed at children and we do not knowingly collect information from them. Since the app has no account and collects no identifying information, it does not build a profile of any user, child or adult.`]},

  {id:'rights',heading:'11. Your choices and your rights',
   body:[`You can see and change everything the app holds about you from Account settings: your profile, your household, your budget, your location, your dietary settings, and what the app has learned.`,
    `Because your information is on your device and not with us, you exercise access, correction and deletion directly in the app rather than by making a request to us. Where we do hold personal information about you — for example if you email us — you may ask for access to it, ask us to correct it, or withdraw consent, by writing to ${OPERATOR.privacyEmail}.`,
    `If you are not satisfied with our response, you can complain to the Office of the Privacy Commissioner of Canada.`]},

  {id:'security',heading:'12. Security',
   body:[`Your data sits in the app's private storage, protected by the operating system's app sandbox and by your device passcode or biometric lock. Requests the app makes use encrypted HTTPS connections, and the app will only contact retailer and directory addresses on an allow-list.`,
    `No system is perfectly secure. Keeping your device locked and up to date is the most effective protection for information held on it.`]},

  {id:'third-parties',heading:'13. Services the app contacts',
   body:[`The app contacts these third parties. Each has its own privacy practices, which we do not control.`],
   list:[`**OpenStreetMap / Overpass query service** — receives a coarse search area to return nearby shops.`,
    `**Retailer websites** — receive requests for their public catalogue pages.`,
    `**Map tile provider** — if you open the map, it receives the area you are viewing in order to serve tiles.`,
    `**Reasoning service (optional)** — receives list item names and collected catalogue results, only if the operator has configured one.`]},

  {id:'changes-privacy',heading:'14. Changes to this policy',
   body:[`We will update this page if our practices change, and update the date at the top. Material changes will be shown in the app. If a change would involve collecting something new about you, we will ask first.`]},

  {id:'contact-privacy',heading:'15. Contact',
   body:[`Privacy questions and requests: ${OPERATOR.privacyEmail}.`,
    `${OPERATOR.legalName}, ${OPERATOR.postalAddress}.`]},
 ],
};

// ---------------------------------------------------------------------------
export const SOURCES:LegalDocument={
 id:'sources',
 title:'Data sources & attribution',
 summary:`Where the information in ${APP} comes from, and the licences it is used under. Several of these require attribution, which is why this page exists.`,
 lastUpdated:OPERATOR.lastUpdated,
 sections:[
  {id:'stores',heading:'Shop locations',
   body:[`Nearby grocery shops come from OpenStreetMap, queried through a public Overpass endpoint. Map data is © OpenStreetMap contributors, available under the Open Database Licence (ODbL).`,
    `Coverage and opening hours may be incomplete, and distances shown are straight-line, not driving routes.`]},

  {id:'city-coords',heading:'City coordinates',
   body:[`Reference coordinates for Ontario cities were retrieved from the Open-Meteo geocoding API, whose place data comes from GeoNames and is used under CC BY 4.0.`]},

  {id:'prices',heading:'Retailer prices',
   body:[`Prices are read from catalogue pages that retailers publish publicly on their own websites. Each price in the app carries a link to the page it came from, the time it was read and a checksum of the response.`,
    `These are online catalogue observations. They are not branch prices, not confirmed stock, and not a checkout total. Major Canadian grocery chains do not publish a machine-readable public price feed, and the app reports those shops without prices rather than estimating them.`]},

  {id:'photos',heading:'Product photographs',
   body:[`Where a product photograph is present it was retrieved from an openly licensed source and is credited in the app's bundled credits file, which records the title, creator, licence and original page for each image.`,
    `Items without a photograph use an illustration generated inside this project, which is ours.`]},

  {id:'map-tiles',heading:'Map tiles',
   body:[`Map tiles are served by OpenStreetMap's tile servers and carry their own attribution, which stays visible on the map. Offline tiles are not downloaded.`]},

  {id:'ingredients',heading:'What is deliberately absent',
   body:[`The app holds no verified ingredient, allergen or nutrition data, because no source it can read provides it reliably. Rather than show unverified information on a subject where being wrong matters, it shows none and says so.`]},
 ],
};

export const DOCUMENTS:LegalDocument[]=[TERMS,PRIVACY,SOURCES];
export const documentById=(id:string)=>DOCUMENTS.find(d=>d.id===id)??null;
