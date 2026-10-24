/* Bid package invites — jpms/Pages/ProjectBidPackageInvites.razor and ProjectBidPackageInviteDetail.razor. */
(function () {
  const ui = JPMS.ui;
  const partners = JPMS.partners;

  const packages = [
    { id: 'bp-0014', ref: 'BP-0014', title: 'Basement tanking & waterproofing', trade: 'Waterproofing', status: 'Awarded', created: '04 Jun 2026' },
    { id: 'bp-0015', ref: 'BP-0015', title: 'Oak frame orangery — supply & erect', trade: 'Carpentry', status: 'Awarded', created: '11 Jun 2026' },
    { id: 'bp-0017', ref: 'BP-0017', title: 'Ground-floor electrical first & second fix', trade: 'Electrical', status: 'Quotes received', created: '02 Jul 2026' },
    { id: 'bp-0018', ref: 'BP-0018', title: 'Underfloor heating & plant room', trade: 'Mechanical', status: 'Inviting', created: '16 Jul 2026' },
    { id: 'bp-0019', ref: 'BP-0019', title: 'Natural slate roof covering', trade: 'Roofing', status: 'Inviting', created: '29 Jul 2026' },
    { id: 'bp-0020', ref: 'BP-0020', title: 'Bespoke joinery — library & boot room', trade: 'Joinery', status: 'Quotes received', created: '12 Aug 2026' },
    { id: 'bp-0021', ref: 'BP-0021', title: 'Limestone flooring — ground floor', trade: 'Stone', status: 'Draft', created: '09 Sep 2026' },
    { id: 'bp-0022', ref: 'BP-0022', title: 'Landscaping — terraces & drive', trade: 'Landscaping', status: 'Draft', created: '18 Sep 2026' },
    { id: 'bp-0016', ref: 'BP-0016', title: 'Scaffold — rear elevation', trade: 'Scaffolding', status: 'Closed', created: '24 Jun 2026' }
  ];

  const lineItems = {
    Electrical: [
      ['Consumer unit & sub-mains to plant room', 'item', '1', '5200', 'Contract line'],
      ['First fix — kitchen, family room, boot room', 'm²', '186', '5200', 'Contract line'],
      ['Second fix — lighting & power, ground floor', 'm²', '186', '5200', 'Contract line'],
      ['Lighting control — scene keypads & dimming', 'nr', '14', '5200', 'Contract line'],
      ['Additional circuits to orangery', 'item', '1', '5200', 'V14']
    ],
    'Fire & security': [
      ['Mains-wired smoke & heat detection', 'nr', '22', '5200', 'Contract line'],
      ['Intruder alarm first fix', 'item', '1', '', null]
    ]
  };

  function packageRows(projectId) {
    return packages.map((item) => [ui.link(item.title, `#/projects/${projectId}/bid-package-invites/${item.id}`), item.trade, ui.pill(item.status), `<span class="subtle">${item.created}</span>`]);
  }

  JPMS.page('/projects/:project/bid-package-invites', {
    title: 'Bid Package Invites',
    render(params) {
      const project = JPMS.project(params.project);
      const actions = [ui.btn('Export to Excel', 'ghost'), ui.btn('Suggest bid packages'), ui.btn('New bid package', 'primary')];
      return partners.projectShell(project, ui.join([
        partners.sectionHeader('Bid package invites', `Bid packages issued to subcontractors to tender. ${packages.length} packages on this project.`, actions),
        ui.panel('', ui.table({ columns: ['Package', 'Trade', 'Status', 'Created'], rows: packageRows(project.id), hrefs: packages.map((item) => `#/projects/${project.id}/bid-package-invites/${item.id}`) }), { flush: true })
      ]));
    }
  });

  function specificationSection() {
    const points = ['Full electrical installation to the ground floor, from the new consumer unit in the plant room', 'Lighting to the lighting designer’s layout rev C, scene control by keypad', 'All accessories in brushed bronze to the client’s schedule', 'Testing, certification and handover pack to BS 7671'];
    return `<section style="margin-bottom:32px"><div class="row-between" style="margin-bottom:12px"><p class="eyebrow">Specification summary</p>${ui.btn('Edit details')}</div><ul class="muted" style="padding:0;list-style:none">${points.map((point) => `<li style="margin-bottom:4px">• ${point}</li>`).join('')}</ul></section>`;
  }

  function coverageCell(coverage) {
    if (!coverage) return '<span class="text-xs subtle"><em>Not linked</em></span>';
    return ui.pill(coverage, coverage.startsWith('V') ? 'accent' : '');
  }

  function lineItemsSection() {
    const groups = Object.entries(lineItems).map(([trade, items]) => `<div style="margin-bottom:16px"><p class="eyebrow" style="margin-bottom:4px">${trade}</p>${ui.table({
      dense: true,
      columns: ['Description', 'Unit', 'Qty', 'Cost code', 'Covered by', ''],
      rows: items.map(([description, unit, quantity, code, coverage]) => [description, unit, quantity, code || ui.pill('No cost code', 'warning'), coverageCell(coverage), `<a class="link text-xs tone-accent">${coverage ? 'Change' : 'Link'}</a>`])
    })}</div>`).join('');
    return `<section><div class="row-between" style="margin-bottom:12px"><p class="eyebrow">Line items</p>${ui.btn('Select line items')}</div>${groups}</section>`;
  }

  JPMS.page('/projects/:project/bid-package-invites/:id', {
    title: 'Bid Package Invites',
    render(params) {
      const project = JPMS.project(params.project);
      const item = packages.find((candidate) => candidate.id === params.id) || packages[2];
      const header = `<header class="page-header"><div><p class="eyebrow mono">${item.ref}</p><div class="row"><h1>${item.title}</h1>${ui.pill(item.status)}</div><p class="subtitle">${item.trade}</p><label class="text-xs muted row" style="gap:8px;margin-top:6px"><input type="checkbox" checked> Materials apply — ask tenderers whether they supply their own</label></div><div class="actions">${ui.menu('Actions', [{ label: 'Create with AI', hint: 'Fill the details from the package’s emails and documents' }, { label: 'Draft the invite', hint: 'To everyone on the tender list' }, { label: 'Close package' }, { label: 'Delete package' }])}</div></header>`;
      const tabs = ui.chips(['Details', 'Tender list', 'Submissions', 'Documents', 'Emails']);
      return partners.projectShell(project, ui.join([
        partners.crumbs([['Bid package invites', `#/projects/${project.id}/bid-package-invites`]]),
        header, `<div style="margin-bottom:20px">${tabs}</div>`, specificationSection(), lineItemsSection()
      ]));
    }
  });
})();
