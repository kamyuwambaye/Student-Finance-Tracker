// Compute totals and summaries

export function stats(data) {
  const total = data.length;
  const sum = data.reduce((a, b) => a + Number(b.amount), 0);
  const byCat = data.reduce(
    (m, r) => ((m[r.category] = (m[r.category] || 0) + Number(r.amount)), m),
    {}
  );
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  const now = Date.now();
  const last7 = data
    .filter((r) => now - new Date(r.date).getTime() <= 7 * 864e5)
    .reduce((a, b) => a + Number(b.amount), 0);
  return { total, sum, top, last7 };
}
