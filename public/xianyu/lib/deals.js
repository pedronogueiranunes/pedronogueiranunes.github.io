// Analisa os anúncios: marca lixo (compra, aluguel, sinal, acessório, peça, bloqueado),
// mede relevância ao termo, calcula o preço típico (mediana) e o desconto de cada anúncio.
import { norm, queryTokens, productCore } from './variations.js';
import { titleColors, attrMatch, parseQuery } from './attributes.js';

const FLAGS = [
  { key: 'wanted', label: 'Pedido de compra', re: /求购|收购|回收|高价收|收一[台个部]|蹲一[个台]|想收|求一[个台]/ },
  { key: 'rent', label: 'Aluguel', re: /出租|租赁|租用|日租|月租/ },
  { key: 'deposit', label: 'Só sinal/depósito', re: /定金|订金|押金|预付/ },
  { key: 'parts', label: 'Peças/defeito', re: /故障|坏了|损坏|不开机|拆机|零件|配件机|主板|总成|维修|进水|报废/ },
  { key: 'locked', label: 'Bloqueado', re: /有锁|id锁|监管机|网络锁|资源机|无法激活/ },
  { key: 'dummy', label: 'Réplica/caixa', re: /模型机|样品机|展示机|空盒|仅包装|只有盒|高仿|复刻|仿品|a货/ },
  { key: 'swap', label: 'Troca', re: /置换|互换|换购|以旧换新/ },
  { key: 'service', label: 'Serviço/digital', re: /代下|代购|代拍|教程|租号|账号|激活码/ },
  // não dá para mandar ao agente: só entrega em mãos / retirada na cidade
  { key: 'localOnly', label: 'Só retirada em mãos', re: /同城自提|仅限?同城|只限?同城|同城面交|仅面交|只面交|只能面交|不邮寄|不发货|只自提|仅自提|自提不邮|不支持邮寄/ },
  // preço do anúncio não é o real
  { key: 'bait', label: 'Preço isca / a combinar', re: /拍下改价|价格不对|标价不对|价格不准|不是实价|非实价|价格私聊|私聊价格|价格面议|面议|勿拍|不要拍|别拍/ },
];
// Frases que NEGAM reparo/troca ("无拆无修" = nunca aberto nem reparado). Removidas antes de marcar.
const NEGATIONS = /无拆无修|未拆未修|未拆修|无拆修|不拆不修|无维修|未维修|没维修|没有维修|没修过|未修过|无修|无拆|未拆机|无进水|未进水|没进水|没换过|未换过|无更换|没有换过|没有更换|原装未换|非翻新|无翻新/g;
const REPAIRED = { key: 'repaired', label: 'Peça trocada/reparo', re: /换过?电池|换过?屏|换过?后盖|换过?摄像头|换过?主板|后压屏|副厂|非原装|组装机|翻新机?|维修过|修过|拆修过|有维修|换过|更换过/ };
// Saúde da bateria no título: "电池100"、"电池健康95%"、"电池效率 92"
const BATTERY = /电池(?:健康度?|效率|寿命|容量|最大容量)?\s*[:：]?\s*(\d{2,3})(?!\d|\s*新|\s*成)/;
// Variantes de modelo: buscar "iphone 17" não deve misturar 17 Pro/Max/Air no preço típico.
const VARIANTS = ['promax', 'pro', 'max', 'pm', 'air', 'plus', 'mini', 'ultra', 'lite', 'fe'];

const ACCESSORY = /手机壳|保护壳|钢化膜|贴膜|保护套|保护膜|数据线|充电器|充电头|支架|贴纸|收纳包|镜头盖|遮光罩|表带|耳机套|皮套|手柄套/;
// Acessório que VEM JUNTO ("附赠原装数据线" = acompanha o cabo original) não faz do anúncio um acessório.
const INCLUDED_ACCESSORY = new RegExp(`(?:附赠|附送|赠送|另送|赠|送|附带|自带|带|配|含|包含|还有)(?:原装|原厂|原配|官方|全新)?(?:的)?(?:${ACCESSORY.source})`, 'g');

// Erro de digitação em palavra latina do título ("figthter" por "fighter"): distância de edição 1,
// mesma primeira letra, palavras de 5+ letras.
const within1 = (a, b) => {
  if (Math.abs(a.length - b.length) > 1 || a === b) return a === b;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else if (a[i] === b[j + 1] && a[i + 1] === b[j]) { i += 2; j += 2; } // letras trocadas
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
};
const fuzzyWord = (alias, words) => alias.length >= 5 && /^[a-z]+$/.test(alias) && words.some((w) => w[0] === alias[0] && within1(alias, w));

