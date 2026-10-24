/* Payment Certificates — jpms/Pages/PaymentCertificates.razor: the certificates each client's
   architect has issued, filed from Document Triage, grouped by project in live-work order. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const issuedFor = { Mar: '02 Apr 2026', Apr: '06 May 2026', May: '03 Jun 2026', Jun: '01 Jul 2026', Jul: '05 Aug 2026', Aug: '02 Sep 2026', Sep: '16 Sep 2026', Nov: '04 Dec 2025', Dec: '08 Jan 2026', Jan: '05 Feb 2026', Feb: '05 Mar 2026' };

  function certificateRow(project, valuation) {
    const number = String(valuation.number).padStart(2, '0');
    const fileName = `${project.name.replace(/^The /, '')} PC${number} signed.pdf`;
    const file = `<span style="white-space:nowrap"><a class="text-xs tone-accent" style="margin-right:12px">Preview</a><a class="text-xs tone-accent">Download</a></span>`;
    return [
      `<span class="strong">Payment Certificate No. ${valuation.number}</span><span class="subline">${fileName}</span>`,
      issuedFor[valuation.month], `Valuation ${valuation.number}`, ui.money(valuation.netDue), file
    ];
  }

  function group(project) {
    const rows = money.valuations(project).reverse().map((valuation) => certificateRow(project, valuation));
    if (!rows.length) return '';
    const total = money.valuations(project).reduce((sum, valuation) => sum + valuation.netDue, 0);
    const head = `<div class="row-between" style="padding:12px 16px;background:var(--surface-raised);border-bottom:1px solid var(--line)"><p class="strong">${project.ref} — ${project.name}</p><p class="text-xs subtle">${rows.length} certificate${rows.length === 1 ? '' : 's'} · ${ui.money(total)} certified</p></div>`;
    return `<div class="panel" style="overflow:hidden">${head}${ui.table({ dense: true, columns: ['Certificate', 'Issued', 'Valuation claim', { label: 'Certified amount', num: true }, { label: 'File', num: true }], rows })}</div>`;
  }

  JPMS.page('/finance/payment-certificates', {
    title: 'Payment Certificates',
    render() {
      const projects = JPMS.data.projects;
      const count = projects.reduce((sum, project) => sum + money.valuations(project).length, 0);
      return ui.join([
        ui.header({ eyebrow: 'Finance', subtitle: `${count} certificates across all projects on record.` }),
        `<div style="margin-bottom:16px"><select class="field" style="width:280px"><option>All projects</option>${projects.map((project) => `<option>${project.ref} · ${project.name}</option>`).join('')}</select></div>`,
        `<div class="stack">${projects.map(group).join('')}</div>`
      ]);
    }
  });
})();
