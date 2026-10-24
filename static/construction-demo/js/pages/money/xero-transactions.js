/* Xero Transactions — jpms/Pages/XeroTransactions.razor under the Xero section tabs: purchase
   invoices read from Xero since 1 Apr 2026 with each line's site and cost code, one expanded. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const xeroTabs = [['Allocation', '/finance/allocation'], ['Transactions', '/finance/xero']];
  const vatRate = 0.2;

  const paid = [
    { number: 'AS-2218', supplier: 'Ashlar Stone & Masonry', project: 'hollowmere', code: '3100', date: '21 Aug 2026', amount: 128290 },
    { number: 'NG-1131', supplier: 'Northgate Groundworks Ltd', project: 'hollowmere', code: '2100', date: '18 Aug 2026', amount: 33400 },
    { number: 'HGS-10390', supplier: 'Harbour Glazing Systems', project: 'hollowmere', code: '4100', date: '14 Aug 2026', amount: 88600 },
    { number: 'HGS-CN-0112', supplier: 'Harbour Glazing Systems', project: 'hollowmere', code: '4100', date: '12 Aug 2026', amount: -1480, isCredit: true },
    { number: 'CPH-0851', supplier: 'Clearflow Plumbing & Heating', project: 'hollowmere', code: '5100', date: '07 Aug 2026', amount: 41200 },
    { number: 'EP-0318', supplier: 'Evenline Plastering', project: 'coach-house', code: '6100', date: '04 Aug 2026', amount: 12650 },
    { number: 'KT-54902', supplier: 'Kestrel Timber Merchants', project: 'hollowmere', code: '6300', date: '21 Aug 2026', amount: 6460 }
  ];

  function statusOf(document) {
    if (document.isDraft) return 'DRAFT';
    return document.bucket === undefined ? 'PAID' : 'AUTHORISED';
  }

  function transactions() {
    const outstanding = money.ledger.payables.map((bill) => ({ ...bill }));
    return [...outstanding, ...paid].sort((first, second) => Date.parse(second.date) - Date.parse(first.date));
  }

  function lineDetail() {
    const rows = [
      ['Bath stone ashlar — second floor, north elevation', '310', 'Hollowmere', '3100', 18640],
      ['Chimney caps & cappings', '310', 'Hollowmere', '3100', 6220]
    ].map(([description, account, site, code, net]) => [description, account, site, code, ui.money(net, { pence: true })]);
    return `<tr><td colspan="8" style="background:var(--surface-raised);padding:4px 16px 16px"><p class="text-xs subtle" style="margin:8px 0">Reference: Hollowmere — WO-0124 stage 3</p>${ui.table({ dense: true, columns: ['Description', 'Account', 'Site', 'Cost code', { label: 'Net', num: true }], rows })}</td></tr>`;
  }

  function row(document) {
    const net = document.amount;
    const credit = document.isCredit ? money.badge('Credit note') : '';
    const site = document.project ? JPMS.money.ledger.siteName(document.project).replace('The ', '') : '—';
    const cells = [document.date, `<span class="strong">${document.supplier}</span>`, `${document.number}${credit}`, site, document.code || '—', `<span class="subtle">${statusOf(document)}</span>`, ui.money(net), `<span class="strong">${ui.money(Math.round(net * (1 + vatRate)))}</span>`];
    const html = `<tr class="is-clickable">${cells.map((cell, index) => `<td class="${index >= 6 ? 'num' : ''}">${cell}</td>`).join('')}</tr>`;
    return document.number === 'AS-2291' ? html + lineDetail() : html;
  }

  JPMS.page('/finance/xero', {
    title: 'Xero Transactions',
    render() {
      const list = transactions();
      const total = list.reduce((sum, document) => sum + Math.round(document.amount * (1 + vatRate)), 0);
      const outstanding = money.ledger.payables.reduce((sum, bill) => sum + Math.round(bill.amount * (1 + vatRate)), 0);
      const head = `<tr>${['Date', 'Supplier', 'Number', 'Site', 'Cost code', 'Status'].map((label) => `<th>${label}</th>`).join('')}<th class="num">Net</th><th class="num">Total</th></tr>`;
      const chips = ['DRAFT', 'AUTHORISED', 'PAID'].map((status) => `<button type="button" class="chip">${status}</button>`).join('');
      return ui.join([
        money.sectionTabs(xeroTabs, '/finance/xero'),
        ui.header({ subtitle: 'Purchase invoices read live from Xero since 1 Apr 2026 — with each line\'s site and cost code, ready for reconciliation.', actions: [money.exportButton(), money.refreshButton('Refresh from Xero')] }),
        `<div class="row-between" style="margin-bottom:24px">${money.segmented(['Transactions', 'Site × cost code'])}<p class="text-xs subtle">412 bills · 9 credit notes · fetched 07:42 today</p></div>`,
        `<p class="muted" style="margin-bottom:16px">${list.length} shown · ${ui.money(total)} total (net of credit notes) · ${ui.money(outstanding)} outstanding. <span class="subtle">Click a row for its lines.</span></p>`,
        `<div class="row" style="margin-bottom:16px"><input class="field" style="width:256px" placeholder="Search supplier, number, reference…"><div class="chips">${chips}</div></div>`,
        `<div class="panel"><div class="table-wrap"><table class="data-table data-table-dense"><thead>${head}</thead><tbody>${list.map(row).join('')}</tbody></table></div></div>`
      ]);
    }
  });
})();
