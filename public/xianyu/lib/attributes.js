// Atributos que a pessoa digita junto do produto: cor, memória, estado e versão (origem).
// Servem para 3 coisas: (1) sair do "nome do produto" (a relevância não pode exigir "verde" no
// título), (2) virar buscas em chinês e em inglês, (3) virar chips que o usuário controla
// (preferir, exigir ou ignorar) e que casam com o que está escrito no título do anúncio.

const nf = (s) => String(s || '').normalize('NFKC').toLowerCase();

// re = como os vendedores escrevem a cor no título. Cuidado com palavras que contêm o caractere
// sem ser cor: 蓝牙 (bluetooth), 绿联 (Ugreen), 红米 (Redmi), 黄金 (ouro), 粉丝 (fã).
export const COLORS = {
  green: { label: 'verde', pt: ['verde'], en: ['green'], zh: ['绿色', '绿'], re: /绿(?!联)/ },
  black: { label: 'preto', pt: ['preto', 'preta'], en: ['black'], zh: ['黑色', '黑'], re: /黑/ },
  white: { label: 'branco', pt: ['branco', 'branca'], en: ['white'], zh: ['白色', '白'], re: /白(?!条)/ },
  blue: { label: 'azul', pt: ['azul'], en: ['blue'], zh: ['蓝色', '蓝'], re: /蓝(?!牙)/ },
  red: { label: 'vermelho', pt: ['vermelho', 'vermelha'], en: ['red'], zh: ['红色', '红'], re: /红(?!包|外|米)/ },
  pink: { label: 'rosa', pt: ['rosa'], en: ['pink'], zh: ['粉色', '粉'], re: /粉(?!丝|尘)/ },
  purple: { label: 'roxo', pt: ['roxo', 'roxa', 'lilás', 'lilas', 'violeta'], en: ['purple', 'violet', 'lavender'], zh: ['紫色', '紫'], re: /紫/ },
  silver: { label: 'prata', pt: ['prata', 'prateado', 'prateada'], en: ['silver'], zh: ['银色', '银'], re: /银(?!行)/ },
  gold: { label: 'dourado', pt: ['dourado', 'dourada', 'ouro'], en: ['gold'], zh: ['金色', '金'], re: /金色|香槟金|土豪金|玫瑰金/ },
  gray: { label: 'cinza', pt: ['cinza'], en: ['gray', 'grey'], zh: ['灰色', '灰'], re: /灰/ },
  orange: { label: 'laranja', pt: ['laranja'], en: ['orange'], zh: ['橙色', '橙'], re: /橙/ },
  yellow: { label: 'amarelo', pt: ['amarelo', 'amarela'], en: ['yellow'], zh: ['黄色', '黄'], re: /黄(?!金|牛)/ },
  brown: { label: 'marrom', pt: ['marrom'], en: ['brown'], zh: ['棕色', '棕'], re: /棕|咖啡色/ },
};
export const COLOR_LABEL = Object.fromEntries(Object.entries(COLORS).map(([k, c]) => [k, c.label]));
const COLOR_BY_WORD = new Map();
const COLOR_BY_CHAR = new Map();
for (const [k, c] of Object.entries(COLORS)) {
  for (const w of [...c.pt, ...c.en, ...c.zh]) COLOR_BY_WORD.set(w, k);
  COLOR_BY_CHAR.set(c.zh[1], k);
}

export const VERSIONS = {
  CN: { label: 'China (国行)', zh: '国行', words: ['cn', 'china', 'chinês', 'chines', '国行', '大陆版'] },
  HK: { label: 'Hong Kong (港版)', zh: '港版', words: ['hk', 'hongkong', '港版', '港行'] },
  JP: { label: 'Japão (日版)', zh: '日版', words: ['jp', 'japão', 'japao', 'japan', '日版', '日行'] },
  KR: { label: 'Coreia (韩版)', zh: '韩版', words: ['kr', 'korea', 'coreia', '韩版'] },
  US: { label: 'EUA (美版)', zh: '美版', words: ['美版', '美行'] },
  EU: { label: 'Europa (欧版)', zh: '欧版', words: ['欧版'] },
};
const VERSION_BY_WORD = new Map(Object.entries(VERSIONS).flatMap(([k, v]) => v.words.map((w) => [w, k])));

const STORAGE = new Set([64, 128, 256, 512, 1024, 2048, 4096]);
const fmtStorage = (v) => (v >= 1024 ? `${v / 1024} TB` : `${v} GB`);

