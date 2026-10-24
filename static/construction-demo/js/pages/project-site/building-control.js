/* Building Control — jpms/Pages/ProjectBuildingControl.razor (the case panel with its documents and
   the BCI-#### inspection register) and ProjectBuildingControlInspection.razor (one stage). */
(function () {
  const ui = JPMS.ui;
  const site = JPMS.site;
  const statuses = ['Planned', 'Booked', 'Inspected', 'Passed', 'Actions required', 'Closed'];
  const statusTones = { Passed: 'positive', 'Actions required': 'negative', Booked: 'info', Inspected: 'info' };

  const inspections = [
    { ref: 'BCI-0001', stage: 'Foundations', status: 'Passed', booked: '18 Mar 2026', inspected: '18 Mar 2026', files: '4 photos, 1 doc', inspector: 'Alan Pryce', outcome: 'Trench depths and bearing acceptable. Passed.' },
    { ref: 'BCI-0002', stage: 'Basement waterproofing', status: 'Passed', booked: '22 Apr 2026', inspected: '22 Apr 2026', files: '6 photos, 1 doc', inspector: 'Alan Pryce', outcome: 'Cavity drain membrane and sump pumps installed to the approved detail.' },
    { ref: 'BCI-0003', stage: 'Drainage', status: 'Actions required', booked: '16 Sep 2026', inspected: '16 Sep 2026', files: '5 photos, 1 doc', inspector: 'Alan Pryce', outcome: 'Air test failed on the rear foul run between MH3 and MH4. Locate and repair, re-test before backfilling. Provide CCTV survey of the new run.' },
    { ref: 'BCI-0004', stage: 'Superstructure & roof', status: 'Booked', booked: '01 Oct 2026', inspected: null, files: '2 photos', inspector: '', outcome: '' },
    { ref: 'BCI-0005', stage: 'Oak frame orangery — structural', status: 'Inspected', booked: '23 Sep 2026', inspected: '23 Sep 2026', files: '3 photos', inspector: 'Alan Pryce', outcome: 'Awaiting the site inspection report.' },
    { ref: 'BCI-0006', stage: 'Insulation & fire lining', status: 'Planned', booked: null, inspected: null, files: null, inspector: '', outcome: '' },
    { ref: 'BCI-0007', stage: 'Completion', status: 'Planned', booked: null, inspected: null, files: null, inspector: '', outcome: '' }
  ];

  const caseStatuses = ['Notice submitted', 'In force', 'Completion requested', 'Completion certified', 'Lapsed'];
  const statusSelect = (status, names = statuses) => site.statusSelect(names, status);
  const addLink = (label) => `<a class="text-xs tone-accent" style="cursor:pointer">${label}</a>`;
  const fileRow = (name, kind, size, extra) => `<li class="row-between" style="padding:6px 0"><div><a class="strong" href="#">${name}</a><span class="text-xs subtle" style="margin-left:8px">${kind} · ${size}${extra ? ` · ${extra}` : ''}</span></div><button type="button" class="text-xs muted" style="background:none;border:0">Remove</button></li>`;
  const eyebrowPair = (label, value, extra) => `<div><p class="eyebrow">${label}</p><p>${value}</p>${extra ? `<p class="text-xs muted">${extra}</p>` : ''}</div>`;

  function casePanel(project) {
    const heading = `<div class="row-between" style="align-items:flex-start;margin-bottom:12px"><div><div class="row"><h3 class="text-base semibold">Surrey Hills Building Control Partnership</h3>${ui.pill('In force', 'info')}</div><p class="text-xs subtle" style="margin-top:2px">Local authority · Ref <span class="mono">BC2603117FP</span> · BC-000${project.id === 'hollowmere' ? 1 : 2}</p></div><div class="row">${statusSelect('In force', caseStatuses)}<a class="text-xs subtle" style="text-decoration:underline">Edit</a></div></div>`;
    const facts = `<div class="grid grid-4 grid-gap-sm" style="margin-bottom:16px">${eyebrowPair('Contact', 'Alan Pryce', 'alan.pryce@surreyhillsbc.example')}${eyebrowPair('Notice submitted', '09 Feb 2026')}${eyebrowPair('Accepted', '26 Feb 2026')}${eyebrowPair('Completion certified', '—')}</div>`;
    const notes = `<p class="muted" style="margin-bottom:16px">Full plans approval with conditions — condition 4 needs the SAP calculation before the insulation stage. Inspector prefers bookings two working days ahead by email.</p>`;
    const files = ['<ul>', fileRow('Full plans application.pdf', 'Notice / application', '2.4 MB'), fileRow('Acknowledgement letter.pdf', 'Acknowledgement', '180 KB'), fileRow('Decision notice — conditional approval.pdf', 'Decision notice', '640 KB'), fileRow('Planning consent 26-0412.pdf', 'Planning permission', '1.1 MB'), '</ul>'].join('');
    const uploading = `<div class="row" style="margin-bottom:8px"><span class="text-xs subtle">Uploading as</span><select class="field" style="height:32px;padding:4px 8px;font-size:13px;max-width:224px"><option>Notice / application</option></select></div>`;
    const documents = `<div style="border-top:1px solid var(--line);padding-top:12px"><div class="row-between" style="margin-bottom:8px"><h4 class="eyebrow">Case documents</h4>${addLink('+ Add files')}</div>${uploading}${files}</div>`;
    return `<section class="panel" style="margin-bottom:20px"><div class="panel-body">${heading}${facts}${notes}${documents}</div></section>`;
  }

  function inspectionRegister(project) {
    const rows = inspections.map((inspection) => [
      site.nowrap(ui.mono(inspection.ref)), `<span class="strong">${inspection.stage}</span>`, ui.pill(inspection.status, statusTones[inspection.status]),
      site.nowrap(inspection.booked || '—'), site.nowrap(inspection.inspected || '—'), site.nowrap(inspection.files || '—'),
      inspection.status === 'Planned' && !inspection.files ? '<a class="text-xs subtle" style="text-decoration:underline">Remove</a>' : ''
    ]);
    const hrefs = inspections.map((inspection) => `#/projects/${project.id}/building-control/inspections/${inspection.ref.toLowerCase()}`);
    const heading = `<div class="row-between" style="margin-bottom:12px"><h3 class="text-base semibold">Inspections</h3>${ui.btn('Add inspection', 'primary')}</div>`;
    return heading + ui.table({ columns: ['Ref', 'Stage', 'Status', 'Booked for', 'Inspected', 'Files', ''], rows, hrefs, dense: true });
  }

  function emptyCase() {
    return `<section class="panel"><div class="panel-body"><h3 class="muted" style="margin-bottom:4px">No building control case yet</h3><p class="subtle" style="margin-bottom:16px">Set up the case — the body signing this project off, their reference and the notice dates — and the inspection checklist starts from a standard set of stages you can edit freely.</p>${ui.btn('Set up building control', 'primary')}</div></section>`;
  }

  JPMS.page('/projects/:project/building-control', {
    title: 'Building Control',
    render(params) {
      const project = JPMS.project(params.project);
      const heading = '<h2 class="text-lg semibold" style="margin-bottom:16px">Building Control</h2>';
      const body = project.stage === 'Pre-construction' ? emptyCase() : casePanel(project) + inspectionRegister(project);
      return site.projectShell(project, [heading, body]);
    }
  });

  function detailsPanel(inspection) {
    const field = (label, value, placeholder) => ui.field(label, value, { placeholder });
    const dates = `<div class="grid grid-4 grid-gap-sm" style="margin-bottom:12px">${field('Booked for', inspection.booked)}${field('Inspected', inspection.inspected)}<div style="grid-column:span 2">${field('Inspector', inspection.inspector, 'Who carried out the visit')}</div></div>`;
    const outcome = `<div style="margin-bottom:12px">${ui.field('Outcome / actions required', inspection.outcome, { textarea: true, placeholder: 'The inspector\'s outcome — passed subject to…, actions before re-inspection…' })}</div>`;
    const stage = `<div style="margin-bottom:12px">${field('Stage name', inspection.stage)}</div>`;
    const footer = `<div class="row-between">${ui.btn('Save changes', 'primary')}<p class="text-xs subtle">Created 26 Feb 2026 by sophie.turner@jewel-demo.example</p></div>`;
    return `<section class="panel" style="margin-bottom:20px"><div class="panel-body">${dates}${outcome}${stage}${footer}</div></section>`;
  }

  function photosPanel(inspection) {
    const captions = ['MH3 opened up', 'Air test gauge', 'Rear run — bedding', 'MH4 benching', 'Pipe joint at bend'];
    const tiles = captions.map((caption) => `<div class="photo" style="height:112px;aspect-ratio:auto">${caption}</div>`).join('');
    const body = `<div class="row-between" style="margin-bottom:12px"><h3 class="eyebrow">Photos</h3>${addLink('+ Add photos')}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:12px">${tiles}</div>`;
    return `<section class="panel" style="margin-bottom:20px"><div class="panel-body">${body}</div></section>`;
  }

  function documentsPanel(inspection) {
    const file = `<li class="card row-between" style="margin-bottom:8px"><div><a class="strong" href="#">Site inspection report — ${inspection.ref}.pdf</a><span class="text-xs subtle" style="margin-left:8px">Site inspection report · 312 KB</span><span class="text-xs subtle" style="margin-left:8px">· From email 17 Sep 2026</span></div><button type="button" class="text-xs muted" style="background:none;border:0">Remove</button></li>`;
    const body = `<div class="row-between" style="margin-bottom:12px"><h3 class="eyebrow">Documents</h3>${addLink('+ Add files')}</div><ul>${file}</ul>`;
    return `<section class="panel" style="margin-bottom:20px"><div class="panel-body">${body}</div></section>`;
  }

  function correspondencePanel(project, inspection) {
    const email = (from, when, text) => `<div class="message"><div class="message-head"><span class="strong">${from}</span><span class="text-xs subtle">${when}</span></div><p class="text-xs subtle" style="margin-bottom:6px">JPMS/${inspection.ref} · ${inspection.stage} inspection — ${project.name}</p><p class="muted">${text}</p><div class="row" style="margin-top:10px">${ui.btn('Reply', 'ghost')}${ui.btn('Forward', 'ghost')}</div></div>`;
    const thread = email('Alan Pryce', '17 Sep 2026 · 10:22', 'Please find attached my site inspection report following yesterday\'s visit. Re-test to be booked once the repair is complete.')
      + email('Liam Carter', '14 Sep 2026 · 08:05', 'Could we book the drainage inspection for Wednesday morning? Runs are open and ready for the air test.');
    return ui.panel('Correspondence', thread, { actions: [ui.btn('Find & tag', 'ghost'), ui.btn('New email')] });
  }

  JPMS.page('/projects/:project/building-control/inspections/:inspection', {
    title: 'Building Control',
    render(params) {
      const project = JPMS.project(params.project);
      const inspection = inspections.find((candidate) => candidate.ref.toLowerCase() === params.inspection) || inspections[2];
      const heading = `<div style="margin-bottom:16px"><a class="text-xs subtle" href="#/projects/${project.id}/building-control">← Building Control</a><div class="row" style="margin-top:4px"><h2 class="text-lg semibold">${inspection.stage}</h2><span class="mono text-xs muted">${inspection.ref}</span>${statusSelect(inspection.status)}</div></div>`;
      return site.projectShell(project, [heading, detailsPanel(inspection), photosPanel(inspection), documentsPanel(inspection), correspondencePanel(project, inspection)]);
    }
  });
})();
