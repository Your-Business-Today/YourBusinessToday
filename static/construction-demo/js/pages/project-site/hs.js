/* H&S — jpms/Pages/ProjectHs.razor (Audits / Actions / Register panes) and ProjectHsAudit.razor
   (one HSA-#### site audit: the report front sheet, the scoring key and the framework sections). */
(function () {
  const ui = JPMS.ui;
  const site = JPMS.site;
  const ratingTones = { 'Very good': 'positive', Good: 'positive', Fair: 'warning', 'Poor (report required)': 'negative' };
  const auditStatusTones = { Issued: 'info', Closed: 'positive' };
  const severityTones = { Critical: 'negative', High: 'negative', Medium: 'warning' };
  const recordStatuses = ['Open', 'In progress', 'Closed'];

  const siteCheckForms = [
    { label: 'Daily site safety check', href: '#/forms' },
    { label: 'Weekly scaffold inspection', href: '#/forms' },
    { label: 'Excavation inspection', href: '#/forms' },
    { label: 'Accident / incident report', href: '#/forms' },
    { label: 'Near miss report', href: '#/forms' }
  ];

  const audits = [
    { ref: 'HSA-0006', date: '22 Sep 2026', type: 'Routine', officer: 'Grace Holloway', manager: 'Liam Carter', score: '81%', rating: 'Fair', status: 'Draft' },
    { ref: 'HSA-0005', date: '25 Aug 2026', type: 'Routine', officer: 'Grace Holloway', manager: 'Liam Carter', score: '88%', rating: 'Good', status: 'Issued' },
    { ref: 'HSA-0004', date: '28 Jul 2026', type: 'Follow-up', officer: 'Grace Holloway', manager: 'Liam Carter', score: '92%', rating: 'Good', status: 'Closed' },
    { ref: 'HSA-0003', date: '14 Jul 2026', type: 'Routine', officer: 'Grace Holloway', manager: 'Tom Reeves', score: '67%', rating: 'Poor (report required)', status: 'Closed' },
    { ref: 'HSA-0002', date: '09 Jun 2026', type: 'Routine', officer: 'Grace Holloway', manager: 'Liam Carter', score: '96%', rating: 'Very good', status: 'Closed' },
    { ref: 'HSA-0001', date: '06 Mar 2026', type: 'Initial', officer: 'Grace Holloway', manager: 'Liam Carter', score: '90%', rating: 'Good', status: 'Closed' }
  ];

  const records = [
    { kind: 'Corrective action', summary: 'HSA-0005 8.04 — Scaffold tag out of date on the rear lift; re-inspect and re-tag.', owner: 'Liam Carter', severity: 'High', raised: '25 Aug 2026', due: '01 Sep 2026', thread: '3 comments', hasPhoto: true, status: 'In progress', isOverdue: true },
    { kind: 'Corrective action', summary: 'HSA-0005 1.14 — Toolbox talk register missing August signatures.', owner: 'Tom Reeves', severity: 'Medium', raised: '25 Aug 2026', due: '08 Sep 2026', thread: '1 comment', status: 'Open', isOverdue: true },
    { kind: 'Corrective action', summary: 'HSA-0005 9.02 — Pedestrian route by the skip bay not segregated.', owner: 'Liam Carter', severity: 'Medium', raised: '25 Aug 2026', due: '26 Sep 2026', thread: '2 comments', hasPhoto: true, status: 'In progress' },
    { kind: 'Corrective action', summary: 'HSA-0005 10.03 — Fire point by the basement stair needs a second extinguisher.', owner: 'Liam Carter', severity: 'Low', raised: '25 Aug 2026', due: '02 Oct 2026', thread: null, status: 'Open' },
    { kind: 'Corrective action', summary: 'HSA-0004 5.06 — Housekeeping on the first floor landing.', owner: 'Tom Reeves', severity: 'Low', raised: '28 Jul 2026', due: '04 Aug 2026', thread: '2 comments', status: 'Closed' },
    { kind: 'Near miss', summary: 'Pallet of tiles slipped on the telehandler forks during offload — nobody in the drop zone.', owner: 'Liam Carter', severity: 'High', raised: '19 Sep 2026', due: '26 Sep 2026', thread: '4 comments', status: 'In progress' },
    { kind: 'Observation', summary: 'Groundworks operative without eye protection while cutting setts.', owner: 'Northgate Groundworks', severity: 'Medium', raised: '16 Sep 2026', due: null, thread: '1 comment', status: 'Closed' },
    { kind: 'Toolbox talk', summary: 'Working near the open basement edge — 11 attended.', owner: 'Liam Carter', severity: 'Low', raised: '14 Sep 2026', due: null, thread: null, status: 'Closed' },
    { kind: 'Permit', summary: 'Hot works permit — lead roofing to the orangery valley.', owner: 'Summit Roofing', severity: 'Medium', raised: '10 Sep 2026', due: '12 Sep 2026', thread: null, status: 'Closed' },
    { kind: 'Incident', summary: 'Minor cut to hand from glazing offcut; first aid given, recorded in the accident book.', owner: 'Liam Carter', severity: 'Low', raised: '02 Sep 2026', due: null, thread: '2 comments', status: 'Closed' }
  ];

  const statusSelect = (status) => site.statusSelect(recordStatuses, status);
  const threadCell = (record) => (record.thread ? `${record.thread}${record.hasPhoto ? ` <span style="margin-left:8px">${ui.pill('Photo', 'info')}</span>` : ''}` : '<span class="subtle">—</span>');

  function currentPane() {
    const view = (location.hash.split('?')[1] || '').replace('view=', '');
    return ['actions', 'register'].includes(view) ? view : 'audits';
  }

  function auditsTable(project) {
    const rows = audits.map((audit) => [site.nowrap(ui.mono(audit.ref)), site.nowrap(audit.date), audit.type, audit.officer, audit.manager, audit.score, ui.pill(audit.rating, ratingTones[audit.rating]), ui.pill(audit.status, auditStatusTones[audit.status])]);
    const hrefs = audits.map((audit) => `#/projects/${project.id}/hs/audits/${audit.ref.toLowerCase()}`);
    return ui.table({ columns: ['Ref', 'Inspected', 'Type', 'Safety officer', 'Site manager', { label: 'Score', num: true }, 'Rating', 'Status'], rows, hrefs, dense: true });
  }

  function recordsTable(pane) {
    const isRegister = pane === 'register';
    const shown = records.filter((record) => (record.kind === 'Corrective action') !== isRegister);
    const rows = shown.map((record) => {
      const summary = record.isOverdue ? `<span class="tone-warning">${record.summary}</span>` : record.summary;
      const due = record.isOverdue ? `<span class="tone-warning">${record.due}</span>` : record.due || '—';
      const cells = [summary, record.owner, ui.pill(record.severity, severityTones[record.severity]), site.nowrap(record.raised), site.nowrap(due), threadCell(record), statusSelect(record.status)];
      return isRegister ? [record.kind, ...cells] : cells;
    });
    const columns = ['Summary', 'Owner', 'Severity', 'Raised', 'Due', 'Thread', 'Status'];
    return ui.table({ columns: isRegister ? ['Kind', ...columns] : columns, rows, hrefs: rows.map(() => '#'), dense: true });
  }

  JPMS.page('/projects/:project/hs', {
    title: 'H&S',
    render(params) {
      const project = JPMS.project(params.project);
      const pane = currentPane();
      const base = `#/projects/${project.id}/hs`;
      const openActions = records.filter((record) => record.kind === 'Corrective action' && record.status !== 'Closed').length;
      const tabs = ui.tabs([{ label: 'Audits', href: base, count: audits.length }, { label: 'Actions', href: `${base}?view=actions`, count: openActions }, { label: 'Register', href: `${base}?view=register` }], ['audits', 'actions', 'register'].indexOf(pane));
      const primary = { audits: ui.btn('New audit', 'primary'), register: ui.btn('Log record', 'primary') }[pane];
      const body = pane === 'audits' ? auditsTable(project) : recordsTable(pane);
      return site.projectShell(project, [site.sectionHeader('Health &amp; Safety', [ui.menu('Site check forms', siteCheckForms), primary]), tabs, body]);
    }
  });

  const sections = [
    { name: '1. Documentation', items: [['1.01', 'Health & Safety Plan', '', '10', 'E', '', '', ''], ['1.02', 'General Risk Assessments', '', '10', 'E', '', '', ''], ['1.03', 'Method Statements', '', '5', 'D', '1%', '7 days', 'Groundworks RAMS for the drainage repair not yet on file.'], ['1.08', 'Briefing Registers', '', '10', 'E', '', '', ''], ['1.14', 'Toolbox Talks', 'R', '5', 'D', '6%', '7 days', 'August talk signatures still incomplete — repeat of HSA-0005.'], ['1.25', 'Accident Records', '', '10', 'E', '', '', '']] },
    { name: '8. Working at Heights', items: [['8.01', 'Scaffold design and handover certificate on site', '', '10', 'E', '', '', ''], ['8.04', 'Scaffold inspected weekly and tagged', '', '5', 'C', '5%', '1', 'Rear lift tag dated 08 Sep. Re-inspect before use.'], ['8.06', 'Edge protection to the basement opening', '', '10', 'E', '', '', ''], ['8.09', 'Ladders inspected and secured', 'N/S', '', '', '', '', '']] }
  ];

  function sectionPanel(section) {
    const columns = ['Code', 'Item', 'Comment', 'Rate', 'Class', { label: 'Pts off', num: true }, 'Time-scale', 'Findings / advice given', 'Owner', 'Rectified'];
    const rows = section.items.map(([code, item, comment, rate, grade, points, scale, finding]) => {
      const action = finding ? ` <span style="margin-left:8px">${ui.pill('Action', 'info')}</span>` : '';
      return [ui.mono(code), item + action, comment || '—', rate || '—', grade || '—', points, scale || '—', finding, finding ? 'Liam Carter' : '', ''];
    });
    return `<div style="margin-bottom:20px">${ui.panel(section.name, ui.table({ columns, rows, dense: true }), { flush: true, actions: [ui.btn('Save section')] })}</div>`;
  }

  function reportPanel(audit) {
    const fields = [['Type of report', audit.type], ['Inspection date', audit.date], ['Safety officer / inspector', audit.officer], ['Site manager / supervisor', audit.manager], ['No. of site operatives', '14'], ['Previous audit score', '88%'], ['Framework version', '15 Sep 2026'], ['Issued', '—']];
    const grid = `<div class="grid grid-4 grid-gap-sm">${fields.map(([label, value]) => ui.field(label, value)).join('')}</div>`;
    const notes = `<div class="grid grid-2 grid-gap-sm" style="margin-top:12px">${ui.field('Summary of work activities', 'Drainage repair to the rear foul run, oak frame orangery roofing, first-fix M&E to ground floor, stone cills being set.', { textarea: true })}${ui.field('Any further comments', 'Good housekeeping on the ground floor; the skip bay route needs attention.', { textarea: true })}</div>`;
    return `<div style="margin-bottom:20px">${ui.panel('Report', [grid, notes], { actions: [ui.btn('Save report details')] })}</div>`;
  }

  const scoringKey = 'Rate 0 not in place · 5 in place but a week out of date · 10 up to date. Class A prosecution · B prohibition · C improvement notice · D minor · E compliant. Time-scale I immediately · 1 within 24 hours · 3 / 7 days · 1M a month · O ongoing. Comment N/A · N note · N/C not checked · N/S not seen · R repeat. Score = Σ rate ÷ (rated items × 10), less a penalty for each class present on the report — A 25% · B 15% · C 5% · D 1%, once per class not per finding, and 5% once for any repeat; unrated items don\'t count. Under 70% poor · 70–84 fair · 85–94 good · 95+ very good.';

  JPMS.page('/projects/:project/hs/audits/:audit', {
    title: 'H&S',
    render(params) {
      const project = JPMS.project(params.project);
      const audit = audits.find((candidate) => candidate.ref.toLowerCase() === params.audit) || audits[0];
      const primary = { Draft: 'Issue audit', Issued: 'Close audit' }[audit.status];
      const actions = [ui.pill(audit.status, auditStatusTones[audit.status]), ui.pill(`${audit.score} · ${audit.rating}`, ratingTones[audit.rating]), ui.iconBtn('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', 'Download PDF'), `<a class="btn-icon" href="#/projects/${project.id}/hs" title="Back to the H&S tab">${ui.svg('<path d="M15 6l-6 6 6 6"/>', 'sm')}</a>`];
      return site.projectShell(project, [
        ui.header({ eyebrow: 'H&amp;S site audit', title: `${audit.ref} · ${audit.type} audit`, subtitle: `Inspected ${audit.date} · ${audit.officer}`, actions, primary }),
        reportPanel(audit),
        `<div style="margin-bottom:20px">${ui.notice('', scoringKey)}</div>`,
        sections.map(sectionPanel).join('')
      ]);
    }
  });
})();
