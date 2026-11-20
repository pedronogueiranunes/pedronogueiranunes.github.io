// Gera variações de busca a partir do termo digitado: marca em chinês, palavras do
// produto em chinês, modelo sem espaço, abreviações usadas no Xianyu (pm = pro max,
// m4 = IV...). As melhores ficam primeiro; a UI deixa marcar/desmarcar.

// apelidos -> nome em chinês (como os vendedores escrevem)
export const BRANDS = {
  iphone: '苹果', apple: '苹果', ipad: '苹果ipad', macbook: '苹果macbook', airpods: '苹果airpods', 'apple watch': '苹果手表',
  sony: '索尼', nintendo: '任天堂', playstation: '索尼ps', canon: '佳能', nikon: '尼康',
  fujifilm: '富士', fuji: '富士', dji: '大疆', xiaomi: '小米', huawei: '华为', samsung: '三星', oppo: 'oppo',
  vivo: 'vivo', oneplus: '一加', honor: '荣耀', leica: '徕卡', ricoh: '理光', olympus: '奥林巴斯', panasonic: '松下',
  sigma: '适马', tamron: '腾龙', gopro: 'gopro', insta360: '影石', garmin: '佳明', casio: '卡西欧', seiko: '精工',
  rolex: '劳力士', omega: '欧米茄', tudor: '帝舵', lego: '乐高', bandai: '万代', pokemon: '宝可梦', dyson: '戴森',
  bose: 'bose', sennheiser: '森海塞尔', 'audio-technica': '铁三角', yamaha: '雅马哈', roland: '罗兰', fender: '芬达',
  gibson: '吉普森', nike: '耐克', adidas: '阿迪达斯', 'new balance': '新百伦', asics: '亚瑟士', 'north face': '北面',
  arcteryx: '始祖鸟', "arc'teryx": '始祖鸟', patagonia: '巴塔哥尼亚', lv: '路易威登', gucci: '古驰', chanel: '香奈儿',
  hermes: '爱马仕', prada: '普拉达', dior: '迪奥', kindle: 'kindle', steam: 'steam', 'steam deck': 'steamdeck',
  rog: '玩家国度', lenovo: '联想', thinkpad: 'thinkpad', dell: '戴尔', asus: '华硕', logitech: '罗技', razer: '雷蛇',
  nvidia: '英伟达', rtx: 'rtx', amd: 'amd', intel: '英特尔', hasselblad: '哈苏', zeiss: '蔡司', pentax: '宾得',
};

// palavras de produto em português/inglês -> chinês
export const WORDS = {
  camera: '相机', câmera: '相机', camara: '相机', lente: '镜头', lens: '镜头', relógio: '手表', relogio: '手表', watch: '手表',
  fone: '耳机', headphone: '耳机', headphones: '耳机', earbuds: '耳机', celular: '手机', phone: '手机', notebook: '笔记本',
  laptop: '笔记本', tablet: '平板', console: '游戏机', videogame: '游戏机', tênis: '球鞋', tenis: '球鞋', sneakers: '球鞋',
  bolsa: '包', bag: '包', teclado: '键盘', keyboard: '键盘', mouse: '鼠标', guitarra: '吉他', guitar: '吉他',
  bicicleta: '自行车', bike: '自行车', drone: '无人机', jaqueta: '外套', jacket: '外套', placa: '显卡', gpu: '显卡',
  monitor: '显示器', caixa: '音箱', speaker: '音箱', 'caixa de som': '音箱', perfume: '香水', óculos: '眼镜', oculos: '眼镜',
};

const ROMAN = { ii: 2, iii: 3, iv: 4, v: 5, vi: 6 };
const ROMAN_OF = { 2: 'ii', 3: 'iii', 4: 'iv', 5: 'v', 6: 'vi' };

export const norm = (s) => String(s || '').normalize('NFKC').toLowerCase().replace(/[\s\-_/·.,，。!！()（）【】\[\]]+/g, '');

function translateLead(q) {
  // troca a primeira marca/palavra conhecida pelo nome em chinês
  let out = q;
  let changed = false;
  for (const [k, zh] of Object.entries({ ...BRANDS, ...WORDS }).sort((a, b) => b[0].length - a[0].length)) {
    const re = new RegExp(`(^|\\s)${k.replace(/[.*+?^${}()|[\]\\']/g, '\\$&')}(?=\\s|$)`, 'i');
    if (re.test(out)) {
      out = out.replace(re, `$1${zh}`);
      changed = true;
      break; // só a primeira marca/palavra: evita "任天堂 任天堂switch"
    }
  }
  return changed ? out.replace(/\s+/g, ' ').trim() : null;
}

