// Xianyu Explorer (web): roda só no navegador. A busca vai direto do navegador para a Apify com
// o token de quem está usando; nada passa por servidor nosso. Cache, gastos e configurações
// ficam no localStorage deste navegador.
import { expandQuery, dedupeTerms, norm, productCore } from './lib/variations.js';
import { analyze } from './lib/deals.js';
import { ACTORS, searchApify, estimateCost, getAccount } from './lib/sources/apify.js';
import { SUPPORT, SORTS, cleanFilters, localFilter } from './lib/filters.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 3, maximumFractionDigits: 4 });
const cny = (v) => `¥${Math.round(v).toLocaleString('pt-BR')}`;

// ---------- armazenamento local ----------
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(`xe.${k}`)); return v ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(`xe.${k}`, JSON.stringify(v)); } catch (e) { pruneHard(); try { localStorage.setItem(`xe.${k}`, JSON.stringify(v)); } catch { /* sem espaço */ } } };
const WEB_SOURCES = ['unitbytes', 'memo23', 'devcake'];
const DEFAULTS = { token: '', source: 'unitbytes', perTerm: 10, cacheHours: 48, budgetUsd: 4.5, confirmAboveUsd: 0.1, maxVariations: 4 };
let S = { ...DEFAULTS, ...load('settings', {}) };
if (!WEB_SOURCES.includes(S.source)) S.source = 'unitbytes';
const saveSettings = () => save('settings', S);
let cache = load('cache', {}); // chave da variação -> { at, limit, items }
let costs = load('costs', []); // [{ at, query, source, estimatedUsd, realUsd, items }]
let refs = load('refs', {}); // produto -> preço típico em CNY
function pruneCache() {
  const ttl = S.cacheHours * 3600e3;
  for (const [k, v] of Object.entries(cache)) if (Date.now() - v.at > ttl) delete cache[k];
}
function pruneHard() { cache = {}; localStorage.removeItem('xe.cache'); }

// ---------- custos ----------
const month = (t) => new Date(t).toISOString().slice(0, 7);
const charged = (e) => e.realUsd ?? e.estimatedUsd ?? 0;
function monthSummary() {
  const rows = costs.filter((e) => month(e.at) === month(Date.now()));
  const spent = rows.reduce((n, e) => n + charged(e), 0);
  return { spent, searches: rows.length, avg: rows.length ? spent / rows.length : 0, pct: S.budgetUsd ? (spent / S.budgetUsd) * 100 : null };
}
function calibration() {
  const m = costs.filter((e) => e.realUsd != null && e.estimatedUsd > 0).slice(-20);
  const est = m.reduce((n, e) => n + e.estimatedUsd, 0);
  if (m.length < 3 || !est) return 1;
  return Math.min(2, Math.max(0.5, m.reduce((n, e) => n + e.realUsd, 0) / est));
}

// ---------- câmbio (APIs públicas que aceitam chamada do navegador) ----------
let fx = load('fx', null);
async function getFx() {
  if (fx && Date.now() - fx.at < 30 * 60e3) return fx;
  const srcs = [
    ['AwesomeAPI', 'https://economia.awesomeapi.com.br/json/last/CNY-BRL', (j) => Number(j?.CNYBRL?.bid)],
    ['Frankfurter (BCE)', 'https://api.frankfurter.dev/v1/latest?base=CNY&symbols=BRL', (j) => Number(j?.rates?.BRL)],
    ['open.er-api.com', 'https://open.er-api.com/v6/latest/CNY', (j) => Number(j?.rates?.BRL)],
  ];
  for (const [name, url, parse] of srcs) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const rate = parse(await r.json());
      if (rate > 0) { fx = { rate, source: name, at: Date.now() }; save('fx', fx); return fx; }
    } catch { /* tenta a próxima */ }
  }
  if (fx) return fx; // a última conhecida
  throw new Error('Não consegui a cotação do yuan agora. Tente de novo em instantes.');
}

