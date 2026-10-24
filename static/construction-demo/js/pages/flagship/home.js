/* Home as an Administrator sees it — jpms/Components/AdminHome.razor: the Actions menu, the
   stats row, My to-dos (board), KPI emails, open RFIs, next valuations, pending access requests. */
(function () {
  const ui = JPMS.ui;

  const adminActions = [
    { label: 'Users', href: '#/admin/users', hint: 'Everyone who can sign in, invites and roles' },
    { label: 'System', href: '#/admin/system', hint: 'Announce an app version, tender T&Cs' },
    { label: 'Integrations', href: '#/admin/integrations', hint: "The portal's shared external connections" },
    { label: 'Trades', href: '#/admin/trades', hint: 'The curated trade list' },
    { label: 'KPI emails', href: '#/admin/kpis', hint: 'Emails marked as a KPI against a member of staff' },
    { label: 'Data protection', href: '#/admin/data-protection', hint: 'What we hold about a person, and erasure on request' },
    { label: 'Audit trail', href: '#/audit', hint: 'The system audit register' },
    { label: 'AI Skills', href: '#/admin/skills', hint: "The assistant's versioned skills" },
    { label: 'AI Actions', href: '#/admin/ai-actions', hint: 'Skills wired to connector actions' }
  ];

  const openTodos = [
    ['Chase Brightwire for revised first-fix quote', 'Hollowmere House', 'Quantity Surveyor'],
    ['Book building control inspection — drainage', 'The Old Coach House', 'Project Manager'],
    ['Approve Northgate bill against WO-0142', 'Hollowmere House', 'Finance Director'],
    ['Confirm oak flooring sample with client', 'Hollowmere House', 'Project Manager'],
    ['Renew Summit Roofing insurance certificate', 'Company', 'Accounts']
  ];

  const doneTodos = [
    ['Issue V14 to Ashdown Rowe for instruction', 'Hollowmere House'],
    ['File September valuation statement', 'The Old Coach House']
  ];

  function todoCard([title, project, role]) {
    const roleLine = role ? ` · ${role}` : '';
    return `<a class="card" href="#/todos" style="display:block;margin-bottom:8px"><p class="strong">${title}</p><p class="text-xs subtle" style="margin-top:6px">${project}${roleLine}</p></a>`;
  }

  function todosPanel() {
    const open = `<div><p class="eyebrow" style="margin-bottom:8px">Open <span class="chip-count">${openTodos.length}</span></p>${openTodos.map(todoCard).join('')}</div>`;
    const done = `<div><p class="eyebrow" style="margin-bottom:8px">Done <span class="chip-count">${doneTodos.length}</span></p>${doneTodos.map(todoCard).join('')}</div>`;
    const actions = ['<button class="chip is-active">Board</button>', '<button class="chip">List</button>', '<button class="chip">⇅ Oldest first</button>', ui.link('View all', '#/todos')];
    return ui.panel('My to-dos', [`<p class="text-xs subtle" style="margin-bottom:16px">Items assigned to your roles or to you by name — general and project to-dos alike.</p>`, ui.grid(2, [open, done])], { actions });
  }

  function kpiPanel() {
    const rows = [
      ['22 Sep', 'Sophie Turner', 'Client thanked the team for the quick turnaround on V14'],
      ['19 Sep', 'Ravi Patel', 'Architect confirmed the cost report was the clearest they have had'],
      ['16 Sep', 'Liam Carter', 'Late response to subcontractor query on drainage levels']
    ].map(([date, person, note]) => `<div class="row" style="flex-wrap:nowrap;align-items:baseline;margin-bottom:8px"><span class="subtle" style="white-space:nowrap">${date}</span><span class="strong" style="white-space:nowrap">${person}</span><span class="muted">${note}</span></div>`);
    return ui.panel('KPI emails', rows, { actions: [`<span class="text-xs subtle">12 marked · 5 people</span>`, ui.link('Open register', '#/admin/kpis')] });
  }

  function requestsPanel() {
    const project = JPMS.project('hollowmere');
    return ui.panel('Open RFIs', ui.table({
      columns: ['Reference', 'Subject', 'Project', 'Raised', { label: 'Due', num: true }],
      rows: [
        [ui.mono('RFI-049'), 'Steel lintel size over kitchen opening', project.name, '09 Sep', ui.pill('Needs variation', 'warning')],
        [ui.mono('RFI-051'), 'Confirm ridge tile profile', project.name, '11 Sep', ui.pill('Overdue', 'negative')],
        [ui.mono('RFI-052'), 'Stair balustrade finish', 'The Old Coach House', '22 Sep', '02 Oct'],
        [ui.mono('RFI-053'), 'Underfloor heating zones — ground floor', project.name, '24 Sep', '06 Oct']
      ],
      hrefs: ['#/projects/hollowmere/requests/view/rfi-049', null, null, null]
    }), { flush: true, actions: [`<span class="text-xs subtle">4 open</span>`, `<span class="text-xs tone-negative">1 overdue</span>`, ui.link('View all', '#/projects/hollowmere/requests')] });
  }

  function valuationsPanel() {
    const rows = JPMS.data.projects.filter((project) => project.stage === 'On site').map((project, index) => [ui.link(project.name, `#/projects/${project.id}/valuation`), project.client, index === 0 ? '30 Sep 2026' : '07 Oct 2026']);
    return ui.panel('Next valuations', ui.table({ columns: ['Project', 'Client', { label: 'Next valuation', num: true }], rows }), { flush: true });
  }

  function pendingPanel() {
    return ui.panel('Pending access requests', ui.table({
      columns: ['Name', 'Email', 'Requested', 'Role asked for', ''],
      rows: [['Nina Lowe', 'nina.lowe@jewel-demo.example', '24 Sep', 'Site Manager', `<div class="row" style="justify-content:flex-end">${ui.btn('Decline')}${ui.btn('Approve…')}</div>`]]
    }), { flush: true });
  }

  JPMS.page('/dashboard', {
    title: 'Home',
    render() {
      const user = JPMS.data.signedIn;
      return ui.join([
        ui.header({ eyebrow: 'Administrator', subtitle: `You are signed in as ${user.email}`, actions: [ui.menu('Actions', adminActions)] }),
        `<div style="margin-bottom:24px">${ui.stats([{ label: 'Approved users', value: '14' }, { label: 'Pending requests', value: '1' }, { label: 'Roles in use', value: '9' }])}</div>`,
        `<div class="stack">${todosPanel()}${kpiPanel()}${requestsPanel()}${valuationsPanel()}${pendingPanel()}</div>`
      ]);
    }
  });
})();