function abbreviations(q) {
  const out = [];
  const lower = q.toLowerCase();
  if (/pro\s*max/.test(lower)) out.push(lower.replace(/pro\s*max/, 'pm'));
  // câmeras: "a7 iv" <-> "a7m4"
  const m1 = lower.match(/([a-z]+\d+)\s*m([2-6])\b/);
  if (m1) out.push(lower.replace(m1[0], `${m1[1]}${ROMAN_OF[m1[2]]}`));
  // só "a7 iv" (com espaço) ou modelos Sony "a7iv"; evita estragar "x100v"
  const m2 = lower.match(/([a-z]+\d+)\s+(vi|iv|v|iii|ii)\b/) || lower.match(/\b(a\d[rsc]?)(vi|iv|v|iii|ii)\b/);
  if (m2) out.push(lower.replace(m2[0], `${m2[1]}m${ROMAN[m2[2]]}`));
  return out;
}

// Palavras de condição/qualidade: servem para buscar, mas não para decidir se o anúncio
// é do produto certo (muitos anúncios bons não repetem "无拆无修" no título).
const QUALIFIERS = new Set(['无拆无修', '未拆修', '无拆修', '未拆未修', '无维修', '原装', '原版', '验货宝', '验机', '准新', '准新机', '全新', '自用',
  '国行', '港版', '美版', '日版', '韩版', '欧版', '二手', '正品', '在保', '保修', '包邮', '未激活', '仅拆封', '无锁', '个人', '闲置', '低价', '便宜',
  'seminovo', 'usado', 'original', 'novo', 'new', 'used']);
const isQualifier = (t) => QUALIFIERS.has(t) || /^\d{2}新$|^[一二三四五六七八九]成新$|^电池\d*%?$|^\d+%$/.test(t);

// "iphone 17; 苹果17 无拆无修" -> ["iphone 17", "苹果17 无拆无修"]
export const splitSearches = (q) => String(q || '').split(/[;；\n]+/).map((x) => x.trim().replace(/\s+/g, ' ')).filter(Boolean);

// separa "苹果17" -> "苹果 17" e "iphone17" -> "iphone 17" (mas não "a7m4" nem "x100v")
function splitWords(q) {
  return String(q || '').toLowerCase().normalize('NFKC')
    .replace(/pro\s*max/g, 'promax')
    .replace(/([一-鿿])(?=[a-z0-9])/g, '$1 ')
    .replace(/([a-z0-9])(?=[一-鿿])/g, '$1 ')
    .replace(/\b([a-z]{3,})(?=\d)/g, '$1 ')
    .split(/\s+/).filter(Boolean);
}

// Só o produto, sem as palavras de condição: "苹果17 无拆无修" -> "苹果 17"
export const productCore = (q) => {
  // tira os qualificadores ANTES de separar números ("99新" e "电池100" saem inteiros)
  const words = (splitSearches(q)[0] || '').toLowerCase().normalize('NFKC').split(/\s+/).filter((w) => w && !isQualifier(w));
  // qualificador colado no produto: "苹果17无拆无修"
  const stripped = words.map((w) => w.replace(/无拆无修|未拆修|无拆修|验货宝|国行|自用|准新机?|\d{2}新|电池\d+%?/g, '')).filter(Boolean);
  return splitWords(stripped.join(' ')).filter((t) => !isQualifier(t)).join(' ');
};

const QUALIFIER_SUGGESTIONS = [
  ['无拆无修', 'nunca aberto nem reparado'],
  ['验货宝', 'com inspeção do Xianyu'],
  ['99新', 'estado 99% novo'],
  ['自用', 'uso pessoal (menos lojista)'],
  ['国行', 'versão oficial chinesa'],
];

