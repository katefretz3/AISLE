import type {Offer, Pack} from './types';
export function parsePack(value: string): Pack | null {
  const text = value.toLowerCase().replace(/,/g, '');
  const m = text.match(/(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*(kg|g|ml|l|lb|oz)\b/);
  if (m) {
    const unit = m[3];
    const amount =
      Number(m[2]) *
      (m[1] ? Number(m[1]) : 1) *
      ({kg: 1000, g: 1, ml: 1, l: 1000, lb: 453.59237, oz: 28.349523}[unit] ?? 1);
    return amount > 0
      ? {
          amount: Math.round(amount * 1000) / 1000,
          unit: ['ml', 'l'].includes(unit) ? 'ml' : 'g',
          label: m[0],
        }
      : null;
  }
  const count = text.match(/(?:bag of\s*|pack of\s*)(\d+)|\b(\d+)\s*(?:eggs|count|ct|pack)\b/);
  if (count) return {amount: Number(count[1] ?? count[2]), unit: 'each', label: count[0]};
  return /\b(?:each|ea)\b/.test(text) ? {amount: 1, unit: 'each', label: 'each'} : null;
}
export type CatalogueSource = {id: string; name: string; origin: string};
export function normalizeProducts(
  raw: unknown,
  source: CatalogueSource,
  now = new Date(),
): Offer[] {
  const body = raw as {products?: unknown[]};
  if (!body || !Array.isArray(body.products)) throw new Error('Unexpected catalogue response');
  const result: Offer[] = [];
  for (const rawProduct of body.products.slice(0, 250)) {
    const p = rawProduct as Record<string, unknown>;
    if (
      typeof p.title !== 'string' ||
      typeof p.handle !== 'string' ||
      !Array.isArray(p.variants) ||
      !/^[a-z0-9-]+$/i.test(p.handle)
    )
      continue;
    if (
      /gift card|gift basket|catering|meal kit|rain barrel|seeds -|workshop|class -/i.test(
        `${p.title} ${p.product_type}`,
      )
    )
      continue;
    for (const rawVariant of p.variants.slice(0, 15)) {
      const v = rawVariant as Record<string, unknown>;
      if (
        typeof v.price !== 'string' ||
        !/^\d{1,5}(?:\.\d{1,2})?$/.test(v.price) ||
        typeof v.available !== 'boolean' ||
        !['number', 'string'].includes(typeof v.id)
      )
        continue;
      const price = Math.round(Number(v.price) * 100);
      if (price <= 0 || price > 100000) continue;
      const title =
        `${p.title}${typeof v.title === 'string' && v.title !== 'Default Title' ? ` · ${v.title}` : ''}`.slice(
          0,
          240,
        );
      result.push({
        id: `${source.id}:${v.id}`,
        sourceId: source.id,
        retailer: source.name,
        title,
        brand: typeof p.vendor === 'string' ? p.vendor.slice(0, 80) : '',
        url: `${source.origin}/products/${p.handle}?variant=${encodeURIComponent(String(v.id))}`,
        price,
        currency: 'CAD',
        pack: parsePack(title),
        available: v.available,
        observedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 24 * 3600000).toISOString(),
        scope: 'online',
        tags: Array.isArray(p.tags)
          ? p.tags.filter((t): t is string => typeof t === 'string').slice(0, 30)
          : [],
      });
    }
  }
  return result;
}
// Wildcard robots rules, parsed once and applied everywhere. Fail closed: an
// unreadable or ambiguous rule stops collection rather than proceeding.
export function robotsDisallows(robots: string): string[] {
  const denied: string[] = [];
  let applies = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.split('#')[0].trim();
    if (/^user-agent:/i.test(line)) applies = /user-agent:\s*\*\s*$/i.test(line);
    else if (applies && /^disallow:/i.test(line)) {
      const rule = line.slice(line.indexOf(':') + 1).trim();
      if (rule) denied.push(rule);
    }
  }
  return denied;
}
export function blockedByRobots(robots: string, paths: string[]): boolean {
  const denied = robotsDisallows(robots);
  return paths.some(path =>
    denied.some(rule =>
      new RegExp('^' + rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')).test(path),
    ),
  );
}