const median = (arr) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const quantile = (arr, q) => {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * q)))];
};

const GOOD_CREDIT = /极好|优秀/;

// ---- atributos lidos do título (servem para celulares, notebooks, câmeras, roupas…) ----
const STORAGE_SIZES = new Set([16, 32, 64, 128, 256, 512, 1024, 2048, 4096]);
const VERSIONS = [[/国行|大陆版|行货/, 'CN'], [/港版|港行/, 'HK'], [/美版|美行/, 'US'], [/日版|日行/, 'JP'], [/欧版|英版|德版|法版/, 'EU'], [/韩版/, 'KR'], [/台版/, 'TW']];
export function parseAttrs(title) {
  const s = String(title || '').normalize('NFKC');
  const l = s.toLowerCase();
  const a = {};
  let m;
  // RAM + armazenamento: "8+256", "12G+512G", "16+1T"
  if ((m = l.match(/(?:^|[^\d.])(\d{1,2})\s*(?:g|gb)?\s*\+\s*(\d{1,4})\s*(g|gb|t|tb)?(?![\d.])/))) {
    let st = Number(m[2]); if (/t/.test(m[3] || '') || st <= 4) st *= 1024;
    if (STORAGE_SIZES.has(st) && Number(m[1]) <= 32) { a.ram = Number(m[1]); a.storage = st; }
  }
  if ((m = l.match(/(\d{1,2})\s*g(?:b)?\s*(?:内存|运存|ram)/) || l.match(/(?:内存|运存|ram)\s*[:：]?\s*(\d{1,2})\s*g/))) a.ram = a.ram || Number(m[1]);
  if (a.storage == null) {
    const cands = [...l.matchAll(/(?:^|[^\d.])(\d{1,4})\s*(g|gb|t|tb)(?![a-z\d])/g)]
      .map((x) => (/t/.test(x[2]) ? Number(x[1]) * 1024 : Number(x[1])))
      .filter((v) => STORAGE_SIZES.has(v) && v !== a.ram);
    if (cands.length) a.storage = Math.max(...cands);
  }
  // sem unidade: "Pro Max 256 原装" — só os tamanhos típicos (64/128/256/512) soltos no título
  if (a.storage == null && (m = l.match(/(?:^|[\s\u3400-\u9fff,，/])(64|128|256|512)(?=$|[\s\u3400-\u9fff,，/])/))) a.storage = Number(m[1]);
  // estado: 全新 = 100, 99新 = 99, 9成新 = 90
  if (/全新|未拆封|未激活|未使用|全新未拆/.test(s) && !/非全新|几乎全新|准全新/.test(s)) a.condition = 100;
  else if (/几乎全新|准新|准全新/.test(s)) a.condition = 99;
  else if ((m = s.match(/(\d{2})\s*新/)) && Number(m[1]) >= 50 && Number(m[1]) <= 99) a.condition = Number(m[1]);
  else if ((m = s.match(/([5-9])\s*成\s*新/))) a.condition = Number(m[1]) * 10;
  // garantia, completo, versão
  if (/在保|保修期?(?:内|到|至)|官保|保到\d|applecare|ac\+|还有保修/i.test(s) && !/过保|无保修|没保修/.test(s)) a.warranty = true;
  if (/配件齐全|全套|盒说全|原盒|包装齐全|全配|带盒|原装盒|配件全/.test(s)) a.complete = true;
  for (const [re, v] of VERSIONS) if (re.test(s)) { a.version = v; break; }
  // câmeras: cliques do obturador ("快门1万", "快门数3000", "快门5k")
  if ((m = l.match(/快门(?:次数|数|数量)?\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(万|w|k|千)?/))) {
    const mult = { 万: 10000, w: 10000, k: 1000, 千: 1000 }[m[2]] || 1;
    a.shutter = Math.round(Number(m[1]) * mult);
  }
  // notebooks: ciclos de bateria ("循环 86 次", "86次循环")
  if ((m = l.match(/(?:循环|充电)(?:次数)?\s*[:：]?\s*(\d{1,4})\s*次?/) || l.match(/(\d{1,4})\s*次\s*循环/))) a.cycles = Number(m[1]);
  // tela em polegadas
  if ((m = l.match(/(\d{2}(?:\.\d)?)\s*(?:英寸|寸)/)) && Number(m[1]) >= 10 && Number(m[1]) <= 100) a.screen = Number(m[1]);
  // tamanho: calçado (42码) ou roupa (XL码)
  if ((m = l.match(/(?:^|[^\d.])(3[4-9]|4[0-8])(?:\.5)?\s*码/))) a.size = m[0].replace(/[^\d.]/g, '');
  else if ((m = s.match(/(?:尺码|码数)?\s*\b(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL)\b\s*(?:码|号)/i) || s.match(/(?:尺码|码数)\s*[:：]?\s*(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL)\b/i))) a.size = m[1].toUpperCase();
  // cor: a primeira citada no título; se citar várias ("黑色 白色"), todas ficam em colors
  const cs = titleColors(s);
  if (cs.length) { a.color = cs[0]; if (cs.length > 1) a.colors = cs; }
  return a;
}

