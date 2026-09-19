const DATA_ROOT = './data';
const BASES_URL = `${DATA_ROOT}/bases.json`;
const PAGE_SIZE = 50;

let seeds = [];
let page = 0;

const sliderKeys = ['fort', 'radius', 'height', 'origin'];
const sliders = Object.fromEntries(sliderKeys.map(k => [k, document.getElementById(`${k}Weight`)]));
const values = Object.fromEntries(sliderKeys.map(k => [k, document.getElementById(`${k}WeightValue`)]));
const rows = document.getElementById('seedRows');
const sortMode = document.getElementById('sortMode');
const controls = document.getElementById('seedControls');
const sortHint = document.getElementById('sortHint');
const searchInput = document.getElementById('seedSearch');
const excludeNoSister = document.getElementById('excludeNoSister');

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}


function htmlEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function attrEscape(value) {
  return htmlEscape(value);
}

function downloadCsv(filename, header, dataRows) {
  const lines = [header, ...dataRows].map(row => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff', lines], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function normaliseNumber(value, fallback = 99999) {
  return Number.isFinite(value) ? value : fallback;
}

function weightedScore(seed) {
  const fw = +sliders.fort.value / 100;
  const rw = +sliders.radius.value / 100;
  const hw = +sliders.height.value / 100;
  const ow = +sliders.origin.value / 100;
  const fort = normaliseNumber(seed.fort);
  const radius = normaliseNumber(seed.radius);
  const y = Array.isArray(seed.portal) && Number.isFinite(Number(seed.portal[1])) ? Number(seed.portal[1]) : -64;
  const heightPenalty = Math.max(0, 64 - y);
  const origin = normaliseNumber(seed.origin);
  return fort * fw + radius * rw + heightPenalty * hw + (origin / 50) * ow;
}

function portalTp(seed) {
  return Array.isArray(seed.portal) ? `/tp @s ${seed.portal[0]} ${seed.portal[1]} ${seed.portal[2]}` : '';
}

function isNoSisterMiss(seed) {
  return seed.noSisterHigh32_0_65535 === true || seed.sisterStatus === 'NO_MATCH_IN_HIGH32_0_65535';
}

function filteredSeeds() {
  const q = (searchInput?.value || '').trim().toLowerCase();
  return seeds.filter(seed => {
    if (excludeNoSister?.checked && isNoSisterMiss(seed)) return false;
    if (!q) return true;
    return String(seed.base).includes(q) || String(seed.verifiedSisterSeed || '').includes(q) || portalTp(seed).toLowerCase().includes(q);
  });
}

function orderedSeeds() {
  const ordered = filteredSeeds();
  if (sortMode.value === 'eyes') {
    ordered.sort((a, b) =>
      (b.eyes || 0) - (a.eyes || 0) ||
      (b.total || 0) - (a.total || 0) ||
      normaliseNumber(a.radius) - normaliseNumber(b.radius) ||
      normaliseNumber(a.fort) - normaliseNumber(b.fort) ||
      Number(a.base) - Number(b.base)
    );
  } else {
    ordered.sort((a, b) => weightedScore(a) - weightedScore(b));
  }
  return ordered;
}

function numberCell(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—';
}

function downloadOrderedBasesCsv() {
  const eyesOnly = sortMode.value === 'eyes';
  const ordered = orderedSeeds();
  const header = ['rank','base_seed','verified_sister_seed','verified_sister_high32','verified_portal_tp','no_sister_found_high32_0_65535','eyes','pearls','total','pearl_radius','fortress_distance','portal_y','origin_distance','score','portal_tp','portal_x','portal_y_coord','portal_z','stronghold_x','stronghold_z'];
  const data = ordered.map((seed, index) => [
    index + 1,
    seed.base,
    seed.verifiedSisterSeed ?? '',
    seed.verifiedSisterHigh32 ?? '',
    seed.verifiedPortalTp ?? portalTp(seed),
    isNoSisterMiss(seed) ? 'yes' : 'no',
    seed.eyes ?? '',
    seed.pearls ?? '',
    seed.total ?? '',
    Number.isFinite(seed.radius) ? seed.radius : '',
    Number.isFinite(seed.fort) ? seed.fort : '',
    seed.portal?.[1] ?? '',
    Number.isFinite(seed.origin) ? seed.origin : '',
    eyesOnly ? '' : weightedScore(seed),
    portalTp(seed),
    seed.portal?.[0] ?? '',
    seed.portal?.[1] ?? '',
    seed.portal?.[2] ?? '',
    seed.stronghold?.[0] ?? '',
    seed.stronghold?.[1] ?? ''
  ]);
  const mode = eyesOnly ? 'eyes' : `weighted-f${sliders.fort.value}-r${sliders.radius.value}-h${sliders.height.value}-o${sliders.origin.value}`;
  downloadCsv(`pseudo12-bases-${mode}.csv`, header, data);
}

function render() {
  sliderKeys.forEach(k => values[k].textContent = sliders[k].value);
  const eyesOnly = sortMode.value === 'eyes';
  controls.classList.toggle('controls-disabled', eyesOnly);
  sortHint.textContent = eyesOnly ? 'Eye-count mode ignores all four sliders.' : 'Weighted mode uses the four sliders below.';

  const sorted = orderedSeeds();
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  page = Math.min(page, pages - 1);
  const slice = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  rows.innerHTML = slice.length ? slice.map(seed => {
    const score = eyesOnly ? 'ignored' : weightedScore(seed).toFixed(2);
    const noSister = isNoSisterMiss(seed);
    const rowClass = noSister ? ' class="no-sister-row"' : '';
    const baseCell = noSister ? `<span class="no-sister-seed" title="No sister seed found in high32 0..65535">${htmlEscape(seed.base)}</span>` : htmlEscape(seed.base);
    const verifiedTp = seed.verifiedPortalTp || portalTp(seed);
    const sisterCell = seed.verifiedSisterSeed
      ? `<button type="button" class="verified-sister-btn" data-tp="${attrEscape(verifiedTp)}" title="Copy ${attrEscape(verifiedTp)}">${htmlEscape(seed.verifiedSisterSeed)}</button>`
      : '—';
    return `<tr${rowClass}>
      <td>${baseCell}</td>
      <td>${sisterCell}</td>
      <td>${seed.eyes ?? '—'}</td>
      <td>${seed.pearls ?? '—'}</td>
      <td>${numberCell(seed.radius)}</td>
      <td>${numberCell(seed.fort)}</td>
      <td>${seed.portal?.[1] ?? '—'}</td>
      <td>${numberCell(seed.origin, 0)}</td>
      <td>${score}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="9">No matching bases.</td></tr>';

  const noSisterTotal = seeds.filter(isNoSisterMiss).length;
  document.getElementById('seedCount').textContent = `${sorted.length.toLocaleString()} shown · ${seeds.length.toLocaleString()} total · ${noSisterTotal.toLocaleString()} no sister found in high32 0..65535`;
  document.getElementById('pageStatus').textContent = `Page ${page + 1} / ${pages}`;
  document.getElementById('prevPage').disabled = page === 0;
  document.getElementById('nextPage').disabled = page >= pages - 1;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

rows.addEventListener('click', async event => {
  const button = event.target.closest('.verified-sister-btn');
  if (!button) return;
  const tp = button.dataset.tp;
  if (!tp) return;
  const original = button.textContent;
  try {
    await copyText(tp);
    button.textContent = 'Copied /tp';
    button.classList.add('copied');
    setTimeout(() => { button.textContent = original; button.classList.remove('copied'); }, 1100);
  } catch (err) {
    button.textContent = 'Copy failed';
    setTimeout(() => { button.textContent = original; }, 1100);
  }
});

async function init() {
  if (location.protocol === 'file:') {
    seeds = Array.isArray(window.PSEUDO12_BASES) ? window.PSEUDO12_BASES : [];
    if (!seeds.length) {
      rows.innerHTML = '<tr><td colspan="9">Seed data could not be loaded from the local data file.</td></tr>';
      document.getElementById('seedCount').textContent = 'Data unavailable';
      return;
    }
    render();
    return;
  }

  try {
    const baseRes = await fetch(BASES_URL, { cache: 'no-store' });
    if (!baseRes.ok) throw new Error(`Base data HTTP ${baseRes.status}`);
    seeds = await baseRes.json();
    render();
  } catch (err) {
    rows.innerHTML = `<tr><td colspan="9">Failed to load seed data: ${err.message}</td></tr>`;
    document.getElementById('seedCount').textContent = 'Data unavailable';
  }
}

sliderKeys.forEach(k => sliders[k].addEventListener('input', () => {
  if (sortMode.value === 'weighted') { page = 0; render(); }
  else values[k].textContent = sliders[k].value;
}));
sortMode.addEventListener('change', () => { page = 0; render(); });
searchInput?.addEventListener('input', () => { page = 0; render(); });
excludeNoSister?.addEventListener('change', () => { page = 0; render(); });
document.getElementById('prevPage').addEventListener('click', () => { if (page > 0) { page--; render(); } });
document.getElementById('nextPage').addEventListener('click', () => { page++; render(); });
document.getElementById('downloadBasesCsv').addEventListener('click', downloadOrderedBasesCsv);

init();
