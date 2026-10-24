/* Project Cashflow — jpms/Pages/ProjectCashflow.razor: the statement from the project claim to
   the completion cashflow, the buy back card, the unapproved variations, the notes alongside, and
   a month-by-month picture of the same figures (JPMS.charts.combo). */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const futureMonths = { hollowmere: 8, 'coach-house': 6, kingsridge: 12, wrenfield: 1 };
  const calendar = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  function amount(value) {
    return value < 0 ? `−${ui.money(-value)}` : ui.money(value);
  }

  function addBack(value) {
    return value ? `+ ${ui.money(value)}` : '—';
  }

  function line(label, caption, value, options = {}) {
    const border = options.isTotal ? 'border-top:2px solid var(--line)' : 'border-top:1px solid var(--line)';
    const labelClass = options.isStrong || options.isTotal ? 'strong' : '';
    const size = options.isTotal ? 'text-xl' : options.isStrong ? 'text-lg' : 'text-base';
    const tone = options.tone ? ` tone-${options.tone}` : '';
    const captionHtml = caption ? `<p class="text-xs subtle" style="margin-top:4px">${caption}</p>` : '';
    return `<div class="row-between" style="flex-wrap:nowrap;align-items:baseline;padding:12px 16px;${options.isFirst ? '' : border}"><div><p class="${labelClass}">${label}</p>${captionHtml}</div><p class="${size} semibold${tone}" style="white-space:nowrap">${value}</p></div>`;
  }

  function statement(cash) {
    const withheld = cash.toWithhold ? `less ${ui.money(cash.toWithhold)} retention to be withheld (3% of works left to value)` : '';
    const awaiting = cash.awaitingPayment ? `<br>of which ${ui.money(cash.awaitingPayment)} already invoiced &amp; awaiting payment` : '';
    const tone = (value) => (value < 0 ? 'negative' : 'positive');
    return `<div class="panel" style="margin-bottom:16px">${[
      line('Project claim', 'The full value of the works as currently valued', ui.money(cash.totals.sales), { isStrong: true, isFirst: true }),
      line('Cash allocated', `${ui.money(cash.received)} received from the client · ${ui.money(cash.retentionHeld)} held in retention`, amount(-cash.allocated), { isStrong: true }),
      line('Left to claim', withheld + awaiting, ui.money(cash.leftToClaim), { isStrong: true }),
      line('Cost centre drawdowns', 'Budget still expected to be spent, on top of orders and bills — overspends counted separately below', amount(-cash.totals.drawdown)),
      line('Uninvoiced work orders', `${ui.money(cash.totals.wo)} committed · ${ui.money(cash.totals.invoiced)} invoiced to date`, amount(-cash.uninvoicedWos)),
      line('Unpaid Xero purchase invoices', '', `<span class="${cash.unpaidBills ? 'tone-negative' : ''}">${amount(-cash.unpaidBills)}</span> ${ui.iconBtn('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', 'View the unpaid invoices behind this figure')}`),
      line('Retention release 1', cash.release1 ? 'Forecast · due at practical completion' : 'Confirmed — now in the claim', addBack(cash.release1)),
      line('Practical completion cashflow', '', amount(cash.practical), { isTotal: true, tone: tone(cash.practical) }),
      line('Retention release 2', 'Forecast · due after the 12-month defects period', addBack(cash.release2)),
      line('Project completion cashflow', '', amount(cash.completion), { isTotal: true, tone: tone(cash.completion) })
    ].join('')}</div>`;
  }

  function buyBack(cash) {
    if (!cash.buyBack) return '';
    const position = cash.completion + cash.buyBack;
    return `<div class="panel" style="margin-bottom:16px">${line('Cost centre overspends — available to buy back', 'Committed cost past target — not assumed recouped in the statement above', addBack(cash.buyBack), { isFirst: true })}${line('Position with overspends bought back', '', amount(position), { isTotal: true, tone: 'positive' })}</div>`;
  }

  function potential(project, cash) {
    if (project.stage !== 'On site') return '';
    const variations = [['V15', 'Wine cellar climate control upgrade', 'Issued', 18400], ['V16', 'Orangery lantern — bronze finish', 'Awaiting AI', 12750], ['V17', 'Additional garden wall coping', 'Quoting', null]];
    const rows = variations.map(([reference, title, status, estimate]) => `<div class="row-between" style="flex-wrap:nowrap;padding:10px 16px;border-top:1px solid var(--line)"><div><p>${ui.link(reference, `#/projects/${project.id}/variations/${reference.toLowerCase()}`)} · ${title}</p><p class="text-xs subtle" style="margin-top:4px">${status}</p></div><p style="white-space:nowrap" class="strong">${estimate ? ui.money(estimate) : '<span class="subtle">no estimate yet</span>'}</p></div>`).join('');
    const total = 31150;
    const head = '<div style="padding:12px 16px"><p class="strong">Potential — unapproved variations</p><p class="text-xs subtle" style="margin-top:4px">Not confirmed — no commercial effect until approved. Kept apart from the statement above on purpose.</p></div>';
    return `<div style="border:1px dashed var(--line);background:var(--surface);margin-top:40px">${head}${rows}${line('Potential additional claim', '', addBack(total), { isTotal: true })}${line('Potential project completion cashflow', '', amount(cash.completion + total), { isStrong: true, tone: 'positive' })}</div>`;
  }

  function monthlyChart(project, cash) {
    const actual = money.valuations(project);
    const future = calendar.slice(0, futureMonths[project.id] || 0);
    const paidCost = cash.totals.acos - cash.unpaidBills;
    const costActual = money.spread(paidCost, actual.map((valuation) => valuation.movement || 1));
    const futureIn = money.spread(cash.leftToClaim + cash.release1, future.map((month, index) => (index === future.length - 1 ? 0.6 : 1)));
    const futureOut = money.spread(cash.totals.drawdown + cash.uninvoicedWos + cash.unpaidBills, future.map((month, index) => (index === 0 ? 1.6 : 1)));
    const cashIn = [...actual.map((valuation) => valuation.netDue), ...futureIn];
    const cashOut = [...costActual, ...futureOut];
    let running = 0;
    const cumulative = cashIn.map((value, index) => (running += value - cashOut[index]));
    const labels = [...actual.map((valuation) => valuation.month), ...future];
    if (!labels.length) return '';
    const chart = JPMS.charts.combo({ labels, bars: [{ name: 'Cash in', tone: 'accent', values: cashIn }, { name: 'Cash out', tone: 'info', values: cashOut }], lines: [{ name: 'Cumulative net cash', tone: 'warning', values: cumulative }] });
    const caption = `<p class="text-xs subtle" style="margin-bottom:12px">${actual.length ? `${actual[0].month}–${actual[actual.length - 1].month} actual` : 'No valuations yet'}${future.length ? ` · ${future[0]}–${future[future.length - 1]} forecast — the statement above spread to practical completion` : ''}</p>`;
    return `<div style="margin-top:24px">${ui.panel('By month', [caption, chart])}</div>`;
  }

  function notes() {
    const note = (term, text) => `<p class="text-xs subtle" style="line-height:18px"><span class="strong">${term}</span> ${text}</p>`;
    return `<aside class="panel" style="padding:16px"><div class="stack-sm"><h3 class="eyebrow">Where these figures come from</h3>${[
      note('Project claim', 'is the valuation report\'s counting lines — contract works, provisional sums, contingency and variations.'),
      note('Cash allocated', 'counts valuation invoices the client has paid plus retention withheld on works complete. Valuation invoices are raised net of retention, so retention held is money earned but not invoiceable until released.'),
      note('Left to claim', 'is the project claim less cash allocated, and also less the retention that will be withheld on the works still to value — that slice comes back through the two release rows instead.'),
      note('Cost centre drawdowns', 'reuse the Financials tab\'s drawdown figure to the penny, so the two always agree. Overspent centres are not netted off — they sit in their own card as the buy back still available.'),
      note('Uninvoiced work orders', 'are committed order value suppliers haven\'t billed yet, from the WO Allocation tab. <span class="strong">Unpaid Xero purchase invoices</span> is the net still owed on allocated purchase lines, part-payment aware, and tracks the aged payables.'),
      note('The retention releases', 'are forecast against the revised contract sum with due dates anchored to practical completion.')
    ].join('')}</div></aside>`;
  }

  JPMS.page('/projects/:project/cashflow', {
    title: 'Project Cashflow',
    render(params) {
      const project = JPMS.project(params.project);
      const cash = money.cash(project);
      const intro = `The project claim against the cash already allocated, then the cash still to move — out to costs, back from retention — through practical completion to the end of the project. These figures spread across the months they are expected to land in, company wide, are the ${ui.link('Cash Forecast', '#/finance/cash-forecast')}.`;
      return money.projectShell(project, [
        '<h2 class="text-lg semibold" style="margin-bottom:6px">Project Cashflow</h2>',
        money.note(intro, { lead: true }),
        `<div class="grid grid-sidebar" style="align-items:start"><div>${statement(cash)}${buyBack(cash)}${potential(project, cash)}</div>${notes()}</div>`,
        monthlyChart(project, cash)
      ]);
    }
  });
})();
