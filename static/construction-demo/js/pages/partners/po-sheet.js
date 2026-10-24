/* The printable purchase order — jpms PurchaseOrderSheet: a white A4 sheet whatever the theme. */
(function () {
  const ui = JPMS.ui;
  const ink = 'color:#0f172a';
  const cell = 'border:1px solid #cbd5e1;padding:7px 10px;text-align:left;vertical-align:top';
  const right = `${cell};text-align:right`;
  const label = 'font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#475569;margin-bottom:4px';
  const heading = `font-weight:700;text-decoration:underline;${ink};margin-top:14px`;

  function head(order) {
    const meta = [['Date Created', order.created], ['Date Released', order.isDraft ? '— on approval' : order.released], ['Purchase Order #', order.isDraft ? 'Draft' : order.ref]]
      .map(([term, value]) => `<div style="display:flex;gap:12px"><span style="width:140px;color:#475569">${term}</span><span>${value}</span></div>`).join('');
    const company = ['Printed: 25 Sep 2026', 'Unit 4, Weyside Court, Mill Lane,', 'Ashcombe Green, Surrey, GU9 4ZZ', 'Phone: 01483 000 410'].map((line) => `<p>${line}</p>`).join('');
    return `<header style="display:flex;justify-content:space-between;gap:24px"><div><div class="row" style="${ink}">${ui.jewel(28)}<span style="font-weight:700;letter-spacing:.08em">JEWEL BESPOKE BUILD</span></div><h1 style="font-size:26px;font-weight:700;margin:14px 0;${ink}">Purchase Order</h1>${meta}</div><div style="text-align:right"><p style="font-weight:700;${ink}">Jewel Bespoke Build Ltd</p>${company}</div></header>`;
  }

  function parties(order, project, supplier) {
    return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:18px 0"><div><p style="${label}">Sub/Vendor</p><p style="font-weight:700;${ink}">${order.supplier}</p><p>${supplier.contact}</p><p>Yard 2, Brook Farm Estate</p><p>Linford Heath, Surrey, GU10 3ZZ</p></div><div><p style="${label}">Job</p><p style="font-weight:700;${ink}">${project.name}</p><p>${project.town}</p><p>Surrey</p></div></div>`;
  }

  function scope(order) {
    const paragraphs = [
      `<p style="font-style:italic">“This Works Order is issued subject to the terms and conditions which are appended hereto”</p>`,
      `<p style="color:#2563eb;text-decoration:underline">Find terms of work order here</p>`,
      `<p style="${heading}">Special Instructions</p><p>Every site requires full PPE, boots and Hi-Vis, please ensure these are worn at all times, with all RAMS adhered to.</p><p>We expect all of your work areas to be clean and tidy and left safe at the end of each working day.</p>`,
      `<p style="${heading}">Insurances &amp; RAMS</p><p>Contractors to send all insurance documents and RAMS prior to starting works on site — <strong>projects@jewel-demo.example</strong></p>`,
      order.scope ? `<p style="${heading}">Works Order info</p><p style="white-space:pre-line">${order.scope}</p>` : '',
      order.programme ? `<p style="${heading}">Programme</p><p>Start Date — ${order.programme[0]}</p><p>Completion Date — ${order.programme[1]}</p>` : '',
      `<p style="${heading}">Invoice and Payment Requirements</p><p>Please forward your invoice to <strong>accounts@jewel-demo.example</strong> and <strong>projects@jewel-demo.example</strong> by COB Friday's with a <strong><em>30 day terms</em></strong></p><p>Invoices to include <strong>CIS Breakdown</strong> (if necessary)</p><p>Correct <strong>VAT breakdown</strong> (including Reverse Charge if necessary)</p>`
    ];
    return `<section style="border:1px solid #cbd5e1;margin-bottom:16px"><p style="background:#f8fafc;border-bottom:1px solid #cbd5e1;padding:7px 10px;font-weight:600;${ink}">Scope of Work</p><div style="padding:10px 12px;line-height:1.6">${paragraphs.join('')}</div></section>`;
  }

  function items(order) {
    const rows = order.lines.map(([title, costType, description, quantity, unitCost, paid]) => `<tr><td style="${cell}">${title}<span style="color:#64748b"> · ${order.code}</span></td><td style="${cell}">${costType}</td><td style="${cell}">${description}</td><td style="${right}">${quantity}</td><td style="${right}">${ui.money(unitCost, { pence: true })}</td><td style="${right}">${ui.money(unitCost * parseFloat(quantity), { pence: true })}</td><td style="${right}">${paid ? ui.money(paid, { pence: true }) : '–'}</td></tr>`).join('');
    const headers = ['Items', 'Cost Types', 'Description', 'Qty/Unit', 'Unit Cost', 'Price', 'Paid'].map((text, index) => `<th style="${index > 2 ? right : cell};background:#f8fafc;${ink}">${text}</th>`).join('');
    const paid = order.paid || 0;
    return `<table style="width:100%;border-collapse:collapse;margin-bottom:12px"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody><tfoot><tr style="font-weight:700;${ink}"><td colspan="5" style="${cell}"></td><td style="${right}">${ui.money(order.total, { pence: true })}</td><td style="${right}">${ui.money(paid, { pence: true })}</td></tr></tfoot></table><p style="text-align:right"><strong>Remaining Balance:</strong> ${ui.money(order.total - paid, { pence: true })}</p>`;
  }

  function signatures(order) {
    const side = (name, line, date) => `<div style="flex:1"><p style="font-family:cursive;font-size:18px;${ink};min-height:24px">${name}</p><p style="border-top:1px solid #94a3b8;padding-top:4px;font-size:12px">${line}</p><p style="font-size:12px;color:#64748b">${date}</p></div>`;
    const approved = order.isDraft ? side('&nbsp;', 'Awaiting approval', '&nbsp;') : side('Daniel Price', 'Approved by', `${order.released}, 10:14`);
    const accepted = order.acceptedBy ? side(order.acceptedBy, 'Electronically accepted by', order.acceptedAt) : side('&nbsp;', 'Awaiting electronic acceptance', '&nbsp;');
    return `<p style="font-size:12px;color:#475569;margin:18px 0">A signature of Approval or Electronic Acceptance is required before this purchase order is effective. This purchase order then becomes part of the existing contract and is binding and subject to our terms and conditions detailed in our Work Orders.</p><div style="display:flex;gap:48px">${approved}${accepted}</div>`;
  }

  JPMS.partnersPoSheet = function (order, project, supplier) {
    const draftMark = order.isDraft ? '<p style="position:absolute;top:36px;right:40px;font-size:42px;font-weight:800;color:rgba(220,38,38,.25);letter-spacing:.2em">DRAFT</p>' : '';
    const summary = `<table style="width:100%;border-collapse:collapse;margin-bottom:16px"><thead><tr><th style="${cell};background:#f8fafc">PO Title</th><th style="${cell};background:#f8fafc">Scheduled Completion</th><th style="${right};background:#f8fafc">Total Price</th></tr></thead><tbody><tr><td style="${cell}">${order.title}</td><td style="${cell}">${order.programme ? order.programme[1] : '—'}</td><td style="${right}">${ui.money(order.total, { pence: true })}</td></tr></tbody></table>`;
    return `<div style="position:relative;max-width:820px;margin:0 auto;background:#fff;color:#334155;padding:40px;font-size:13px;box-shadow:0 1px 3px rgba(0,0,0,.4)">${draftMark}${head(order)}<div style="border-top:2px solid #0f172a;margin-top:16px"></div>${parties(order, project, supplier)}${summary}${scope(order)}${items(order)}${signatures(order)}</div>`;
  };
})();
