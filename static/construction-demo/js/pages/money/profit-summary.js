/* Profit Summary — jpms/Pages/ProfitSummary.razor: the Running profit by month grid (Xero site
   P&L, invoiced basis), the summary strip, the budget → forecast bridge, the profit table in its
   three bands, and the cumulative position. Table figures are JPMS.money.profit — the same set
   as Financials and Project Cashflow. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const windowMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const costFactors = { hollowmere: [0.95, 0.78, 0.84, 0.88, 0.8, 0.83, 1.12], 'coach-house': [0.9, 0.82, 1.08], wrenfield: [0.9, 0.86, 0.84, 0.92, 0.81, 0.88, 0.95, 0.86, 1.04, 0.9] };
  const siteOverheads = { hollowmere: 18400, 'coach-house': 6200, wrenfield: 9800 };

  function monthly(project) {
    const runs = money.valuations(project);
    if (!runs.length) return [];
    const invoiced = runs.map((run) => run.netDue);
    const factors = costFactors[project.id];
    const cost = money.spread(money.cvr(project).totals.acos + (siteOverheads[project.id] || 0), runs.map((run, index) => run.movement * factors[index]));
    let invoicedSoFar = 0;
    let profitSoFar = 0;
    return runs.map((run, index) => {
      const profit = invoiced[index] - cost[index];
      invoicedSoFar += invoiced[index];
      profitSoFar += profit;
      return { month: run.month, profit, monthPercent: (profit / invoiced[index]) * 100, running: (profitSoFar / invoicedSoFar) * 100, profitSoFar };
    });
  }

  function runningCell(entry) {
    if (!entry) return money.dim('—');
    const tone = entry.profit < 0 ? 'tone-negative' : 'tone-positive';
    return `<span class="strong">${entry.running.toFixed(1)}%</span><span class="subline"><span class="${tone}">${entry.monthPercent.toFixed(1)}% · ${money.signed(entry.profit)}</span></span>`;
  }

  function runningPanel(projects) {
    const rows = projects.map((project) => {
      const entries = monthly(project);
      const byMonth = windowMonths.map((month) => entries.find((entry) => entry.month === month));
      const latest = entries[entries.length - 1];
      const earliest = byMonth.find(Boolean);
      const delta = latest && earliest ? money.toned(latest.running - earliest.running, `${(latest.running - earliest.running).toFixed(1)} pts`) : money.dim('—');
      const now = latest ? `<span class="strong">${latest.running.toFixed(1)}%</span><span class="subline">${ui.money(latest.profitSoFar)} to date</span>` : `<span class="faint" style="white-space:nowrap">no Xero activity yet</span>`;
      return [`<span class="strong" style="white-space:nowrap">${project.name}</span>`, ...byMonth.map(runningCell), delta, now];
    });
    const controls = `<div class="row" style="gap:16px">${ui.btn('‹')}<span class="text-xs subtle">Apr 26 – Sep 26</span>${ui.btn('›')}<span class="text-xs subtle">Months on screen</span><select class="field" style="width:64px;padding:2px 6px"><option>6</option></select>${money.checkbox('<span class="text-xs">Include approved labour not yet billed</span>')}</div>`;
    const head = `<div class="row-between" style="align-items:flex-start;margin-bottom:12px"><div><p class="eyebrow">Running profit by month <span class="faint text-xs">— the whole job's % profit to date at each month end, that month on its own beneath · Xero site P&amp;L, invoiced basis</span></p><p class="text-xs subtle" style="margin-top:6px">The main figure is the whole job to that month end; the small print is that month on its own — its margin and its £. The last column is where the job stands to date.</p></div>${controls}</div>`;
    const columns = ['Project', ...windowMonths.map((month) => ({ label: `${month} 26`, num: true })), { label: '6-mo Δ', num: true }, { label: 'Position now', num: true }];
    return `<div class="panel" style="padding:20px;margin-bottom:24px">${head}${ui.table({ dense: true, columns, rows })}</div>`;
  }

  function bridge(totals) {
    const bars = [['Budgeted profit', 'the deal as signed', totals.budgeted, 0], ['Variations', 'net approved', totals.variations, totals.budgeted], ['Cost movement', 'initial costs − forecast cost', totals.costMovement, totals.budgeted + totals.variations], ['Forecast profit', 'where the jobs land', totals.forecast, 0]];
    const top = Math.max(...bars.map(([, , value, base]) => base + Math.max(value, 0)));
    const bottom = Math.min(0, ...bars.map(([, , value, base]) => base + Math.min(value, 0)));
    const span = top - bottom;
    const columns = bars.map(([label, subline, value, base]) => {
      const high = base + Math.max(value, 0);
      const colour = value < 0 ? 'var(--negative)' : base ? 'var(--info)' : 'var(--accent)';
      const topPercent = ((top - high) / span) * 80 + 10;
      const heightPercent = (Math.abs(value) / span) * 80;
      return `<div style="position:relative;height:210px"><div class="text-xs semibold" style="position:absolute;left:0;right:0;text-align:center;top:calc(${topPercent}% - 20px)">${money.signed(value).replace('+', base ? '+' : '')}</div><div style="position:absolute;left:50%;transform:translateX(-50%);width:64px;border-radius:4px;background:${colour};top:${topPercent}%;height:${heightPercent}%"></div></div>`;
    }).join('');
    const labels = bars.map(([label, subline]) => `<div style="text-align:center"><p class="text-xs muted strong">${label}</p><p class="text-xs subtle">${subline}</p></div>`).join('');
    return `<div class="panel" style="padding:20px;margin-bottom:24px"><p class="eyebrow">Budget → forecast bridge <span class="faint text-xs">— budgeted profit, plus variations, plus the cost movement, is the forecast</span></p><div class="grid grid-4" style="margin-top:12px">${columns}</div><div class="grid grid-4" style="margin-top:8px">${labels}</div></div>`;
  }

  function margin(value, whole) {
    return `<span class="subline">${money.percentOf(value, whole)}</span>`;
  }

  function profitRow(label, figures) {
    const cell = (value, extra = '') => `<td class="num">${value < 0 ? `<span class="tone-negative">${ui.money(value)}</span>` : ui.money(value)}${extra}</td>`;
    return `<tr><td>${label}</td>${cell(figures.budgeted, margin(figures.budgeted, figures.initial))}${cell(figures.certified, `<span class="subline">${ui.money(figures.retention)} retention held</span>`)}${cell(figures.costToDate)}${cell(figures.current, margin(figures.current, figures.certified))}${cell(figures.leftToCertify)}${cell(figures.costToComplete)}${cell(figures.toFinish, margin(figures.toFinish, figures.leftToCertify))}${cell(figures.finalSales, `<span class="subline">incl. ${ui.money(figures.variations)} variations</span>`)}${cell(figures.finalCost)}<td class="num strong">${ui.money(figures.forecast)}${margin(figures.forecast, figures.finalSales)}</td></tr>`;
  }

  function profitTable(projects, totals) {
    const band = (label, subline, span) => `<th colspan="${span}" style="border-left:1px solid var(--line-strong)">${label} <span class="faint text-xs" style="font-weight:400">${subline}</span></th>`;
    const bands = `<tr><th></th>${band('The deal', 'initial contract', 1)}${band('Current position', 'valuations + allocated Xero cost · certified basis', 3)}${band('To finish', 'today → completion', 3)}${band('Forecast at completion', 'contract + variations · Financials tab', 3)}</tr>`;
    const labels = ['Budgeted profit', 'Certified', 'Cost to date', 'Current profit', 'Left to certify', 'Cost to complete', 'Profit to finish', 'Final sales', 'Final cost', 'Forecast profit'];
    const head = `<tr><th>Project ⇅</th>${labels.map((label) => `<th class="num">${label}</th>`).join('')}</tr>`;
    const body = projects.map((project) => profitRow(ui.link(`<span class="strong" style="white-space:nowrap">${project.ref} · ${project.name}</span>`, `#/projects/${project.id}/financials`), money.profit(project))).join('');
    const foot = profitRow('<span class="strong">Total</span>', totals).replace('<tr>', '<tr class="is-total">').replace(/<td/g, '<td style="background:var(--canvas);font-weight:600;color:var(--content)"');
    return `<div class="panel" style="margin-bottom:12px"><div class="table-wrap"><table class="data-table data-table-dense"><thead>${bands}${head}</thead><tbody>${body}${foot}</tbody></table></div></div>`;
  }

  function cumulativePanel(projects) {
    const cards = projects.filter((project) => monthly(project).length).map((project) => {
      const runs = money.valuations(project);
      const entries = monthly(project);
      let invoiced = 0;
      let cost = 0;
      const invoicedLine = runs.map((run) => (invoiced += run.netDue));
      const costLine = runs.map((run, index) => (cost += run.netDue - entries[index].profit));
      return `<div class="card"><p class="strong" style="margin-bottom:8px">${project.name}</p>${JPMS.charts.lines({ labels: runs.map((run) => run.month), series: [{ name: 'Cumulative invoiced', tone: 'accent', values: invoicedLine }, { name: 'Cumulative cost', tone: 'warning', values: costLine }] })}</div>`;
    });
    return ui.panel('Cumulative position', [`<p class="text-xs subtle" style="margin-bottom:12px">Cumulative invoiced against cumulative cost, job start to date — the running total is the gap between them · Xero site P&amp;L, invoiced basis</p>`, ui.grid(2, cards)], { actions: [money.refreshButton('Refresh')] });
  }

  JPMS.page('/finance/profit-summary', {
    title: 'Profit Summary',
    render() {
      const selected = JPMS.data.projects.filter((project) => project.stage !== 'Completed');
      const figures = selected.map(money.profit);
      const totals = Object.fromEntries(Object.keys(figures[0]).map((key) => [key, figures.reduce((sum, row) => sum + row[key], 0)]));
      const swings = selected.map((project, index) => [project, figures[index].forecast - figures[index].budgeted]).sort((first, second) => Math.abs(second[1]) - Math.abs(first[1]));
      const [swingProject, swing] = swings[0];
      return ui.join([
        ui.header({ subtitle: 'Gross profit by project — the deal as signed, where each job stands today, and where it lands.' }),
        ui.toolbar(money.projectFilter(selected), [money.checkbox('Compact table'), money.exportButton()]),
        runningPanel(JPMS.data.projects),
        money.tiles([['Budgeted profit', ui.money(totals.budgeted), `${money.percentOf(totals.budgeted, totals.initial)} on ${ui.money(totals.initial)} initial contracts`], ['Forecast profit', ui.money(totals.forecast), `${money.percentOf(totals.forecast, totals.finalSales)} on ${ui.money(totals.finalSales)} final sales`], ['Biggest swing vs the deal', swingProject.name, `<span class="${swing < 0 ? 'tone-negative' : 'tone-positive'}">${money.signed(swing)} against budgeted profit</span>`]]),
        bridge(totals),
        profitTable(selected, totals),
        money.note('Budgeted profit backs the assumed 10% markup out of the initial contract sum, the same rule as the Financials tab. Current profit plus profit to finish equals the forecast, to the penny. The running grid and the charts read Xero\'s site P&amp;L — invoiced, and after overheads tracked to the site — so they sit near, not on, the certified figures in the table.', { gap: 24 }),
        cumulativePanel(JPMS.data.projects)
      ]);
    }
  });
})();
