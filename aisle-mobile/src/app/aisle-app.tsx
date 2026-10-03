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
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ClipboardList,
  Download,
  HelpCircle,
  Home,
  Info,
  Leaf,
  ListPlus,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Plus,
  ReceiptText,
  Settings2,
  ShieldCheck,
  ShoppingBasket,
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
  Trash2,
  X,
  Camera,
  CheckCircle2,
  TriangleAlert,
  RefreshCw,
  FileText,
  HeartHandshake,
} from 'lucide-react';
import {Scale, History, Bookmark} from 'lucide-react';
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
  categories,
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
import {cx, newId, ProductIcon, Pill, Choice, Empty, ViewLoading} from './parts';
import {ItemRow, type ItemRowContext} from './item-row';
import {BudgetCard} from './home-cards';
import {useHousehold} from './use-household';
import {useAppearance} from '@/lib/appearance';
import SpendingView from './views/spending-view';
import HelpDialog from './help-dialog';

type View = 'home' | 'list' | 'compare' | 'spending' | 'account' | 'legal' | 'shop';
const nav = [
  {id: 'home', label: 'My week', icon: Home},
  {id: 'list', label: 'My grocery list', icon: ClipboardList},
  {id: 'compare', label: 'Compare baskets', icon: StoreIcon},
  {id: 'spending', label: 'My spending', icon: BarChart3},
] as const;
export default function AisleApp() {
  const household = useHousehold();
  const appearance = useAppearance();
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
  const [listFilter, setListFilter] = useState('All items');
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

  // Photos and receipts are dropped by several routes — a price removed by hand
  // or aged out, a trip deleted, everything erased — and each would otherwise
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
  const itemCount = state.items.reduce((n, i) => n + i.qty, 0);
  const checked = state.items.filter(i => i.checked).length;
  const missing = state.items.filter(i => !i.productId).length;

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
   *  retailer. It never edits the list itself — the household asked for the
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
    const content = `${state.listName}\n\n${state.items.map(i => `${i.checked ? '[x]' : '[ ]'} ${i.qty} × ${i.name}${i.productId ? ` — ${productById[i.productId].brand}, ${productById[i.productId].size}` : ' — match needed'}`).join('\n')}\n\nAisle grocery list. Refer to retailer sources for current prices.`;
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
        ? 'Your Aisle is ready. It was merged with a newer copy of your list saved elsewhere.'
        : 'Your Aisle is ready. Your preferences are saved.',
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
            <span className="brand-symbol">
              <ShoppingBasket size={25} strokeWidth={1.8} />
            </span>
            aisle<span className="brand-dot">.</span>
          </a>
          <span className="brand-caption">A better way to grocery shop</span>
        </SidebarHeader>
        <SidebarContent className="nav-content">
          <p className="nav-label">YOUR SPACE</p>
          <SidebarMenu>
            {nav.map(({id, label, icon: Icon}) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton asChild isActive={view === id} className="nav-item">
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
          <div className="sidebar-note">
            <span className="note-icon">
              <HeartHandshake size={23} />
            </span>
            <h4>A little more in your pocket.</h4>
            <p>Better choices start with a clear view of your whole list.</p>
            <button onClick={() => setHelp(true)}>
              The Aisle approach <ArrowUpRight size={15} />
            </button>
          </div>
        </SidebarContent>
        <SidebarFooter className="sidebar-footer">
          <button
            className={cx('nav-item', view === 'account' && 'active')}
            onClick={() => go('account')}
          >
            <Settings2 size={19} /> Account settings
          </button>
          <button
            className={cx('nav-item', view === 'legal' && 'active')}
            onClick={() => goLegal(null)}
          >
            <Scale size={19} /> Legal &amp; privacy
          </button>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <HelpCircle size={19} /> How Aisle works
          </button>
          <div className="profile">
            <span className="avatar">
              {state.prefs.name ? state.prefs.name.slice(0, 1).toUpperCase() : 'A'}
            </span>
            <div>
              <strong>{state.prefs.name || 'Your household'}</strong>
              <span>{state.prefs.city || 'Burlington'}, Ontario</span>
            </div>
            <button
              className="icon-button"
              onClick={() => go('account')}
              aria-label="Household settings"
            >
              <ChevronsUpDown size={16} />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar">
          <div className="mobile-brand brand">
            <ShoppingBasket size={24} /> aisle.
          </div>
          <div className="breadcrumb">
            Your space <ChevronRight size={13} />{' '}
            <strong>
              {nav.find(n => n.id === view)?.label ??
                (view === 'shop'
                  ? 'Shopping mode'
                  : view === 'legal'
                    ? 'Legal & privacy'
                    : 'Account settings')}
            </strong>
          </div>
          <div className="topbar-right">
            <button className="location-button" onClick={() => go('account')}>
              <MapPin size={16} />
              <span>{state.prefs.city || 'Burlington'}, ON</span>
              <ChevronDown size={14} />
            </button>
            <span className="top-divider" />
            <button className="data-badge" onClick={() => setHelp(true)}>
              <span /> {'Observed prices'} <Info size={13} />
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
            <DueThisWeek
              state={state}
              onAdd={addProduct}
              onDismiss={id =>
                commit(s => ({...s, dueSnoozed: {...s.dueSnoozed, [id]: new Date().toISOString()}}))
              }
            />
          )}
          {view === 'home' && (
            <AgentWorkspace
              state={state}
              agent={agent}
              commit={commit}
              onAdd={addProduct}
              onList={() => go('list')}
              onPreferences={() => go('account')}
              onSetup={() => setOnboard(true)}
              onCompare={() => go('compare')}
            />
          )}
          {view === 'home' && suggestions.length > 0 && (
            <section className="personal-recommendations">
              <div className="section-top">
                <div>
                  <h3>Often on your list</h3>
                  <p>Picked from your preferences and confirmed choices.</p>
                </div>
                <Pill kind="neutral">Made for you</Pill>
              </div>
              <div className="suggestion-grid">
                {suggestions.map(({product: p, why}) => (
                  <div className="suggestion-card" key={p.id}>
                    <ProductIcon product={p} />
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
                        toast(
                          'Suggestion hidden. You can reset hidden suggestions in preferences.',
                        );
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
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">MAKE IT YOURS</span>
                  <h1>Your grocery list</h1>
                  <p>Keep your favourites. Find room to save.</p>
                </div>
                <div className="heading-actions">
                  {/* The label is hidden on narrow screens, so the name is set here. */}
                  <button
                    className="button secondary"
                    aria-label="Export list"
                    onClick={exportList}
                  >
                    <Download size={16} />
                    <span>Export list</span>
                  </button>
                  <button className="button primary" onClick={() => setCatalogOpen(true)}>
                    <Plus size={18} /> Add groceries
                  </button>
                </div>
              </div>
              <div className="list-layout">
                <section className="card full-list">
                  <div className="list-title">
                    <input
                      aria-label="List name"
                      value={state.listName}
                      maxLength={80}
                      onChange={e => {
                        if (e.target.value.trim()) commit(s => ({...s, listName: e.target.value}));
                      }}
                    />
                    <span className="saved-label">
                      <CheckCheck size={14} />
                      {saveStatus}
                    </span>
                  </div>
                  <div className="list-toolbar">
                    <span>
                      {state.items.length} products · {itemCount} items
                    </span>
                    <button className="text-button" onClick={() => setStartersOpen(true)}>
                      <History size={15} /> Start from…
                    </button>
                    <button
                      className="text-button"
                      onClick={() => {
                        setImportMode('paste');
                        setCatalogOpen(true);
                      }}
                    >
                      <ClipboardList size={15} /> Paste a list
                    </button>
                    <button
                      className="text-button"
                      disabled={!state.items.length}
                      onClick={() => {
                        commit(st => ({
                          ...st,
                          savedLists: snapshotList(st, st.listName || 'Saved list', false),
                        }));
                        toast.success('List saved. Reuse it from Start from…');
                      }}
                    >
                      <Bookmark size={15} /> Save list
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Clear grocery list"
                      onClick={() => setClearOpen(true)}
                      disabled={!state.items.length}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="category-pills">
                    {[
                      'All items',
                      ...categories
                        .slice(1)
                        .filter(c =>
                          state.items.some(
                            i => i.productId && productById[i.productId].category === c,
                          ),
                        ),
                      ...(missing ? ['Unmatched'] : []),
                    ].map(c => (
                      <button
                        key={c}
                        className={cx('filter-pill', listFilter === c && 'selected')}
                        onClick={() => setListFilter(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {missing > 0 && (
                    <div className="inline-warning">
                      <Info size={16} />
                      {missing} {missing === 1 ? 'item needs' : 'items need'} a match before we can
                      recommend a complete basket.
                    </div>
                  )}
                  {state.items.length ? (
                    state.items
                      .filter(
                        i =>
                          listFilter === 'All items' ||
                          (listFilter === 'Unmatched'
                            ? !i.productId
                            : i.productId && productById[i.productId].category === listFilter),
                      )
                      .map(i => <ItemRow key={i.id} item={i} ctx={rowCtx} />)
                  ) : (
                    <Empty
                      title="Your list is empty"
                      action={
                        <>
                          <button className="button primary" onClick={() => setCatalogOpen(true)}>
                            <Plus size={16} /> Add items
                          </button>
                          <button
                            className="button secondary"
                            onClick={() => setStartersOpen(true)}
                          >
                            <History size={16} /> Start from a previous list
                          </button>
                        </>
                      }
                    >
                      Browse by aisle, paste a list you already have, or reuse a shop you have done
                      before.
                    </Empty>
                  )}
                  <button className="list-add" onClick={() => setCatalogOpen(true)}>
                    <Plus size={17} /> Add another item
                  </button>
                  <div className="list-bottom-note">
                    <LockKeyhole size={14} /> Lock a product to keep it out of swap suggestions.
                  </div>
                </section>
                <aside className="list-aside">
                  <BudgetCard
                    budget={agent.perShopBudget}
                    items={state.items.length}
                    total={listTotal}
                    swapCount={swaps.length}
                    swapSaving={potential}
                    basketCount={agent.baskets.length}
                    onEditBudget={() => go('account')}
                    onSwaps={() => setSwapsOpen(true)}
                    onCompare={() => go('compare')}
                  />
                  <section className="card list-summary">
                    <h3>Your list at a glance</h3>
                    <div>
                      <span>List items</span>
                      <strong>{state.items.length}</strong>
                    </div>
                    <div>
                      <span>Priced by Aisle</span>
                      <strong>
                        {headlineBasket
                          ? `${headlineBasket.priced} of ${headlineBasket.total}`
                          : 'Not checked yet'}
                      </strong>
                    </div>
                    <div>
                      <span>Baskets compared</span>
                      <strong>{agent.baskets.length}</strong>
                    </div>
                    <div>
                      <span>Products locked</span>
                      <strong>{state.items.filter(i => i.locked).length}</strong>
                    </div>
                    <button
                      className="button primary full"
                      onClick={() => go('compare')}
                      disabled={!state.items.length}
                    >
                      Compare my list <ArrowRight size={17} />
                    </button>
                    <p>Review observed prices and confirm retailer products before comparing.</p>
                  </section>
                  <div className="quiet-tip">
                    <ShieldCheck size={20} />
                    <p>Your choices stay yours. We ask before changing anything on your list.</p>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === 'compare' && (
            <BasketCompare
              state={state}
              agent={agent}
              onShop={beginShop}
              onList={() => go('list')}
              onSetup={() => setOnboard(true)}
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
                  <span className="eyebrow">ONE ITEM AT A TIME</span>
                  <h1>{active ? `Your shop at ${active.name}` : 'Ready when you are.'}</h1>
                  <p>Check off what’s in your basket. Your list saves as you go.</p>
                </div>
                <button className="button secondary" onClick={() => go('compare')}>
                  <ArrowLeft size={16} /> Change store
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
                      <Info size={14} /> Check shelf prices before buying. These are online
                      catalogue prices, not confirmed branch prices.
                      {(() => {
                        const blank = state.items.filter(
                          i => activeBasket?.lineTotal(i.id) == null,
                        ).length;
                        return blank > 0
                          ? ` ${blank} of ${state.items.length} items show a dash because no catalogue price was collected for them — the running total only covers the rest.`
                          : '';
                      })()}
                    </div>
                  </section>
                  <aside>
                    <section className="card shop-summary">
                      <div className="shopping-circle">
                        <ShoppingBag size={32} />
                      </div>
                      <h3>
                        {checked === state.items.length
                          ? 'Everything’s in the basket.'
                          : 'You’ve got this.'}
                      </h3>
                      <p>
                        {checked === state.items.length
                          ? 'After checkout, save the receipt and record what you actually spent.'
                          : 'Take your time. We’ll keep your place on the list.'}
                      </p>
                      <button className="button primary full" onClick={openReceipt}>
                        <ReceiptText size={16} /> Finish & add receipt
                      </button>
                      <button className="text-button" onClick={exportList}>
                        <Download size={15} /> Export checklist
                      </button>
                    </section>
                  </aside>
                </div>
              ) : (
                <Empty
                  title="Pick your basket first"
                  action={
                    <button className="button primary" onClick={() => go('compare')}>
                      Compare baskets
                    </button>
                  }
                >
                  Your shopping checklist will be ready once you choose a basket to shop from.
                </Empty>
              )}
            </>
          )}
          <footer className="workspace-footer">
            <span>
              <Leaf size={14} /> Made for a more thoughtful shop.
            </span>
            <div className="workspace-footer-right">
              <button onClick={() => setHelp(true)}>
                Prices in CAD · Check retailer sources <Info size={13} />
              </button>
              <button onClick={() => goLegal('terms')}>Terms</button>
              <button onClick={() => goLegal('privacy')}>Privacy</button>
              <button onClick={() => goLegal('sources')}>Data sources</button>
            </div>
          </footer>
        </main>
        <nav className="mobile-nav" aria-label="Main navigation">
          {nav.map(({id, label, icon: Icon}) => (
            <button
              key={id}
              aria-label={label}
              aria-current={view === id ? 'page' : undefined}
              className={view === id ? 'selected' : ''}
              onClick={() => go(id)}
            >
              <Icon size={21} />
              <span>
                {id === 'home'
                  ? 'My week'
                  : id === 'list'
                    ? 'My list'
                    : id === 'compare'
                      ? 'Baskets'
                      : 'Spending'}
              </span>
            </button>
          ))}
          <button
            aria-label="Account settings"
            className={view === 'account' || view === 'legal' ? 'selected' : ''}
            onClick={() => go('account')}
          >
            <Settings2 size={21} />
            <span>You</span>
          </button>
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
          <DialogTitle>
            {matchingItem ? 'Choose the right match' : 'What’s on your list?'}
          </DialogTitle>
          <DialogDescription>
            Browse by department and aisle, search across every item, or paste a list you already
            have.
          </DialogDescription>
          <Tabs value={importMode} onValueChange={setImportMode}>
            <TabsList className="segment-tabs">
              <TabsTrigger value="browse">Find groceries</TabsTrigger>
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
                <ListPlus size={18} /> Add to my list
              </button>
            </TabsContent>
          </Tabs>
          <div className="catalog-footer">
            <span>{state.items.length} products on your list</span>
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
          <DialogTitle>Better value, same shop.</DialogTitle>
          <DialogDescription>
            Each suggestion is a second catalogue record from the retailer you are already shopping.
            You approve every change; locked products stay as they are.
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
                ? 'Run a price check and Aisle will look for better value among the offers it collects.'
                : !state.prefs.substitutions
                  ? 'Substitutions are turned off in your account settings, so Aisle leaves your choices alone.'
                  : state.prefs.allergens.length || state.prefs.dietary.length
                    ? 'Aisle does not suggest alternatives while you have a diet or allergy recorded — a swap it cannot verify is not worth the risk.'
                    : 'Nothing in the collected catalogues gives you the same amount for less than what is already in your basket.'}
            </Empty>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="receipt-modal">
          <DialogTitle>How did your shop go?</DialogTitle>
          <DialogDescription>
            Keep the receipt, record what you spent, and build your history.
          </DialogDescription>
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
                  : 'Attach a receipt photo'}
            </strong>
            <span>JPG, PNG or WebP · up to 5 MB · optional</span>
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
              Add item prices for a closer review <ChevronDown size={14} />
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
            Save shopping trip <Check size={17} />
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
          <DialogDescription>{historyDetail?.date} · Manually recorded spending</DialogDescription>
          {historyDetail && (
            <>
              <div className="history-total">
                <span>Actual total paid</span>
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
          <AlertDialogTitle>Start with a fresh list?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes all {state.items.length} products from the current list. Your preferences
            and past receipts will stay saved.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my list</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                commit(s => ({...s, items: [], activeShop: null}));
                setListFilter('All items');
                toast.success('Your list is ready for a fresh start.');
              }}
            >
              Clear list
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster position="bottom-right" theme={appearance.theme} closeButton />
    </SidebarProvider>
  );
}
