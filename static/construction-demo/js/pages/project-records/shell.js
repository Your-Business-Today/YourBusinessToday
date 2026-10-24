/* The project page frame for the records group — jpms/Components/ProjectPageShell.razor, the
   register section header, the RecordTabBar (Request → RFI → Variation) and the status-pill
   dropdown the request and variation header bars wear. */
(function () {
  const ui = JPMS.ui;
  const arrowLeft = '<path d="M15 6l-6 6 6 6"/>';
  const arrowRight = '<path d="M9 6l6 6-6 6"/>';
  const stageTones = { 'On site': 'positive', 'Pre-construction': 'info', Completed: '' };
  const tabIcons = {
    request: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',
    official: '<path d="M6 3h9l4 4v14H6z"/><path d="M10.5 11a2 2 0 1 1 2.5 1.9c-.6.2-1 .6-1 1.1M12 17h.01"/>',
    variation: '<path d="M16 7a4 4 0 0 0-7 2.5V18M6 13h7M6 18h11"/>'
  };

  function breadcrumb(project) {
    return `<nav class="text-xs" style="margin-bottom:16px"><a class="subtle" href="#/projects" style="text-decoration:underline">Projects</a><span class="subtle" style="margin:0 8px">/</span><a class="subtle" href="#/projects/${project.id}" style="text-decoration:underline">${project.ref}</a></nav>`;
  }

  function projectShell(project, body) {
    const title = `<span class="row" style="gap:4px">${ui.iconBtn(arrowLeft, 'Previous project')}<span>${ui.escape(project.name)}</span>${ui.iconBtn(arrowRight, 'Next project')}</span>`;
    const subtitle = `${ui.escape(project.client)} · JBB · ${ui.pill(project.stage, stageTones[project.stage], { dot: true })}`;
    return ui.join([breadcrumb(project), ui.header({ eyebrow: project.ref, title, subtitle }), ui.join(body)]);
  }

  function sectionHeader(title, subtitle, actions) {
    const subtitleHtml = subtitle ? `<p class="subtle" style="margin-top:4px">${subtitle}</p>` : '';
    return `<div class="row-between" style="align-items:flex-start;margin-bottom:16px"><div><h2 class="text-lg">${title}</h2>${subtitleHtml}</div><div class="row">${ui.join(actions)}</div></div>`;
  }

  function backLink(label, href) {
    return `<a class="muted" href="${href}" style="display:inline-flex;gap:4px;margin-bottom:16px">&larr; ${label}</a>`;
  }

  function statusMenu(current, tone, options) {
    const entries = options.map((option) => {
      const isCurrent = option.label === current;
      const tick = isCurrent ? '<span class="tone-accent" style="margin-right:6px">✓</span>' : '';
      const style = isCurrent ? ' style="opacity:.6"' : '';
      return `<a class="menu-item" href="#"${style}>${tick}${ui.escape(option.label)}${option.hint ? `<span class="hint">${ui.escape(option.hint)}</span>` : ''}</a>`;
    }).join('');
    return `<div class="menu" data-menu><button type="button" class="pill pill-${tone}" title="Change status">${ui.escape(current)} <span>▾</span></button><div class="menu-panel" style="left:0;right:auto;min-width:260px">${entries}</div></div>`;
  }

  function recordTabBar(tabs, activeId) {
    const items = tabs.map((tab) => {
      const content = `${ui.svg(tabIcons[tab.id], 'sm')}<span>${tab.eyebrow}</span><span class="mono">${tab.label}</span>`;
      const isActive = tab.id === activeId;
      const style = isActive
        ? 'background:var(--accent);color:var(--accent-ink);font-weight:500'
        : 'color:var(--content-muted)';
      return `<a href="${tab.href}" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:4px;${style}">${content}</a>`;
    }).join('');
    return `<nav class="row" style="gap:6px;margin-bottom:20px" aria-label="Related records">${items}</nav>`;
  }

  function headerBar({ reference, secondary, kind, pills, title, actions }) {
    const secondaryHtml = secondary ? `<span class="mono muted" style="font-size:14px">${secondary}</span>` : '';
    const identity = `<div class="row" style="gap:10px;margin-bottom:6px"><span class="mono strong" style="font-size:16px;font-weight:600">${reference}</span>${secondaryHtml}<span class="text-xs subtle">${kind}</span><span style="width:1px;height:16px;background:var(--line)"></span>${ui.join(pills)}</div>`;
    return `<header class="panel" style="padding:16px 20px;margin-bottom:20px;overflow:visible"><div class="row-between" style="align-items:flex-start"><div style="min-width:0">${identity}<h2 class="text-xl" style="font-weight:600">${title}</h2></div><div class="row" style="gap:8px">${ui.join(actions)}</div></div></header>`;
  }

  function factsStrip(pairs) {
    const cells = pairs.map(([label, value, tone]) => `<div><p class="eyebrow" style="margin-bottom:2px">${label}</p><p class="${tone ? 'tone-' + tone + ' semibold' : ''}">${value}</p></div>`).join('');
    return `<div class="panel" style="padding:16px 20px;margin-bottom:20px"><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px 24px">${cells}</div></div>`;
  }

  function sidePanel(eyebrow, body) {
    return `<div class="panel" style="padding:20px"><h3 class="eyebrow" style="margin-bottom:12px">${eyebrow}</h3><div class="stack-sm">${ui.join(body)}</div></div>`;
  }

  function factRow(label, value) {
    return `<div class="row-between"><span class="subtle">${label}</span><span>${value}</span></div>`;
  }

  function message({ who, role, when, text, isInternal, isReply }) {
    const badge = isInternal ? ui.pill('Internal note', 'warning') : '';
    const indent = isReply ? 'margin-left:32px;border-left:2px solid var(--line-strong);' : '';
    return `<div class="message" style="${indent}"><div class="message-head"><span class="row" style="gap:8px"><span class="strong">${who}</span><span class="text-xs subtle">${role}</span>${badge}</span><span class="text-xs subtle">${when}</span></div><p class="muted" style="line-height:20px">${text}</p></div>`;
  }

  function email({ from, to, when, subject, text, tag }) {
    return `<div class="message"><div class="message-head"><span class="strong">${from}</span><span class="text-xs subtle">${when}</span></div><p class="text-xs subtle" style="margin-bottom:6px">To ${to} · <span class="mono">${tag}</span></p><p class="strong" style="margin-bottom:6px">${subject}</p><p class="muted" style="line-height:20px">${text}</p></div>`;
  }

  JPMS.records = Object.assign(JPMS.records || {}, { projectShell, sectionHeader, backLink, statusMenu, recordTabBar, headerBar, factsStrip, sidePanel, factRow, message, email });
})();
