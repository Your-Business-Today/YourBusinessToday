/* The project Labour tab — jpms/Pages/ProjectLabour.razor: the week's Timesheets grid with the
   approval footer, Workers on this project, the Site register, and Subcontractor settlement. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const statusTones = { Submitted: 'info', Approved: 'positive', Rejected: 'negative' };

  const timesheets = [
    ['Reece Hollis', 'Mon 21 Sep', '6300', 8, 'Approved'],
    ['Reece Hollis', 'Tue 22 Sep', '6300', 8, 'Approved'],
    ['Luca Bellini', 'Mon 21 Sep', '6300', 8, 'Approved'],
    ['Luca Bellini', 'Tue 22 Sep', '6300', 7.5, 'Submitted'],
    ['Arturas Petrenas', 'Mon 21 Sep', '3100', 8, 'Approved'],
    ['Arturas Petrenas', 'Tue 22 Sep', '3100', 8, 'Submitted'],
    ['Callum Dyer', 'Tue 22 Sep', '', 8, 'Submitted'],
    ['Jonah Pike', 'Tue 22 Sep', '1000', 8, 'Submitted'],
    ['Jonah Pike', 'Wed 23 Sep', '1000', 16, 'Rejected'],
    ['Kieran Blythe', 'Mon 21 Sep', '5100', 8, 'Submitted'],
    ['Owen Faulkner', 'Mon 21 Sep', '1000', 8, 'Approved']
  ];

  function hourlyOf(name) {
    return money.labour.workers.find((worker) => worker.name === name).hourly;
  }

  function actionsFor(status) {
    if (status === 'Submitted') return `<span style="white-space:nowrap">${ui.btn('Adjust')} ${ui.btn('Reject')}</span>`;
    if (status === 'Approved') return `<a class="text-xs subtle" style="text-decoration:underline">Unapprove</a> <a class="text-xs subtle" style="text-decoration:underline;margin-left:8px">Move</a>`;
    return '';
  }

  function timesheetRow([name, day, code, hours, status]) {
    const tick = status === 'Submitted' ? `<input type="checkbox" ${code ? 'checked' : ''}>` : '';
    const codeCell = code ? ui.mono(code) : ui.pill('uncoded');
    const cost = status === 'Approved' ? (hours * hourlyOf(name)).toLocaleString('en-GB', { minimumFractionDigits: 2 }) : '—';
    return [tick, `<span class="strong">${name}</span>`, `<span class="subtle">${day}</span>`, codeCell, hours, cost, ui.pill(status, statusTones[status]), actionsFor(status)];
  }

  function timesheetsPanel() {
    const filter = `<div class="row" style="padding:12px 16px;border-bottom:1px solid var(--line)">${money.select('Worker', ['All workers', ...new Set(timesheets.map(([name]) => name))])}</div>`;
    const table = ui.table({ dense: true, columns: ['<input type="checkbox">', 'Worker', 'Day', 'Cost code', { label: 'Hours', num: true }, { label: '£', num: true }, 'Status', ''], rows: timesheets.map(timesheetRow) });
    const footer = `<div class="row" style="flex-wrap:wrap;gap:12px;padding:12px 16px;border-top:1px solid var(--line)"><input class="field" style="width:220px" placeholder="Cost code…">${ui.btn('Code 4 selected')}${ui.btn('Approve 4 selected')}<span class="text-xs subtle">Uncoded rows? Pick a cost code and Code selected first, then approve. Only approved time posts to Financials as cost. Budget hard-block applies per cost code.</span></div>`;
    return `<div style="margin-bottom:24px">${ui.panel('Timesheets', [filter, table, footer], { flush: true })}</div>`;
  }

  function workersPanel(project) {
    const assigned = money.labour.activeWorkers().filter((worker) => worker.sites.includes(project.id === 'coach-house' ? 'c' : 'h')).slice(0, 7);
    const list = assigned.map((worker) => `<li class="row-between" style="max-width:320px;padding:4px 0"><span>${worker.name}</span><a class="text-xs tone-negative">Remove</a></li>`).join('');
    const assign = `<div class="row" style="gap:8px"><select class="field"><option>Add worker to project…</option><option>Deon Marsh</option><option>Sam Whitlow</option></select>${ui.btn('Assign')}</div>`;
    const help = `<p class="text-xs subtle" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line);line-height:18px">Workers sign in to the portal like any other user and log time on their <span class="strong">My day</span> page. To set one up: invite them as a user with the <span class="strong">Site Operative</span> role, add a worker record with the same email on the ${ui.link('Workers page', '#/labour/workers')}, then assign them here. Missed a sign-out? Use <span class="strong">Add a day</span> above.</p>`;
    return ui.panel('Workers on this project', [assign, `<ul style="margin-top:12px">${list}</ul>`, help]);
  }

  function registerPanel() {
    const rows = [
      ['Fri 25 Sep', 'Reece Hollis', '07:32', '—'], ['Fri 25 Sep', 'Luca Bellini', '07:41', '—'], ['Fri 25 Sep', 'Jonah Pike', '07:18', '—'],
      ['Thu 24 Sep', 'Reece Hollis', '07:35', '16:02'], ['Thu 24 Sep', 'Arturas Petrenas', '07:50', '16:30'], ['Thu 24 Sep', 'Owen Faulkner', '08:04', '15:45'],
      ['Wed 23 Sep', 'Luca Bellini', '07:38', '16:12'], ['Fri 18 Sep', 'Ben Crossley', '07:55', null]
    ].map(([date, name, signedIn, signedOut]) => [date, `<span class="strong">${name}</span>`, `<span class="subtle">${signedIn}</span>`, signedOut === null ? ui.pill('no sign-out', 'negative') : `<span class="subtle">${signedOut}</span>`]);
    return ui.panel('Site register', ui.table({ dense: true, columns: ['Date', 'Worker', 'In', 'Out'], rows }), { flush: true });
  }

  function settlementPanel() {
    const rows = [
      ['Timbercraft Joinery', 9750, 8500, 0, 1250], ['Ashlar Stone & Masonry', 8970, 8970, 0, 0], ['Callum Dyer (sole trader)', 4180, 4400, -220, 0], ['Reece Hollis (sole trader)', 5280, 3360, 0, 1920]
    ];
    const table = ui.table({
      dense: true,
      columns: ['Subcontractor', { label: 'Approved £', num: true }, { label: 'Covered invoices £', num: true }, { label: 'Posted variances £', num: true }, { label: 'Unresolved £', num: true }],
      rows: rows.map(([name, approved, covered, posted, unresolved]) => [name, ui.money(approved), ui.money(covered), posted ? money.signed(posted) : '—', unresolved ? `<span class="tone-warning">${ui.money(unresolved)}</span>` : '—'])
    });
    const intro = money.note('Approved timesheets are the actual cost; the subbie\'s invoice settles them — mark the invoice lines as covered below. A non-zero unresolved variance stays open until timesheets are corrected, the invoice is amended or split, or the difference is posted as a settlement variance.', { gap: 12 });
    return `<div style="margin-bottom:32px">${ui.panel('Subcontractor settlement', [intro, table, `<div style="margin-top:16px">${ui.btn('Mark invoice lines as covered…')}</div>`])}</div>`;
  }

  JPMS.page('/projects/:project/labour', {
    title: 'Labour',
    render(params) {
      const project = JPMS.project(params.project);
      const weekNav = `<div class="row" style="gap:8px">${ui.btn('‹ Prev')}<span class="subtle">w/c 21 Sep 2026</span>${ui.btn('Next ›')}</div>`;
      return money.projectShell(project, [
        money.sectionHeader('Labour', [weekNav, money.exportButton(), ui.btn('Add a day', 'primary')]),
        timesheetsPanel(),
        `<div class="grid grid-2" style="margin-bottom:24px">${workersPanel(project)}${registerPanel()}</div>`,
        settlementPanel()
      ]);
    }
  });
})();
