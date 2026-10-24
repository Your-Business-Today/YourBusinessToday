/* The project page frame — jpms/Components/ProjectPageShell.razor (breadcrumb, reference eyebrow,
   project name with the prev/next arrows, client · JBB · stage badge) and SectionHeader.razor. */
(function () {
  const ui = JPMS.ui;
  const arrowLeft = '<path d="M15 6l-6 6 6 6"/>';
  const arrowRight = '<path d="M9 6l6 6-6 6"/>';
  const stageTones = { 'On site': 'positive', 'Pre-construction': 'info', Completed: '' };

  function stageBadge(stage) {
    return ui.pill(stage, stageTones[stage], { dot: true });
  }

  function breadcrumb(project) {
    return `<nav class="text-xs" style="margin-bottom:16px"><a class="subtle" href="#/projects" style="text-decoration:underline">Projects</a><span class="subtle" style="margin:0 8px">/</span><a class="subtle" href="#/projects/${project.id}" style="text-decoration:underline">${project.ref}</a></nav>`;
  }

  function projectShell(project, body) {
    const title = `<span class="row" style="gap:4px">${ui.iconBtn(arrowLeft, 'Previous project')}<span>${ui.escape(project.name)}</span>${ui.iconBtn(arrowRight, 'Next project')}</span>`;
    const subtitle = `${ui.escape(project.client)} · JBB · ${stageBadge(project.stage)}`;
    return ui.join([breadcrumb(project), ui.header({ eyebrow: project.ref, title, subtitle }), ui.join(body)]);
  }

  function sectionHeader(title, actions, subtitle) {
    const subtitleHtml = subtitle ? `<p class="muted" style="margin-top:4px">${subtitle}</p>` : '';
    return `<div class="row-between" style="flex-wrap:wrap;gap:12px 24px;margin-bottom:24px"><div><h2 class="text-lg semibold">${title}</h2>${subtitleHtml}</div><div class="row">${ui.join(actions)}</div></div>`;
  }

  function italic(text) {
    return `<span class="subtle" style="font-style:italic">${text}</span>`;
  }

  function nowrap(text) {
    return `<span style="white-space:nowrap">${text}</span>`;
  }

  function statusSelect(names, current) {
    return `<select class="field" style="height:32px;padding:4px 8px;font-size:13px;width:auto;min-width:132px">${names.map((name) => `<option${name === current ? ' selected' : ''}>${name}</option>`).join('')}</select>`;
  }

  function rowActions(isExpanded) {
    const action = (label) => `<a class="text-xs subtle" style="text-decoration:underline;margin-left:12px">${label}</a>`;
    return `<span style="white-space:nowrap">${action('Edit')}${action(isExpanded ? 'Hide emails' : 'Emails')}</span>`;
  }

  function filedEmails(reference, emails) {
    const header = `<div class="row-between" style="margin-bottom:8px"><span class="eyebrow">Emails · ${reference}</span>${ui.btn('Find & tag emails', 'ghost')}</div>`;
    const messages = emails.map(({ from, when, subject, text }) => `<div class="message"><div class="message-head"><span class="strong">${from}</span><span class="text-xs subtle">${when}</span></div><p class="text-xs subtle" style="margin-bottom:6px">JPMS/${reference} · ${subject}</p><p class="muted">${text}</p></div>`).join('');
    return header + messages;
  }

  function expandableRegister(columns, rows, expandedIndex, expandedHtml) {
    const head = columns.map((label) => `<th>${label}</th>`).join('');
    const expanded = `<tr style="background:var(--surface-raised)"><td colspan="${columns.length}"><div style="padding:8px 0">${expandedHtml}</div></td></tr>`;
    const body = rows.map((cells, index) => `<tr>${cells.map((value, cellIndex) => `<td${cellIndex === 0 ? ' style="white-space:nowrap"' : ''}>${value}</td>`).join('')}</tr>${index === expandedIndex ? expanded : ''}`).join('');
    return `<div class="table-wrap"><table class="data-table data-table-dense"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  JPMS.site = { projectShell, sectionHeader, stageBadge, italic, nowrap, statusSelect, rowActions, filedEmails, expandableRegister };
})();
