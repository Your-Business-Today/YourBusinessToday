/* The frames the money pages share — jpms/Components/ProjectPageShell.razor, SectionHeader,
   TableNote, WorkspaceSectionNav, StatTile — plus the signed-money and dimmed-cell formats. */
(function () {
  const ui = JPMS.ui;
  const stageTones = { 'On site': 'positive', 'Pre-construction': 'info', Completed: '' };

  function projectShell(project, body) {
    const crumbs = `<nav class="text-xs" style="margin-bottom:16px"><a class="subtle" href="#/projects" style="text-decoration:underline">Projects</a><span class="subtle" style="margin:0 8px">/</span><a class="subtle" href="#/projects/${project.id}" style="text-decoration:underline">${project.ref}</a></nav>`;
    const title = `<span class="row" style="gap:4px">${ui.iconBtn('<path d="M15 6l-6 6 6 6"/>', 'Previous project')}<span>${ui.escape(project.name)}</span>${ui.iconBtn('<path d="M9 6l6 6-6 6"/>', 'Next project')}</span>`;
    const subtitle = `${ui.escape(project.client)} · JBB · ${ui.pill(project.stage, stageTones[project.stage], { dot: true })}`;
    return ui.join([crumbs, ui.header({ eyebrow: project.ref, title, subtitle }), ui.join(body)]);
  }

  function sectionHeader(title, actions, subtitle) {
    const subtitleHtml = subtitle ? `<p class="subtle" style="margin-top:6px;max-width:760px;line-height:20px">${subtitle}</p>` : '';
    return `<div class="row-between" style="flex-wrap:wrap;gap:12px 24px;margin-bottom:16px;align-items:flex-start"><div><h2 class="text-lg semibold">${title}</h2>${subtitleHtml}</div><div class="row">${ui.join(actions)}</div></div>`;
  }

  function note(html, options = {}) {
    const size = options.lead ? '' : 'text-xs ';
    return `<p class="${size}subtle" style="margin-bottom:${options.gap || 16}px;max-width:${options.wide ? 'none' : '880px'};line-height:${options.lead ? 20 : 18}px">${html}</p>`;
  }

  function sectionTabs(tabs, activeHref) {
    return ui.tabs(tabs.map(([label, href]) => ({ label, href: '#' + href })), tabs.findIndex(([, href]) => href === activeHref));
  }

  function tile(label, value, caption, tone) {
    const valueTone = tone ? ` tone-${tone}` : '';
    const captionHtml = caption ? `<p class="text-xs subtle" style="margin-top:6px">${caption}</p>` : '';
    return `<article class="stat"><p class="stat-label">${label}</p><p class="stat-value${valueTone}">${value}</p>${captionHtml}</article>`;
  }

  function tiles(items) {
    return `<div class="grid grid-${Math.min(items.length, 4)} grid-gap-sm" style="margin-bottom:24px">${items.map((item) => tile(...item)).join('')}</div>`;
  }

  function signed(amount) {
    if (!amount) return '—';
    return `${amount < 0 ? '−' : '+'}${ui.money(Math.abs(amount))}`;
  }

  function toned(amount, text) {
    const tone = amount < 0 ? 'tone-negative' : amount > 0 ? 'tone-positive' : 'faint';
    return `<span class="${tone}">${text ?? signed(amount)}</span>`;
  }

  function dim(text) {
    return `<span class="faint">${text}</span>`;
  }

  function sub(main, subline) {
    return `<div style="min-width:260px">${main}<span class="subline">${subline}</span></div>`;
  }

  function badge(text, title) {
    return `<span class="text-xs" title="${title || ''}" style="margin-left:6px;border:1px solid var(--line);border-radius:4px;padding:1px 6px;color:var(--content-subtle);white-space:nowrap">${text}</span>`;
  }

  function segmented(labels, activeIndex = 0) {
    const buttons = labels.map((label, index) => `<button type="button" class="text-xs" style="padding:6px 12px;${index ? 'border-left:1px solid var(--line);' : ''}${index === activeIndex ? 'background:var(--surface-raised);color:var(--content);font-weight:500' : 'color:var(--content-subtle)'}">${label}</button>`).join('');
    return `<div style="display:inline-flex;border:1px solid var(--line);border-radius:4px;overflow:hidden">${buttons}</div>`;
  }

  function exportButton() {
    return ui.btn('Export to Excel', 'secondary', { icon: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"/>' });
  }

  function refreshButton(label = 'Refresh') {
    return ui.btn(label, 'secondary', { icon: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/>' });
  }

  function checkbox(label, isChecked) {
    return `<label class="row subtle" style="gap:8px;cursor:pointer"><input type="checkbox" ${isChecked ? 'checked' : ''}>${label}</label>`;
  }

  function select(label, options) {
    return `<label style="display:block"><span class="form-label">${label}</span><select class="field">${options.map((option) => `<option>${option}</option>`).join('')}</select></label>`;
  }

  function projectFilter(projects) {
    const text = projects.length === JPMS.data.projects.length ? 'All projects' : `${projects.length} projects`;
    return `<button type="button" class="btn btn-secondary">${text} ▾</button><span class="text-xs subtle">${projects.map((project) => project.ref).join(' · ')}</span>`;
  }

  JPMS.money = Object.assign(JPMS.money || {}, { projectShell, sectionHeader, note, sectionTabs, tile, tiles, signed, toned, dim, sub, badge, segmented, exportButton, refreshButton, checkbox, select, projectFilter });
})();
