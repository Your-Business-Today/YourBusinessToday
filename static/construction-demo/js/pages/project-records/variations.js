/* Variation Orders — jpms/Pages/ProjectVariations.razor: the one-document explainer, status chips
   and search, the two figure panels, subcontractor variation requests, and the variations book. */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;
  const excelIcon = '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8l6 8M15 8l-6 8"/>';
  const stages = ['Quoting', 'Issued', 'Awaiting AI', 'Approved', 'Rejected'];

  function explainer(unlinkedCount) {
    const stage = (name) => `<span class="strong">${name}</span>`;
    const unlinked = unlinkedCount ? `<p class="muted" style="margin-top:8px;padding:8px 12px;border:1px solid var(--line);background:var(--surface-raised);border-radius:4px">${unlinkedCount} historic variation${unlinkedCount === 1 ? " isn't" : "s aren't"} linked back to a request yet — open a variation and attach the RFI it was raised from in its <span class="strong">Originating request</span> panel, or open the RFI and link the variation from its <span class="strong">Variation</span> panel.</p>` : '';
    const notice = `<div style="margin-top:8px">${ui.notice('', '<span class="tone-negative">A variation is not approved money until it is Approved — nothing on it appears on the valuation report or can be billed before then.</span>', 'negative')}</div>`;
    return `<div class="panel" style="padding:12px 16px;margin-bottom:16px"><p class="strong" style="margin-bottom:4px">Variation — one document, four stages</p><p class="muted" style="line-height:20px">When every requirement of a specific group has been identified and costed, the request becomes a ${stage('variation')} — the priced scope put to the client for approval. It is one record throughout, and its status says where it has got to: ${stage('Quoting')} while it is being priced, ${stage('Issued')} once it is with the client, then ${stage('Approved')} or ${stage('Rejected')}. Approval is what writes its value onto the project valuation report.</p>${notice}${unlinked}</div>`;
  }

  function subcontractorRequests() {
    const request = `<div style="padding:16px 20px"><div class="row-between" style="align-items:flex-start;flex-wrap:nowrap"><div><p class="strong">Additional external socket and isolator to terrace</p><p class="text-xs subtle" style="margin-top:4px">Brightwire Electrical Ltd · against WO-0151 · raised 23 Sep 2026</p><p class="muted" style="margin-top:8px">Client asked on site for a weatherproof double socket by the outdoor kitchen. Needs a new radial from the garage board.</p></div><div style="text-align:right"><p class="strong">${ui.money(640)}</p><div class="row" style="gap:8px;margin-top:8px;justify-content:flex-end">${ui.btn('Accept → variation')}${ui.btn('Reject')}</div></div></div></div>`;
    const reviewed = `<div style="border-top:1px solid var(--line);padding:12px 20px"><p class="text-xs subtle">▸ Reviewed (2)</p></div>`;
    return `<section class="panel" style="margin-bottom:24px"><header class="row-between" style="padding:12px 20px;border-bottom:1px solid var(--line);background:var(--surface-raised)"><h3 class="muted">Subcontractor variation requests</h3><span class="text-xs subtle">1 awaiting review</span></header>${request}${reviewed}</section>`;
  }

  function nowrap(text) {
    return `<span style="white-space:nowrap">${text}</span>`;
  }

  function requestCell(project, row) {
    if (!row.request) return `<a class="btn btn-secondary" href="#/projects/${project.id}/variations/${row.id}" title="No request behind this variation yet — open it to link the RFI it was raised from">No request</a>`;
    return `<a class="mono muted" href="#/projects/${project.id}/requests/view/${row.requestId}" style="text-decoration:underline">${row.request}</a>`;
  }

  function workOrderCell(row) {
    if (row.status !== 'Approved') return '<span class="subtle">—</span>';
    const issued = (row.workOrders || []).join(', ');
    return `<span class="text-xs muted">${issued}</span><br><a class="text-xs tone-accent" style="text-decoration:underline">Issue another</a>`;
  }

  function valueCell(row) {
    if (row.value === null) return '—';
    const money = ui.money(row.value);
    return row.status === 'Rejected' ? `<span class="subtle" style="text-decoration:line-through">${money}</span>` : `<span class="strong">${money}</span>`;
  }

  function book(project, rows) {
    return ui.table({
      columns: ['Ref', 'Title', 'Request', 'Status', { label: 'Value', num: true }, 'Issued', 'Approved', 'Work order'],
      rows: rows.map((row) => [
        ui.link(ui.mono(row.ref), `#/projects/${project.id}/variations/${row.id}`),
        `<a class="strong" href="#/projects/${project.id}/variations/${row.id}">${ui.escape(row.title)}</a>${row.id === 'v14' ? ' ' + ui.pill('1 new email', 'info') : ''}`,
        requestCell(project, row),
        ui.pill(row.status, records().variationTones[row.status], { caret: true }),
        valueCell(row), nowrap(row.issued), nowrap(row.approved), workOrderCell(row)
      ]),
      hrefs: rows.map((row) => `#/projects/${project.id}/variations/${row.id}`),
      dense: true
    });
  }

  JPMS.page('/projects/:project/variations', {
    title: 'Variation Orders',
    render(params) {
      const project = JPMS.project(params.project);
      const rows = records().variations(project.id);
      const approved = rows.filter((row) => row.status === 'Approved');
      const openCount = rows.filter((row) => !['Approved', 'Rejected'].includes(row.status)).length;
      const approvedValue = ui.money(approved.reduce((sum, row) => sum + row.value, 0));
      const counts = `${openCount} open · ${approved.length} approved`;
      const actions = [ui.btn('Export to Excel', 'secondary', { icon: excelIcon }), ui.btn('Add variation manually', 'primary')];
      const chips = `<div class="row" style="margin-bottom:20px"><div class="chips" style="margin:0">${ui.chips([{ label: 'All', count: rows.length }, ...stages.map((stage) => ({ label: stage, count: rows.filter((row) => row.status === stage).length }))]).replace(/^<div class="chips">|<\/div>$/g, '')}</div><div style="margin-left:auto;width:320px">${ui.search('Search text in variations…')}</div></div>`;
      const figures = `<div class="grid grid-2 grid-gap-sm" style="margin-bottom:24px"><div class="panel" style="padding:16px"><p class="eyebrow" style="margin-bottom:4px">Variations</p><p class="text-xl semibold">${counts}</p></div><div class="panel" style="padding:16px"><p class="eyebrow" style="margin-bottom:4px">Approved value</p><p class="text-xl semibold">${approvedValue}</p></div></div>`;
      const footnote = '<p class="text-xs subtle" style="margin-top:12px">Only approved variations are included on the valuation report; the rest stay here until they are.</p>';
      return records().projectShell(project, [
        records().sectionHeader('Variation Orders', `${counts} · ${approvedValue} approved value`, actions),
        explainer(rows.filter((row) => !row.request).length), chips, figures,
        project.id === 'hollowmere' ? subcontractorRequests() : '',
        book(project, rows), footnote
      ]);
    }
  });
})();
