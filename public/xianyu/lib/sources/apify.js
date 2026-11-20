// Scrapers do Goofish na Apify. Cada adapter traduz a entrada e a saída do seu Actor
// para o formato comum. Os mapeamentos aceitam vários nomes de campo porque os Actors
// mudam o formato com o tempo; use "Testar fontes" na UI para conferir.
import { makeItem, pick } from '../normalize.js';
import { norm } from '../variations.js';

const API = 'https://api.apify.com/v2';

// sort comum: relevance | newest | price_asc | price_desc
export const ACTORS = {
  unitbytes: {
    id: 'unitbytes~goofish-scraper',
    label: 'UnitBytes (recomendado no plano grátis)',
    pricePerItem: 0.002, // US$ por anúncio (plano Free)
    runFee: 0.005, // US$ por execução
    multiKeyword: false,
    // Todas as variações numa execução só (campo "keywords", até 50), com limite por variação.
    // Cada linha volta com "keyword" = a variação que a trouxe. Paga uma taxa de execução em vez de uma por variação.
    batchKeywords: true,
    priceFilter: true,
    input: ({ keyword, keywords, limit, perKeyword, sort, minPrice, maxPrice, quick, region }) => ({
      mode: 'search',
      ...(keywords?.length > 1 ? { keywords, maxItemsPerKeyword: perKeyword } : { keyword: keyword ?? keywords?.[0] }),
      maxItems: limit,
      sortBy: { newest: 'newest', price_drop: 'priceDrop', price_asc: 'price_asc', price_desc: 'price_desc', credit: 'credit' }[sort] || 'relevance',
      ...(quick?.length && { quickFilters: quick }),
      ...(region && { regionIds: [region] }),
      includeListings: false,
      includeReviews: false,
      outputFormat: 'tabular',
      detailLevel: 'summary',
      ...(minPrice != null && { priceMin: Math.floor(minPrice) }),
      ...(maxPrice != null && { priceMax: Math.ceil(maxPrice) }),
    }),
    keep: (r) => r && (r.recordType ?? 'item') === 'item' && (r.rowStatus ?? 'ok') === 'ok' && pick(r, 'id', 'itemId'),
  },

  // memo23: US$ 0,50 por mil anúncios + US$ 0,005 por execução. Várias palavras-chave numa
  // execução, limite por palavra-chave, filtro de preço em CNY. Não traz o nível da loja (L1–L7).
  memo23: {
    id: 'memo23~goofish-xianyu-scraper',
    label: 'memo23 (≈ 3x mais barata; sem nível de loja)',
    pricePerItem: 0.00025, // medido em 18/11/2026: 10 anúncios + execução = US$ 0,0075
    runFee: 0.005,
    batchKeywords: true,
    priceFilter: true,
    input: ({ keyword, keywords, limit, perKeyword, sort, minPrice, maxPrice }) => {
      const kws = keywords?.length ? keywords : [keyword];
      return {
        keywords: kws,
        maxItemsPerKeyword: perKeyword || limit,
        maxItems: limit,
        translateKeywords: false, // as variações já vêm em chinês quando precisa
        includeDetails: false, // detalhes custam US$ 0,009 por anúncio
        sortBy: { newest: 'newest', price_asc: 'priceAsc', price_desc: 'priceDesc' }[sort] || 'relevance',
        ...(minPrice != null && { minPrice: Math.floor(minPrice) }),
        ...(maxPrice != null && { maxPrice: Math.ceil(maxPrice) }),
      };
    },
    keep: (r) => r && pick(r, 'itemId', 'id') && (pick(r, 'title') != null),
  },

  // fetch_cat: a partir de US$ 0,08 por mil anúncios (o preço exato e a taxa por execução não
  // estão claros na página; o custo real medido mostra o valor de verdade). Entrada conhecida:
  // só "keywords"; os outros campos são enviados com os nomes mais comuns e o app corta o
  // excedente e filtra preço aqui se o Actor ignorar.
  fetchcat: {
    id: 'fetch_cat~goofish-xianyu-search-scraper',
    label: 'fetch_cat (a mais barata; em teste)',
    pricePerItem: 0.0001,
    runFee: 0.005,
    batchKeywords: true,
    priceFilter: false,
    input: ({ keyword, keywords, limit, perKeyword }) => {
      const kws = keywords?.length ? keywords : [keyword];
      return { keywords: kws, maxItemsPerKeyword: perKeyword || limit, maxItems: limit, maxResults: limit };
    },
    keep: (r) => r && pick(r, 'itemId', 'item_id', 'id') && (pick(r, 'title', 'itemTitle', 'name') != null),
  },

  devcake: {
    id: 'devcake~goofish-scraper',
    label: 'Devcake (várias variações numa execução só)',
    pricePerItem: 0.002,
    runFee: 0,
    multiKeyword: true,
    priceFilter: false,
    input: ({ keywords, limit }) => ({ keywords, maxItems: limit, fetchDetails: false, includeComments: false }),
    keep: (r) => r && (r._phase ?? 'search') === 'search' && pick(r, 'item_id', 'itemId', 'id'),
  },

  sian: {
    id: 'sian.agency~xianyu-goofish-product-scraper',
    label: 'SIÁN (mais caro; mín. 8 por variação)',
    pricePerItem: 0.0075,
    runFee: 0,
    multiKeyword: true,
    perKeywordLimit: true,
    priceFilter: false,
    input: ({ keywords, limit, sort }) => ({
      operation: 'keywordSearch',
      keywords: keywords.slice(0, 5), // plano grátis: até 5 palavras-chave por execução
      maxResults: Math.max(8, limit),
      ...({ newest: { sort: 'newest' }, price_drop: { sort: 'price_drop' }, price_asc: { sort: 'price_asc' }, price_desc: { sort: 'price_desc' }, credit: { sort: 'credit' } }[sort] || {}),
    }),
    keep: (r) => r && (r.status ?? 'success') === 'success' && pick(r, 'itemId'),
  },
};

