/* The Work Order bills tab — WorkOrderBillsStrip, WorkOrderBillCard, WorkOrderBillOrderSlices and
   WorkOrderBillLinesTable: one card per bill, pre-filled from its orders, approved in one press. */
(function () {
  const ui = JPMS.ui;

  function strip() {
    return '<div class="card muted" style="margin-bottom:16px;background:var(--surface-raised);line-height:20px">These bills come from suppliers with an <span class="strong">open work order</span>, so their project and cost code were decided when the order was approved. Each card is one bill, pre-filled from its order — check it and press Approve: every line is allocated and linked to the order, the Sites and Cost Code tracking is written to Xero, and the bill is approved there and becomes payable. A bill that pays two of the supplier’s orders takes a figure per order off the bill total.</div>';
  }

  function orderRow(order) {
    const remaining = order.value - order.invoiced - order.thisBill;
    const link = `<a class="strong" href="#/projects/hollowmere/work-orders" style="text-decoration:underline">${order.reference}</a><span class="muted"> ${order.title} · ${order.project}</span>`;
    const input = `<input class="field" style="height:30px;width:128px;text-align:right;font-size:14px;padding:0 8px" value="${order.thisBill.toFixed(2)}">`;
    return [link, ui.money(order.value), ui.money(order.invoiced), input, `<span class="strong">${ui.money(remaining)}</span>`];
  }

  function slices(bill) {
    const columns = ['Order', { label: 'Order value', num: true }, { label: 'Invoiced to date', num: true }, { label: 'This bill', num: true }, { label: 'Remaining after', num: true }];
    return ui.table({ columns, rows: bill.orders.map(orderRow) });
  }

  function lines(bill) {
    const rows = bill.lines.map(([description, centre, net]) => [description, centre, ui.money(net, { pence: true })]);
    return ui.table({ columns: ['Xero line', 'Cost code as raised', { label: 'Net', num: true }], rows, dense: true });
  }

  function card(bill, index) {
    const orders = bill.orders.map((order) => `<span class="strong" style="margin-right:8px">${order.reference}</span>`).join('');
    const head = `<header class="row-between" style="padding:16px 24px;border-bottom:1px solid var(--line);align-items:flex-start"><div><p class="strong">${bill.supplier}<span class="muted" style="font-weight:400"> · ${bill.number} · ${bill.date}</span><span class="text-xs" style="margin-left:6px;border:1px solid var(--line);border-radius:4px;padding:1px 6px">Draft</span></p><p class="muted" style="margin-top:6px">${orders}${ui.pill(bill.rule, bill.tone)}</p></div><div class="row"><span class="strong">${ui.money(bill.net, { pence: true })} net</span>${ui.btn('Document')}${ui.btn('Not a work-order bill')}</div></header>`;
    const approve = index === 0 ? ui.btn('Approve', 'primary') : ui.btn('Approve');
    const foot = `<footer class="row-between" style="padding:16px 24px;border-top:1px solid var(--line)"><p class="subtle">Approve allocates every line, links each order for its figure, writes the tracking to Xero line by line as raised, and approves the bill there.</p>${approve}</footer>`;
    return `<article class="panel" style="margin-bottom:16px">${head}${slices(bill)}${lines(bill)}${foot}</article>`;
  }

  JPMS.allocationBills = { strip, card };
})();
