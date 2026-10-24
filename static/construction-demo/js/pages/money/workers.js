/* Workers — jpms/Pages/Workers.razor: the worker registry (day-rate operatives and their cost
   rates) and the Workers without a settlement identity card. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;

  function statusOf(worker) {
    return worker.isActive ? '<span class="tone-positive">Active</span>' : '<span class="subtle">Inactive</span>';
  }

  function actionsOf(worker) {
    const retire = worker.isRetired ? '<span class="subtle" title="Contact details cleared and engagement closed">Retired</span>' : `${ui.btn('Retire', 'ghost')}<button type="button" class="btn btn-ghost tone-negative">Delete</button>`;
    return `<span class="row" style="justify-content:flex-end;gap:4px;flex-wrap:nowrap">${ui.btn('Edit')}${retire}</span>`;
  }

  function companyOf(worker) {
    if (worker.company) return worker.company;
    if (worker.isUnlinked || worker.isRetired) return '—';
    return `<span title="Bills under their own name — their own settlement counterparty">${ui.pill('Sole trader')}</span>`;
  }

  function registry() {
    const rows = money.labour.workers.map((worker) => [
      `<span class="strong">${worker.name}</span>`,
      `<span class="subtle">${worker.email || '— not linked —'}</span>`,
      companyOf(worker),
      worker.hourly.toFixed(2),
      (worker.hourly * 8).toFixed(2),
      statusOf(worker),
      actionsOf(worker)
    ]);
    return ui.table({ columns: ['Name', 'Portal email', 'Subcontractor', { label: 'Hourly £', num: true }, { label: 'Day £ (8h)', num: true }, 'Status', ''], rows });
  }

  function identityCard() {
    const rows = [
      ['Ben Crossley', '<span class="subtle" style="font-style:italic">No directory match — likely a sole trader, or the company is still to import from Xero</span>', `<span class="row" style="justify-content:flex-end">${ui.btn('Sole trader', 'ghost')}</span>`],
      ['Owen Faulkner', '<span class="strong">Faulkner Site Services</span>', `<span class="row" style="justify-content:flex-end;gap:4px">${ui.btn('Link')}${ui.btn('Sole trader', 'ghost')}</span>`]
    ].map(([name, match, actions]) => [`<span class="strong">${name}</span>`, match, actions]);
    const head = `<div class="row-between" style="flex-wrap:wrap;gap:12px;margin-bottom:12px"><div><h3 class="strong">Workers without a settlement identity (2)</h3><p class="text-xs subtle" style="margin-top:4px;max-width:640px;line-height:18px">These workers' bills cannot be marked as settlement until each is linked to a directory company or flagged a sole trader. Find matches compares names against the directory; applying a match is audited.</p></div>${ui.btn('Re-check matches')}</div>`;
    return `<div class="panel" style="margin-top:32px;padding:16px;max-width:900px">${head}${ui.table({ columns: ['Worker', 'Directory match', ''], rows })}<div style="margin-top:12px;text-align:right">${ui.btn('Link all matched (1)')}</div></div>`;
  }

  JPMS.page('/labour/workers', {
    title: 'Workers',
    render() {
      return ui.join([
        money.sectionHeader('Workers', [ui.btn('Add worker', 'primary')]),
        money.note('Day-rate site operatives and their cost rates. Each worker logs their own time on the My day page: invite them as a user with the Site Operative role, then enter the same email here — that links their account to this record. Assign workers to projects from each project\'s Labour tab.', { lead: true, gap: 20 }),
        `<div class="row" style="justify-content:flex-end;margin-bottom:12px">${money.exportButton()}</div>`,
        ui.panel('', registry(), { flush: true }),
        identityCard()
      ]);
    }
  });
})();
