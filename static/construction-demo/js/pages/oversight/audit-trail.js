/* System Audit Trail — jpms/Pages/AuditTrail.razor: every recorded client-facing interaction and
   finance recode, newest first. Writes made through the connector sit beside clicks, each under the
   signed-in person's own name. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const pathwayTones = { Client: 'positive', Subcontractor: 'warning', Supplier: 'info', Sales: 'accent' };
  const connector = 'via Claude (connector)';
  const portal = 'in the portal';

  const events = [
    ['4m ago', 'sophie.turner', connector, 'Draft created', 'Client', 'RFI-053', 'Drafted the reply to Ashdown Rowe on underfloor heating zones — held in Drafts for review', true],
    ['11m ago', 'sophie.turner', portal, 'Email routed', 'Client', 'RFI-053', 'Thread filed under the client pathway from the Control Centre', false],
    ['38m ago', 'ravi.patel', connector, 'Cost centre recoded', '', 'VR-2100-04', 'Moved “Attenuation tank — additional excavation” to 2200 Substructure · £8,420', false],
    ['1h ago', 'ravi.patel', portal, 'Record created from email', 'Subcontractor', 'WO-0147', 'Work order raised for Evenline Plastering from their quotation email', true],
    ['2h ago', 'marcus.hale', connector, 'KPI marked', 'Internal', 'KPI-0014', 'Client thanked the site team for the tidy handover of the orangery', false],
    ['3h ago', 'daniel.price', portal, 'Snapshot taken', 'Client', 'INV-0031', 'Valuation 7 statement frozen — We’re claiming this', false],
    ['3h ago', 'daniel.price', connector, 'Email sent', 'Client', 'INV-0031', 'Valuation invoice INV-0031 sent to Mr & Mrs Whitfield', true],
    ['5h ago', 'liam.carter', portal, 'Sent to Document Triage', 'Subcontractor', 'DOC-0412', 'Northgate drainage as-built PDF copied into the triage queue', false],
    ['6h ago', 'emma.walsh', connector, 'Document filed', 'Internal', 'DOC-0409', 'Summit Roofing insurance certificate filed to the Directory record', false],
    ['1d ago', 'sophie.turner', portal, 'Wall refused', 'Client', 'RFI-049', 'Refused: linking a subcontractor quote to a client-pathway thread', false],
    ['1d ago', 'ravi.patel', portal, 'WO sale warning overridden', '', 'WO-0146', 'Raised against 5200 Electrical services with no priced valuation line', false],
    ['1d ago', 'sophie.turner', connector, 'Record linked', 'Client', 'V14', 'Architect’s instruction email linked to V14', true],
    ['2d ago', 'tom.reeves', portal, 'Labour day moved', 'Internal', 'LAB-0388', 'Tue 22 Sep moved from The Old Coach House to Hollowmere House', false],
    ['2d ago', 'daniel.price', connector, 'Cost code budget set', '', '6300', 'Joinery budget set to £186,400 on Hollowmere House', false],
    ['3d ago', 'grace.holloway', portal, 'Contractor’s Report exported', 'Internal', 'CR-0012', 'September Contractor’s Report exported as PDF', false]
  ];

  function actorCell([, who, via]) {
    const tone = via === connector ? 'tone-accent' : 'subtle';
    return `<span style="white-space:nowrap">${who}@jewel-demo.example</span><p class="text-xs ${tone}">${via}</p>`;
  }

  function recordCell(reference) {
    const isRequest = /^RFI-|^V\d/.test(reference);
    if (!isRequest) return `<span class="mono text-xs muted" style="white-space:nowrap">${reference}</span>`;
    const href = reference.startsWith('RFI') ? `#/projects/hollowmere/requests/view/${reference.toLowerCase()}` : `#/projects/hollowmere/variations/${reference.toLowerCase()}`;
    return `<a class="mono text-xs link" href="${href}">${reference}</a>`;
  }

  function row(event) {
    const [when, , , label, pathway, reference, detail, hasEmail] = event;
    return [
      `<span class="subtle" style="white-space:nowrap">${when}</span>`,
      actorCell(event),
      `<span style="white-space:nowrap">${label}</span>`,
      pathway ? ui.pill(pathway, pathwayTones[pathway]) : '<span class="subtle">—</span>',
      recordCell(reference),
      `<span style="display:block;min-width:280px">${detail}</span>`,
      hasEmail ? `<a class="text-xs muted" style="text-decoration:underline;white-space:nowrap" href="#/audit">Open in Outlook</a>` : ''
    ];
  }

  function filters() {
    const projects = ['All projects', ...JPMS.data.projects.map((project) => `${project.ref} — ${project.name}`)];
    const eventTypes = ['All events', 'Email routed', 'Record linked', 'Record created from email', 'Draft created', 'Email sent', 'Snapshot taken', 'Cost centre recoded', 'KPI marked', 'Document filed'];
    return `<div class="row" style="margin-bottom:16px;flex-wrap:wrap">${ui.chips(['All', 'Client', 'Subcontractor', 'Internal'])}${shared.select(eventTypes)}${shared.select(projects)}<span class="text-xs subtle" style="margin-left:auto">Showing ${events.length} of 1,284</span></div>`;
  }

  JPMS.page('/audit', {
    title: 'System Audit Trail',
    render() {
      const connectorCount = events.filter((event) => event[2] === connector).length;
      const note = ui.notice('', `Every write carries the signed-in person’s name, whichever door it came through — a click in the portal or their own Claude over the connector. ${connectorCount} of the last ${events.length} came ${connector}.`, 'info');
      return ui.join([
        shared.header({ subtitle: 'Client-facing interactions and finance recodes recorded by the portal.' }),
        filters(),
        `<div style="margin-bottom:16px">${note}</div>`,
        ui.table({ columns: ['When', 'Actor', 'Event', 'Pathway', 'Record', 'Detail', 'Email'], rows: events.map(row) }),
        `<div style="margin-top:16px;text-align:center">${ui.btn('Load more')}</div>`
      ]);
    }
  });
})();