// ---------- plano da busca ----------
const termKey = (src, term, sort, min, max) => JSON.stringify([src, norm(term), min ? Math.floor(min) : null, max ? Math.ceil(max) : null, sort]);
function findCache(src, term, sort, min, max, size) {
  const k = termKey(src, term, sort, min, max);
  if (cache[k]?.limit >= size) return k;
  const want = JSON.parse(k);
  for (const [ck, ce] of Object.entries(cache)) {
    if (!(ce.limit >= size)) continue;
    const c = JSON.parse(ck);
    if (c[0] !== want[0] || c[1] !== want[1] || c[4] !== want[4]) continue;
    if (c[2] != null && (want[2] == null || c[2] > want[2] * 1.02 + 1)) continue;
    if (c[3] != null && (want[3] == null || c[3] < want[3] * 0.98 - 1)) continue;
    const inRange = ce.items.filter((i) => i.priceCny == null || ((want[2] == null || i.priceCny >= want[2]) && (want[3] == null || i.priceCny <= want[3]))).length;
    if (inRange >= Math.min(5, size)) return ck;
  }
  return null;
}
function plan({ query, terms, f, rate, refresh }) {
  pruneCache();
  const { kept, dropped } = dedupeTerms(terms.length ? terms : [query]);
  const src = S.source;
  const sort = (SUPPORT[src]?.sorts || []).includes(f.sort) ? f.sort : 'relevance';
  const min = f.minPriceBrl ? f.minPriceBrl / rate : null;
  const max = f.maxPriceBrl ? f.maxPriceBrl / rate : null;
  const keys = {};
  for (const t of kept) { const k = refresh ? null : findCache(src, t, sort, min, max, S.perTerm); if (k) keys[t] = k; }
  const toFetch = kept.filter((t) => !keys[t]);
  // piso aprendido: 35% do preço típico já visto evita pagar por capinha e peça
  const ref = refs[norm(productCore(query))];
  const floor = ACTORS[src]?.priceFilter && ref ? Math.floor(ref * 0.35) : null;
  const raw = toFetch.length ? estimateCost(src, { terms: toFetch, perTerm: S.perTerm }) : 0;
  return { src, sort, min, max, floor, terms: kept, dropped, keys, toFetch, rawUsd: raw, estUsd: Math.round(raw * calibration() * 1000) / 1000 };
}

// ---------- caçada ----------
async function hunt({ query, terms, f, refresh }) {
  if (!S.token) throw new Error('Coloque seu token da Apify em Configurações primeiro.');
  const { rate } = await getFx();
  const p = plan({ query, terms, f, rate, refresh });
  const m = monthSummary();
  if (p.estUsd && S.budgetUsd && m.spent + p.estUsd > S.budgetUsd) {
    throw new Error(`Esta busca (≈ ${usd.format(p.estUsd)}) passaria do seu limite mensal de ${usd.format(S.budgetUsd)} (já gasto: ${usd.format(m.spent)}).`);
  }
  if (p.estUsd && S.confirmAboveUsd && p.estUsd > S.confirmAboveUsd && !confirm(`Esta busca deve custar ≈ ${usd.format(p.estUsd)} do seu crédito da Apify. Continuar?`)) return null;

  let cost = null;
  if (p.toFetch.length) {
    const minP = Math.max(p.floor || 0, p.min ? Math.floor(p.min) : 0) || null;
    const out = await searchApify(p.src, { terms: p.toFetch, perTerm: S.perTerm, sort: p.sort, minPrice: minP, maxPrice: p.max }, S.token);
    for (const t of out) {
      if (!t.items.length && t.error) continue;
      const k = termKey(p.src, t.term, p.sort, p.min, p.max);
      cache[k] = { at: Date.now(), limit: S.perTerm, items: t.items };
      p.keys[t.term] = k;
    }
    save('cache', cache);
    cost = { estimatedUsd: p.rawUsd, realUsd: out.meta?.realUsd ?? null, items: out.meta?.items ?? 0, overflow: out.meta?.perKeywordOverflow || 0 };
    costs.push({ at: Date.now(), query, source: p.src, ...cost });
    costs = costs.filter((e) => Date.now() - e.at < 120 * 86400e3);
    save('costs', costs);
  }

  const byId = new Map();
  const perTerm = p.terms.map((term) => {
    const e = cache[p.keys[term]];
    const items = e?.items || [];
    for (const it of items) { if (!it.id) continue; const prev = byId.get(it.id); if (prev) prev.foundBy.push(term); else byId.set(it.id, { ...it, foundBy: [term] }); }
    return { term, count: items.length, cached: !p.toFetch.includes(term), at: e?.at };
  });
  let all = [...byId.values()];
  if (p.max) all = all.filter((i) => i.priceCny == null || i.priceCny <= p.max);
  if (p.min) all = all.filter((i) => i.priceCny == null || i.priceCny >= p.min);
  all = localFilter(all, f, SUPPORT[p.src] || SUPPORT.mock);
  const { results, reference } = analyze(all, query);
  if (reference?.typicalCny && reference.sample >= 5) { refs[norm(productCore(query))] = reference.typicalCny; save('refs', refs); }
  results.sort((a, b) => b.score - a.score || (a.priceCny ?? 1e9) - (b.priceCny ?? 1e9));
  return { query, p, rate, cost, perTerm, results, reference };
}

