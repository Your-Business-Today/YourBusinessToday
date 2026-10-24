/* The printable purchase order — jpms/Pages/WorkOrderPo.razor: toolbar, PurchaseOrderSheet, Attachments,
   Timeline; WO-0142 also carries its bill as the Work Order bills tab's card (WorkOrderBillCard). */
(function () {
  const ui = JPMS.ui;
  const data = JPMS.partnersWorkOrders;

  const richLines = [
    ['Attenuation tank', 'Subcontract', '30 m³ geocellular tank, wrapped, incl. dig & backfill', '1 item', 38200, 27380],
    ['Foul drainage', 'Subcontract', '150mm uPVC runs MH4–MH7, bedding & surround', '64 m', 185, 0],
    ['Manholes', 'Subcontract', 'Precast chambers MH4–MH7 with covers', '4 nr', 2350, 0],
    ['Surface water to soakaway', 'Subcontract', 'Rear terrace channel drains to tank inlet', '1 item', 7810, 0],
    ['CCTV survey', 'Subcontract', 'Survey & report of all new drainage', '1 item', 1200, 0]
  ];

  function orderFor(id) {
    const found = data.orders.find((order) => order.id === id);
    if (found) return { ...found, created: found.released };
    const draft = data.drafts.find((candidate) => candidate.id === id) || data.drafts[0];
    return { ref: 'Draft', id, supplier: draft.supplier, code: draft.code, title: draft.title, total: draft.value, paid: 0, isDraft: true, created: '23 Sep 2026' };
  }

  function withLines(order) {
    if (order.id === 'wo-0142') return { ...order, lines: richLines, scope: 'External foul and surface water drainage to the engineer’s drawing D-201 rev D.\nAttenuation tank to the rear lawn, levels to be agreed with the site manager before backfill.', programme: ['01 Sep 2026', '16 Oct 2026'], acceptedBy: 'Gary Northgate', acceptedAt: '12 Aug 2026, 08:41' };
    const labour = Math.round(order.total * 0.7);
    return { ...order, lines: [[order.title, 'Subcontract', 'Labour and plant as quoted', '1 item', labour, order.paid || 0], ['Materials', 'Materials', 'Materials as quoted', '1 item', order.total - labour, 0]] };
  }

  function statusPill(order) {
    if (order.isDraft) return ui.pill('Draft — awaiting approval');
    if (order.acceptedBy) return ui.pill('Accepted by supplier', 'positive');
    return ui.pill('Awaiting supplier acceptance', 'warning');
  }

  function toolbar(order, projectId) {
    const email = order.isDraft ? '' : ui.btn('Email to supplier…');
    return `<div class="row-between" style="max-width:820px;margin:0 auto 20px">${ui.link('← Work orders', `#/projects/${projectId}/work-orders`)}<div class="row">${statusPill(order)}${email}${ui.btn('Print / save PDF')}</div></div>`;
  }

  function attachmentsPanel(order) {
    const files = order.id === 'wo-0142' ? [['Northgate quote Q-1187 — drainage.pdf', '412 KB'], ['D-201 rev D drainage layout.pdf', '1.8 MB']] : [];
    const body = files.length ? files.map(([name, size]) => `<div class="row-between" style="padding:6px 0"><span>${name}</span><span class="row text-xs subtle">${size} ${ui.link('Open', '#')}</span></div>`).join('') : ui.empty('Nothing attached to this order yet.');
    return ui.panel('Attachments', body, { actions: [ui.btn('Attach files')] });
  }

  function timelinePanel(order) {
    const events = [['Raised' + (order.isDraft ? ' — still a draft' : ''), `${order.created}, 09:02`]];
    if (!order.isDraft) events.push([`Approved &amp; issued as ${order.ref}`, `${order.released}, 10:14 · Daniel Price`]);
    if (order.acceptedBy) events.push([`Accepted by ${order.acceptedBy}`, order.acceptedAt]);
    if (order.id === 'wo-0142') events.push(['Bill NG-2207 linked — £27,380.00', '04 Sep 2026 · Emma Walsh'], ['Purchase order emailed to accounts@northgate-groundworks.example', '11 Aug 2026, 10:15']);
    const items = events.map(([what, when]) => `<div class="timeline-item is-done"><p>${what}</p><p class="text-xs subtle">${when}</p></div>`).join('');
    return ui.panel('Timeline', `<div class="timeline">${items}</div>`);
  }

  function billSlices(bill) {
    const rows = bill.orders.map((order) => {
      const remaining = order.value - order.invoiced - (order.thisBill || 0);
      return [`<span style="display:inline-block;min-width:280px">${ui.link(order.ref, `#/projects/hollowmere/work-orders/${order.ref.toLowerCase()}/po`)} <span class="muted">${order.title} · Hollowmere House</span></span>`, ui.money(order.value, { pence: true }), ui.money(order.invoiced, { pence: true }), `<input class="field" style="width:120px;text-align:right" value="${order.thisBill ? order.thisBill.toFixed(2) : ''}" placeholder="—">`, `<span class="strong">${ui.money(remaining, { pence: true })}</span>`];
    });
    return ui.table({ columns: ['Order', { label: 'Order value', num: true }, { label: 'Invoiced to date', num: true }, { label: 'This bill', num: true }, { label: 'Remaining after', num: true }], rows }) + `<p class="text-xs subtle" style="padding:8px 20px">${ui.money(bill.net, { pence: true })} of ${ui.money(bill.net, { pence: true })} placed</p>`;
  }

  function billCard() {
    const bill = data.bill;
    const lines = ui.table({ dense: true, columns: ['Xero line — left as raised', 'Account', { label: 'Net', num: true }], rows: bill.lines.map(([text, account, net]) => [text, account, ui.money(net, { pence: true })]) });
    const header = `<header class="panel-header" style="align-items:flex-start"><div><p class="strong">${bill.supplier} <span class="muted" style="font-weight:400">· ${bill.number} · ${bill.date}</span> ${ui.pill('Draft')}</p><p class="muted" style="margin-top:4px"><span class="strong" style="margin-right:8px">WO-0142</span>${ui.pill(bill.rule, bill.tone)}</p></div><div class="row" style="flex-wrap:nowrap;white-space:nowrap"><span class="strong">${ui.money(bill.net, { pence: true })} net</span>${ui.btn('Document')}${ui.btn('Not a work-order bill')}</div></header>`;
    const footer = `<div class="row-between" style="padding:16px 20px;border-top:1px solid var(--line)"><p class="text-xs subtle" style="flex:1">Approve allocates every line, links each order for its figure, writes the tracking to Xero line by line as raised, and approves the bill there.</p>${ui.btn('Approve', 'primary')}</div>`;
    const strip = ui.notice('', 'These bills come from suppliers with an <strong>open work order</strong>, so their project and cost code were decided when the order was approved. Each card is one bill, pre-filled from its order — check it and press Approve: every line is allocated and linked to the order, the Sites and Cost Code tracking is written to Xero, and the bill is approved there and becomes payable. Nothing is coded by hand.');
    return `<section style="max-width:820px;margin:0 auto 24px"><div class="row-between" style="margin-bottom:12px"><h2 class="text-lg strong">Work Order bills <span class="chip-count">1</span></h2>${ui.link('Open Xero allocation →', '#/finance/allocation')}</div>${strip}<article class="panel" style="margin-top:16px">${header}${billSlices(bill)}${lines}${footer}</article></section>`;
  }

  JPMS.page('/projects/:project/work-orders/:id/po', {
    title: (params) => (params.id.startsWith('wo-') ? params.id.toUpperCase() : 'Draft work order'),
    render(params) {
      const project = JPMS.project(params.project);
      const order = withLines(orderFor(params.id));
      const supplier = data.bySupplier(order.supplier) || { contact: 'Accounts' };
      const bill = order.id === 'wo-0142' ? billCard() : '';
      const panels = `<div class="stack" style="max-width:820px;margin:24px auto 0">${attachmentsPanel(order)}${timelinePanel(order)}</div>`;
      return ui.join([toolbar(order, project.id), bill, JPMS.partnersPoSheet(order, project, supplier), panels]);
    }
  });
})();
