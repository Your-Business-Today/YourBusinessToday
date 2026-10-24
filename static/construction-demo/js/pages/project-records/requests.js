/* RFIs — jpms/Pages/ProjectRequests.razor with RequestTable.razor: the RFIs / Requests tabs, the
   document-type explainer, the Open / Closed / All chips and search, and the register. The bare
   project URL (ProjectDetail.razor) lands here too. */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;
  const checkbox = '<input type="checkbox" style="accent-color:var(--accent)">';
  const excelIcon = '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8l6 8M15 8l-6 8"/>';

  function explainer(isGeneral, counts) {
    const heading = `<div class="row" style="gap:8px;margin-bottom:6px"><p class="eyebrow">Document type</p><span class="text-xs subtle">·</span><p class="text-xs subtle">RFI ${counts.rfis} · Request ${counts.generals}</p></div>`;
    if (isGeneral) {
      return `<div class="panel" style="padding:12px 16px;margin-bottom:16px">${heading}<p class="strong" style="margin-bottom:4px">Request — the legacy general document type</p><p class="muted" style="line-height:20px">The old general container from mailbox triage — each one tracked as its own record, carrying its conversation, itemised queries and linked emails, until it's resolved, merged into another request, or promoted to an RFI. Requests are being sunset: nothing raises a new one any more (raise a to-do for things that aren't an RFI); the records here stay until each is closed or promoted.</p></div>`;
    }
    const overdue = counts.overdue ? ` <span class="semibold">${counts.overdue} RFIs are past their response-due date — chase before the programme slips.</span>` : '';
    const notice = `<div style="margin-top:8px">${ui.notice('', `<span class="tone-negative">While an RFI is unanswered the project may be waiting on information — that wait can have a material impact on the programme.${overdue}</span>`, 'negative')}</div>`;
    return `<div class="panel" style="padding:12px 16px;margin-bottom:16px">${heading}<p class="strong" style="margin-bottom:4px">RFI — Request for Information</p><p class="muted" style="line-height:20px">An official ask of an external party — architect, client or consultant — for information the project needs. An RFI carries an issue date and a contractual response-due date, and its official document can be drafted to the projects mailbox from here.</p>${notice}</div>`;
  }

  function nowrap(html) {
    return `<span style="white-space:nowrap">${html}</span>`;
  }

  function subjectCell(row) {
    const critical = row.isCriticalPath ? ` ${ui.pill('Critical path', 'negative')}` : '';
    const activity = row.id === 'rfi-049' ? ` ${ui.pill('2 new emails', 'info')}` : '';
    return `<span class="strong">${ui.escape(row.title)}</span>${critical}${activity}`;
  }

  function daysCell(row) {
    if (row.status === 'Closed') return `<span class="subtle">${row.days}</span>`;
    return row.isOverdue ? `<span class="tone-negative semibold">${row.days}</span>` : String(row.days);
  }

  function registerTable(project, rows, kind) {
    return ui.table({
      columns: [checkbox, 'Ref', 'Kind', 'Subject', 'Drawing / Detail', 'Issued', 'Response Due', { label: 'Days Out', num: true }, { label: 'Value', num: true }, 'Status'],
      rows: rows.map((row) => [
        checkbox,
        nowrap(ui.mono(row.ref)),
        kind,
        subjectCell(row),
        `<span class="mono subtle" style="white-space:nowrap">${row.drawing || '—'}</span>`,
        nowrap(row.issued),
        nowrap(row.due || '—'),
        row.days !== undefined ? daysCell(row) : '<span class="subtle">—</span>',
        row.value ? ui.money(row.value) : '—',
        ui.pill(row.status, records().requestTones[row.status], { caret: true })
      ]),
      hrefs: rows.map((row) => `#/projects/${project.id}/requests/view/${row.id}`),
      dense: true
    });
  }

  function render(params) {
    const project = JPMS.project(params.project);
    const isGeneral = params.kind === 'general';
    const rfis = records().rfis(project.id);
    const generals = records().generals(project.id);
    const all = isGeneral ? generals : rfis;
    const open = all.filter((row) => row.status !== 'Closed');
    const counts = { rfis: rfis.length, generals: generals.length, overdue: rfis.filter((row) => row.isOverdue).length };
    const noun = isGeneral ? 'requests' : 'RFIs';
    const subtitle = `${counts.rfis} RFIs · ${counts.overdue} overdue · ${counts.generals} legacy requests`;
    const actions = [ui.btn('Export to Excel', 'secondary', { icon: excelIcon }), ui.btn('Raise RFI', 'primary')];
    const tabs = ui.tabs([{ label: 'RFIs', href: `#/projects/${project.id}/requests` }, { label: 'Requests', href: `#/projects/${project.id}/requests/general` }], isGeneral ? 1 : 0);
    const chips = `<div class="row" style="margin-bottom:20px"><div class="chips" style="margin:0">${[`Open · ${open.length}`, `Closed · ${all.length - open.length}`, `All · ${all.length}`].map((label, index) => `<button type="button" class="chip${index === 0 ? ' is-active' : ''}" data-chip>${label}</button>`).join('')}</div><div style="margin-left:auto;width:320px">${ui.search(`Search text in ${noun}…`)}</div></div>`;
    const body = open.length ? registerTable(project, open, isGeneral ? 'General' : 'RFI') : `<p class="subtle" style="font-style:italic">No ${noun} recorded.</p>`;
    return records().projectShell(project, [records().sectionHeader('RFIs', subtitle, actions), tabs, explainer(isGeneral, counts), chips, body]);
  }

  JPMS.page('/projects/:project', { title: 'RFIs', render });
  JPMS.page('/projects/:project/requests', { title: 'RFIs', render });
  JPMS.page('/projects/:project/requests/:kind', { title: 'RFIs', render });
})();
