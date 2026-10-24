/* The sections that live with the bill on the Valuation Report — ValuationInvoicesSection (the
   invoice ladder Draft → Awaiting approval → Approved → Issued → Paid), the claim's
   Correspondence, and ValuationSummaryPanel. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const figures = JPMS.valuationFigures;
  const tones = { Draft: '', 'Awaiting approval': 'warning', Approved: 'positive', Issued: 'info', Paid: 'positive' };

  function invoiceRow(invoice) {
    const xero = invoice.xeroNumber ? `<span class="text-xs subtle" style="margin-left:6px">Xero ${invoice.xeroNumber}</span>` : '';
    return [`<span class="mono text-xs subtle">${invoice.number}</span>`, invoice.period, ui.money(invoice.amount), ui.pill(invoice.status, tones[invoice.status]) + xero, invoice.paid ? ui.money(invoice.paid) : '—', '<span class="text-xs subtle" style="text-decoration:underline">View report</span>', '<button type="button" class="btn btn-secondary" style="height:26px;padding:0 10px;font-size:12px">Actions ▾</button>'];
  }

  function headerFigure(label, value, isStrong) {
    return `<span><span class="eyebrow" style="margin-right:6px">${label}</span><span class="${isStrong ? 'strong' : 'muted'}">${ui.money(value)}</span></span>`;
  }

  function invoicesSection(invoices) {
    const invoiced = invoices.filter((invoice) => invoice.status === 'Issued' || invoice.status === 'Paid').reduce((total, invoice) => total + invoice.amount, 0);
    const paid = invoices.reduce((total, invoice) => total + invoice.paid, 0);
    const awaiting = invoices.filter((invoice) => invoice.status === 'Awaiting approval').reduce((total, invoice) => total + invoice.amount, 0);
    const figuresHtml = [awaiting ? headerFigure('Awaiting approval', awaiting) : '', headerFigure('Paid', paid), headerFigure('Invoiced', invoiced, true)].join('');
    const tools = frame.toolbar([frame.toolButton('pound', 'Sync payments from Xero…'), frame.toolButton('excel', 'Export to Excel')]);
    const summary = `<summary class="row" style="padding:12px 16px;cursor:pointer;list-style:none;flex-wrap:nowrap">${frame.chevron(true)}<span class="semibold" style="white-space:nowrap">Valuation Invoices</span><span class="text-xs subtle">${invoices.length} invoices</span><span class="row" style="margin-left:auto;gap:24px;flex-wrap:nowrap;white-space:nowrap">${figuresHtml}</span>${tools}</summary>`;
    const columns = ['Ref', 'Period', { label: 'Amount £', num: true }, 'Status', { label: 'Paid £', num: true }, 'Report', ''];
    const table = `<div style="border-top:1px solid var(--line)">${ui.table({ columns, rows: invoices.map(invoiceRow), dense: true })}</div>`;
    return `<details class="panel" style="margin-bottom:12px" open>${summary}${table}</details>`;
  }

  function correspondence(project, claim) {
    const architect = JPMS.data.architects.find((entry) => entry.firm === project.architect) || JPMS.data.architects[0];
    const claimName = claim ? claim.name : 'No claim';
    const sender = `${architect.contact} (${architect.firm})`;
    const emails = claim ? [
      ['16 Sep', sender, `RE: Valuation ${claim.number} — ${claimName}. Agreed as submitted; certificate to follow.`],
      ['14 Sep', 'Ravi Patel', `${project.name} — ${claimName} valuation statement attached for review.`],
      ['11 Sep', sender, 'Site walk Thursday 10:00 to agree percentages before the claim goes in.']
    ] : [];
    const rows = emails.map(([date, from, preview]) => `<div class="list-row" style="justify-content:flex-start;padding:10px 16px"><span class="text-xs subtle" style="width:48px">${date}</span><span class="strong" style="white-space:nowrap">${from}</span><span class="muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${preview}</span></div>`).join('');
    const summary = `<summary class="row" style="padding:12px 16px;cursor:pointer;list-style:none">${frame.chevron(false)}<span class="semibold">Correspondence</span><span class="text-xs subtle">${claimName}</span><span class="text-xs subtle">${emails.length} emails</span></summary>`;
    return `<details class="panel" style="margin-bottom:12px">${summary}<div style="border-top:1px solid var(--line)">${rows}</div></details>`;
  }

  function summaryRow(label, value, isStrong) {
    const weight = isStrong ? 'strong' : 'muted';
    return `<div class="row-between" style="padding:3px 0"><dt class="${weight}">${label}</dt><dd class="${isStrong ? 'strong' : ''}" style="margin:0">${ui.money(value)}</dd></div>`;
  }

  function summaryPanel(sums) {
    const heading = sums.claimName ? `Valuation summary — ${sums.claimName}` : 'Valuation summary';
    const rate = ui.percent(figures.retentionPercent);
    const rows = [
      summaryRow('Original contract sum', sums.contractSum), summaryRow('Net variations', sums.netVariations), summaryRow('Revised contract sum', sums.revisedSum, true), summaryRow('Total works complete', sums.worksComplete),
      summaryRow('Works claimed this period', sums.period), summaryRow(`Retention held (${rate})`, sums.retentionHeld), summaryRow('Retention released (0.0%)', 0), summaryRow('Certified to date', sums.certifiedToDate), summaryRow('Payment due (ex VAT)', sums.paymentDue, true)
    ].join('');
    return `<div class="card" style="margin-top:16px;padding:20px;background:var(--surface-raised)"><h3 class="semibold" style="margin-bottom:12px">${heading}</h3><dl style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px;max-width:680px;margin:0">${rows}</dl></div>`;
  }

  JPMS.valuationExtras = { invoicesSection, correspondence, summaryPanel };
})();
