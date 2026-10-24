/* Owner Overview — jpms/Pages/OwnerOverview.razor with Features/Owner (OwnerDecisionsPanel,
   OwnerProjectsTable, OwnerGapsPanel): the board's one-page reading of the business. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;

  const weeks = ['28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct', '2 Nov', '9 Nov', '16 Nov', '23 Nov', '30 Nov', '7 Dec', '14 Dec', '21 Dec'];
  const closing = [548200, 471900, 402300, 188600, -38400, 96200, 214800, 262100, 131500, 205900, 318400, 276300, 342700];

  const jobs = [
    { id: 'hollowmere', name: 'Hollowmere House', ref: 'JBB-101', stage: 'On site', profit: 512400, margin: 13.9, toFinish: 204600, complete: 62.0 },
    { id: 'kingsridge', name: 'Kingsridge Lodge', ref: 'JBB-103', stage: 'Pre-construction', profit: 917600, margin: 15.5, toFinish: 917600, complete: null },
    { id: 'coach-house', name: 'The Old Coach House', ref: 'JBB-102', stage: 'On site', profit: 128900, margin: 10.1, toFinish: -21300, complete: 38.4 },
    { id: null, name: 'Fernleigh Court Basement', ref: 'JBB-105', stage: 'Mobilisation', profit: 348500, margin: 13.2, toFinish: 348500, complete: 0.0 },
    { id: null, name: 'Larch Hollow Orangery', ref: 'JBB-104', stage: 'Procurement', profit: 141600, margin: 12.0, toFinish: 141600, complete: null },
    { id: null, name: 'Stonebridge Farmhouse', ref: 'JBB-099', stage: 'Defects period', profit: -18400, margin: -0.9, toFinish: -6200, complete: 98.5 }
  ];

  const decisions = [
    { title: 'The 13-week plan goes below zero', detail: '(£38,400) in the week of 26 Oct, on the recorded bills, invoices and manual items.', href: '#/finance/weekly-cashflow', isSerious: true },
    { title: 'Stonebridge Farmhouse: forecast whole-job loss', detail: '(£18,400) at completion — £1.94m contract against £1.95m forecast cost.', href: '#/projects', isSerious: true },
    { title: 'The Old Coach House: loss on the work remaining', detail: '(£21,300) between £773k left to certify and £794k cost to complete; the job is still £128,900 up overall.', href: '#/projects/coach-house/financials', isSerious: false },
    { title: 'Supplier bills past their due date', detail: '£86,240 overdue, drafts included — timing and disputes to settle, not necessarily all to pay.', href: '#/finance/aged-payables', isSerious: false },
    { title: 'Client invoices past their due date', detail: '£142,680 overdue from clients.', href: '#/finance/aged-receivables', isSerious: false }
  ];

  const gaps = [
    ['Company operating profit after overhead', 'Every profit figure the portal holds is project gross profit — certified against allocated Xero spend. Company overhead is not held against a period anywhere, so there is no period P&amp;L to read it from.'],
    ['One complete cash outlook', 'The 13-week plan counts recorded bills and invoices but not valuations yet to be issued; the monthly Cash Forecast counts future valuations but its overhead figure is typed per user, so two directors see two forecasts. Reconciling the two into one dated cash ledger is new logic.'],
    ['An early-warning cash buffer', 'The list above flags a week below zero. Flagging a week below an approved minimum balance needs that minimum agreeing first.'],
    ['Pipeline value', 'Leads carry an estimated value and a stage, but no probability or margin — a weighted pipeline is a definition the sales team has not made. The open-lead count above is the fact the portal does hold.'],
    ['The five data checks', "The prototype's reconciliation tickets (certified total vs the invoice register, retention across two pages, cost to complete vs cash drawdowns, cost-of-sales scope) compare figures from different pages on different bases. Each bridge is its own piece of logic to define and then automate."],
    ['Programme days late', "The programme knows which tasks are past their planned finish; it holds no baseline or dependency links, so 'critical-path days late' cannot be computed."]
  ];

  function tile(label, value, caption, options = {}) {
    const valueClass = options.tone ? `tone-${options.tone}` : '';
    const dim = options.isDim ? 'opacity:.6;' : '';
    return `<article class="stat" style="${dim}"><div class="stat-top"><p class="stat-label">${label}</p></div><p class="stat-value ${valueClass}">${value}</p><p class="text-xs subtle" style="margin-top:6px">${caption}</p></article>`;
  }

  function nowTiles() {
    return `<div class="grid grid-4 grid-gap-sm" style="margin-bottom:24px">${[
      tile('Cash in bank', ui.money(612450), '3 Xero bank accounts · synced 07:40 today'),
      tile('Lowest week, 13-week plan', ui.money(-38400), 'w/c 26 Oct · week 5 · before valuations not yet issued', { tone: 'negative' }),
      tile('Forecast project profit', ui.money(2030600), '12.2% on £16.6m · 6 live jobs · before overhead', { tone: 'positive' }),
      tile('Company operating profit', '<span class="muted">Not yet calculated</span>', 'No period P&amp;L with overhead exists in the portal', { isDim: true })
    ].join('')}</div>`;
  }

  function cashPanel() {
    const chart = JPMS.charts.lines({ labels: weeks, series: [{ name: 'Closing bank balance', tone: 'accent', values: closing }, { name: 'Zero', tone: 'negative', dashed: true, values: weeks.map(() => 0) }] });
    const note = `<p class="text-xs muted" style="margin-top:12px;line-height:18px">The Weekly Cashflow's recorded plan: outstanding Xero bills and sales invoices in the week they fall due or were placed, plus the manual items Xero cannot see. Valuations not yet issued are not in it — the monthly ${ui.link('Cash Forecast', '#/finance/cash-forecast')} holds those. ${ui.link('Open the plan', '#/finance/weekly-cashflow')}</p>`;
    return ui.panel('Cash ahead — the 13-week plan', [chart, note], { class: '' });
  }

  function decisionRow(decision) {
    const dot = decision.isSerious ? 'var(--negative)' : 'var(--warning)';
    return `<a class="list-row" href="${decision.href}" style="align-items:flex-start;justify-content:flex-start"><span style="margin-top:5px;width:8px;height:8px;border-radius:999px;background:${dot};flex-shrink:0"></span><span><span class="strong" style="display:block">${decision.title}</span><span class="text-xs muted" style="display:block;margin-top:4px;line-height:16px">${decision.detail}</span></span></a>`;
  }

  function decisionsPanel() {
    return ui.panel('Needs a decision', decisions.map(decisionRow), { flush: true });
  }

  JPMS.ownerOverview = { jobs, gaps, tile, nowTiles, cashPanel, decisionsPanel };
})();