const MIN_GROUP = 4;
const condBucket = (c) => (c == null ? null : c >= 100 ? 'new' : c >= 98 ? '98' : c >= 95 ? '95' : c >= 90 ? '90' : 'low');
const COND_LABEL = { new: 'novo', 98: '98–99%', 95: '95–97%', 90: '90–94%', low: 'abaixo de 90%' };
const fmtGB = (v) => (v >= 1024 ? `${v / 1024} TB` : `${v} GB`);
const CREDIT = [[/极好/, 5], [/优秀/, 4], [/良好/, 3], [/中等|一般/, 2], [/极差|很差/, 0], [/较差/, 1]];
const creditLevel = (c) => { for (const [re, l] of CREDIT) if (re.test(String(c || ''))) return l; return null; };

export function analyze(items, query) {
  const tokens = queryTokens(query);
  const qAttrs = parseQuery(query).attrs; // cor, memória, estado, versão digitados: viram chips, não palavra obrigatória
  const queryHasAccessory = ACCESSORY.test(query);

  const q = norm(productCore(query));
  const modelNumbers = productCore(query).match(/\b\d+\b/g) || [];
  const enriched = items.map((it) => {
    const raw = norm(it.title);
    const t = raw.replace(NEGATIONS, ' ');
    const flags = FLAGS.filter((f) => f.re.test(t)).map(({ key, label }) => ({ key, label }));
    if (REPAIRED.re.test(t) && !flags.some((f) => f.key === 'parts')) flags.push({ key: REPAIRED.key, label: REPAIRED.label });

    const bm = raw.match(BATTERY);
    const battery = bm && Number(bm[1]) >= 50 && Number(bm[1]) <= 100 ? Number(bm[1]) : null;

    // "17pro" quando a busca é só "17" → outro modelo
    for (const n of modelNumbers) {
      const m = raw.match(new RegExp(`(?:^|\\D)${n}(${VARIANTS.join('|')})`));
      if (m && !q.includes(m[1]) && !(m[1] === 'pm' && q.includes('promax'))) {
        flags.push({ key: 'variant', label: `Outro modelo (${n} ${m[1]})` });
        break;
      }
    }
    if (!queryHasAccessory && ACCESSORY.test(t.replace(INCLUDED_ACCESSORY, ' '))) flags.push({ key: 'accessory', label: 'Acessório' });

    // números comparados no título com espaços (senão "17 256G" vira "17256")
    const spaced = String(it.title).normalize('NFKC').toLowerCase();
    const words = spaced.match(/[a-z]+/g) || [];
    const matched = tokens.filter(({ aliases, numeric }) =>
      aliases.some((a) => (numeric ? new RegExp(`(^|\\D)${a}(\\D|$)`).test(spaced) : t.includes(a) || raw.includes(a) || fuzzyWord(a, words))),
    ).length;
    const relevance = tokens.length ? matched / tokens.length : 1;
    const attrs = parseAttrs(it.title);
    if (battery != null) attrs.battery = battery;
    // true = o título diz o atributo pedido; false = diz outro; null = não diz
    const attrHit = qAttrs.length ? Object.fromEntries(qAttrs.map((a) => [a.id, attrMatch(a, attrs)])) : undefined;
    return { ...it, flags, relevance, battery, attrs, attrMatch: attrHit, goodSeller: GOOD_CREDIT.test(it.sellerCredit || '') };
  });

  // Preço típico: só anúncios relevantes, sem lixo e com preço.
  let base = enriched.filter((i) => i.priceCny > 0 && i.relevance === 1 && !i.flags.length);
  // produto de nicho (poucos anúncios): 3 certos valem mais que misturar outros produtos no preço típico
  if (base.length < 3) base = enriched.filter((i) => i.priceCny > 0 && i.relevance >= 0.5 && !i.flags.length);
  // corta extremos (ex.: preço isca de ¥1 e anúncios de ¥99999) antes da mediana
  const trimmed = (arr) => {
    const ps = arr.map((i) => i.priceCny);
    if (ps.length < 6) return ps;
    const lo = quantile(ps, 0.1), hi = quantile(ps, 0.9);
    const c = ps.filter((p) => p >= lo && p <= hi);
    return c.length >= 3 ? c : ps;
  };
  const core = trimmed(base);
  const typical = median(core);

  // Preço típico POR VARIANTE: compara 256 GB com 256 GB, "99% novo" com "99% novo"…
  const groups = new Map();
  const put = (k, it) => { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(it); };
  for (const it of base) {
    const st = it.attrs?.storage, cb = condBucket(it.attrs?.condition);
    if (st) put(`s:${st}`, it);
    if (cb) put(`c:${cb}`, it);
    if (st && cb) put(`sc:${st}|${cb}`, it);
  }
  const gMed = new Map([...groups].filter(([, v]) => v.length >= MIN_GROUP).map(([k, v]) => [k, { median: median(trimmed(v)), n: v.length }]));
  const refFor = (it) => {
    const st = it.attrs?.storage, cb = condBucket(it.attrs?.condition);
    const tries = [st && cb && [`sc:${st}|${cb}`, `${fmtGB(st)} · ${COND_LABEL[cb]}`], st && [`s:${st}`, fmtGB(st)], cb && [`c:${cb}`, COND_LABEL[cb]]].filter(Boolean);
    for (const [k, label] of tries) { const g = gMed.get(k); if (g) return { cny: g.median, n: g.n, label, basis: 'variant' }; }
    return typical ? { cny: typical, n: base.length, label: 'todos os anúncios', basis: 'all' } : null;
  };

  // Mesma foto usada por vendedores diferentes: revenda de fotos alheias ou golpe
  const imgSellers = new Map();
  for (const it of enriched) {
    if (!it.image) continue;
    const k = String(it.image).split('?')[0];
    if (!imgSellers.has(k)) imgSellers.set(k, new Set());
    imgSellers.get(k).add(it.sellerId || it.seller || it.id);
  }

  const results = enriched.map((it) => {
    const ref = refFor(it);
    const ratio = ref && it.priceCny ? it.priceCny / ref.cny : null;
    const flags = [...it.flags];
    // Muito abaixo do típico: provável isca/golpe. Tolerância menor se o vendedor não tem avaliação.
    if (ratio != null && !flags.length && (ratio < 0.45 || (ratio < 0.65 && !it.sellerCredit))) {
      flags.push({ key: 'suspicious', label: 'Barato demais (confira: possível golpe)' });
    }
    if (it.image && (imgSellers.get(String(it.image).split('?')[0])?.size || 0) > 1) flags.push({ key: 'dupimg', label: 'Mesma foto em outro vendedor' });
    if (it.relevance < 1) flags.push({ key: 'offtopic', label: 'Pouco relevante' });
    const eligible = !flags.length && it.priceCny > 0;
    const discount = ratio != null ? 1 - ratio : null;
    // Confiança no vendedor (0–1): nível da loja e reputação
    const cl = creditLevel(it.sellerCredit);
    const trust = 0.5 * (it.shopLevel ? it.shopLevel / 7 : 0.35) + 0.5 * (cl == null ? 0.4 : cl / 5);
    // "Negócio confiável": o desconto vale mais quando o vendedor é confiável
    const score = eligible && discount != null
      ? (discount > 0 ? discount * (0.5 + trust) : discount - (1 - trust) * 0.05) + Math.min(it.wants || 0, 50) / 3000
      : -1;
    return { ...it, flags, discount, score, eligible, trust: Math.round(trust * 100), refCny: ref?.cny ?? null, refLabel: ref?.label ?? null, refN: ref?.n ?? null, refBasis: ref?.basis ?? null };
  });

  const variants = [...gMed].filter(([k]) => k.startsWith('sc:') || k.startsWith('s:'))
    .map(([k, g]) => {
      const [st, cb] = k.replace(/^sc?:/, '').split('|');
      return { storage: Number(st), cond: cb || null, label: cb ? `${fmtGB(Number(st))} · ${COND_LABEL[cb]}` : `${fmtGB(Number(st))} (qualquer estado)`, medianCny: g.median, n: g.n };
    })
    .sort((a, b) => a.storage - b.storage || String(a.cond || '').localeCompare(String(b.cond || '')));

  return {
    results,
    reference: typical
      ? {
          typicalCny: typical,
          p25Cny: quantile(core, 0.25),
          p75Cny: quantile(core, 0.75),
          sample: base.length,
          variants,
        }
      : null,
  };
}