// Sugestões de variações (nada é selecionado automaticamente na UI).
export function expandQuery(query, max = 10) {
  const q = splitSearches(query)[0] || '';
  if (!q) return [];
  const cands = [];
  const add = (term, reason) => term && cands.push({ term: term.trim(), reason });

  add(q, 'como você digitou');
  const zh = translateLead(q);
  add(zh, 'nome em chinês');
  if (/\s/.test(q)) add(q.replace(/\s+/g, ''), 'modelo junto (sem espaço)');
  if (zh && /\s/.test(zh)) add(zh.replace(/\s+/g, ''), 'chinês, junto');
  for (const a of abbreviations(q)) {
    add(a, 'abreviação usada no Xianyu');
    const az = translateLead(a);
    if (az) add(az.replace(/\s+/g, ''), 'abreviação em chinês');
  }
  const base = (zh || q).replace(/\s+/g, '');
  const have = norm(q);
  for (const [w, why] of QUALIFIER_SUGGESTIONS) if (!have.includes(norm(w))) add(`${base} ${w}`, why);

  const seen = new Set();
  return cands.filter((c) => {
    const k = norm(c.term);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, max);
}

// Para o filtro de relevância: cada palavra do PRODUTO (sem qualificadores) + apelidos.
export function queryTokens(query) {
  // "a7 iv" / "a7 mark iv" viram um token só ("a7iv"), que também casa com "a7m4" dos títulos chineses
  const tokens = productCore(query).replace(/\b([a-z]+\d+)\s+(?:mark\s+)?(vi|iv|v|iii|ii)\b/g, '$1$2').split(' ').filter(Boolean);
  return tokens.map((t) => {
    const aliases = new Set([norm(t)]);
    if (t === 'promax') aliases.add('pm');
    if (/^\d+pm$/.test(t)) aliases.add(t.replace(/pm$/, 'promax'));
    if (BRANDS[t]) aliases.add(norm(BRANDS[t]));
    if (WORDS[t]) aliases.add(norm(WORDS[t]));
    if (['iphone', 'apple', '苹果'].includes(t)) aliases.add('苹果').add('iphone').add('apple');
    for (const [k, zh] of Object.entries(BRANDS)) if (norm(zh) === t) aliases.add(norm(k)); // 索尼 -> sony
    const m1 = t.match(/^([a-z]+\d+)m([2-6])$/);
    if (m1) aliases.add(m1[1] + ROMAN_OF[m1[2]]);
    const m2 = t.match(/^([a-z]+\d+)(vi|iv|v|iii|ii)$/);
    if (m2) aliases.add(`${m2[1]}m${ROMAN[m2[2]]}`);
    return { token: t, aliases: [...aliases], numeric: /^\d+$/.test(t) };
  });
}

// Tira variações que trariam praticamente os mesmos anúncios antes de pagar por elas.
// Duas variações contam como iguais quando, depois de normalizar caixa, largura (NFKC),
// espaços e pontuação, têm as mesmas palavras, mesmo em outra ordem ("17 苹果" = "苹果17",
// "A7 IV" = "a7iv"). Variações com palavras diferentes (ex.: com "无拆无修") ficam, porque
// trazem outro recorte de anúncios. Devolve { kept, dropped: [{ term, sameAs, reason }] }.
const termWords = (t) => splitWords(String(t || '').replace(/[\-_/·.,，。!！()（）【】\[\]'"“”:：+]+/g, ' ')).sort();
export function dedupeTerms(terms, max = Infinity) {
  const kept = [];
  const dropped = [];
  const seen = new Map(); // assinatura -> variação mantida
  for (const raw of terms) {
    const term = String(raw || '').trim().replace(/\s+/g, ' ');
    if (!term) continue;
    const joined = norm(term);
    const words = termWords(term);
    const bag = words.join(' ');
    const sameJoined = seen.get(`j:${joined}`);
    const sameBag = seen.get(`b:${bag}`);
    // as palavras juntas na ordem certa ("a7 iv" e "a7iv") ou as mesmas palavras em outra ordem
    const bagJoined = seen.get(`j:${norm(bag)}`) || [...seen.entries()].find(([k]) => k.startsWith('b:') && norm(k.slice(2)) === joined)?.[1];
    const prev = sameJoined || sameBag || bagJoined;
    if (prev) {
      dropped.push({ term, sameAs: prev, reason: sameJoined ? 'igual a outra variação (só muda espaço, caixa ou pontuação)' : 'mesmas palavras em outra ordem' });
      continue;
    }
    if (kept.length >= max) { dropped.push({ term, sameAs: null, reason: `passou do limite de ${max} variações` }); continue; }
    kept.push(term);
    seen.set(`j:${joined}`, term);
    seen.set(`b:${bag}`, term);
  }
  return { kept, dropped };
}