// ---------- interface ----------
let selected = new Set();
let variations = [];
let custom = [];
let lastData = null;
let onlyGood = true;

function renderVars() {
  const all = [...variations, ...custom.map((term) => ({ term, reason: 'sua' }))];
  $('#vars').innerHTML = all.map((v) => `<label class="var ${selected.has(v.term) ? 'on' : ''}" title="${esc(v.reason)}"><input type="checkbox" data-term="${esc(v.term)}" ${selected.has(v.term) ? 'checked' : ''}>${esc(v.term)}</label>`).join('')
    + '<input id="varAdd" placeholder="+ outra variação" aria-label="Adicionar variação">';
  updateEstimate();
}
function chosen() { return [...selected]; }
function filters() { return cleanFilters({ sort: $('#sort').value, minPriceBrl: $('#minBrl').value, maxPriceBrl: $('#maxBrl').value }); }

async function updateEstimate() {
  const q = $('#q').value.trim();
  if (!q) { $('#estimate').textContent = ''; return; }
  let rate = fx?.rate;
  if (!rate) try { rate = (await getFx()).rate; } catch { return; }
  const p = plan({ query: q, terms: chosen(), f: filters(), rate, refresh: $('#refresh').checked });
  const parts = [`<b>${p.terms.length}</b> busca${p.terms.length > 1 ? 's' : ''} × ${S.perTerm} anúncios`];
  if (Object.keys(p.keys).length) parts.push(`${Object.keys(p.keys).length} já no cache`);
  parts.push(p.estUsd ? `≈ <b>${usd.format(p.estUsd)}</b>` : '<b class="ok">grátis</b> (tudo no cache)');
  if (p.dropped.length) parts.push(`<span title="${esc(p.dropped.map((d) => `${d.term}: ${d.reason}`).join('\n'))}">${p.dropped.length} repetida(s) fora</span>`);
  $('#estimate').innerHTML = parts.join(' · ');
}

async function loadVariations() {
  const q = $('#q').value.trim();
  variations = q ? expandQuery(q, 8) : [];
  selected = new Set(variations.slice(0, S.maxVariations).map((v) => v.term));
  custom = [];
  renderVars();
}

function card(r, rate) {
  const flags = r.flags.map((f) => `<span class="flag">${esc(f.label)}</span>`).join('');
  const disc = r.discount != null ? Math.round(r.discount * 100) : null;
  return `<article class="card ${r.eligible ? '' : 'dim'}">
    <a href="${esc(r.url)}" target="_blank" rel="noopener" class="img">${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}${disc != null && r.eligible ? `<span class="disc ${disc > 0 ? 'good' : ''}">${disc > 0 ? `−${disc}%` : `+${-disc}%`}</span>` : ''}</a>
    <div class="body">
      <div class="price">${r.priceCny ? brl.format(r.priceCny * rate) : 'sem preço'} <small>${r.priceCny ? cny(r.priceCny) : ''}</small></div>
      <a class="title" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>
      <div class="meta">${r.seller ? esc(r.seller) : 'vendedor ?'}${r.shopLevel ? ` <b class="lvl">L${r.shopLevel}</b>` : ''}${r.sellerCredit ? ` · ${esc(String(r.sellerCredit).replace('卖家信用', ''))}` : ''}${r.location ? ` · ${esc(r.location)}` : ''}${r.wants ? ` · ${r.wants} querem` : ''}</div>
      ${flags ? `<div class="flags">${flags}</div>` : ''}
      <div class="actions"><a class="btn sm" href="${esc(r.url)}" target="_blank" rel="noopener">Abrir no Goofish</a><button class="btn sm" data-copy="${esc(r.url)}">copiar link</button>${r.sellerUrl ? `<button class="btn sm" data-copy="${esc(r.sellerUrl)}">link do vendedor</button>` : ''}</div>
    </div></article>`;
}

