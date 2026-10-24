/* WO Allocation — jpms/Pages/ProjectWorkOrderAllocation.razor: headline figures, the work orders
   with their invoiced balances (one expanded), and the queue of Xero purchase lines to link. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const invoicingTones = { 'Not invoiced': '', 'Part invoiced': 'info', 'Fully invoiced': 'positive', 'Over-invoiced': 'negative' };

  const hollowmereOrders = [
    ['WO-0118', 'Northgate Groundworks Ltd', 'Enabling works & site drainage', '2100', 142800, 142800],
    ['WO-0121', 'Northgate Groundworks Ltd', 'Basement dig, piling & RC box', '2200', 441200, 441200],
    ['WO-0124', 'Ashlar Stone & Masonry', 'Bath stone façade & chimneys', '3100', 268400, 249350],
    ['WO-0127', 'Summit Roofing Ltd', 'Roof structure, slate & leadwork', '3300', 181200, 169500],
    ['WO-0131', 'Harbour Glazing Systems', 'Bronze glazing & orangery roof', '4100', 263900, 206800],
    ['WO-0135', 'Clearflow Plumbing & Heating', 'Heating, UFH & plumbing first fix', '5100', 212600, 98850],
    ['WO-0136', 'Brightwire Electrical Ltd', 'Electrical first & second fix', '5200', 148900, 68200],
    ['WO-0139', 'Evenline Plastering', 'Plastering & drylining', '6100', 96400, 22700],
    ['WO-0142', 'Northgate Groundworks Ltd', 'External drainage & attenuation tank', '2100', 45800, 33400],
    ['WO-0144', 'Timbercraft Joinery', 'Oak staircase, doors & panelling', '6300', 176500, 19100],
    ['WO-0147', 'Ardenne Kitchens Ltd', 'Bespoke kitchen & pantry', '7100', 118600, 0]
  ];

  const unlinkedLines = [
    ['22 Sep 2026', 'Meridian Builders Supplies', 'MBS-77812', 'Site consumables & fixings — September', '1000', 3400],
    ['19 Sep 2026', 'Kestrel Timber Merchants', 'KT-55120', 'Oak boards for stair treads (client selection)', '6300', 6340],
    ['15 Sep 2026', 'Halden Site Services', 'HSS-8996', 'Welfare cabin & drying room hire', '1000', 2940],
    ['11 Sep 2026', 'Coldharbour Skips', 'CS-40177', '8yd skip exchanges × 4', '1000', 1480],
    ['04 Sep 2026', 'Stoneleigh Tiles & Stone', 'STS-2011', 'Sample slabs — terrace limestone', '8100', 2100],
    ['28 Aug 2026', 'Meridian Builders Supplies', 'MBS-77310', 'Temporary works props & boarding', '1000', 4260],
    ['21 Aug 2026', 'Kestrel Timber Merchants', 'KT-54902', 'Studwork & noggins — second floor', '6300', 6460]
  ];

  function ordersFor(project) {
    if (project.id === 'hollowmere') return hollowmereOrders;
    const subcontractors = JPMS.data.subcontractors;
    return money.cvr(project).lines.filter((line) => line.wo > 0).map((line, index) => [`WO-${String(160 + index * 3).padStart(4, '0')}`, subcontractors[index % subcontractors.length].name, `${line.name} package`, line.code, line.wo, line.invoiced]);
  }

  function statusOf(value, invoiced) {
    if (!invoiced) return 'Not invoiced';
    return invoiced >= value ? 'Fully invoiced' : 'Part invoiced';
  }

  function orderRow([reference, supplier, title, , value, invoiced], index) {
    const share = value ? Math.round((invoiced / value) * 100) : 0;
    const bar = `<div style="width:120px;height:6px;border-radius:999px;background:var(--surface-raised);border:1px solid var(--line);overflow:hidden"><div style="height:100%;width:${share}%;background:var(--accent)"></div></div>`;
    const status = statusOf(value, invoiced);
    return [`<span class="mono subtle">${index === 2 ? '▾' : '▸'} ${reference}</span>`, supplier, title, ui.pill(status, invoicingTones[status]), ui.money(value), ui.money(invoiced), ui.money(value - invoiced), bar];
  }

  function expandedLines() {
    const rows = [
      ['24 Jul 2026', 'AS-2140', 'Façade stone — ground floor, south & east', '3100', '£96,200.00'],
      ['21 Aug 2026', 'AS-2218', 'Façade stone — first floor & chimneys', '3100', '£128,290.00'],
      ['31 Aug 2026', 'AS-2291', 'Façade stone — second floor ashlar', '3100', '£24,860.00']
    ].map(([date, invoice, description, code, amount]) => [date, 'Ashlar Stone & Masonry', invoice, description, ui.mono(code), amount, '<a class="text-xs subtle" style="text-decoration:underline">Unlink</a>']);
    return `<tr><td colspan="8" style="background:var(--surface-raised);padding:4px 16px 16px">${ui.table({ dense: true, columns: ['Date', 'Supplier', 'Invoice', 'Description', 'Centre', { label: 'Linked £', num: true }, ''], rows })}</td></tr>`;
  }

  function ordersTable(orders) {
    const labels = ['Order', 'Supplier', 'Title', 'Invoicing', 'Value', 'Invoiced', 'Left to invoice', ''];
    const isNumber = (index) => index >= 4 && index <= 6;
    const cells = (values, tag) => values.map((value, index) => `<${tag} class="${isNumber(index) ? 'num' : ''}">${value}</${tag}>`).join('');
    const body = orders.map((order, index) => `<tr class="is-clickable">${cells(orderRow(order, index), 'td')}</tr>${index === 2 ? expandedLines() : ''}`).join('');
    const value = orders.reduce((sum, order) => sum + order[4], 0);
    const invoiced = orders.reduce((sum, order) => sum + order[5], 0);
    const footer = cells(['Total shown', '', '', '', ui.money(value), ui.money(invoiced), ui.money(value - invoiced), ''], 'td');
    return `<div class="table-wrap"><table class="data-table data-table-dense"><thead><tr>${cells(labels, 'th')}</tr></thead><tbody>${body}</tbody><tfoot><tr>${footer}</tr></tfoot></table></div>`;
  }

  function queue() {
    const select = '<select class="field" style="width:240px"><option>Not linked</option><option>WO-0124 · Ashlar Stone &amp; Masonry</option><option>WO-0144 · Timbercraft Joinery</option></select>';
    const rows = unlinkedLines.map(([date, supplier, invoice, description, code, net]) => [date, supplier, invoice, description, ui.mono(code), ui.money(net, { pence: true }), select]);
    const filters = ['Unlinked', 'Linked', 'All'].map((label, index) => `<button type="button" class="text-xs" style="border-radius:999px;padding:2px 10px;border:1px solid ${index ? 'var(--line)' : 'var(--accent)'};color:${index ? 'var(--content-subtle)' : 'var(--content)'}">${label}</button>`).join('');
    return `<div class="row" style="margin-bottom:8px"><h3 class="strong">Invoice lines</h3>${filters}</div><div class="panel">${ui.table({ dense: true, columns: ['Date', 'Supplier', 'Invoice', 'Description', 'Centre', { label: 'Net £', num: true }, 'Work Order'], rows })}</div>`;
  }

  JPMS.page('/projects/:project/work-order-allocation', {
    title: 'WO Allocation',
    render(params) {
      const project = JPMS.project(params.project);
      const { totals } = money.cvr(project);
      const orders = ordersFor(project);
      const linked = orders.reduce((sum, order) => sum + order[5], 0);
      const fully = orders.filter(([, , , , value, invoiced]) => invoiced >= value && value > 0).length;
      const tile = (label, value, tone) => `<div class="panel" style="padding:12px 16px"><p class="eyebrow">${label}</p><p class="text-lg semibold ${tone || ''}" style="margin-top:6px">${value}</p></div>`;
      return money.projectShell(project, [
        '<h2 class="text-lg semibold" style="margin-bottom:6px">Work order invoice allocation</h2>',
        money.note('Tie each Xero purchase line to the work order it pays against. Linking recodes the whole order to the invoice\'s cost centre — the invoice drives the order\'s coding. A work order can never be invoiced past its value; unlinked lines count as non-work-order cost of sales on the Financials tab.', { lead: true }),
        `<div class="grid grid-4 grid-gap-sm" style="margin-bottom:24px">${tile('Cost of sales', ui.money(totals.acos))}${tile('Linked to work orders', ui.money(linked))}${tile('Not linked', ui.money(totals.acos - linked), 'tone-negative')}${tile('Orders fully invoiced', `${fully} of ${orders.length}`)}</div>`,
        `<div class="row-between" style="margin-bottom:8px"><div class="row"><h3 class="strong">Work orders</h3>${ui.search('Search supplier or title…')}</div>${money.exportButton()}</div>`,
        `<div class="panel" style="margin-bottom:24px">${ordersTable(orders)}</div>`,
        queue()
      ]);
    }
  });
})();
