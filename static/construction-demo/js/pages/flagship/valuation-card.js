/* The claim card on the Valuation Report — the selected claim's name and status, the stage hint,
   the statement toolbar, the Actions menu, the six-step stepper and the ONE next action. Each
   primary button moves the demo to the next stage (?stage=…), so the ladder can be walked. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;

  const stages = {
    draft: { step: 1, status: 'Draft', button: "We're claiming this", next: 'awaiting-invoice', hint: () => 'Set each line’s cumulative % complete (Bulk edit % handles many at once), then lock the claim.' },
    'awaiting-invoice': { step: 2, status: 'Issued', button: (f) => `Raise invoice (${ui.money(f.paymentDue)})`, next: 'invoice-draft', hint: (f) => `Valued and locked by the project team — ${ui.money(f.worksComplete)} works complete; the statement is frozen. Over to accounts: raise the invoice for the amount due. Raising files it as a draft — nothing is sent from here.` },
    'invoice-draft': { step: 2, status: 'Issued', button: 'Record claim sent', next: 'awaiting-approval', hint: (f) => `Invoice ${f.invoiceNumber} raised for ${ui.money(f.invoiceAmount)}, not yet claimed. Send the statement to the architect/client (Email statement, above), then record the claim as sent — or, if this client runs no approval loop, issue it directly from Actions.` },
    'awaiting-approval': { step: 3, status: 'Issued', button: 'Record approval', next: 'approved', hint: (f) => `Claimed — invoice ${f.invoiceNumber} for ${ui.money(f.invoiceAmount)} is with the architect/client since ${f.invoiceDate}. Record their approval (or rejection, in Actions) when it comes.` },
    approved: { step: 4, status: 'Issued', button: 'Raise in Xero & issue…', next: 'awaiting-payment', hint: (f) => `Approved — issue invoice ${f.invoiceNumber} to count it toward certified to date, then put it through the accounts as usual.` },
    'awaiting-payment': { step: 5, status: 'Issued', button: 'Start next claim', next: 'draft', hint: (f) => `Invoice ${f.invoiceNumber} issued for ${ui.money(f.invoiceAmount)} — payment is no gate: carry on with the next claim and record the payment (Actions) when the cash lands.` },
    'ready-to-confirm': { step: 6, status: 'Issued', button: 'Confirm & roll over', next: 'confirmed', hint: (f) => `Invoice ${f.invoiceNumber} is paid — confirm to lock this period as the baseline and roll into the next.` },
    confirmed: { step: 7, status: 'Confirmed', button: 'Start next claim', next: 'draft', hint: (f) => `Confirmed on ${f.confirmedDate} — this claim is the baseline the next period starts from.` }
  };

  const stepLabels = ['Value & lock', 'Claim', 'Approve', 'Invoice', 'Paid', 'Confirm & roll over'];
  const statusTones = { Draft: '', Issued: 'warning', Confirmed: 'positive' };

  function stepper(current) {
    const steps = stepLabels.map((label, index) => {
      const number = index + 1;
      const isDone = number < current;
      const isCurrent = number === current;
      const circle = isDone ? 'background:var(--accent);color:var(--accent-ink);' : isCurrent ? 'border:1px solid var(--accent);color:var(--accent);' : 'border:1px solid var(--line);color:var(--content-faint);';
      const text = isCurrent ? 'strong' : isDone ? 'muted' : 'faint';
      const joiner = number < 6 ? '<span style="width:24px;height:1px;background:var(--line);margin:0 4px"></span>' : '';
      return `<li class="row text-xs" style="gap:6px;flex-wrap:nowrap"><span style="width:16px;height:16px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;${circle}">${isDone ? '✓' : number}</span><span class="${text}">${label}</span>${joiner}</li>`;
    }).join('');
    return `<ol class="row" style="gap:6px">${steps}</ol>`;
  }

  function actionsMenu(key, href) {
    const items = [{ label: 'Rename claim…', hint: 'Name the period this claim values — it shows everywhere the claim does' }];
    if (key === 'draft') items.push({ label: 'Set % complete…', hint: 'Enter cumulative % complete for several lines at once — or have the assistant fill it from the evidence' });
    if (key !== 'draft' && key !== 'confirmed') items.push({ label: 'Reopen as draft', hint: 'Un-issue the claim — back to Draft, % complete editable again', href: href('draft') });
    if (key === 'invoice-draft' || key === 'awaiting-approval') items.push({ label: 'Issue without approval…', hint: 'For clients with no formal approval loop — raise in Xero (or issue without) and count toward certified to date', href: href('awaiting-payment') });
    if (key === 'awaiting-approval') items.push({ label: 'Record rejection…', hint: 'The client refused the claim — unlocks the invoice for amendment or cancellation' });
    if (key === 'awaiting-payment') items.push({ label: 'Record payment…', hint: 'The cash has landed — rolls the amount into the project’s paid total', href: href('ready-to-confirm') });
    items.push({ label: 'Delete claim…', hint: 'Delete this claim and its statement lines — refused while an invoice stands against it' });
    return ui.menu('Actions', items);
  }

  function statementTools(key) {
    if (key === 'draft') return '';
    return frame.toolbar([frame.toolButton('document', 'View statement — the report exactly as it stood when this claim was locked'), frame.toolButton('download', 'Statement PDF — the branded statement the client is sent'), frame.toolButton('email', 'Email statement to client — opens the email for review first')]);
  }

  function card(key, figures, baseHref) {
    const stage = stages[key];
    const href = (next) => `${baseHref}?stage=${next}`;
    const label = typeof stage.button === 'function' ? stage.button(figures) : stage.button;
    const title = `<div class="row" style="gap:8px"><span class="semibold">${figures.claimName}</span>${ui.pill(stage.status, statusTones[stage.status])}</div><p class="muted" style="margin-top:8px;line-height:18px;max-width:760px">${stage.hint(figures)}</p>`;
    const top = `<div class="row-between" style="align-items:flex-start">${`<div style="min-width:0;flex:1">${title}</div>`}<div class="row">${statementTools(key)}${actionsMenu(key, href)}</div></div>`;
    const bottom = `<div class="row-between" style="margin-top:14px">${stepper(stage.step)}${ui.btn(label, 'primary', { href: href(stage.next) })}</div>`;
    return `<section class="panel" style="padding:16px;margin-bottom:16px">${top}${bottom}</section>`;
  }

  function spaced(html) {
    return `<div style="margin-bottom:8px">${html}</div>`;
  }

  function notices(key, project, figures) {
    if (key === 'approved') return spaced(ui.notice('', `Approval recorded. A draft programme update from ${figures.claimName} is awaiting review — 14 of 17 tasks matched to cost centres. ${ui.link('Review it on the Programme tab', `#/projects/${project.id}/programme`)}`, 'positive'));
    if (key === 'awaiting-payment') return spaced(ui.notice('', `Raised in Xero as ${figures.xeroNumber} on ${figures.invoiceDate} for ${ui.escape(project.client)}, due ${figures.invoiceDue} — Sites tracking “${ui.escape(project.name.split(' ')[0])}”, the ${figures.claimName} certificate attached — and issued here. It now counts toward certified to date.`, 'positive'));
    return '';
  }

  JPMS.valuationCard = { stages, card, notices };
})();