function renderResults() {
  const d = lastData;
  if (!d) return;
  const r = d.reference;
  const c = d.cost;
  const costTxt = !c ? '<b>do cache</b> (não gastou crédito)'
    : `cobrado <b>${c.realUsd != null ? usd.format(c.realUsd) : 'não informado'}</b> · estimado ${usd.format(c.estimatedUsd)} · ${c.items} anúncios pagos${c.overflow ? ` · <span class="err">${c.overflow} acima do limite</span>` : ''}`;
  const eligible = d.results.filter((x) => x.eligible);
  $('#summary').innerHTML = `
    <div class="ref">${r ? `Preço típico <strong>${brl.format(r.typicalCny * d.rate)}</strong> <small>${cny(r.typicalCny)} · faixa ${brl.format(r.p25Cny * d.rate)}–${brl.format(r.p75Cny * d.rate)}</small>` : 'Preço típico: poucos anúncios válidos'}</div>
    <div class="facts"><span><b>${eligible.length}</b> ofertas válidas de ${d.results.length} anúncios</span><span>${costTxt}</span><span>fonte ${esc(d.p.src)} · ¥1 = ${d.rate.toFixed(3).replace('.', ',')}</span></div>
    <div class="facts small">Por busca: ${d.perTerm.map((t) => `${esc(t.term)} <b>${t.count}</b>${t.cached ? ' (cache)' : ''}`).join(' · ')}${d.p.dropped.length ? `<br>Fora para não pagar duas vezes: ${d.p.dropped.map((x) => `${esc(x.term)} (${esc(x.reason)})`).join(' · ')}` : ''}</div>
    <label class="toggle"><input type="checkbox" id="onlyGood" ${onlyGood ? 'checked' : ''}> só ofertas válidas</label>`;
  const list = onlyGood ? eligible : d.results;
  $('#grid').innerHTML = list.length ? list.map((x) => card(x, d.rate)).join('') : '<p class="muted">Nada por aqui. Tente desmarcar "só ofertas válidas" ou outras variações.</p>';
  $('#onlyGood').onchange = (e) => { onlyGood = e.target.checked; renderResults(); };
  renderMonth();
}

function renderMonth() {
  const m = monthSummary();
  const warn = m.pct != null && m.pct >= 80;
  $('#spend').innerHTML = S.token ? `Gasto no mês: <b class="${warn ? 'err' : ''}">${usd.format(m.spent)}</b>${S.budgetUsd ? ` de ${usd.format(S.budgetUsd)}` : ''}` : '<b>Configure o token</b>';
  $('#spend').classList.toggle('warn', warn);
  const el = $('#monthBox');
  if (el) el.innerHTML = `Este mês, neste navegador: gasto <b>${usd.format(m.spent)}</b> em ${m.searches} busca(s) paga(s), média ${usd.format(m.avg)} por busca.${warn ? ' <span class="err">Passou de 80% do seu limite.</span>' : ''} O uso total da sua conta (inclusive em outros aparelhos) aparece em "Testar token".`;
}

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }

async function run() {
  const query = $('#q').value.trim();
  if (!query) return;
  if (!selected.size && !custom.length) await loadVariations();
  $('#go').disabled = true; $('#status').textContent = 'Buscando na Apify (10 a 60 s)…'; $('#status').className = 'status';
  try {
    const d = await hunt({ query, terms: chosen(), f: filters(), refresh: $('#refresh').checked });
    if (!d) { $('#status').textContent = ''; return; }
    lastData = d; $('#refresh').checked = false; $('#status').textContent = '';
    renderResults();
    if (monthSummary().pct >= 80) toast('Atenção: você passou de 80% do limite mensal da Apify.');
  } catch (e) {
    $('#status').textContent = e.message; $('#status').className = 'status err';
  } finally { $('#go').disabled = false; updateEstimate(); }
}