// Nível de loja 鱼小铺 (L1–L7): procura em campos com nome de nível e em selos/tags do vendedor.
function shopLevelOf(r) {
  const direct = pick(r, 'shopLevel', 'fishShopLevel', 'sellerShopLevel', 'sellerLevel', 'seller.shopLevel', 'seller.level', 'seller.fishShopLevel', 'userFishShopLevel', 'yxpLevel');
  const n = Number(String(direct ?? '').replace(/\D/g, ''));
  if (n >= 1 && n <= 7) return n;
  const texts = [r.sellerCreditTags, r.sellerTags, r.tags, r.badges, r.seller?.tags, r.userFishShopLabel, r.sellerCredit]
    .filter(Boolean).map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ');
  const m = texts.match(/(?:鱼小铺|店铺|小铺)?\s*(?:L|Lv\.?|等级)\s?([1-7])(?!\d)/i);
  return m ? Number(m[1]) : null;
}

// Mapeamento tolerante: cobre os nomes de campo dos três Actors.
export function mapRow(r) {
  const tags = [r.tags, r.sellerCreditTags, r.labels].flat().filter((t) => typeof t === 'string');
  return makeItem({
    shopLevel: shopLevelOf(r),
    isShop: Boolean(pick(r, 'isFishShop', 'isShop', 'seller.isShop', 'userIsUseFishShopCard')) || null,
    freeShipping: pick(r, 'freeShipping', 'isFreeShipping', 'free_shipping') ?? (/包邮/.test(String(r.shippingText || '')) ? true : undefined),
    tags,
    condition: pick(r, 'conditionText', 'condition', 'stuffStatus'),
    id: pick(r, 'itemId', 'item_id', 'id'),
    title: pick(r, 'title', 'itemTitle', 'name'),
    priceCny: pick(r, 'priceCny', 'price', 'priceYuan', 'price_value', 'soldPrice', 'priceText', 'price_text'),
    url: pick(r, 'url', 'itemUrl', 'detail_url', 'link'),
    image: pick(r, 'image', 'imageUrl', 'mainImageUrl', 'coverUrl', 'picUrl', 'pic_url', 'pictureUrl', 'mainImage', 'cover', 'images.0', 'imageUrls.0'),
    seller: pick(r, 'sellerNick', 'sellerName', 'user_nick', 'seller.nick', 'seller.name', 'userNick'),
    sellerId: pick(r, 'sellerId', 'seller_id', 'seller.seller_id', 'seller.id', 'userId'),
    sellerCredit: pick(r, 'sellerCredit', 'seller.creditLabel', 'sellerCreditTags.0', 'sellerCreditLabel', 'sellerBadges.0'),
    location: pick(r, 'city', 'area', 'location', 'seller.city'),
    wants: pick(r, 'wants', 'wantCount', 'wantCnt', 'want_count', 'want', 'stats.wants'),
    postedAt: pick(r, 'publishTime', 'publish_time', 'postedAt', 'createTime', 'publishedAt'),
  });
}

export class ApifyError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.code = 'APIFY';
  }
}

