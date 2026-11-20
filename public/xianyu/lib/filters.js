// Filtros iguais aos da busca do Goofish/Xianyu + nível de loja do vendedor.
// Cada fonte aplica o que consegue na origem; o resto é filtrado aqui depois.

export const SORTS = [
  { key: 'relevance', label: 'Relevância (综合)' },
  { key: 'newest', label: 'Mais recentes (新发布)' },
  { key: 'price_drop', label: 'Maior redução de preço (新降价)' },
  { key: 'price_asc', label: 'Menor preço' },
  { key: 'price_desc', label: 'Maior preço' },
  { key: 'credit', label: 'Melhor crédito do vendedor (信用)' },
];

export const PUBLISH_DAYS = ['1', '3', '7', '14'];

// key = valor usado pelo Goofish em "quickFilter:..."; local = teste para fontes que não filtram na origem
// (true = passa, false = sai, null = sem dado, mantém)
export const QUICK_FILTERS = [
  { key: 'filterPersonal', zh: '个人闲置', label: 'Vendedor pessoal', local: (i) => (i.shopLevel != null || i.isShop ? false : null) },
  { key: 'filterAppraise', zh: '验货宝', label: 'Com inspeção (验货宝)', local: (i) => /验货宝/.test(i.title + (i.tags || []).join(' ')) },
  { key: 'gameAccountInsurance', zh: '验号担保', label: 'Conta de jogo garantida', local: () => null },
  { key: 'filterFreePostage', zh: '包邮', label: 'Frete grátis (包邮)', local: (i) => (i.freeShipping != null ? i.freeShipping : /包邮/.test(i.title) || null) },
  { key: 'filterHighLevelYxpSeller', zh: '超赞鱼小铺', label: 'Loja muito bem avaliada (超赞鱼小铺)', local: (i) => (i.shopLevel != null ? i.shopLevel >= 5 : null) },
  { key: 'filterNew', zh: '全新', label: 'Novo (全新)', local: (i) => /全新|未拆封|未使用/.test(i.title + (i.condition || '')) },
  { key: 'inspectedPhone', zh: '严选', label: 'Selecionado (严选)', local: (i) => /严选/.test(i.title + (i.tags || []).join(' ')) },
  { key: 'filterOneKeyResell', zh: '转卖', label: 'Revenda (转卖)', local: (i) => /转卖/.test(i.title) },
];

// Cidades mais comuns. code = código administrativo usado pelos scrapers (regionIds).
export const REGIONS = [
  { code: '110100', province: '北京', city: '北京', label: 'Pequim (北京)' },
  { code: '310100', province: '上海', city: '上海', label: 'Xangai (上海)' },
  { code: '440100', province: '广东', city: '广州', label: 'Guangzhou (广州)' },
  { code: '440300', province: '广东', city: '深圳', label: 'Shenzhen (深圳)' },
  { code: '330100', province: '浙江', city: '杭州', label: 'Hangzhou (杭州)' },
  { code: '320100', province: '江苏', city: '南京', label: 'Nanquim (南京)' },
  { code: '320500', province: '江苏', city: '苏州', label: 'Suzhou (苏州)' },
  { code: '510100', province: '四川', city: '成都', label: 'Chengdu (成都)' },
  { code: '500100', province: '重庆', city: '重庆', label: 'Chongqing (重庆)' },
  { code: '420100', province: '湖北', city: '武汉', label: 'Wuhan (武汉)' },
  { code: '610100', province: '陕西', city: '西安', label: "Xi'an (西安)" },
  { code: '120100', province: '天津', city: '天津', label: 'Tianjin (天津)' },
  { code: '441900', province: '广东', city: '东莞', label: 'Dongguan (东莞)' },
  { code: '350200', province: '福建', city: '厦门', label: 'Xiamen (厦门)' },
];

// O que cada fonte consegue aplicar NA ORIGEM (o resto vira filtro local, quando há dado para isso).
export const SUPPORT = {
  xianyu: { sorts: SORTS.map((s) => s.key), price: true, publishDays: true, quick: true, region: true },
  unitbytes: { sorts: ['relevance', 'newest', 'price_drop', 'price_asc', 'price_desc', 'credit'], price: true, publishDays: false, quick: true, region: true },
  memo23: { sorts: ['relevance', 'newest', 'price_asc', 'price_desc'], price: true, publishDays: false, quick: false, region: false },
  fetchcat: { sorts: [], price: false, publishDays: false, quick: false, region: false },
  devcake: { sorts: [], price: false, publishDays: false, quick: false, region: false },
  sian: { sorts: ['relevance', 'newest', 'price_drop', 'price_asc', 'price_desc', 'credit'], price: false, publishDays: false, quick: false, region: false },
  mock: { sorts: [], price: false, publishDays: false, quick: false, region: false },
};

export function cleanFilters(f = {}) {
  const quickKeys = new Set(QUICK_FILTERS.map((q) => q.key));
  const num = (v) => (v != null && v !== '' && Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : null);
  return {
    sort: SORTS.some((s) => s.key === f.sort) ? f.sort : 'relevance',
    minPriceBrl: num(f.minPriceBrl),
    maxPriceBrl: num(f.maxPriceBrl),
    publishDays: PUBLISH_DAYS.includes(String(f.publishDays)) ? String(f.publishDays) : null,
    quick: [...new Set((f.quick || []).filter((k) => quickKeys.has(k)))].sort(),
    region: REGIONS.some((r) => r.code === String(f.region)) ? String(f.region) : null,
  };
}

// Filtro local para o que a fonte não aplicou. Item sem o dado necessário é mantido.
export function localFilter(items, f, sup) {
  const quick = sup.quick ? [] : QUICK_FILTERS.filter((q) => f.quick.includes(q.key));
  const region = !sup.region && f.region ? REGIONS.find((r) => r.code === f.region) : null;
  const maxAgeMs = !sup.publishDays && f.publishDays ? Number(f.publishDays) * 86400_000 : null;
  return items.filter((i) => {
    for (const q of quick) if (q.local(i) === false) return false;
    if (region && i.location && !i.location.includes(region.city) && !i.location.includes(region.province)) return false;
    if (maxAgeMs && i.postedAt) {
      const t = Date.parse(i.postedAt);
      if (Number.isFinite(t) && Date.now() - t > maxAgeMs) return false;
    }
    return true;
  });
}
