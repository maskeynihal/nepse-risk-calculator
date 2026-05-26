const STOCKS = ['Stock A', 'Stock B', 'Stock C'];
const state = { portfolio: 1000000, entries: [300, 400, 200], stops: [285, 380, 188] };

function fmt(n) {
  return 'Rs. ' + Math.round(n).toLocaleString('en-IN');
}

function renderRows() {
  const wrap = document.getElementById('stocks-wrap');
  wrap.innerHTML = '';
  STOCKS.forEach((name, i) => {
    const row = document.createElement('div');
    row.className = 'stock-row';
    row.innerHTML = `
      <span style="font-size:13px;font-weight:500;">${name}</span>
      <div>
        <label>Entry price</label>
        <input type="number" min="1" step="1" value="${state.entries[i]}" oninput="updateVal(${i},'entry',this.value)">
      </div>
      <div>
        <label>Stop-loss</label>
        <input type="number" min="1" step="1" value="${state.stops[i]}" oninput="updateVal(${i},'stop',this.value)">
      </div>
      <div id="result-${i}" style="font-size:13px;"></div>
    `;
    wrap.appendChild(row);
  });
}

function updateVal(i, type, val) {
  if (type === 'entry') state.entries[i] = parseFloat(val) || 0;
  else state.stops[i] = parseFloat(val) || 0;
  recalc();
}

function recalc() {
  const pVal = parseFloat(document.getElementById('portfolio-input').value) || 0;
  state.portfolio = pVal;
  const riskPerTrade = pVal * 0.02;
  const totalCap = riskPerTrade * 3;

  document.getElementById('m-portfolio').textContent = fmt(pVal);
  document.getElementById('m-risk-per').textContent = fmt(riskPerTrade);
  document.getElementById('m-risk-total').textContent = fmt(totalCap);

  let totalRiskUsed = 0;

  STOCKS.forEach((_, i) => {
    const entry = state.entries[i];
    const stop = state.stops[i];
    const el = document.getElementById('result-' + i);
    if (!el) return;

    const diff = entry - stop;
    if (diff <= 0 || entry <= 0) {
      el.innerHTML = `<span style="color:#aaa;font-size:12px;">Set valid prices</span>`;
      return;
    }

    const units = Math.floor(riskPerTrade / diff);
    const actualRisk = units * diff;
    const actualRiskPct = pVal > 0 ? (actualRisk / pVal * 100) : 0;
    const totalCost = units * entry;

    const overFlag = actualRiskPct > 2.05;
    const tagClass = overFlag ? 'tag-danger' : 'tag-ok';
    const tagText = overFlag ? '> 2%' : actualRiskPct.toFixed(2) + '%';

    el.innerHTML = `
      <div style="font-weight:500;font-size:14px;">${units.toLocaleString('en-IN')} units</div>
      <div style="font-size:11px;color:#888;margin:2px 0;">Cost: ${fmt(totalCost)}</div>
      <span class="tag ${tagClass}">${tagText} risk</span>
    `;

    totalRiskUsed += actualRisk;
  });

  const usedPct = pVal > 0 ? (totalRiskUsed / pVal * 100) : 0;
  document.getElementById('m-used').textContent = fmt(totalRiskUsed);
  document.getElementById('m-used-pct').textContent = usedPct.toFixed(2) + '% of portfolio';
  document.getElementById('bar-pct').textContent = usedPct.toFixed(2) + '% / 6%';

  const barWidth = Math.min(100, (usedPct / 6) * 100);
  const bar = document.getElementById('risk-bar');
  bar.style.width = barWidth + '%';
  if (usedPct > 6) bar.style.background = '#b71c1c';
  else if (usedPct > 4.5) bar.style.background = '#8a6000';
  else bar.style.background = '#1e6e3a';
}

document.addEventListener('DOMContentLoaded', () => {
  renderRows();
  recalc();
});