async function call(path, token, init = {}) {
  if (!token) throw new ApifyError('Configure seu token da Apify (ícone de engrenagem no topo).', 400);
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers || {}) },
    signal: init.signal || AbortSignal.timeout(30_000),
  }).catch((err) => {
    throw new ApifyError(`Não consegui falar com a Apify (${err.cause?.code || err.message}).`, 502);
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) {
    const msg = body?.error?.message || String(text).slice(0, 300);
    if (res.status === 401) throw new ApifyError('Token da Apify inválido. Confira nas configurações.', 401);
    if (res.status === 402 || /usage|limit|credit/i.test(msg)) {
      throw new ApifyError(`A Apify recusou por limite de uso: ${msg}. O crédito grátis renova todo mês.`, 402);
    }
    throw new ApifyError(`Apify respondeu HTTP ${res.status}: ${msg}`, 502);
  }
  return body;
}

// Custo real de uma execução. A Apify devolve "usageTotalUsd" (o que você paga) no objeto da
// execução; em Actors pagos por evento ele pode vir vazio para quem não é dono do Actor, então
// calculamos pelos eventos cobrados (chargedEventCounts × preço de cada evento).
export function runCostUsd(run) {
  if (!run) return null;
  if (Number.isFinite(run.usageTotalUsd) && run.usageTotalUsd > 0) return run.usageTotalUsd;
  const counts = run.chargedEventCounts || run.accountedChargedEventCounts;
  const prices = run.pricingInfo?.pricingPerEvent?.actorChargeEvents;
  if (counts && prices) {
    let total = 0;
    for (const [ev, n] of Object.entries(counts)) total += (Number(prices[ev]?.eventPriceUsd) || 0) * (Number(n) || 0);
    return total;
  }
  return Number.isFinite(run.usageTotalUsd) ? run.usageTotalUsd : null;
}
const DONE = new Set(['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Roda qualquer Actor com uma entrada pronta e espera os itens (até ~5 min).
// Usa a API de execuções (inicia, espera, lê o dataset e o custo) em vez de run-sync, que só
// devolve os itens. O array devolvido leva "meta" com o id da execução e o custo real.
export async function runRaw(actorId, input, token) {
  const started = Date.now();
  let run = (await call(`/acts/${actorId}/runs?timeout=280&waitForFinish=60`, token, {
    method: 'POST', body: JSON.stringify(input), signal: AbortSignal.timeout(75_000),
  }))?.data;
  if (!run?.id) throw new ApifyError('A Apify não iniciou a execução.', 502);
  while (!DONE.has(run.status) && Date.now() - started < 300_000) {
    run = (await call(`/actor-runs/${run.id}?waitForFinish=60`, token, { signal: AbortSignal.timeout(75_000) }))?.data || run;
  }
  const rows = await call(`/datasets/${run.defaultDatasetId}/items?clean=true&format=json`, token, { signal: AbortSignal.timeout(60_000) });
  if (!Array.isArray(rows)) throw new ApifyError('A execução terminou sem devolver itens.', 502);
  if (run.status !== 'SUCCEEDED' && !rows.length) throw new ApifyError(`A execução na Apify terminou como ${run.status} sem anúncios.`, 502);
  // a cobrança por evento às vezes aparece um instante depois do fim: relê uma vez se veio vazia
  let realUsd = null;
  try {
    realUsd = runCostUsd(run);
    if (!realUsd && rows.length) {
      await sleep(1500);
      run = (await call(`/actor-runs/${run.id}`, token))?.data || run;
      realUsd = runCostUsd(run);
    }
  } catch { realUsd = null; } // medir falhou: quem chamou usa a estimativa
  Object.defineProperty(rows, 'meta', {
    value: { runId: run.id, status: run.status, realUsd, chargedEventCounts: run.chargedEventCounts || null, items: rows.length },
    enumerable: false,
  });
  return rows;
}

export async function runActor(actorKey, params, token) {
  const actor = ACTORS[actorKey];
  return runRaw(actor.id, actor.input(params), token);
}

export async function getAccount(token) {
  const [me, limits] = await Promise.all([call('/users/me', token), call('/users/me/limits', token)]);
  return {
    username: me?.data?.username,
    plan: me?.data?.plan?.id || null,
    usedUsd: limits?.data?.current?.monthlyUsageUsd ?? null,
    limitUsd: limits?.data?.limits?.maxMonthlyUsageUsd ?? null,
    cycleEnd: limits?.data?.monthlyUsageCycle?.endAt ?? null,
  };
}

// Busca as variações e devolve [{ term, items, rawSample }]. perTerm = anúncios por busca.
export async function searchApify(actorKey, opts, token) {
  const runs = [];
  const out = await searchApifyInner(actorKey, opts, token, (rows) => { runs.push(rows.meta || {}); return rows; });
  const measured = runs.filter((m) => m.realUsd != null);
  Object.defineProperty(out, 'meta', {
    value: {
      runs: runs.length,
      items: runs.reduce((n, m) => n + (m.items || 0), 0),
      realUsd: runs.length && measured.length === runs.length ? measured.reduce((n, m) => n + m.realUsd, 0) : null,
      runIds: runs.map((m) => m.runId).filter(Boolean),
      perKeywordOverflow: out.perKeywordOverflow || 0,
    },
    enumerable: false,
  });
  return out;
}

async function searchApifyInner(actorKey, { terms, perTerm, limit, sort, minPrice, maxPrice, quick, region }, token, track) {
  const actor = ACTORS[actorKey];
  if (!actor) throw new ApifyError(`Fonte desconhecida: ${actorKey}`, 400);
  const each = Math.max(Number(perTerm) || Math.ceil((limit || 20) / terms.length), 5);
  const filter = actor.priceFilter ? { minPrice, maxPrice, quick, region } : {};

  if (actor.multiKeyword) {
    const keywords = terms.slice(0, actorKey === 'sian' ? 5 : 50);
    const runLimit = actor.perKeywordLimit ? Math.max(8, each) : each * keywords.length;
    const rows = track(await runActor(actorKey, { keywords, limit: runLimit, sort }, token)).filter(actor.keep);
    // Agrupa pela variação que trouxe cada anúncio (quando o Actor informa).
    return keywords.map((term, i) => {
      const mine = rows.filter((r) => (pick(r, 'keyword', '_sourceKeyword') ?? keywords[0]) === term || (i === 0 && !pick(r, 'keyword', '_sourceKeyword')));
      return { term, items: mine.map(mapRow), rawSample: mine[0] };
    });
  }

  if (actor.batchKeywords && terms.length > 1) {
    const keywords = terms.slice(0, 50);
    const rows = track(await runActor(actorKey, { keywords, perKeyword: each, limit: each * keywords.length, sort, ...filter }, token)).filter(actor.keep);
    const byTerm = new Map(keywords.map((t) => [norm(t), []]));
    const loose = []; // linha sem "keyword" reconhecível: vai para todas as variações (o resultado tira repetidos)
    for (const r of rows) {
      const k = norm(pick(r, 'keyword', 'searchKeyword', 'searchQuery', 'searchTerm', 'query', 'searchedAs') ?? '');
      (byTerm.get(k) || loose).push(r);
    }
    // Confere se o Actor respeitou maxItemsPerKeyword. Se passou, guarda só o limite (o excesso
    // já foi cobrado, mas fica registrado em perKeywordOverflow para aparecer no diagnóstico).
    let overflow = 0;
    const result = keywords.map((term) => {
      const own = byTerm.get(norm(term));
      if (own.length > each) overflow += own.length - each;
      const mine = [...own.slice(0, each), ...loose];
      return { term, items: mine.map(mapRow), rawSample: mine[0] };
    });
    result.perKeywordOverflow = overflow;
    return result;
  }

  const settled = await Promise.allSettled(terms.map((term) => runActor(actorKey, { keyword: term, limit: each, sort, ...filter }, token).then(track)));
  const failures = settled.filter((s) => s.status === 'rejected');
  if (failures.length === terms.length) throw failures[0].reason;
  return terms.map((term, i) => {
    const s = settled[i];
    if (s.status === 'rejected') return { term, items: [], error: s.reason.message };
    const rows = s.value.filter(actor.keep);
    return { term, items: rows.map(mapRow), rawSample: rows[0] };
  });
}

// Custo estimado em US$. perTerm = anúncios por busca.
export function estimateCost(actorKey, { terms, perTerm, limit }) {
  const a = ACTORS[actorKey];
  if (!a || !terms?.length) return 0;
  const each = Math.max(Number(perTerm) || Math.ceil((limit || 10) / terms.length), 5);
  const runs = a.multiKeyword || a.batchKeywords ? 1 : terms.length;
  const items = a.perKeywordLimit ? Math.max(8, each) * Math.min(terms.length, 5) : each * terms.length;
  return Math.round((runs * a.runFee + items * a.pricePerItem) * 1000) / 1000;
}
