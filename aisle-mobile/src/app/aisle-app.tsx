'use client';

import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUser,
  Download,
  FileText,
  HelpCircle,
  House,
  Info,
  ListChecks,
  ListPlus,
  LoaderCircle,
  MapPin,
  Plus,
  ReceiptText,
  RefreshCw,
  Scale,
  ShoppingBag,
  ShoppingBasket,
  Sparkles,
  Store as StoreIcon,
  TriangleAlert,
  Wallet,
  X,
} from 'lucide-react';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {Toaster} from '@/components/ui/sonner';
import {toast} from 'sonner';
import Onboarding from './onboarding';
import AgentWorkspace from '@/components/agent-workspace';
import CategoryBrowser from '@/components/category-browser';
import {useAgentRun} from '@/lib/use-agent-run';
import {pruneSavedLists, type SavedList} from '@/lib/catalog';
import {chooseBasis, unitPriceCents, formatUnitPrice} from '@/lib/unit-price';
import BasketCompare from '@/components/basket-compare';
import ShopChecklist, {type ChecklistOrder} from '@/components/shop-checklist';
import ListStarters from '@/components/list-starters';
import DueThisWeek from '@/components/due-this-week';
import ShelfPriceCapture from '@/components/shelf-price-capture';
// Not needed to open the app, so each loads the first time it is shown.
const Account = lazy(() => import('./account'));
const Legal = lazy(() => import('./legal'));
import {
  loadState,
  saveState,
  uploadReceipt,
  openReceiptFile,
  captureReceipt,
  shareList,
  isDevice,
  sweepShelfPhotos,
  sweepReceipts,
  eraseStoredFiles,
  deleteShelfPhoto,
} from '@/lib/persistence';
import {
  personalSuggestions,
  recordChoice,
  starterList,
  productById,
  stores,
  money,
  initialState,
  parseList,
  type Store,
  type UserState,
  type ListItem,
  type Preferences,
  type Trip,
  type TripLine,
} from '@/lib/catalog';
import {priceHistory} from '@/lib/shopping-history';
import {
  recordShelfPrice,
  removeShelfPrice,
  latestShelfPrice,
  resolveLinePrice,
  tallyProvenance,
  referencedPhotoIds,
} from '@/lib/shelf-prices';
import {valueSwaps, totalSaving, type ValueSwap} from '@/lib/value-swaps';
// One version number: the release check holds iOS and Android to this too.
import {version as APP_VERSION} from '../../package.json';
import {ProductArt} from '@/components/product-art';
import {cx, newId, Choice, Empty, ViewLoading} from './parts';
import {ItemRow, type ItemRowContext} from './item-row';
import {} from './home-cards';
import {useHousehold} from './use-household';
import {useAppearance} from '@/lib/appearance';
import SpendingView from './views/spending-view';
import ListView from './views/list-view';
import HelpDialog from './help-dialog';

