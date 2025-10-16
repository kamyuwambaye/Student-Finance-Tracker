// Handles rendering, event binding, and chart updates

import { makeFilter, highlight } from './search.js';
import { validateRecord, patterns } from './validation.js';
import { load, save, nuid, clearAll } from './storage.js';
import { stats } from './stats.js';

let data = load();
let sortBy = 'date';
let sortDir = 'desc';
let editId = null;
let caseInsensitive = true;

function format(n) {
  return Number(n).toFixed(2);
}

// ---------- STATE HANDLERS ----------
function add(rec) {
  const now = new Date().toISOString();
  const full = { id: nuid(), ...rec, createdAt: now, updatedAt: now };
  const errs = validateRecord(full);
  if (errs.length) throw new Error(errs.join(' '));
  data.push(full);
  save(data);
}

function update(id, partial) {
  const idx = data.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error('Not found');
  const merged = { ...data[idx], ...partial, updatedAt: new Date().toISOString() };
  const errs = validateRecord(merged);
  if (errs.length) throw new Error(errs.join(' '));
  data[idx] = merged;
  save(data);
}

function removeItem(id) {
  data = data.filter((r) => r.id !== id);
  save(data);
}

function exportJSON() {
  return JSON.stringify(data, null, 2);
}

function importJSON(json) {
  const arr = JSON.parse(json);
  if (!Array.isArray(arr)) throw new Error('Invalid JSON');
  arr.forEach((r) => {
    if (!r.id) r.id = nuid();
    r.createdAt ||= new Date().toISOString();
    r.updatedAt ||= r.createdAt;
    const errs = validateRecord(r);
    if (errs.length) throw new Error('Invalid record: ' + errs.join(' '));
  });
  data = arr;
  save(data);
}

// ---------- CHARTS ----------
function drawBarChart(canvas, dataPairs, title = '') {
  const ctx = canvas.getContext('2d');
  const W = (canvas.width = canvas.clientWidth);
  const H = 180;
  ctx.clearRect(0, 0, W, H);
  ctx.font = '12px system-ui';
  ctx.fillText(title, 8, 14);
  const values = dataPairs.map((d) => d[1]);
  const max = Math.max(1, ...values);
  const pad = 24;
  const bw = (W - pad * 2) / dataPairs.length * 0.7;
  const gap = (W - pad * 2) / dataPairs.length * 0.3;
  dataPairs.forEach((d, i) => {
    const x = pad + i * (bw + gap);
    const h = (d[1] / max) * (H - 50);
    const y = H - 30 - h;
    ctx.fillStyle = '#e3d4c6';
    ctx.fillRect(x, y, bw, h);
    ctx.fillStyle = '#3e3a37';
    ctx.fillText(d[0].slice(0, 8), x, H - 10);
  });
}

function drawLineChart(canvas, points, title = '') {
  const ctx = canvas.getContext('2d');
  const W = (canvas.width = canvas.clientWidth);
  const H = 180;
  ctx.clearRect(0, 0, W, H);
  ctx.font = '12px system-ui';
  ctx.fillText(title, 8, 14);
  const vals = points.map((p) => p[1]);
  const max = Math.max(1, ...vals);
  const pad = 24;
  ctx.beginPath();
  points.forEach((p, i) => {
    const x = pad + i * ((W - 2 * pad) / Math.max(1, points.length - 1));
    const y = H - 30 - (p[1] / max) * (H - 50);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#c7ad9a';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function refreshCharts() {
  const byCatCanvas = document.getElementById('chart-bycat');
  const trendCanvas = document.getElementById('chart-trend');
  const byCat = data.reduce(
    (m, r) => ((m[r.category] = (m[r.category] || 0) + Number(r.amount)), m),
    {}
  );
  const catPairs = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  drawBarChart(byCatCanvas, catPairs, 'Spend by Category');

  const now = new Date();
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i);
    const key = d.toISOString().slice(0, 10);
    const sum = data.filter((r) => r.date === key).reduce((a, b) => a + Number(b.amount), 0);
    return [key.slice(5), sum];
  });
  drawLineChart(trendCanvas, days, 'Last 7 Days');
}

// ---------- RENDER ----------
export function render() {
  const tbody = document.getElementById('tbody');
  const search = document.getElementById('search');
  const filter = makeFilter(search.value, caseInsensitive);
  let out = data.filter(filter);
  out.sort((a, b) => {
    const v1 = a[sortBy],
      v2 = b[sortBy];
    if (sortBy === 'amount') return (sortDir === 'asc' ? 1 : -1) * (v1 - v2);
    return (sortDir === 'asc' ? 1 : -1) * String(v1).localeCompare(String(v2));
  });

  const re = search.value ? new RegExp(search.value, caseInsensitive ? 'i' : '') : null;
  tbody.innerHTML = out
    .map(
      (r) => `<tr>
      <td>${r.date}</td>
      <td>${highlight(r.description, re)}</td>
      <td>${r.category}</td>
      <td>${format(r.amount)}</td>
      <td>
        <button data-act="edit" data-id="${r.id}">Edit</button>
        <button data-act="del" data-id="${r.id}">Delete</button>
      </td>
    </tr>`
    )
    .join('');

  const st = stats(data);
  document.getElementById('stat-total').textContent = st.total;
  document.getElementById('stat-sum').textContent = format(st.sum);
  document.getElementById('stat-top').textContent = st.top;
  document.getElementById('stat-week').textContent = format(st.last7);
  document.getElementById('year').textContent = new Date().getFullYear();
  refreshCharts();
}

// ---------- EVENTS ----------
export function initUI() {
  render();
  window.addEventListener('resize', refreshCharts);
}