// ---------- configurações ----------
function openSettings() {
  $('#token').value = ''; $('#token').placeholder = S.token ? `token salvo (…${S.token.slice(-4)}); cole outro para trocar` : 'apify_api_…';
  $('#source').innerHTML = WEB_SOURCES.map((k) => `<option value="${k}" ${k === S.source ? 'selected' : ''}>${esc(ACTORS[k].label)} · US$ ${ACTORS[k].pricePerItem}/anúncio</option>`).join('');
  $('#budget').value = S.budgetUsd || ''; $('#confirmAbove').value = S.confirmAboveUsd || ''; $('#cacheHours').value = String(S.cacheHours);
  $('#tokenStatus').textContent = '';
  renderMonth();
  $('#settings').showModal();
}
$('#settingsBtn').onclick = openSettings;
$('#token').onchange = () => { const v = $('#token').value.trim(); if (v) { S.token = v; saveSettings(); renderMonth(); toast('Token salvo neste navegador'); } };
$('#source').onchange = () => { S.source = $('#source').value; saveSettings(); updateEstimate(); };
$('#budget').onchange = () => { S.budgetUsd = Math.max(0, Number($('#budget').value) || 0); saveSettings(); renderMonth(); };
$('#confirmAbove').onchange = () => { S.confirmAboveUsd = Math.max(0, Number($('#confirmAbove').value) || 0); saveSettings(); };
$('#cacheHours').onchange = () => { S.cacheHours = Number($('#cacheHours').value) || 48; saveSettings(); updateEstimate(); };
$('#testToken').onclick = async () => {
  $('#tokenStatus').textContent = 'Testando…';
  try { const a = await getAccount(S.token); $('#tokenStatus').innerHTML = `<span class="ok">Conta ${esc(a.username || '')}: ${usd.format(a.usedUsd ?? 0)} de ${usd.format(a.limitUsd ?? 5)} usados no mês.</span>`; }
  catch (e) { $('#tokenStatus').innerHTML = `<span class="err">${esc(e.message)}</span>`; }
};
$('#forget').onclick = () => {
  if (!confirm('Apagar token, cache e histórico de gastos deste navegador?')) return;
  ['settings', 'cache', 'costs', 'refs', 'fx'].forEach((k) => localStorage.removeItem(`xe.${k}`));
  location.reload();
};

// ---------- eventos ----------
$('#sort').innerHTML = SORTS.map((s) => `<option value="${s.key}">${esc(s.label)}</option>`).join('');
document.querySelectorAll('#size button').forEach((b) => b.classList.toggle('on', Number(b.dataset.size) === S.perTerm));
$('#size').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; S.perTerm = Number(b.dataset.size); saveSettings(); document.querySelectorAll('#size button').forEach((x) => x.classList.toggle('on', x === b)); updateEstimate(); };
let qTimer;
$('#q').addEventListener('input', () => { clearTimeout(qTimer); qTimer = setTimeout(loadVariations, 350); });
$('#vars').addEventListener('change', (e) => { const t = e.target.dataset.term; if (!t) return; e.target.checked ? selected.add(t) : selected.delete(t); renderVars(); });
$('#vars').addEventListener('keydown', (e) => {
  if (e.target.id !== 'varAdd' || e.key !== 'Enter') return;
  e.preventDefault(); const t = e.target.value.trim(); if (t) { custom.push(t); selected.add(t); renderVars(); $('#varAdd').focus(); }
});
['#sort', '#minBrl', '#maxBrl', '#refresh'].forEach((s) => $(s).addEventListener('change', updateEstimate));
$('#form').onsubmit = (e) => { e.preventDefault(); run(); };
document.addEventListener('click', (e) => { const c = e.target.closest('[data-copy]'); if (c) navigator.clipboard.writeText(c.dataset.copy).then(() => toast('Link copiado'), () => toast('Não consegui copiar')); });

renderMonth();
getFx().then((f) => { $('#fx').textContent = `¥1 = R$ ${f.rate.toFixed(3).replace('.', ',')}`; }).catch(() => { $('#fx').textContent = 'cotação indisponível'; });
if (!S.token) openSettings();
