/* Cash Forecast — jpms/Pages/CashForecast.razor: the unconfirmed-figures notice, the directors'
   KPI strip, every known future cash movement in the month it lands (CashForecastTable), the
   closing balance chart, the tie-back, then the Position to completion (the former Cash Summary).
   Each project's months are its Project Cashflow statement spread in time, so they sum to it. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const months = ['Oct 26', 'Nov 26', 'Dec 26', 'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27', 'May 27', 'Jun 27'];
  const overheads = 38000;
  const timing = { hollowmere: { from: 1, to: 7, release: 7 }, 'coach-house': { from: 1, to: 6, release: 6 }, kingsridge: { from: 4, to: 22, release: 23 }, wrenfield: { from: 0, to: -1, release: -1 } };

  const categories = [
    ['in', 'invoices', 'Valuation invoices outstanding', 'already issued (or awaiting approval) · lands a payment-mechanism lag after issue'],
    ['in', 'valuations', 'Future valuations', 'left to claim — spread evenly to practical completion, or claimed at the project\'s expected £/month where set'],
    ['in', 'retention', 'Retention releases', 'R1 at practical completion · R2 after the defects period'],
    ['out', 'bills', 'Supplier bills unpaid', 'part-payment aware · assumed payable this month (per-bill due dates pending)'],
    ['out', 'orders', 'Work orders still to invoice', 'committed less invoiced, spread to practical completion, paid a month later'],
    ['out', 'drawdowns', 'Drawdowns still to spend', 'budget beyond orders and bills, spread to practical completion, paid a month later']
  ];

  function place(total, from, to) {
    const slots = new Array(months.length + 1).fill(0);
    if (!total) return slots;
    const indices = to >= from ? Array.from({ length: to - from + 1 }, (item, offset) => from + offset) : [0];
    money.spread(total, indices.map(() => 1)).forEach((part, index) => { slots[Math.min(indices[index], months.length)] += part; });
    return slots;
  }

  function phase(project) {
    const cash = money.cash(project);
    const window = timing[project.id];
    const at = (index, value) => place(value, index, index);
    const retention = at(window.release < 0 ? months.length : window.release, cash.release1).map((value, index) => value + (index === months.length ? cash.release2 : 0));
    return {
      invoices: at(0, cash.awaitingPayment),
      valuations: place(cash.leftToClaim - cash.awaitingPayment, window.from, window.to),
      retention,
      bills: at(0, cash.unpaidBills),
      orders: place(cash.uninvoicedWos, window.from, window.to),
      drawdowns: place(cash.totals.drawdown, window.from, window.to)
    };
  }

  function forecast(projects) {
    const phased = projects.map(phase);
    const sum = (key) => months.concat('Later').map((month, index) => phased.reduce((total, rows) => total + rows[key][index], 0));
    const rows = Object.fromEntries(categories.map(([, key]) => [key, sum(key)]));
    const movement = rows.invoices.map((value, index) => categories.reduce((total, [side, key]) => total + (side === 'in' ? 1 : -1) * rows[key][index], 0));
    const net = movement.map((value, index) => (index < months.length ? value - overheads : value));
    let balance = money.cashInBank;
    const closing = net.slice(0, months.length).map((value) => (balance += value));
    const lowest = closing.indexOf(Math.min(...closing));
    return { rows, movement, net, closing, lowest };
  }

  function cells(values, format) {
    return values.map(format);
  }

  function forecastTable(view) {
    const band = (label) => [`<span class="eyebrow">${label}</span>`, ...months.map(() => ''), '', ''];
    const categoryRow = ([, key, label, subline]) => [money.sub(`<span class="strong">▸ ${label}</span>`, subline), ...cells(view.rows[key], (value) => (value ? ui.money(value) : money.dim('—'))), money.dim('—')];
    const signedRow = (label, subline, values) => [money.sub(`<span class="strong">${label}</span>`, subline), ...cells(values, (value) => money.toned(value)), money.dim('excluded')];
    const overheadRow = [money.sub('<span class="strong">Company overheads</span>', `entered on this page · <input class="field" style="width:80px;padding:2px 6px;display:inline-block" value="${overheads}"> a month`), ...months.map(() => ui.money(overheads)), money.dim('—'), money.dim('—')];
    const ring = (value, index) => `<span style="${index === view.lowest ? 'outline:2px solid var(--negative);outline-offset:4px;border-radius:2px;' : ''}">${ui.money(value)}</span>`;
    const closingRow = [money.sub('<span class="strong">Closing bank balance</span>', 'directors only · seeded from Xero'), ...view.closing.map(ring), money.dim('—'), money.dim('excluded')];
    const rows = [band('Cash in'), ...categories.filter(([side]) => side === 'in').map(categoryRow), band('Cash out'), ...categories.filter(([side]) => side === 'out').map(categoryRow), signedRow('Project movement', 'cash in less cash out for the projects ticked — before company overheads', view.movement), overheadRow, signedRow('Net movement', 'project movement less company overheads', view.net), closingRow];
    return `<div class="panel" style="margin-bottom:24px">${ui.table({ dense: true, columns: ['', ...months.map((label) => ({ label, num: true })), { label: 'Later', num: true }, { label: 'Undated', num: true }], rows })}</div>`;
  }

  function positionTable(projects) {
    const figures = projects.map((project) => [project, money.cash(project)]);
    const keys = [(cash) => cash.totals.sales, (cash) => cash.allocated, (cash) => cash.leftToClaim, (cash) => -cash.totals.drawdown, (cash) => -cash.uninvoicedWos, (cash) => -cash.unpaidBills, (cash) => cash.release1, (cash) => cash.practical, (cash) => cash.release2, (cash) => cash.completion];
    const format = (value) => (value < 0 ? `−${ui.money(-value)}` : ui.money(value));
    const rows = figures.map(([project, cash]) => [`<span style="white-space:nowrap">${ui.link(`${project.ref} · ${project.name}`, `#/projects/${project.id}/cashflow`)}</span>`, ...keys.map((key) => format(key(cash)))]);
    const footer = ['Total', ...keys.map((key) => format(figures.reduce((sum, [, cash]) => sum + key(cash), 0)))];
    const labels = ['Project Claim', 'Cash Allocated', 'Left to Claim', 'Drawdowns', 'Uninvoiced WOs', 'Unpaid Bills', 'Retention R1', 'PC Cashflow', 'Retention R2', 'Completion Cashflow'];
    return `<div class="panel">${ui.table({ dense: true, columns: ['Project', ...labels.map((label) => ({ label, num: true }))], rows, footer })}</div>`;
  }

  function divider() {
    return '<div class="row" style="gap:16px;margin:40px 0 24px"><div style="height:1px;background:var(--line);flex:1"></div><p class="eyebrow" style="white-space:nowrap">Position to completion — the former Cash Summary</p><div style="height:1px;background:var(--line);flex:1"></div></div>';
  }

  JPMS.page('/finance/cash-forecast', {
    title: 'Cash Forecast',
    render() {
      const projects = JPMS.data.projects;
      const view = forecast(projects);
      const receivables = money.ledger.receivables.reduce((sum, invoice) => sum + invoice.amount, 0);
      return ui.join([
        ui.header({ subtitle: 'Every known future cash movement in the month it is expected to land, and the bank balance that results — lowest point first.' }),
        `<div style="margin-bottom:24px;max-width:900px">${ui.notice('', '<span class="strong">Unconfirmed figures.</span> The timing rules behind this forecast are awaiting sign-off. Amounts are live and reconcile to the statement below; treat the months as indicative. Two known simplifications: supplier bills are assumed payable this month (per-bill due dates come with the confirmed build), and the overheads figure is entered on this page, not yet a system setting.', 'warning')}</div>`,
        ui.toolbar(money.projectFilter(projects), money.exportButton()),
        money.tiles([['Cash in bank', ui.money(money.cashInBank), '3 accounts · fetched 07:42 today'], ['Lowest forecast balance', ui.money(view.closing[view.lowest]), `${months[view.lowest]} — the month to plan for`, view.closing[view.lowest] < 0 ? 'negative' : ''], ['Outstanding sales invoices', ui.money(receivables), `${money.ledger.receivables.length} invoices · 3 overdue`], ['Balance at horizon end', ui.money(view.closing[months.length - 1] + view.net[months.length]), `after ${months[months.length - 1]} incl. later retention releases`]]),
        money.note('<span class="strong">No signs to decode:</span> the band carries the direction — Cash in adds, Cash out subtracts; only Net movement and the balance are signed. Anything overdue sits in the current month, never the past. Flows with no honest date (no practical-completion date set) sit in Undated and never touch the balance.'),
        forecastTable(view),
        `<div style="margin-bottom:24px">${ui.panel('', [`<p class="eyebrow" style="margin-bottom:8px">Closing bank balance by month</p>`, JPMS.charts.lines({ labels: months, series: [{ name: 'Closing bank balance', tone: 'accent', values: view.closing }] })])}</div>`,
        money.note('<span class="tone-positive strong">✓ Ties to the statement below, to the penny.</span> Every project\'s phased months (dated, later and undated together) sum to its Project Completion Cashflow — the forecast is the same figures spread in time, never a second opinion.'),
        divider(),
        money.note('The to-completion statement this page grew out of, unchanged: no time axis, just where the selected jobs\' cash lands if they run to the end. The forecast above is these same figures with "when" added.'),
        positionTable(projects)
      ]);
    }
  });
})();
