/* Programme — jpms/Pages/ProjectProgramme.razor with ProgrammeWorkbench and ProgrammeGanttChart:
   the sub-tabs, the movement banner, the four doors, the Gantt of tasks, and the Variations and
   Extensions of time sections on the same ruler beneath. */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;
  const rulerStart = Date.UTC(2026, 2, 1);
  const rulerEnd = Date.UTC(2027, 5, 1);
  const today = '2026-09-25';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const tasks = [
    ['Site set-up and enabling works', '2026-03-02', '2026-03-20', 100],
    ['Demolitions and strip-out', '2026-03-16', '2026-04-10', 100],
    ['Groundworks and drainage', '2026-04-06', '2026-05-29', 100],
    ['Basement and substructure', '2026-05-11', '2026-07-10', 100],
    ['Masonry — main house', '2026-06-22', '2026-10-02', 88, '2026-09-25', 5],
    ['Roof structure and covering', '2026-08-17', '2026-10-16', 55],
    ['Kitchen / dining structural opening', '2026-09-21', '2026-10-09', 10, null, 0, { ref: 'V14', days: 4 }],
    ['Windows and external doors', '2026-09-14', '2026-10-30', 20],
    ['First-fix M&E', '2026-09-28', '2026-11-20', 0],
    ['Plastering and drylining', '2026-11-02', '2026-12-18', 0],
    ['Kitchen installation', '2026-10-12', '2026-11-06', 0],
    ['Joinery and library fit-out', '2026-12-07', '2027-02-12', 0],
    ['Bathrooms and sanitaryware', '2027-01-11', '2027-03-05', 0],
    ['External works and landscaping', '2027-02-01', '2027-04-16', 0],
    ['Snagging and handover', '2027-04-05', '2027-04-30', 0]
  ];

  const variationMarkers = { V17: '2026-09-23', V16: '2026-09-18', V15: '2026-09-17', V14: '2026-09-19', V13: '2026-09-12', V12: '2026-08-14', V11: '2026-08-07', V10: '2026-07-24', V08: '2026-06-19', V07: '2026-07-16', V05: '2026-04-14' };
  const landsOn = { V14: 'Kitchen / dining structural opening · +4 d', V13: 'Joinery and library fit-out', V11: 'Masonry — main house', V15: 'Roof structure and covering', V16: 'Bathrooms and sanitaryware', V17: 'External works and landscaping' };

  function position(date) {
    const time = Date.parse(date + 'T00:00:00Z');
    return ((time - rulerStart) / (rulerEnd - rulerStart)) * 100;
  }

  function span(start, end) {
    return `left:${position(start).toFixed(2)}%;width:${Math.max(0.6, position(end) - position(start)).toFixed(2)}%`;
  }

  function addDays(date, days) {
    return new Date(Date.parse(date + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);
  }

  function todayLine() {
    return `<div style="position:absolute;top:0;bottom:0;width:1px;background:rgba(60,161,255,.6);left:${position(today).toFixed(2)}%"></div>`;
  }

  function ruler() {
    const marks = [];
    for (let index = 0; index < 15; index++) {
      const month = (2 + index) % 12;
      const year = 2026 + Math.floor((2 + index) / 12);
      const date = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      marks.push(`<span class="text-xs subtle" style="position:absolute;top:10px;left:${position(date).toFixed(2)}%;border-left:1px solid var(--line);padding-left:4px">${monthNames[month]}${month === 0 ? ' ' + String(year).slice(2) : ''}</span>`);
    }
    return `<div class="gantt-label eyebrow">Task</div><div class="gantt-track" style="height:36px">${marks.join('')}</div>`;
  }

  function taskRow([title, start, end, progress, baselineEnd, slip, push]) {
    const pills = [slip ? ui.pill(`+${slip} d`, 'negative') : '', push ? ui.pill(`${push.ref} +${push.days} d`, 'warning') : ''].join(' ');
    const colour = slip ? 'rgba(255,64,60,.35)' : 'rgba(102,224,148,.35)';
    const fill = slip ? 'var(--negative)' : 'var(--accent)';
    const bar = `<div class="gantt-bar" style="${span(start, end)};background:${colour}" title="${title}: ${progress}% complete"><span style="width:${progress}%;background:${fill}"></span></div>`;
    const pushBar = push ? `<div class="gantt-bar is-variation" style="${span(end, addDays(end, push.days))}" title="${push.ref} would push this task ${push.days} days"></div>` : '';
    const baseline = `<div style="position:absolute;top:29px;height:3px;border-radius:2px;background:rgba(140,140,140,.7);${span(start, baselineEnd || end)}"></div>`;
    return `<div class="gantt-label"><span class="row" style="gap:6px;flex-wrap:nowrap"><span>${title}</span>${pills}</span></div><div class="gantt-track" style="height:40px">${todayLine()}${bar}${pushBar}${baseline}</div>`;
  }

  function variationRow(project, variation) {
    const marker = variationMarkers[variation.ref];
    const markerHtml = marker ? `<div style="position:absolute;top:14px;width:10px;height:10px;margin-left:-5px;transform:rotate(45deg);background:rgba(60,161,255,.8);left:${position(marker).toFixed(2)}%" title="${variation.ref} ${variation.issued === '—' ? 'raised' : 'issued'}"></div>` : '';
    const push = variation.ref === 'V14' ? `<div class="gantt-bar is-variation" style="${span('2026-10-09', '2026-10-13')}"></div>` : '';
    const label = `<div class="row" style="gap:6px;flex-wrap:nowrap"><span class="mono text-xs muted">${variation.ref}</span><a href="#/projects/${project.id}/variations/${variation.id}" style="overflow:hidden;text-overflow:ellipsis">${ui.escape(variation.title)}</a>${ui.pill(variation.status, records().variationTones[variation.status])}</div><div class="text-xs subtle" style="margin-top:2px">${landsOn[variation.ref] || 'Lands on its cost centres’ tasks'} · <a class="tone-accent">Programme effect…</a></div>`;
    return `<div class="gantt-label" style="padding:6px 16px">${label}</div><div class="gantt-track" style="height:48px">${todayLine()}${markerHtml}${push}</div>`;
  }

  function extensionRow() {
    const label = `<div class="row" style="gap:6px;flex-wrap:nowrap"><span class="mono text-xs muted">EOT-002</span><a>Exceptionally adverse weather — March 2026</a>${ui.pill('Open / Awaiting response', 'info')}</div><div class="text-xs subtle" style="margin-top:2px">10 d claimed · 6 d granted · <a class="tone-accent">Days…</a></div>`;
    const claimed = `<div style="position:absolute;top:10px;height:16px;border-radius:3px;border:1px dashed var(--warning);background:rgba(242,181,68,.15);${span('2027-04-30', '2027-05-10')}"></div>`;
    const granted = `<div style="position:absolute;top:10px;height:16px;border-radius:3px;background:rgba(242,181,68,.7);${span('2027-04-30', '2027-05-06')}"></div>`;
    return `<div class="gantt-label" style="padding:6px 16px">${label}</div><div class="gantt-track" style="height:48px">${todayLine()}${claimed}${granted}</div>`;
  }

  function gantt(project) {
    const variations = records().variations(project.id).filter((row) => row.status !== 'Rejected');
    const sections = [
      ruler(), tasks.map(taskRow).join(''),
      `<div class="gantt-section eyebrow">Variations <span class="subtle" style="font-weight:400">— ${variations.length} on the programme</span></div>`,
      variations.map((row) => variationRow(project, row)).join(''),
      `<div class="gantt-section eyebrow">Extensions of time <span class="subtle" style="font-weight:400">— 1 raised</span></div>`,
      extensionRow()
    ];
    return `<div class="panel" style="overflow-x:auto"><div class="gantt" style="min-width:960px;grid-template-columns:360px 1fr">${sections.join('')}</div></div>`;
  }

  JPMS.page('/projects/:project/programme', {
    title: 'Programme',
    render(params) {
      const project = JPMS.project(params.project);
      const subTabs = ui.tabs(['Programme', { label: 'Claims', count: 2 }, { label: 'Critical Path RFIs', count: 2 }, { label: 'Relevant Events', count: 6 }]);
      const banner = `<div class="panel" style="padding:12px 16px;margin-bottom:20px">1 task(s) have slipped against baseline “Contract programme rev A”, but completion is holding.</div>`;
      const doors = `<div class="row" style="gap:8px;margin-bottom:20px">${ui.btn('Add task')}${ui.btn('Add dependency')}${ui.btn('Baselines')}${ui.btn('Draft from valuation…')}</div>`;
      const draft = `<div style="margin-bottom:20px">${ui.notice('', `<div class="row"><span><span class="strong">Draft programme update from Valuation 7 awaits review</span> — 11 of 15 tasks matched to cost centres, 4 would change; opened 22 Sep 2026, 16:05 by ravi.patel@jewel-demo.example.</span>${ui.btn('Review draft')}</div>`, 'warning')}</div>`;
      const legend = '<p class="text-xs subtle" style="margin-top:8px;line-height:16px">Green bars are the live programme (red where slipped past baseline); the thin grey bar underneath is the baselined position; the darker fill is progress. An amber segment on a task\'s end is a variation\'s push — dashed until the variation is approved. Planned dates never move because of a variation; the segment is the push it would make. Click a task to edit it.</p>';
      return records().projectShell(project, [
        records().sectionHeader('Programme', 'The project programme, its formal claims documents and related correspondence.'),
        subTabs, banner, draft, doors, gantt(project), legend
      ]);
    }
  });
})();
