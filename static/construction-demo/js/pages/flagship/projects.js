/* The project portfolio — jpms/Pages/Projects.razor + ProjectsTable.razor + ValuationDueBadge. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const dueSoon = ['30 Sep 2026'];
  const overdue = ['23 Sep 2026', '22 Sep 2026'];

  function valuationCell(project) {
    if (project.stage === 'Completed') return '<span class="subtle">—</span>';
    if (!project.nextValuation) return '<span class="subtle">Not set</span>';
    if (overdue.includes(project.nextValuation)) return `<span class="tone-negative">${project.nextValuation}</span> ${ui.pill('Overdue', 'negative')}`;
    if (dueSoon.includes(project.nextValuation)) return `<span class="tone-warning">${project.nextValuation}</span> ${ui.pill('Due soon', 'warning')}`;
    return project.nextValuation;
  }

  function tick(label, isChecked, tone) {
    const colour = tone ? `class="tone-${tone}"` : 'class="muted"';
    return `<label class="row" style="gap:8px;cursor:pointer"><input type="checkbox" ${isChecked ? 'checked' : ''}><span ${colour}>${label}</span></label>`;
  }

  function filters(projects) {
    const overdueCount = projects.filter((project) => overdue.includes(project.nextValuation)).length;
    const dueSoonCount = projects.filter((project) => dueSoon.includes(project.nextValuation)).length;
    return `<div class="row" style="justify-content:flex-end;gap:16px;margin-bottom:12px">${tick(`Overdue valuations only (${overdueCount})`, false)}${tick(`Due soon only (${dueSoonCount})`, false)}${tick('Show completed', false)}${ui.btn('Export to Excel', 'secondary', { icon: frame.paths.excel })}</div>`;
  }

  function table(projects) {
    const rows = projects.map((project) => [ui.mono(project.ref), `<span class="strong">${ui.escape(project.name)}</span>`, ui.escape(project.client), 'JBB', frame.stageBadge(project.stage), valuationCell(project)]);
    const hrefs = projects.map((project) => (project.id ? `#/projects/${project.id}` : null));
    return `<section class="panel">${ui.table({ columns: ['Reference', 'Name', 'Client', 'Entity', 'Stage', { label: 'Next valuation', num: true }], rows, hrefs })}</section>`;
  }

  JPMS.page('/projects', {
    title: 'Projects',
    render() {
      const all = frame.portfolio();
      const live = all.filter((project) => project.stage !== 'Completed');
      const subtitle = `${live.length} active. Projects are created from a won lead, or add one directly.`;
      return ui.join([ui.header({ subtitle, primary: '+ New project' }), filters(live), table(live)]);
    }
  });
})();
