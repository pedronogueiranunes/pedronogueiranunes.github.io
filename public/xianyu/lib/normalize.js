// Formato comum que todas as fontes devolvem.
// { id, title, priceCny, url, image, seller, sellerId, sellerCredit, location, wants, postedAt }

// Converte "¥1,299", "2999.00", "1.2万" etc. em número de yuan.
export function parseCny(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const s = String(value).replace(/[,\s¥￥元]/g, '');
  const m = s.match(/(\d+(?:\.\d+)?)(万)?/);
  if (!m) return null;
  const n = Number(m[1]);
  return m[2] ? n * 10000 : n;
}

export const itemUrl = (id) => (id ? `https://www.goofish.com/item?id=${id}` : null);
export const sellerUrl = (id) => (id && /^\d+$/.test(String(id)) ? `https://www.goofish.com/personal?userId=${id}` : null);

// Primeiro valor não vazio entre vários caminhos possíveis ("a.b.0").
export function pick(obj, ...paths) {
  for (const p of paths) {
    const v = p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

const fixUrl = (u) => (typeof u === 'string' && u.startsWith('//') ? `https:${u}` : u);

export function makeItem(f) {
  const wants = f.wants != null && f.wants !== '' ? Number(String(f.wants).replace(/\D/g, '')) || 0 : null;
  return {
    id: f.id ? String(f.id) : null,
    title: String(f.title || '').trim() || '(sem título)',
    priceCny: parseCny(f.priceCny),
    url: f.url || itemUrl(f.id),
    image: fixUrl(f.image) || null,
    seller: f.seller || null,
    sellerId: f.sellerId ? String(f.sellerId) : null,
    sellerUrl: f.sellerUrl || sellerUrl(f.sellerId),
    sellerCredit: f.sellerCredit || null,
    location: f.location || null,
    wants,
    postedAt: f.postedAt || null,
    shopLevel: f.shopLevel ?? null, // nível da loja 鱼小铺 (1–7); null = vendedor pessoal ou desconhecido
    isShop: f.isShop ?? null,
    freeShipping: typeof f.freeShipping === 'boolean' ? f.freeShipping : null,
    tags: f.tags?.length ? f.tags : undefined,
    condition: f.condition || null,
  };
}