function attrOf(token, index, hasCore) {
  const t = nf(token);
  const c = COLOR_BY_WORD.get(t) || (/^[深浅暗亮]?([绿黑白蓝红粉紫银金灰橙黄棕])色?$/.exec(t) && COLOR_BY_CHAR.get(/^[深浅暗亮]?([绿黑白蓝红粉紫银金灰橙黄棕])色?$/.exec(t)[1]));
  if (c) return { id: `color:${c}`, kind: 'color', value: c, label: COLORS[c].label, zh: COLORS[c].zh[0], en: COLORS[c].en[0] };
  let m = /^(\d{2,4})\s?(g|gb)$/.exec(t);
  if (m && STORAGE.has(Number(m[1]))) return storageAttr(Number(m[1]));
  m = /^(\d)\s?(t|tb)$/.exec(t);
  if (m && STORAGE.has(Number(m[1]) * 1024)) return storageAttr(Number(m[1]) * 1024);
  // número solto só vale como memória depois do nome do produto e nos tamanhos que não se confundem com modelo
  if (hasCore && /^(128|256|512)$/.test(t)) return storageAttr(Number(t));
  if (['novo', 'nova', 'lacrado', 'lacrada', '全新'].includes(t)) return { id: 'condition:100', kind: 'condition', value: 100, label: 'novo', zh: '全新', en: null };
  m = /^(\d{2})新$/.exec(t);
  if (m && Number(m[1]) >= 50 && Number(m[1]) <= 99) return { id: `condition:${m[1]}`, kind: 'condition', value: Number(m[1]), label: `${m[1]}% ou mais`, zh: `${m[1]}新`, en: null };
  const v = VERSION_BY_WORD.get(t);
  if (v) return { id: `version:${v}`, kind: 'version', value: v, label: VERSIONS[v].label, zh: VERSIONS[v].zh, en: null };
  return null;
}
function storageAttr(v) {
  return { id: `storage:${v}`, kind: 'storage', value: v, label: fmtStorage(v), zh: v >= 1024 ? `${v / 1024}T` : `${v}G`, en: v >= 1024 ? `${v / 1024}tb` : `${v}gb` };
}

// "iphone 17 verde 256gb" -> { core: "iphone 17", attrs: [verde, 256 GB] }
// Só olha a primeira busca (as outras, separadas por ";", são tratadas uma a uma pelo app).
// Nomes de produto que carregam uma cor: não são atributo.
const NAME_WITH_COLOR = /black\s?shark|red\s?magic|pink\s?floyd|green\s?lantern|white\s?stripes/g;
export function parseQuery(query) {
  const first = String(query || '').split(/[;；\n]+/)[0].trim();
  const tokens = nf(first).replace(NAME_WITH_COLOR, (m) => m.replace(/\s/g, '\u0001')).split(/\s+/).filter(Boolean);
  const core = [];
  const attrs = [];
  tokens.forEach((t, i) => {
    const a = attrOf(t, i, core.length > 0);
    if (a && !attrs.some((x) => x.id === a.id)) attrs.push({ ...a, token: t });
    else if (!a) core.push(t);
  });
  // só havia atributos ("verde"): trata tudo como produto, não há o que filtrar
  if (!core.length) return { core: tokens.join(' ').replace(/\u0001/g, ' '), attrs: [] };
  return { core: core.join(' ').replace(/\u0001/g, ' '), attrs };
}

// Cores citadas no título, na ordem em que aparecem ("黑色 白色" -> ['black', 'white']).
export function titleColors(title) {
  const s = nf(title);
  const hits = [];
  for (const [k, c] of Object.entries(COLORS)) {
    let at = s.search(c.re);
    for (const w of c.en) { const i = s.search(new RegExp(`(^|[^a-z])${w}([^a-z]|$)`)); if (i >= 0 && (at < 0 || i < at)) at = i; }
    if (at >= 0) hits.push([at, k]);
  }
  return hits.sort((a, b) => a[0] - b[0]).map((h) => h[1]);
}

// true = o título diz isso; false = diz outra coisa; null = não diz (anúncio sem o dado).
// "it" é o objeto de atributos lido do título (parseAttrs em deals.js).
export function attrMatch(a, it = {}) {
  if (a.kind === 'color') {
    const cs = it.colors || (it.color ? [it.color] : []);
    return cs.includes(a.value) ? true : cs.length ? false : null;
  }
  if (a.kind === 'storage') return it.storage == null ? null : it.storage === a.value;
  if (a.kind === 'condition') return it.condition == null ? null : it.condition >= a.value;
  if (a.kind === 'version') return it.version == null ? null : it.version === a.value;
  return null;
}

// Dados dos chips para a interface (sem funções, vão por JSON).
export const chipsOf = (query) => parseQuery(query).attrs.map(({ id, kind, value, label }) => ({ id, kind, value, label }));