type View = 'home' | 'list' | 'compare' | 'spending' | 'account' | 'legal' | 'shop';
// One set of names for the main places, shared by the sidebar and the tab bar.
const nav = [
  {id: 'home', label: 'Home', icon: House},
  {id: 'list', label: 'List', icon: ListChecks},
  {id: 'compare', label: 'Prices', icon: StoreIcon},
  {id: 'spending', label: 'Spending', icon: Wallet},
  {id: 'account', label: 'Account', icon: CircleUser},
] as const;
export default function AisleApp() {
  const household = useHousehold();
  const appearance = useAppearance();
  // Toasts come down from the top on a phone, clear of the tab bar and of the
  // controls a thumb is using; bottom-right on a wide screen.
  const [phone, setPhone] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(max-width: 760px)').matches,
  );
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const query = matchMedia('(max-width: 760px)');
    const update = () => setPhone(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const {state, ready, loadError, saveStatus, savingError, setSavingError, commit} = household;
  // The MCP tool reads the latest run without re-subscribing on every change.
  const agentRef = useRef<{run: typeof agent.run; baskets: typeof agent.baskets}>(null);
  const [view, setView] = useState<View>('home');
  const [legalDoc, setLegalDoc] = useState<string | null>(null),
    [resetOpen, setResetOpen] = useState(false);
  const [startersOpen, setStartersOpen] = useState(false);
  const [captureItem, setCaptureItem] = useState<ListItem | null>(null);
  const [checklistOrder, setChecklistOrder] = useState<ChecklistOrder>(() => {
    try {
      return (localStorage.getItem('aisle.checklistOrder') as ChecklistOrder) || 'aisle';
    } catch {
      return 'aisle';
    }
  });
  function changeChecklistOrder(next: ChecklistOrder) {
    setChecklistOrder(next);
    try {
      localStorage.setItem('aisle.checklistOrder', next);
    } catch {
      /* storage unavailable; the order still applies this session */
    }
  }
  const [onboard, setOnboard] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false),
    [paste, setPaste] = useState(''),
    [importMode, setImportMode] = useState('browse');
  const [help, setHelp] = useState(false),
    [swapsOpen, setSwapsOpen] = useState(false),
    [clearOpen, setClearOpen] = useState(false),
    [receiptOpen, setReceiptOpen] = useState(false),
    [historyDetail, setHistoryDetail] = useState<Trip | null>(null);
  const [receiptStore, setReceiptStore] = useState('food-basics'),
    [receiptTotal, setReceiptTotal] = useState(''),
    [receiptDate, setReceiptDate] = useState(''),
    [receiptId, setReceiptId] = useState<string | undefined>(),
    [receiptName, setReceiptName] = useState(''),
    [uploading, setUploading] = useState(false),
    [actuals, setActuals] = useState<Record<string, string>>({});
  const [matchingItem, setMatchingItem] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const agent = useAgentRun(state, ready && state.onboarded);
  // What this household has actually paid. For the 17 Ontario chains Aisle
  // cannot read, this is the only price any of their items will ever carry.
  const paidHistory = useMemo(() => priceHistory(state.trips), [state.trips]);

  // Photos and receipts are dropped by several routes (a price removed by hand
  // or aged out, a trip deleted, everything erased), and each would otherwise
  // leave its image behind. Reconcile whenever the set of referenced ids changes.
  const photoKeep = useMemo(() => [...referencedPhotoIds(state)].sort().join(','), [state]);
  const receiptKeep = useMemo(
    () =>
      state.trips
        .map(t => t.receiptId)
        .filter(Boolean)
        .sort()
        .join(','),
    [state.trips],
  );
  useEffect(() => {
    if (!ready) return;
    void sweepShelfPhotos(photoKeep.split(',').filter(Boolean));
    void sweepReceipts(receiptKeep.split(',').filter(Boolean));
  }, [ready, photoKeep, receiptKeep]);

  agentRef.current = {run: agent.run, baskets: agent.baskets};
  const best = agent.best
    ? {id: agent.best.sourceId, name: agent.best.name, subtotal: agent.best.subtotal}
    : undefined;
  // One shape for "a basket you are shopping from", whichever engine produced it.
  // `lineTotal` is always the cost of that whole list line, packs included.
  const fromAgent = (basket: ReturnType<typeof agent.basketFor>) =>
    basket
      ? {
          id: basket.sourceId,
          name: basket.name,
          subtotal: basket.subtotal,
          complete: basket.complete,
          total: basket.total,
          priced: basket.priced,
          lineTotal: (itemId: string) => {
            const line = basket.lines.find(l => l.itemId === itemId);
            return line?.offer ? line.lineTotal : null;
          },
          unitPrice: (itemId: string) => {
            const offer = basket.lines.find(l => l.itemId === itemId)?.offer;
            if (!offer) return null;
            const basis = chooseBasis([offer.pack]);
            return formatUnitPrice(unitPriceCents(offer.price, offer.pack, basis), basis);
          },
        }
      : null;
  const activeBasket = useMemo(
    () => fromAgent(agent.basketFor(state.activeShop)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.activeShop, state.items, agent.baskets],
  );
  const headlineBasket = useMemo(
    () => fromAgent(agent.best),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [agent.best, state.items],
  );
  // The shop being walked. Shelf prices compare within a shop, so this decides
  // which captured price is the relevant one.
  const shopStoreId = state.activeShop ?? '';
  const lineFor = useCallback(
    (item: ListItem, shopping: boolean) =>
      resolveLinePrice(
        item,
        (shopping ? activeBasket : headlineBasket)?.lineTotal(item.id) ?? null,
        state,
        shopping ? shopStoreId : undefined,
      ),
    [activeBasket, headlineBasket, state, shopStoreId],
  );
  // Better-value suggestions, drawn from the offers actually collected for the
  // basket in hand. With nothing collected there is nothing to suggest.
  const swaps = useMemo(() => {
    const basket = agent.basketFor(state.activeShop) ?? agent.best;
    if (!basket || !agent.run) return [];
    const current = new Map(
      basket.lines.flatMap(line =>
        line.offer
          ? [
              [
                line.itemId,
                {offer: line.offer, packs: line.packs, lineTotal: line.lineTotal},
              ] as const,
            ]
          : [],
      ),
    );
    return valueSwaps(state, agent.run.offers, new Map(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, agent.run, agent.best, agent.baskets, state.activeShop]);
  const potential = totalSaving(swaps);
  const active = activeBasket;
  const checked = state.items.filter(i => i.checked).length;

  async function load() {
    const loaded = await household.load();
    if (loaded) setOnboard(!loaded.onboarded);
  }
  useEffect(() => {
    void load();
    const handle = () => {
      const raw = location.hash.slice(1);
      const [head, tail] = raw.split('/');
      if (head === 'legal') {
        setView('legal');
        setLegalDoc(tail ?? null);
        return;
      }
      // `preferences` was the old name for this screen.
      const name = head === 'account' ? 'account' : head;
      if (['home', 'list', 'compare', 'spending', 'account', 'shop'].includes(name))
        setView(name as View);
    };
    handle();
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
    // Once, on mount: the household is loaded a single time and later reloads
    // are explicit (the Try again and Reload buttons).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function go(v: View) {
    if (v !== 'legal') setLegalDoc(null);
    setView(v);
    window.history.replaceState(null, '', `#${v}`);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  function goLegal(docId: string | null) {
    setLegalDoc(docId);
    setView('legal');
    window.history.replaceState(null, '', docId ? `#legal/${docId}` : '#legal');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }
  function prefs(p: Partial<Preferences>) {
    commit(s => ({...s, prefs: {...s.prefs, ...p}}));
  }
  function addProduct(id: string) {
    if (matchingItem) {
      commit(s => ({
        ...s,
        items: s.items.map(i =>
          i.id === matchingItem ? {...i, productId: id, name: productById[id].name} : i,
        ),
      }));
      setMatchingItem(null);
      setCatalogOpen(false);
      toast.success('Product matched. Your baskets are updated.');
      return;
    }
    commit(s => {
      const existing = s.items.find(i => i.productId === id);
      return {
        ...recordChoice(s, 'added', id),
        items: existing
          ? s.items.map(i =>
              i.id === existing.id ? {...i, qty: Math.min(99, i.qty + 1), checked: false} : i,
            )
          : [
              ...s.items,
              {
                id: newId(),
                productId: id,
                name: productById[id].name,
                qty: 1,
                checked: false,
                locked: false,
              },
            ],
      };
    });
    toast.success(`${productById[id].name} added to your list`);
  }
  function applyStarter(
    rows: {productId: string | null; name: string; qty: number}[],
    replace: boolean,
  ) {
    commit(s => {
      const fresh = rows.map((row, index) => ({
        id: `${Date.now().toString(36)}-${index}`,
        productId: row.productId,
        name: row.name,
        qty: row.qty,
        checked: false,
        locked: false,
      }));
      if (replace) return {...s, items: fresh.slice(0, 150), activeShop: null};
      const items = s.items.map(item => ({...item}));
      for (const row of fresh) {
        // Adding something already on the list raises its quantity instead of
        // creating a duplicate line to tick twice in the shop.
        const existing = row.productId ? items.find(i => i.productId === row.productId) : undefined;
        if (existing) existing.qty = Math.min(99, existing.qty + row.qty);
        else items.push(row);
      }
      return {...s, items: items.slice(0, 150)};
    });
    toast.success(
      replace
        ? `Your list is now ${rows.length} item${rows.length === 1 ? '' : 's'}.`
        : `${rows.length} item${rows.length === 1 ? '' : 's'} added.`,
    );
  }

  /** Keep a copy of a finished shop so the next list can start from it. */
  function snapshotList(state: UserState, name: string, auto: boolean): SavedList[] {
    if (!state.items.length) return state.savedLists ?? [];
    const snapshot: SavedList = {
      id: newId(),
      name,
      savedAt: new Date().toISOString(),
      auto,
      items: state.items.map(item => ({...item, checked: false})),
    };
    return pruneSavedLists([snapshot, ...(state.savedLists ?? [])]);
  }

  function addText() {
    const parsed = parseList(paste);
    if (!parsed.length) return;
    commit(s => {
      const items = s.items.map(i => ({...i}));
      for (const p of parsed) {
        const old = items.find(i => p.productId && i.productId === p.productId);
        if (old) old.qty = Math.min(99, old.qty + p.qty);
        else items.push({...p, id: newId(), checked: false, locked: false});
      }
      return {...s, items: items.slice(0, 150)};
    });
    setCatalogOpen(false);
    setPaste('');
    go('list');
    toast.success(`${parsed.length} items added. Check the sizes and any unmatched items.`);
  }
  function updateItem(id: string, p: Partial<ListItem>) {
    commit(s => ({...s, items: s.items.map(i => (i.id === id ? {...i, ...p} : i))}));
  }
  function removeItem(item: ListItem) {
    commit(s => ({...s, items: s.items.filter(i => i.id !== item.id)}));
    toast('Item removed', {
      action: {label: 'Undo', onClick: () => commit(s => ({...s, items: [...s.items, item]}))},
    });
  }
  /** Taking a suggestion records the cheaper offer as this item's choice at that
   *  retailer. It never edits the list itself: the household asked for the
   *  product, not for a different one. */
  function applySwap(swap: ValueSwap) {
    commit(s => {
      const selections = {
        ...s.offerSelections,
        [swap.item.id]: {...s.offerSelections?.[swap.item.id]},
      };
      selections[swap.item.id][swap.to.offer.sourceId] = swap.to.offer.id;
      const product = swap.item.productId ? productById[swap.item.productId] : null;
      return {
        ...s,
        offerSelections: selections,
        events: s.prefs.learning
          ? [
              ...s.events,
              {
                category: product?.category ?? 'Other',
                action: 'accepted_swap',
                productId: swap.item.productId ?? undefined,
                offerId: swap.to.offer.id,
                brand: swap.to.offer.brand,
                storeId: swap.to.offer.sourceId,
                date: new Date().toISOString(),
              },
            ].slice(-200)
          : s.events,
      };
    });
    toast.success(
      `Switched to ${swap.to.offer.title} at ${swap.retailer}. That line is ${money(swap.saving)} less.`,
    );
  }
  function rejectSwap(swap: ValueSwap) {
    commit(s => ({
      ...s,
      items: s.items.map(i => (i.id === swap.item.id ? {...i, locked: true} : i)),
      events: s.prefs.learning
        ? [
            ...s.events,
            {
              category: swap.item.productId
                ? (productById[swap.item.productId]?.category ?? 'Other')
                : 'Other',
              action: 'kept_brand',
              date: new Date().toISOString(),
            },
          ].slice(-200)
        : s.events,
    }));
    toast('Kept your original choice and locked it for this list.');
  }
  // What the checklist total is made of, so a mixed figure is never shown as one
  // kind of number.
  // One answer to "what will this cost", used by the budget card and the
  // checklist alike, with its composition kept alongside it.
  const listTotal = useMemo(() => {
    let cents = 0;
    const tally = tallyProvenance(state.items, item => {
      const price = lineFor(item, false);
      if (price) cents += price.cents;
      return price;
    });
    return {cents, ...tally};
  }, [state.items, lineFor]);

  const checklistProvenance = useMemo(
    () => tallyProvenance(state.items, item => lineFor(item, true)),
    [state.items, lineFor],
  );

  function beginShop(id: string) {
    const name = agent.basketFor(id)?.name;
    commit(s => ({...s, activeShop: id, items: s.items.map(i => ({...i, checked: false}))}));
    go('shop');
    toast.success(
      name ? `Your checklist for ${name} is ready` : 'Your shopping checklist is ready',
    );
  }
  function openReceipt() {
    const store = state.activeShop ?? best?.id ?? stores[0].id;
    setReceiptStore(store);
    setReceiptTotal('');
    setReceiptDate(new Date().toISOString().slice(0, 10));
    setReceiptId(undefined);
    setReceiptName('');
    // Anything read off a shelf during this shop is what that line cost, so offer
    // it rather than making somebody type the same number twice. It is a draft
    // they can correct against the receipt before saving.
    const prefill: Record<string, string> = {};
    for (const item of state.items.filter(i => i.checked)) {
      const resolved = lineFor(item, true);
      if (resolved?.source === 'observed') prefill[item.id] = (resolved.cents / 100).toFixed(2);
    }
    setActuals(prefill);
    setReceiptOpen(true);
  }
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const body = await uploadReceipt(file);
      setReceiptId(body.id);
      setReceiptName(body.name);
      toast.success('Receipt attached. Enter the amount you paid below.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }
  function saveReceipt() {
    const total = Math.round(Number(receiptTotal) * 100);
    if (!receiptTotal || !Number.isFinite(total) || total <= 0 || total > 10000000) {
      toast.error('Enter a valid receipt total.');
      return;
    }
    if (!receiptDate || receiptDate > new Date().toISOString().slice(0, 10)) {
      toast.error('Choose today or an earlier shopping date.');
      return;
    }
    const basket = fromAgent(agent.basketFor(receiptStore));
    // The receipt records everything that came home, not only the lines somebody
    // typed a price against. Without that, an item bought every week but never
    // priced would never build a repurchase interval.
    const bought = state.items.filter(i => i.checked || actuals[i.id]?.trim());
    const lines: TripLine[] = bought.map(i => {
      const typed = actuals[i.id]?.trim();
      return {
        productId: i.productId,
        name: i.name,
        quantity: i.qty,
        actual: typed ? Math.round(Number(typed) * 100) : null,
        predicted: basket?.lineTotal(i.id) ?? null,
      };
    });
    const entered = lines.filter(l => l.actual !== null) as (TripLine & {actual: number})[];
    if (
      entered.some(l => !Number.isFinite(l.actual) || l.actual < 0) ||
      entered.reduce((sum, l) => sum + l.actual, 0) > total
    ) {
      toast.error('Item totals must be valid and cannot exceed your receipt total.');
      return;
    }
    const trip: Trip = {
      id: newId(),
      storeId: receiptStore,
      storeName: shopIdentity(receiptStore).name,
      date: receiptDate,
      total,
      predicted: basket?.subtotal ?? 0,
      predictedPriced: basket?.priced ?? 0,
      predictedTotal: basket?.total ?? state.items.length,
      comparisonTotal: 0,
      items: state.items.length,
      receiptId,
      lines,
    };
    commit(s => {
      let next = s;
      for (const item of s.items.filter(i => i.checked || actuals[i.id]?.trim()))
        if (item.productId) next = recordChoice(next, 'purchased', item.productId, receiptStore);
      const shopName = shopIdentity(receiptStore).name;
      return {
        ...next,
        trips: [trip, ...s.trips].slice(0, 200),
        activeShop: null,
        savedLists: snapshotList(
          s,
          `${shopName}, ${new Date(receiptDate + 'T12:00:00').toLocaleDateString('en-CA', {day: 'numeric', month: 'short'})}`,
          true,
        ),
      };
    });
    setReceiptOpen(false);
    go('spending');
    toast.success('Shopping trip saved to your spending history.');
  }
  function exportList() {
    const content = `${state.listName}\n\n${state.items.map(i => `${i.checked ? '[x]' : '[ ]'} ${i.qty} × ${i.name}${i.productId ? ` (${productById[i.productId].brand}, ${productById[i.productId].size})` : ' (match needed)'}`).join('\n')}\n\nFrom Aisle. Check each shop for current prices.`;
    void shareList(content)
      .then(() => toast.success(isDevice ? 'List ready to share' : 'Shopping list downloaded'))
      .catch(() => toast.error('Could not share the list.'));
  }
  async function finishOnboarding(profile: Preferences, buildList: boolean) {
    const {merged} = await household.saveNow(source => ({
      ...source,
      prefs: profile,
      onboarded: true,
      items: buildList ? starterList(profile) : source.items,
      activeShop: buildList ? null : source.activeShop,
    }));
    setOnboard(false);
    go('home');
    toast.success(
      merged
        ? 'Saved. It was merged with a newer copy of your list saved elsewhere.'
        : 'Saved. Your list is ready.',
    );
  }
  useEffect(() => {
    const mc = (
      document as unknown as {modelContext?: {registerTool: (t: unknown, o: unknown) => void}}
    ).modelContext;
    if (!mc) return;
    const abort = new AbortController();
    try {
      mc.registerTool(
        {
          name: 'compare_grocery_basket',
          title: 'Compare grocery basket',
          description:
            'Return the basket totals Aisle has collected from public retailer catalogues. Every figure traces to an HTTP response; items with no collected price are reported as unpriced rather than estimated. Does not purchase groceries.',
          inputSchema: {type: 'object', properties: {}, additionalProperties: false},
          annotations: {readOnlyHint: true},
          execute(input: unknown) {
            if (!input || typeof input !== 'object' || Object.keys(input).length)
              throw new Error('No arguments expected');
            return {
              dataMode: 'observed',
              collectedAt: agentRef.current?.run?.finishedAt ?? null,
              // The live baskets: re-gated, and re-totalled after confirmations.
              stores: (agentRef.current?.run ? agentRef.current.baskets : []).map(b => ({
                name: b.name,
                subtotalCents: b.subtotal,
                itemsPriced: b.priced,
                itemsOnList: b.total,
                complete: b.complete,
              })),
            };
          },
        },
        {signal: abort.signal},
      );
      mc.registerTool(
        {
          name: 'open_grocery_list',
          title: 'Open grocery list',
          description: 'Navigate to the current list without changing its items.',
          inputSchema: {type: 'object', properties: {}, additionalProperties: false},
          annotations: {readOnlyHint: false},
          execute(input: unknown) {
            if (!input || typeof input !== 'object' || Object.keys(input).length)
              throw new Error('No arguments expected');
            go('list');
            return {view: 'list'};
          },
        },
        {signal: abort.signal},
      );
    } catch {
      /* WebMCP is optional; the app works without it */
    }
    return () => abort.abort();
  }, []);

  // Everything a list row needs, in one object so rows can live outside this
  // component (see parts.tsx for why that matters).
  const rowCtx: ItemRowContext = {
    lineFor,
    unitPrice: itemId => activeBasket?.unitPrice(itemId) ?? null,
    paidHistory,
    updateItem,
    removeItem,
    capturePrice: setCaptureItem,
    matchItem: item => {
      setMatchingItem(item.id);
      setImportMode('browse');
      setCatalogOpen(true);
    },
  };

  // A receipt can be recorded against a bundled chain or a retailer the agent
  // discovered, so every lookup has to tolerate both and neither.
  // Retailers you can record a receipt against: the bundled chains, plus any
  // retailer the agent actually priced, so a shop started from Compare can be
  // logged against the shop you were in.
  const receiptStoreOptions = useMemo(() => {
    const rows = stores.map(store => ({value: store.id, label: store.name}));
    for (const basket of agent.baskets)
      if (!rows.some(row => row.value === basket.sourceId))
        rows.unshift({value: basket.sourceId, label: basket.name});
    if (state.activeShop && !rows.some(row => row.value === state.activeShop))
      rows.unshift({value: state.activeShop, label: shopIdentity(state.activeShop).name});
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.baskets, state.activeShop]);

  function shopIdentity(id: string, fallbackName?: string) {
    const chain = stores.find(store => store.id === id);
    if (chain) return chain;
    const basket = agent.baskets.find(b => b.sourceId === id);
    return {id, name: fallbackName ?? basket?.name ?? id} as Store;
  }

  const suggestions = personalSuggestions(state);
  return (
    <SidebarProvider style={{'--sidebar-width': '236px'} as CSSProperties}>
      <Sidebar collapsible="none" className="aisle-sidebar">
        <SidebarHeader className="brand-wrap">
          <a href="#home" className="brand" onClick={() => go('home')} aria-label="Aisle home">
            <span className="brand-symbol" aria-hidden="true">
              <ShoppingBasket strokeWidth={2} />
            </span>
            aisle
          </a>
        </SidebarHeader>
        <SidebarContent className="nav-content">
          <SidebarMenu>
            {nav.map(({id, label, icon: Icon}) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  asChild
                  isActive={view === id || (id === 'account' && view === 'legal')}
                  className="nav-item"
                >
                  <a
                    href={`#${id}`}
                    onClick={e => {
                      e.preventDefault();
                      go(id);
                    }}
                  >
                    <Icon size={19} />
                    <span>{label}</span>
                    {id === 'list' && <span className="nav-count">{state.items.length}</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          {state.activeShop && (
            <button className="resume-shop" onClick={() => go('shop')}>
              <ShoppingBag size={18} />
              <span>Continue your shop</span>
              <ChevronRight size={16} />
            </button>
          )}
        </SidebarContent>
        <SidebarFooter className="sidebar-footer">
          <button
            className={cx('nav-item', view === 'legal' && 'active')}
            onClick={() => goLegal(null)}
          >
            <Scale size={19} /> Legal and privacy
          </button>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <HelpCircle size={19} /> How prices work
          </button>
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              {state.prefs.name ? state.prefs.name.slice(0, 1).toUpperCase() : 'A'}
            </span>
            <div>
              <strong>{state.prefs.name || 'Your household'}</strong>
              <span>{state.prefs.city || 'Burlington'}, Ontario</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar">
          <a href="#home" className="mobile-brand brand" onClick={() => go('home')}>
            <span className="brand-symbol" aria-hidden="true">
              <ShoppingBasket strokeWidth={2} />
            </span>
            aisle
          </a>
          <div className="topbar-right">
            <button
              className="location-button"
              aria-label={`Search area: ${state.prefs.city || 'Burlington'}, Ontario. Change in settings`}
              onClick={() => go('account')}
            >
              <MapPin size={16} />
              <span>
                {state.prefs.city || 'Burlington'}
                <span className="location-province">, ON</span>
              </span>
              <ChevronDown size={14} />
            </button>
            <button
              className="data-badge"
              aria-label="How Aisle gets its prices"
              onClick={() => setHelp(true)}
            >
              <span className="data-dot" />
              <span className="data-badge-label">How prices work</span>
              <Info size={17} />
            </button>
          </div>
        </header>
        {loadError && (
          <div className="system-message error">
            <TriangleAlert size={17} /> We couldn’t load your saved list.{' '}
            <button onClick={() => void load()}>Try again</button>
            <button onClick={() => setResetOpen(true)}>Start fresh</button>
          </div>
        )}
        {savingError && (
          <div className="system-message error">
            <TriangleAlert size={17} />
            {savingError}
            <button onClick={household.retrySave}>Retry save</button>
            <button onClick={() => void load()}>Reload saved list</button>
          </div>
        )}
        {!ready && !loadError && (
          <div className="system-message">
            <LoaderCircle className="spin" size={16} /> Getting your list ready…
          </div>
        )}
        <main className="workspace" id="main-content">
          {view === 'home' && (
            <AgentWorkspace
              state={state}
              agent={agent}
              commit={commit}
              onAdd={addProduct}
              onList={() => go('list')}
              onPreferences={() => go('account')}
              onCompare={() => go('compare')}
            >
              <DueThisWeek
                state={state}
                onAdd={addProduct}
                onDismiss={id =>
                  commit(s => ({
                    ...s,
                    dueSnoozed: {...s.dueSnoozed, [id]: new Date().toISOString()},
                  }))
                }
              />
            </AgentWorkspace>
          )}
          {view === 'home' && suggestions.length > 0 && (
            <section className="personal-recommendations" aria-labelledby="often-h">
              <div className="section-top">
                <div>
                  <h2 id="often-h">Often on your list</h2>
                  <p>From things you have bought or added before.</p>
                </div>
              </div>
              <div className="suggestion-grid">
                {suggestions.map(({product: p, why}) => (
                  <div className="suggestion-card" key={p.id}>
                    <ProductArt id={p.id} />
                    <div>
                      <strong>{p.name}</strong>
                      <span>
                        {p.brand} · {p.size}
                      </span>
                      <small>{why}</small>
                    </div>
                    <button
                      className="add-product"
                      aria-label={`Add suggested ${p.name}`}
                      onClick={() => addProduct(p.id)}
                    >
                      <Plus size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Dismiss suggestion ${p.name}`}
                      onClick={() => {
                        commit(s => ({
                          ...recordChoice(s, 'dismissed', p.id),
                          prefs: {
                            ...s.prefs,
                            excludedProducts: [...s.prefs.excludedProducts, p.id],
                          },
                        }));
                        toast('Hidden. You can bring it back in Account.');
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
          {view === 'list' && (
            <ListView
              state={state}
              saveStatus={saveStatus}
              rowCtx={rowCtx}
              listTotal={listTotal}
              budget={agent.perShopBudget}
              basketCount={agent.baskets.length}
              swapCount={swaps.length}
              swapSaving={potential}
              priced={headlineBasket}
              onRename={name => commit(s => ({...s, listName: name}))}
              onAdd={addProduct}
              onOpenCatalog={mode => {
                setImportMode(mode);
                setCatalogOpen(true);
              }}
              onOpenStarters={() => setStartersOpen(true)}
              onSaveList={() => {
                commit(st => ({
                  ...st,
                  savedLists: snapshotList(st, st.listName || 'Saved list', false),
                }));
                toast.success('List saved. Reuse it from Start from…');
              }}
              onClear={() => setClearOpen(true)}
              onExport={exportList}
              onEditBudget={() => go('account')}
              onSwaps={() => setSwapsOpen(true)}
              onCompare={() => go('compare')}
            />
          )}
          {view === 'compare' && (
            <BasketCompare
              state={state}
              agent={agent}
              onShop={beginShop}
              onList={() => go('list')}
              onPrefs={prefs}
            />
          )}
          {view === 'spending' && (
            <SpendingView
              trips={state.trips}
              perShopBudget={agent.perShopBudget}
              shopIdentity={shopIdentity}
              onAddReceipt={openReceipt}
              onOpenTrip={setHistoryDetail}
            />
          )}
          {view === 'account' && (
            <Suspense fallback={<ViewLoading />}>
              <Account
                state={state}
                saveStatus={saveStatus}
                onPrefs={prefs}
                onCommit={commit}
                onEditFood={() => setOnboard(true)}
                onReplaySetup={() => setOnboard(true)}
                onLegal={goLegal}
                onErase={() => {
                  agent.forget();
                  void eraseStoredFiles();
                }}
                appearance={appearance.appearance}
                onAppearance={appearance.choose}
                appVersion={APP_VERSION}
              />
            </Suspense>
          )}
          {view === 'legal' && (
            <Suspense fallback={<ViewLoading />}>
              <Legal docId={legalDoc} onSelect={goLegal} onBack={() => goLegal(null)} />
            </Suspense>
          )}
          {view === 'shop' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>{active ? `Shopping at ${active.name}` : 'Choose a shop'}</h1>
                  <p>Tick things off as they go in the basket. Your place is saved.</p>
                </div>
                <button className="button secondary" onClick={() => go('compare')}>
                  <ArrowLeft size={16} /> Change shop
                </button>
              </div>
              {active ? (
                <div className="list-layout">
                  <section className="card">
                    <ShopChecklist
                      items={state.items}
                      order={checklistOrder}
                      onOrderChange={changeChecklistOrder}
                      lineTotal={id => {
                        const it = state.items.find(i => i.id === id);
                        return it ? (lineFor(it, true)?.cents ?? null) : null;
                      }}
                      provenance={checklistProvenance}
                      budget={agent.perShopBudget}
                      shopName={active.name}
                      renderItem={i => <ItemRow key={i.id} item={i} ctx={rowCtx} shopping />}
                    />
                    <div className="list-bottom-note">
                      <Info size={14} />
                      <span>
                        These are the shop’s online prices. Check the shelf before you buy.
                        {(() => {
                          const blank = state.items.filter(
                            i => activeBasket?.lineTotal(i.id) == null,
                          ).length;
                          return blank > 0
                            ? ` ${blank} of ${state.items.length} items have no online price, so the running total leaves them out.`
                            : '';
                        })()}
                      </span>
                    </div>
                  </section>
                  <aside>
                    <section className="card shop-summary">
                      <div className="shopping-circle">
                        <ShoppingBag size={32} />
                      </div>
                      <h3>
                        {checked === state.items.length
                          ? 'Everything is in the basket'
                          : `${state.items.length - checked} of ${state.items.length} left`}
                      </h3>
                      <p>
                        {checked === state.items.length
                          ? 'Add the receipt to record what you paid.'
                          : 'When you have paid, add the receipt to record what you spent.'}
                      </p>
                      <button className="button primary full" onClick={openReceipt}>
                        <ReceiptText size={16} /> Finish and add receipt
                      </button>
                      <button className="text-button" onClick={exportList}>
                        <Download size={15} /> Export checklist
                      </button>
                    </section>
                  </aside>
                </div>
              ) : (
                <Empty
                  title="Choose a shop first"
                  action={
                    <button className="button primary" onClick={() => go('compare')}>
                      See prices
                    </button>
                  }
                >
                  Pick a shop on Prices and your checklist will be ready here.
                </Empty>
              )}
            </>
          )}
          <footer className="workspace-footer">
            <span>Prices in Canadian dollars, from each shop’s own website.</span>
            <div className="workspace-footer-right">
              <button onClick={() => setHelp(true)}>How prices work</button>
              <button onClick={() => goLegal('terms')}>Terms</button>
              <button onClick={() => goLegal('privacy')}>Privacy</button>
              <button onClick={() => goLegal('accessibility')}>Accessibility</button>
              <button onClick={() => goLegal('sources')}>Data sources</button>
            </div>
          </footer>
        </main>
        {state.activeShop && view !== 'shop' && (
          // A shop in progress is one tap away from anywhere, the way a music
          // app keeps the current track above its tab bar.
          <button className="shop-pill" onClick={() => go('shop')}>
            <ShoppingBag size={18} />
            <span>
              <strong>Continue your shop</strong>
              <small>
                {checked} of {state.items.length} picked up
              </small>
            </span>
            <ChevronRight size={18} />
          </button>
        )}
        <nav className="mobile-nav" aria-label="Main navigation">
          {nav.map(({id, label, icon: Icon}) => {
            const selected = view === id || (id === 'account' && view === 'legal');
            return (
              <button
                key={id}
                aria-current={selected ? 'page' : undefined}
                className={selected ? 'selected' : ''}
                onClick={() => go(id)}
              >
                <span className="tab-icon">
                  <Icon size={22} strokeWidth={selected ? 2.25 : 1.8} />
                  {id === 'list' && state.items.length > 0 && (
                    <span className="tab-badge" aria-hidden="true">
                      {state.items.length > 99 ? '99+' : state.items.length}
                    </span>
                  )}
                </span>
                <span className="tab-label">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <Onboarding
        open={onboard}
        initial={state.prefs}
        revisit={state.onboarded}
        onClose={() => {
          if (!state.onboarded) commit(s => ({...s, onboarded: true}));
          setOnboard(false);
        }}
        onFinish={finishOnboarding}
        onPrivacy={() => {
          setOnboard(false);
          goLegal('privacy');
        }}
      />

      <Dialog
        open={catalogOpen}
        onOpenChange={v => {
          setCatalogOpen(v);
          if (!v) setMatchingItem(null);
        }}
      >
        <DialogContent className="catalog-modal">
          <DialogTitle>{matchingItem ? 'Choose the right match' : 'Add groceries'}</DialogTitle>
          <DialogDescription>
            Search, browse by department, or paste a list you already have.
          </DialogDescription>
          <Tabs value={importMode} onValueChange={setImportMode}>
            <TabsList className="segment-tabs">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="paste" disabled={!!matchingItem}>
                Paste a list
              </TabsTrigger>
            </TabsList>
            <TabsContent value="browse">
              <CategoryBrowser
                onPick={addProduct}
                picked={
                  new Set(state.items.map(i => i.productId).filter((id): id is string => !!id))
                }
                mode={matchingItem ? 'match' : 'add'}
              />
            </TabsContent>
            <TabsContent value="paste">
              <label className="field-label">
                Your grocery list
                <textarea
                  rows={7}
                  value={paste}
                  onChange={e => setPaste(e.target.value)}
                  placeholder={'2 milk\neggs\nbananas\nwhole wheat bread\ncoffee'}
                />
              </label>
              <p className="field-help">
                One item per line, or separate with commas. Add a quantity before the name. You’ll
                review brands and sizes next.
              </p>
              <button className="button primary full" disabled={!paste.trim()} onClick={addText}>
                <ListPlus size={18} /> Add to list
              </button>
            </TabsContent>
          </Tabs>
          <div className="catalog-footer">
            <span>
              {state.items.length} {state.items.length === 1 ? 'item' : 'items'} on your list
            </span>
            <button
              className="button secondary"
              onClick={() => {
                setCatalogOpen(false);
                go('list');
              }}
            >
              Done <Check size={16} />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={swapsOpen} onOpenChange={setSwapsOpen}>
        <DialogContent className="swaps-modal">
          <div className="modal-icon">
            <Sparkles size={23} />
          </div>
          <DialogTitle>Cheaper options at the same shop</DialogTitle>
          <DialogDescription>
            Each one comes from the same shop’s website. Nothing changes until you say yes, and
            locked items are never swapped.
          </DialogDescription>
          {swaps.length ? (
            <>
              <div className="swap-summary">
                <span>Total off your basket if you take them all</span>
                <strong>{money(potential)}</strong>
              </div>
              <div className="swaps-list">
                {swaps.map(sw => (
                  <div className="swap-row" key={sw.item.id}>
                    <div className="swap-body">
                      <strong>{sw.to.offer.title}</strong>
                      <p className="swap-from">
                        Instead of {sw.from.offer.title} · {sw.retailer}
                      </p>
                      <span className="green-text">
                        {money(sw.saving)} off this line
                        {sw.item.qty > 1 ? ` (${sw.item.qty} on your list)` : ''}
                      </span>
                      {sw.unitNote && <small className="swap-reason">{sw.unitNote}</small>}
                      <small className="swap-reason">{sw.sizeNote}</small>
                    </div>
                    <div className="swap-actions">
                      <button className="button primary" onClick={() => applySwap(sw)}>
                        Use this <RefreshCw size={14} />
                      </button>
                      <button className="text-button" onClick={() => rejectSwap(sw)}>
                        Keep mine
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="field-help">
                Both products were read from the same retailer catalogue, and a suggestion is only
                made when it gives you at least as much for less. Ingredients and allergens may
                differ; check the label in the shop.
              </p>
            </>
          ) : (
            <Empty icon={CheckCircle2} title="Nothing cheaper to offer">
              {!agent.run
                ? 'Check prices and Aisle will look for better value at the same shop.'
                : !state.prefs.substitutions
                  ? 'Swaps are turned off in Account, so Aisle leaves your choices alone.'
                  : state.prefs.allergens.length || state.prefs.dietary.length
                    ? 'Aisle does not suggest alternatives while you have a diet or allergy recorded, because it cannot check ingredients.'
                    : 'Nothing at this shop gives you the same amount for less.'}
            </Empty>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="receipt-modal">
          <DialogTitle>Add a receipt</DialogTitle>
          <DialogDescription>Record what you paid. The photo is optional.</DialogDescription>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={fileRef}
            className="sr-only"
            onChange={e => void upload(e.target.files?.[0])}
          />
          <button
            className={cx('upload-zone', receiptId && 'uploaded')}
            onClick={() => {
              if (isDevice)
                void captureReceipt()
                  .then(file => {
                    if (file) void upload(file);
                  })
                  .catch(() => toast.error('Could not open the camera. Please try again.'));
              else fileRef.current?.click();
            }}
            disabled={uploading}
          >
            {uploading ? (
              <LoaderCircle className="spin" size={27} />
            ) : receiptId ? (
              <CheckCircle2 size={27} />
            ) : (
              <Camera size={27} />
            )}
            <strong>
              {uploading
                ? 'Saving your receipt…'
                : receiptId
                  ? receiptName
                  : 'Add a photo of the receipt'}
            </strong>
            <span>JPEG, PNG or WebP, up to 5 MB</span>
          </button>
          <div className="form-grid">
            <label>
              Store
              <Choice
                label="Receipt store"
                value={receiptStore}
                onChange={setReceiptStore}
                options={receiptStoreOptions}
              />
            </label>
            <label>
              Shopping date
              <input
                type="date"
                value={receiptDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={e => setReceiptDate(e.target.value)}
              />
            </label>
          </div>
          <label className="field-label">
            Total paid (CAD)
            <div className="budget-input">
              <span>$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                aria-label="Receipt total paid"
                value={receiptTotal}
                onChange={e => setReceiptTotal(e.target.value)}
              />
            </div>
          </label>
          <details className="receipt-line-details">
            <summary>
              What each item cost (optional) <ChevronDown size={14} />
            </summary>
            <p>Enter each line total, including the quantity. Leave unpurchased items blank.</p>
            <div>
              {state.items.map(i => (
                <label key={i.id}>
                  <span>
                    {i.qty} × {i.name}
                  </span>
                  <input
                    aria-label={`Actual total for ${i.name}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={actuals[i.id] ?? ''}
                    onChange={e => setActuals({...actuals, [i.id]: e.target.value})}
                  />
                </label>
              ))}
            </div>
          </details>
          <div className="receipt-honesty">
            <Info size={15} />
            <p>
              Photos are stored on this device for your reference. Enter totals yourself; Aisle does
              not read receipts automatically, and a receipt cannot show what another shop would
              have charged.
            </p>
          </div>
          <button
            className="button primary full"
            disabled={uploading || !receiptTotal || !ready}
            onClick={saveReceipt}
          >
            Save receipt <Check size={17} />
          </button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!historyDetail}
        onOpenChange={v => {
          if (!v) setHistoryDetail(null);
        }}
      >
        <DialogContent className="receipt-modal">
          <DialogTitle>
            {stores.find(s => s.id === historyDetail?.storeId)?.name} receipt
          </DialogTitle>
          <DialogDescription>{historyDetail?.date} · Entered by you</DialogDescription>
          {historyDetail && (
            <>
              <div className="history-total">
                <span>Total paid</span>
                <strong>{money(historyDetail.total)}</strong>
              </div>
              {historyDetail.receiptId && (
                <button
                  onClick={() =>
                    void openReceiptFile(historyDetail.receiptId!).catch(() =>
                      toast.error('Could not open the receipt.'),
                    )
                  }
                  className="button secondary"
                >
                  <FileText size={17} /> View saved receipt <ArrowUpRight size={15} />
                </button>
              )}
              {(historyDetail.lines ?? []).length > 0 && (
                <div className="receipt-records">
                  {(historyDetail.lines ?? []).map((p, i) => (
                    <div key={i}>
                      <span>
                        {p.quantity} × {p.name}
                      </span>
                      <strong className={p.actual === null ? 'record-blank' : undefined}>
                        {p.actual === null ? 'no price entered' : money(p.actual)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
              <p className="field-help">
                Only the amounts you entered are recorded as what you spent. Aisle does not work out
                savings from them.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      <HelpDialog open={help} onOpenChange={setHelp} onLegal={goLegal} onDevice={isDevice} />
      <ShelfPriceCapture
        open={!!captureItem}
        onOpenChange={v => {
          if (!v) setCaptureItem(null);
        }}
        item={captureItem}
        defaultStoreId={state.activeShop ?? state.prefs.usualStore}
        stores={receiptStoreOptions}
        existing={
          captureItem
            ? latestShelfPrice(state, captureItem.productId, state.activeShop ?? undefined)
            : null
        }
        onSave={input => {
          if (!captureItem) return;
          commit(st =>
            recordShelfPrice(st, {
              item: captureItem,
              storeId: input.storeId,
              storeName: shopIdentity(input.storeId).name,
              priceCents: input.priceCents,
              packLabel: input.packLabel,
              note: input.note,
              photoId: input.photoId,
            }),
          );
          toast.success(
            `Saved ${money(input.priceCents)} for ${captureItem.name}. Recorded as your own reading.`,
          );
        }}
        onRemove={id => {
          const gone = (state.shelfPrices ?? []).find(r => r.id === id);
          if (gone?.photoId) void deleteShelfPhoto(gone.photoId);
          commit(st => removeShelfPrice(st, id));
          toast('Removed that price.');
        }}
      />
      <ListStarters
        open={startersOpen}
        onOpenChange={setStartersOpen}
        state={state}
        onUse={applyStarter}
      />
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Start fresh?</AlertDialogTitle>
          <AlertDialogDescription>
            Your saved data cannot be read, so Aisle will replace it with an empty list and default
            preferences. Anything currently stored on this device is discarded. This cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void (async () => {
                  try {
                    const blank = initialState();
                    await eraseStoredFiles();
                    await saveState({...blank, onboarded: true}, 0).catch(async () => {
                      await saveState({...blank, onboarded: true}, (await loadState()).revision);
                    });
                    setResetOpen(false);
                    window.location.reload();
                  } catch {
                    setResetOpen(false);
                    setSavingError(
                      'Aisle could not reset its storage. Reinstalling the app will clear it.',
                    );
                  }
                })();
              }}
            >
              Start fresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Clear the list?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes all {state.items.length} products from the current list. Your preferences
            and past receipts will stay saved.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my list</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                commit(s => ({...s, items: [], activeShop: null}));
                toast.success('List cleared.');
              }}
            >
              Clear list
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster
        position={phone ? 'top-center' : 'bottom-right'}
        theme={appearance.theme}
        closeButton
      />
    </SidebarProvider>
  );
}
