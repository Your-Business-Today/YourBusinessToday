/* Defects — jpms/Pages/ProjectDefects.razor (the DEF-#### register) and ProjectDefectDetail.razor
   (one defect: Communications, Detail and To-dos). Status walks Open → In progress → Resolved → Verified. */
(function () {
  const ui = JPMS.ui;
  const site = JPMS.site;
  const statusTones = { Open: 'negative', 'In progress': 'warning', Resolved: 'info', Verified: 'positive' };

  const defects = [
    { ref: 'DEF-0014', location: 'Kitchen — island', description: 'Quartz worktop chipped at the sink cut-out; replace the section.', supplier: 'Stoneleigh Tiles & Stone', email: 'jobs@stoneleigh.example', sent: null, raised: '24 Sep 2026', status: 'Open' },
    { ref: 'DEF-0013', location: 'Orangery', description: 'Condensation between the panes of the second roof lantern unit.', supplier: 'Harbour Glazing Systems', email: 'service@harbourglazing.example', sent: '22 Sep 2026', raised: '21 Sep 2026', status: 'In progress' },
    { ref: 'DEF-0012', location: 'Principal bedroom en-suite', description: 'Shower tray fall wrong — water ponding at the glass screen.', supplier: 'Clearflow Plumbing & Heating', email: 'jo@clearflow.example', sent: '18 Sep 2026', raised: '17 Sep 2026', status: 'In progress' },
    { ref: 'DEF-0011', location: 'Basement cinema', description: 'Hairline crack in the plaster above the acoustic panel run.', supplier: 'Evenline Plastering', email: 'kat@evenline.example', sent: '15 Sep 2026', raised: '14 Sep 2026', status: 'Resolved' },
    { ref: 'DEF-0010', location: 'Front elevation', description: 'Two Bath stone quoins stained by mortar smears; clean and seal.', supplier: 'Ashlar Stone & Masonry', email: 'ben@ashlarstone.example', sent: '09 Sep 2026', raised: '08 Sep 2026', status: 'Verified' },
    { ref: 'DEF-0009', location: 'Hallway', description: 'Oak staircase newel post loose at the base fixing.', supplier: 'Timbercraft Joinery', email: 'callum@timbercraft.example', sent: '04 Sep 2026', raised: '03 Sep 2026', status: 'Resolved' },
    { ref: 'DEF-0008', location: 'Rear terrace', description: 'External socket installed upside down; refit with weatherproof cover.', supplier: 'Brightwire Electrical Ltd', email: 'sam@brightwire.example', sent: '28 Aug 2026', raised: '27 Aug 2026', status: 'Verified' },
    { ref: 'DEF-0007', location: 'Garage roof', description: 'Lead flashing lifted at the abutment after the storm.', supplier: 'Summit Roofing Ltd', email: 'dean@summitroofing.example', sent: '20 Aug 2026', raised: '19 Aug 2026', status: 'In progress' },
    { ref: 'DEF-0006', location: 'Drive', description: 'Setts sinking by the gate pier — sub-base to be re-compacted.', supplier: null, email: null, sent: null, raised: '12 Aug 2026', status: 'Open' },
    { ref: 'DEF-0005', location: 'Boot room', description: 'Cupboard door out of true; re-hang and adjust hinges.', supplier: 'Timbercraft Joinery', email: 'callum@timbercraft.example', sent: '30 Jul 2026', raised: '29 Jul 2026', status: 'Verified' }
  ];

  const statusSelect = (status) => site.statusSelect(Object.keys(statusTones), status);
  const defectHref = (project, defect) => `#/projects/${project.id}/defects/${defect.ref.toLowerCase()}`;

  function registerRow(project, defect) {
    const href = defectHref(project, defect);
    return [
      `<a class="link mono" style="white-space:nowrap" href="${href}">${defect.ref}</a>`,
      defect.location,
      `<a href="${href}">${ui.escape(defect.description)}</a>`,
      defect.supplier || site.italic('Not assigned'),
      site.nowrap(defect.sent || site.italic('Not sent')),
      site.nowrap(defect.raised),
      statusSelect(defect.status),
      `<a class="text-xs subtle" href="${href}" style="text-decoration:underline">Open</a>`
    ];
  }

  JPMS.page('/projects/:project/defects', {
    title: 'Defects',
    render(params) {
      const project = JPMS.project(params.project);
      const rows = project.stage === 'Pre-construction' ? [] : defects.map((defect) => registerRow(project, defect));
      const body = rows.length
        ? ui.table({ columns: ['Ref', 'Location', 'Description', 'Supplier', 'Sent', 'Raised', 'Status', ''], rows, dense: true })
        : ui.empty('No defects on this project. Raise one here, or file a subcontractor email to a new defect from the Control Centre.');
      return site.projectShell(project, [site.sectionHeader('Defects', [ui.btn('Raise defect', 'primary')]), body]);
    }
  });

  function communicationsPanel(project, defect) {
    const email = (from, when, subject, text) => `<div class="message"><div class="message-head"><span class="strong">${from}</span><span class="text-xs subtle">${when}</span></div><p class="text-xs subtle" style="margin-bottom:6px">${subject}</p><p class="muted">${text}</p><div class="row" style="margin-top:10px">${ui.btn('Reply', 'ghost')}${ui.btn('Forward', 'ghost')}</div></div>`;
    const subject = `JPMS/${defect.ref} · ${project.name} — ${defect.location}`;
    const thread = defect.sent
      ? email(defect.supplier, '23 Sep 2026 · 09:14', subject, 'Thanks — we have the replacement unit on order, 10 working days. We will book the fit with Liam once it lands.')
        + email('Liam Carter', `${defect.sent} · 16:42`, subject, `Please see the defect below at ${project.name}. Could you confirm a date to attend and put it right? Photographs attached.`)
      : ui.empty('No correspondence filed to this defect yet.');
    const actions = [`<span class="text-xs subtle">${defect.sent ? '2 emails' : ''}</span>`, ui.btn('Find & tag', 'ghost'), ui.iconBtn('<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>', 'New email'), ui.iconBtn('<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>', 'Refresh')];
    return ui.panel('Communications', thread, { actions });
  }

  function detailPanel(defect) {
    const supplier = defect.supplier ? `${ui.link(defect.supplier, '#/directory')}<span class="text-xs subtle" style="display:block">${defect.email}</span>` : site.italic('Not assigned — Edit to pick the supplier.');
    const pairs = [['Supplier', supplier], ['Sent to supplier', defect.sent ? `${defect.sent} by liam.carter@jewel-demo.example` : site.italic('Not yet')], ['Raised', defect.raised]];
    if (defect.status === 'Resolved' || defect.status === 'Verified') pairs.push(['Resolved', '22 Sep 2026']);
    const list = pairs.map(([label, value]) => `<div style="margin-bottom:12px"><p class="eyebrow">${label}</p><div style="margin-top:2px">${value}</div></div>`).join('');
    return ui.panel('Detail', list);
  }

  function todosPanel(defect) {
    const todo = (title, who, due) => `<div class="list-row" style="padding:10px 0"><div><p>${title}</p><p class="text-xs subtle">${who}</p></div><span class="text-xs subtle" style="white-space:nowrap">${due}</span></div>`;
    const items = todo(`Book the fit for ${defect.ref} with the supplier`, 'Liam Carter', 'Due 02 Oct') + todo('Photograph the finished repair for sign-off', 'Site Manager', 'Due 09 Oct');
    return ui.panel('To-dos', items, { actions: [ui.btn('New to-do')] });
  }

  JPMS.page('/projects/:project/defects/:defect', {
    title: 'Defects',
    render(params) {
      const project = JPMS.project(params.project);
      const defect = defects.find((candidate) => candidate.ref.toLowerCase() === params.defect) || defects[1];
      const primary = defect.sent ? 'Chase supplier' : 'Send to supplier';
      const title = `${defect.location} <span style="margin-left:12px;vertical-align:middle">${ui.pill(defect.status, statusTones[defect.status])}</span>`;
      return site.projectShell(project, [
        `<a class="text-xs subtle" href="#/projects/${project.id}/defects" style="text-decoration:underline">← Defects</a>`,
        `<div style="margin-top:8px">${ui.header({ eyebrow: defect.ref, title, subtitle: ui.escape(defect.description), actions: [ui.btn('Edit'), statusSelect(defect.status)], primary })}</div>`,
        `<div class="grid-sidebar" style="display:grid;grid-template-columns:2fr 1fr;gap:24px;align-items:start">${communicationsPanel(project, defect)}<div class="stack">${detailPanel(defect)}${todosPanel(defect)}</div></div>`
      ]);
    }
  });
})();
