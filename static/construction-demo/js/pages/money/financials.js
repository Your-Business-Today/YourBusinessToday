/* Financials — jpms/Pages/ProjectFinancials.razor with jpms/Components/FinancialsTable.razor: the
   CVR per cost centre (sales side, then the cost side in the order the maths runs) and the
   reconciliation Packages below. Figures come from JPMS.money.cvr, the same set every report uses. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;

  function whole(value) {
    return value ? ui.money(value) : money.dim('£0');
  }

  function percent(value) {
    const rounded = Math.round(value * 10) / 10;
    return rounded ? `${rounded}%` : money.dim('0%');
  }

  function drill(value, title) {
    return value ? `<a class="strong" title="${title}" style="text-decoration:underline dotted;text-underline-offset:3px;cursor:pointer">${ui.money(value)}</a>` : whole(0);
  }

  function textLink(label, isStrong) {
    return `<a class="text-xs ${isStrong ? 'strong' : 'subtle'}" style="text-decoration:underline;text-underline-offset:4px;cursor:pointer">${label}</a>`;
  }

  function profitCell(line) {
    if (line.profitLoss === null) return money.dim('—');
    return `<span class="strong ${line.profitLoss < 0 ? 'tone-negative' : 'tone-positive'}">${ui.money(line.profitLoss)}</span>`;
  }

  function costInput(value) {
    return `<input class="field" style="width:72px;text-align:right;padding:4px 8px" value="${value}">`;
  }

  function lineRow(line) {
    const lockedDash = money.dim('—');
    return [
      '<input type="checkbox">', `<span class="mono subtle">${line.code}</span>`, `<span class="strong" style="white-space:nowrap">${line.name}</span>`,
      drill(line.sales, 'Show the valuation lines behind this figure'), percent(line.complete), whole(line.claim),
      whole(line.target), drill(line.wo, "Show this line's work orders"), whole(line.nonWo), whole(line.committed),
      line.isLocked ? lockedDash : whole(line.drawdown),
      line.isLocked ? lockedDash : line.overspend ? `<span class="tone-negative">${ui.money(line.overspend)}</span>` : whole(0),
      whole(line.forecast), profitCell(line), costInput(line.costPct),
      textLink(line.isLocked ? 'Unlock' : 'Lock', line.isLocked), textLink('Report'),
      drill(line.acos, 'Show the allocated purchase invoices behind this figure, and link them to work orders')
    ];
  }

  const columns = ['', 'Code', 'Cost Centre', 'Contract Sales Value', '% Complete', 'Claim Value', 'Target Cost Value', 'Work Orders', 'Non-WO Cost of Sales', 'Committed Cost of Sales', 'Drawdown', 'Overspend', 'Forecasted Cost of Sales', 'Profit / Loss', 'Cost % Complete', '', '', 'Actual Cost of Sales']
    .map((label, index) => (index > 2 && index !== 15 && index !== 16 ? { label, num: true } : label));

  function cvrTable(project) {
    const { lines, totals } = money.cvr(project);
    const footer = ['', '', 'Total', ui.money(totals.sales), `${Math.round(totals.complete * 10) / 10}%`, ui.money(totals.claim), ui.money(totals.target), ui.money(totals.wo), ui.money(totals.nonWo), ui.money(totals.committed), ui.money(totals.drawdown), totals.overspend ? `<span class="tone-negative">${ui.money(totals.overspend)}</span>` : '£0', ui.money(totals.forecast), `<span class="tone-positive">${ui.money(totals.profitLoss)}</span>`, '', '', '', ui.money(totals.acos)];
    const compact = '<style>#cvr .data-table th,#cvr .data-table td{padding:6px 10px;height:auto;font-size:13px}#cvr .data-table .field{height:28px}</style>';
    return `${compact}<div class="panel" id="cvr">${ui.table({ dense: true, columns, rows: lines.map(lineRow), footer })}</div>`;
  }

  function controls() {
    const left = `<input class="field" style="width:256px" placeholder="Search cost centre or code…">${money.checkbox('Hide zero rows')}${money.checkbox('Hide scope in packages')}`;
    return ui.toolbar(left, money.exportButton());
  }

  function packagesSection(project) {
    const scale = project.contractSum / 3480000;
    const figure = (value) => ui.money(Math.round(value * scale));
    const rows = [
      [`<span class="strong" style="white-space:nowrap">Basement &amp; substructure — Northgate Groundworks</span> ${ui.pill('Locked')}`, figure(596000), figure(596000), figure(541818), figure(441200), figure(457500), money.dim('—'), `<span class="tone-positive">${figure(138500)}</span>`, textLink('Edit') + ' ' + textLink('Unlock')],
      ['<span class="strong" style="white-space:nowrap">Stone façade — Ashlar Stone &amp; Masonry</span>', figure(342000), figure(314640), figure(310909), figure(268400), figure(262950), figure(42509), `<span class="tone-positive">${figure(42509)}</span>`, textLink('Edit') + ' ' + textLink('Lock') + ' ' + textLink('Dissolve')],
      ['<span class="strong" style="white-space:nowrap">Glazing — Harbour Glazing Systems</span>', figure(286000), figure(228800), figure(260000), figure(263900), figure(214300), `<span class="tone-negative">${figure(-3900)}</span>`, `<span class="tone-negative">${figure(-3900)}</span>`, textLink('Edit') + ' ' + textLink('Lock') + ' ' + textLink('Dissolve')]
    ];
    const table = ui.table({ dense: true, columns: ['Package', { label: 'Sales Value', num: true }, { label: 'Claimed', num: true }, { label: 'Target Cost', num: true }, { label: 'WO Committed', num: true }, { label: 'Invoiced', num: true }, { label: 'Drawdown', num: true }, { label: 'Margin / P&L', num: true }, ''], rows });
    return `<section style="margin-top:32px">${money.sectionHeader('Packages', [money.exportButton(), ui.btn('New work order + package'), ui.btn('New package')], 'Match a sub\'s work orders — and any purchase invoices bought directly for the same scope — against the valuation lines that priced it, and read the true position at package level: sales, claimed, target cost, committed, invoiced, margin.')}<div class="panel">${table}</div></section>`;
  }

  const explanation = 'Contract sales value is the valuation report\'s contract value per cost centre — initial contract plus variation lines, declined/TBC excluded; click a figure for the valuation lines behind it. % complete is the sales-side completion from the latest claim (edit it on the valuation report); claim value is the cumulative claimed amount at that completion. Target cost value is the contract sales value with our assumed 10% markup backed out (divided by 1.1) — what the line should cost us. Work orders is the value committed to work orders. Actual cost of sales is Xero purchase spend allocated to this project on the Allocation page, net of credit notes. Non-WO cost of sales is the share of that spend not linked to any work order. Committed cost of sales is work orders plus non-WO cost of sales. What\'s left of the target cost after that splits by sign: drawdown is the remainder where positive, overspend where negative. Forecasted cost of sales is committed plus drawdown — the line\'s expected total cost. Lock a line when no more is to be spent on it: its remaining drawdown moves to profit / loss, realising what was made (or lost) buying against that centre. Cost % complete is the cost-side completion — edit it directly in the table.';

  JPMS.page('/projects/:project/financials', {
    title: 'Financials',
    render(params) {
      const project = JPMS.project(params.project);
      const pending = project.stage === 'On site' ? ui.notice('', `Pending labour: £3,812.50 submitted on timesheets but not yet approved — it posts to cost of sales only once approved on the ${ui.link('Labour tab', `#/projects/${project.id}/labour`)}.`, 'warning') : '';
      return money.projectShell(project, [
        '<h2 class="text-lg semibold" style="margin-bottom:12px">Financial summary</h2>',
        pending ? `<div style="margin-bottom:12px">${pending}</div>` : '',
        controls(), cvrTable(project),
        `<p class="text-xs subtle" style="margin-top:12px;line-height:18px">${explanation}</p>`,
        packagesSection(project)
      ]);
    }
  });
})();
