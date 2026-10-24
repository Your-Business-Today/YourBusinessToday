/* Work Orders tab — jpms/Pages/ProjectWorkOrders.razor with WorkOrdersTable, WorkOrderGroupRow and DraftWorkOrdersPanel. */
(function () {
  const ui = JPMS.ui;
  const partners = JPMS.partners;
  const { orders, drafts } = JPMS.partnersWorkOrders;
  const dash = '<span class="subtle">–</span>';
  const invoicingTones = { 'Fully invoiced': 'positive', 'Part invoiced': 'info', 'Not invoiced': '' };
  const paymentTones = { Paid: 'positive', 'Part paid': 'info', Unpaid: 'warning', 'Not linked': '' };
  const expandedCode = '2100';

  const sum = (items, pick) => items.reduce((total, item) => total + (pick(item) || 0), 0);
  const costCentre = (code) => JPMS.data.costCodes.find((entry) => entry.code === code).name;

  function groups() {
    const codes = [...new Set(orders.map((item) => item.code))].sort();
    return codes.map((code) => {
      const members = orders.filter((item) => item.code === code);
      const known = members.filter((item) => item.paid !== null);
      return { code, members, committed: sum(members, (item) => item.total), paid: known.length ? sum(known, (item) => item.paid) : null, remaining: sum(known, (item) => item.total - item.paid), leftToInvoice: sum(members, (item) => item.total - item.invoiced) };
    });
  }

  function summaryLine(projectId) {
    const committed = sum(orders, (item) => item.total);
    const paid = sum(orders, (item) => item.paid);
    const unknown = sum(orders.filter((item) => item.paid === null), (item) => item.total);
    const invoiced = sum(orders, (item) => item.invoiced);
    return `<p class="subtle" style="margin-bottom:16px">${orders.length} work orders issued · <span class="strong" style="color:var(--content)">${ui.money(committed)}</span> committed · ${ui.money(paid)} paid · ${ui.money(committed - unknown - paid)} remaining · ${ui.money(unknown)} on orders with no bill linked · <span class="strong" style="color:var(--content)">${ui.money(sum(drafts, (item) => item.value))}</span> in ${drafts.length} drafts awaiting approval † · <span class="strong" style="color:var(--content)">${ui.money(invoiced)}</span> invoiced against orders · ${ui.money(committed - invoiced)} left to invoice — see the ${ui.link('WO Allocation tab', `#/projects/${projectId}/work-order-allocation`)}<span class="text-xs" style="display:block;margin-top:4px">Xero synced 2 hours ago</span></p>`;
  }

  function draftsPanel(projectId) {
    const rows = drafts.map((draft) => `<div class="list-row">${ui.pill('Draft')}<span class="strong">${draft.title}</span><span class="subtle">${draft.supplier}</span><span style="margin-left:auto">${ui.money(draft.value)}</span>${ui.link('Preview PO', `#/projects/${projectId}/work-orders/${draft.id}/po`)}${ui.menu('Actions', [{ label: 'Approve…' }, { label: 'Edit' }, { label: 'Reject…' }, { label: 'Delete…' }])}</div>`).join('');
    return `<h3 class="strong" style="margin-bottom:8px">Draft work orders</h3><p class="text-xs subtle" style="margin-bottom:8px">Awaiting approval: a draft has no order number, is invisible to the supplier and can't be invoiced or packaged — but its value already counts in the Financials tab's committed figures. Preview PO opens the purchase order exactly as the supplier will receive it. Approving mints the next order number and issues it like any other order.</p><div class="panel" style="margin-bottom:24px">${rows}</div>`;
  }

  function orderLines(members, projectId) {
    const rows = members.map((item) => [ui.link(`<span class="mono" style="white-space:nowrap">${item.ref}</span>`, `#/projects/${projectId}/work-orders/${item.id}/po`), item.supplier, item.title, `${ui.pill(item.status, 'positive')} ${ui.pill(item.invoicing, invoicingTones[item.invoicing])} ${ui.pill(item.payment, paymentTones[item.payment])}`, ui.money(item.total), item.paid === null ? dash : ui.money(item.paid), `<div class="row" style="justify-content:flex-end">${ui.btn('Actions ▾')}</div>`]);
    const table = ui.table({ dense: true, columns: ['Order', 'Supplier', 'Line', 'Status', { label: 'Total', num: true }, { label: 'Paid', num: true }, ''], rows, hrefs: members.map((item) => `#/projects/${projectId}/work-orders/${item.id}/po`) });
    return `<tr><td colspan="7" style="background:var(--surface-raised);padding:4px 16px 16px">${table}</td></tr>`;
  }

  function groupRow(group, projectId) {
    const isExpanded = group.code === expandedCode;
    const paidCell = group.paid === null ? dash : ui.money(group.paid);
    const remainingCell = group.paid === null ? dash : ui.money(group.remaining);
    const row = `<tr class="is-clickable"><td class="mono subtle">${isExpanded ? '▾' : '▸'} ${group.code}</td><td class="strong">${costCentre(group.code)}</td><td class="num">${group.members.length}</td><td class="num">${ui.money(group.committed)}</td><td class="num">${paidCell}</td><td class="num">${remainingCell}</td><td class="num">${ui.money(group.leftToInvoice)}</td></tr>`;
    return isExpanded ? row + orderLines(group.members, projectId) : row;
  }

  function ordersTable(projectId) {
    const all = groups();
    const head = ['Code', 'Cost Centre', 'Orders', 'Committed', 'Paid', 'Remaining', 'Left to invoice'].map((label, index) => `<th class="${index > 1 ? 'num' : ''}">${label}</th>`).join('');
    const known = all.filter((group) => group.paid !== null);
    const foot = `<tr><td colspan="2">Total</td><td class="num">${orders.length}</td><td class="num">${ui.money(sum(all, (group) => group.committed))}</td><td class="num">${ui.money(sum(known, (group) => group.paid))}</td><td class="num">${ui.money(sum(known, (group) => group.remaining))}</td><td class="num">${ui.money(sum(all, (group) => group.leftToInvoice))}</td></tr>`;
    return `<div class="panel"><div class="table-wrap"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${all.map((group) => groupRow(group, projectId)).join('')}</tbody><tfoot>${foot}</tfoot></table></div></div>`;
  }

  const footnote = 'Committed is the sum of work-order line totals per cost centre; one order can span several cost centres, so its value may appear split across rows. Paid is what Xero has settled against the bills linked to each order, spread across its lines by value. An order with no bill linked to it shows “–” rather than £0.00 — nothing is known about it either way until its bills are linked on the WO Allocation tab. Click a row to see the orders behind it.';

  JPMS.page('/projects/:project/work-orders', {
    title: 'Work Orders',
    render(params) {
      const project = JPMS.project(params.project);
      const actions = ['<button class="chip is-active" data-chip>Cost centre</button><button class="chip" data-chip>Supplier</button>', ui.search('Search by supplier…'), ui.btn('Export to Excel', 'ghost'), ui.btn('Add work order')];
      return partners.projectShell(project, ui.join([
        partners.sectionHeader('Work orders by cost centre', '', actions),
        summaryLine(project.id), draftsPanel(project.id), ordersTable(project.id),
        `<p class="text-xs subtle" style="margin-top:12px">${footnote}</p>`
      ]));
    }
  });
})();
