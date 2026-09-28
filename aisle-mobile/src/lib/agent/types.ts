export type Pack = {amount: number; unit: 'g' | 'ml' | 'each'; label: string};
export type Offer = {
  id: string;
  sourceId: string;
  retailer: string;
  title: string;
  brand: string;
  url: string;
  price: number;
  currency: 'CAD';
  pack: Pack | null;
  available: boolean;
  observedAt: string;
  expiresAt: string;
  scope: 'online';
  tags: string[];
  previousPrice?: number;
};
export type OfferSelection = Record<string, Record<string, string>>;
