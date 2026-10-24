/* Weekly Cashflow — jpms/Pages/WeeklyCashflow.razor with WeeklyCashflowGrid: the next 13 weeks,
   every outstanding Xero bill and sales invoice (the same documents as Aged Payables and Aged
   Receivables) plus the manual outgoings, the net movement and the closing bank balance. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const weekCount = 13;

  const manualBands = [
    ['Subcontractors', [['Day-rate labour settlement', 'weekly', Array.from({ length: weekCount }, (item, week) => [week, 9450])]]],
    ['Staff', [['Salaries — monthly payroll', 'monthly · last working day', [[1, 48600], [5, 48600], [10, 48600]]]]],
    ['Subscriptions', [['Microsoft 365 & Autodesk', 'monthly', [[1, 1240], [5, 1240], [10, 1240]]], ['Xero & payroll add-on', 'monthly', [[1, 96], [5, 96], [10, 96]]]]],
    ['Direct debits', [['HMRC PAYE / NIC', 'monthly · 22nd', [[4, 17850], [8, 17850]]], ['VAT return — quarter to 30 Sep', 'one-off · 7 Nov', [[6, 41200]]], ['Van & plant leases', 'monthly · 1st', [[1, 3480], [5, 3480], [10, 3480]]]]]
  ];

  function weeks(placements) {
    const cells = new Array(weekCount + 1).fill(0);
    placements.forEach(([week, amount]) => { cells[Math.min(week, weekCount)] += amount; });
    return cells;
  }

  function entry(label, subline, cells, options = {}) {
    const style = options.isExcluded ? 'text-decoration:line-through;color:var(--content-faint)' : '';
    const marker = options.isMoved ? '<span class="tone-accent" title="Moved from its due week">‣ </span>' : '';
    const format = (value) => (value ? `<span style="${style}">${marker}${ui.money(value)}</span>` : '');
    const tail = options.isExcluded ? '<span class="text-xs subtle">excluded — paid by direct debit</span>' : '';
    return [`<span style="padding-left:20px;display:block;min-width:260px;${style}">${label}<span class="subline">${subline}${tail ? ' · ' + tail : ''}</span></span>`, ...cells.map(format)];
  }

  function bandTotal(label, subline, cells) {
    return [money.sub(`<span class="strong">▾ ${label}</span>`, subline), ...cells.map((value) => (value ? `<span class="strong">${ui.money(value)}</span>` : money.dim('—')))];
  }

  function sumCells(rows) {
    return rows.reduce((totals, cells) => totals.map((value, index) => value + cells[index]), new Array(weekCount + 1).fill(0));
  }

  function build() {
    const ledger = money.ledger;
    const invoices = ledger.receivables.map((invoice) => ({ label: `${invoice.number} · ${invoice.client}`, subline: `${invoice.isDraft ? 'Draft · ' : ''}due ${invoice.due}`, cells: weeks([[invoice.week, invoice.amount]]), isMoved: invoice.isMoved }));
    const counted = ledger.payables.filter((bill) => bill.number !== 'FVL-2209');
    const bills = counted.map((bill) => ({ label: `${bill.supplier} · ${bill.number}`, subline: `${bill.isDraft ? 'Draft · ' : ''}due ${bill.due}${bill.project ? ' · ' + ledger.siteName(bill.project) : ''}`, cells: weeks([[bill.week, bill.amount]]), isMoved: bill.isMoved }));
    const manual = manualBands.map(([label, items]) => ({ label, items: items.map(([name, subline, placements]) => ({ label: name, subline, cells: weeks(placements) })) }));
    const cashIn = sumCells(invoices.map((row) => row.cells));
    const cashOut = sumCells([...bills, ...manual.flatMap((band) => band.items)].map((row) => row.cells));
    const net = cashIn.map((value, index) => value - cashOut[index]);
    let balance = money.cashInBank;
    const closing = net.slice(0, weekCount).map((value) => (balance += value));
    return { invoices, bills, manual, cashIn, cashOut, net, closing, lowest: closing.indexOf(Math.min(...closing)) };
  }

  function summaryRows(view) {
    const ring = (value, index) => `<span class="${value < 0 ? 'tone-negative' : 'strong'}" style="${index === view.lowest ? 'outline:2px solid var(--negative);outline-offset:4px;border-radius:2px' : ''}">${ui.money(value)}</span>`;
    return [
      [money.sub('<span class="strong">Net movement</span>', 'cash in less cash out, per week'), ...view.net.map((value) => money.toned(value))],
      [money.sub('<span class="strong">Closing bank balance</span>', 'directors only · seeded from Xero'), ...view.closing.map(ring), money.dim('—')]
    ];
  }

  function grid(view) {
    const band = (label) => [`<span class="eyebrow">${label}</span>`, ...new Array(weekCount + 1).fill('')];
    const rows = [
      ...summaryRows(view),
      band('Cash in'),
      bandTotal('Client invoices outstanding', 'one line per outstanding sales invoice in Xero, at its due week — or at the Expected date when one is set in Xero', view.cashIn),
      ...view.invoices.map((row) => entry(row.label, row.subline, row.cells, row)),
      band('Cash out'),
      bandTotal('Supplier bills', 'one line per outstanding bill in Xero — drafts included, as Aged Payables counts them', sumCells(view.bills.map((row) => row.cells))),
      ...view.bills.map((row) => entry(row.label, row.subline, row.cells, row)),
      entry('Fleetwise Vehicle Leasing · FVL-2209', 'due 15 Sep 2026', weeks([[0, 1812]]), { isExcluded: true }),
      ...view.manual.flatMap((group) => [bandTotal(group.label, 'manual items — added on this page', sumCells(group.items.map((item) => item.cells))), ...group.items.map((item) => entry(item.label, item.subline, item.cells))]),
      [`<a class="tone-accent strong" style="cursor:pointer">+ Add item</a>`, ...new Array(weekCount + 1).fill('')],
      ...summaryRows(view)
    ];
    const labels = money.ledger.weekStarts.map((start, index) => ({ label: index ? start : 'This week', num: true }));
    return `<div class="panel" style="margin-bottom:24px">${ui.table({ dense: true, columns: ['', ...labels, { label: 'Later', num: true }], rows })}</div>`;
  }

  JPMS.page('/finance/weekly-cashflow', {
    title: 'Weekly Cashflow',
    render() {
      const view = build();
      const total = (cells) => cells.slice(0, weekCount).reduce((sum, value) => sum + value, 0);
      return ui.join([
        ui.header({ subtitle: `The next ${weekCount} weeks, week by week — every outstanding bill and invoice from Xero, plus the outgoings it can't see. Move any entry to the week it will really be paid.`, actions: [money.exportButton(), ui.btn('Group suppliers'), money.refreshButton('Refresh from Xero')], primary: 'Add item' }),
        money.tiles([['Cash in bank', ui.money(money.cashInBank), 'Xero, as of 07:42 today'], ['To pay this week', ui.money(view.cashOut[0]), 'incl. everything overdue'], ['Lowest week', ui.money(view.closing[view.lowest]), `w/c ${money.ledger.weekStarts[view.lowest]}`, view.closing[view.lowest] < 0 ? 'negative' : ''], ['Balance at horizon end', ui.money(view.closing[weekCount - 1]), `after w/c ${money.ledger.weekStarts[weekCount - 1]}`], [`Cash out, ${weekCount} weeks`, ui.money(total(view.cashOut)), 'bills and manual items in the visible weeks'], [`Cash in, ${weekCount} weeks`, ui.money(total(view.cashIn)), 'outstanding sales invoices in the visible weeks']]),
        money.note('<span class="strong">No signs to decode:</span> the band carries the direction — Cash in adds, Cash out subtracts. Anything overdue sits in the current week, never the past. An <span class="strong">Expected</span> (invoices) or <span class="strong">Planned</span> (bills) date set in Xero places the entry at that week instead of its due week. Use ‹ › on an entry\'s cell to move it to the week it will really be paid — the <span class="tone-accent">‣</span> marks a moved entry, and ↺ returns it to its due week. Moves are shared: everyone sees the same plan.'),
        grid(view),
        money.note(`Every figure is an outstanding Xero document or an item added on this page — nothing is invented, and moving an entry changes <span class="strong">when</span>, never <span class="strong">how much</span>. Bills tie to ${ui.link('Aged Payables', '#/finance/aged-payables')}, invoices to ${ui.link('Aged Receivables', '#/finance/aged-receivables')}, to the penny. Xero read at 07:42.`)
      ]);
    }
  });
})();
