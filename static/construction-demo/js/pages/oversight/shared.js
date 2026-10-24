/* What the oversight pages share: the Admin and Sales section tab rows (WorkspaceSectionNav),
   the project page shell's header, and small formatting helpers. */
(function () {
  const ui = JPMS.ui;

  const adminTabs = [
    { label: 'Users', href: '#/admin/users' },
    { label: 'Revoked', href: '#/admin/users/revoked' },
    { label: 'System', href: '#/admin/system' },
    { label: 'Integrations', href: '#/admin/integrations' },
    { label: 'Trades', href: '#/admin/trades' },
    { label: 'KPI emails', href: '#/admin/kpis' },
    { label: 'Data protection', href: '#/admin/data-protection' }
  ];

  const salesTabs = [
    { label: 'Leads', href: '#/sales/leads' },
    { label: 'Inbox', href: '#/sales/inbox' },
    { label: 'Strategies', href: '#/sales/strategies' }
  ];

  const stageTones = { Engaged: 'info', 'Site visit': 'info', Proposal: 'info', Won: 'positive', Lost: 'negative' };

  function projectShell(project) {
    const crumbs = `<nav class="text-xs subtle" style="margin-bottom:16px">${ui.link('Projects', '#/projects')}<span style="margin:0 8px">/</span>${ui.link(project.ref, `#/projects/${project.id}`)}</nav>`;
    const subtitle = `${project.client} · JBB · ${ui.pill(project.stage, project.stage === 'On site' ? 'positive' : '')}`;
    return crumbs + ui.header({ eyebrow: project.ref, title: `<span class="subtle">‹</span> ${project.name} <span class="subtle">›</span>`, subtitle });
  }

  function subText(text) {
    return `<p class="text-xs subtle">${text}</p>`;
  }

  function twoLine(main, sub) {
    return `<p class="strong">${main}</p>${subText(sub)}`;
  }

  function checkbox(label, isChecked) {
    return `<label class="row text-xs subtle" style="gap:8px;cursor:pointer"><input type="checkbox" ${isChecked ? 'checked' : ''}> ${label}</label>`;
  }

  function select(options, width) {
    const items = options.map((option) => `<option>${ui.escape(option)}</option>`).join('');
    return `<select class="field" style="width:${width || 'auto'};height:32px;font-size:14px;padding:0 12px">${items}</select>`;
  }

  function header(options) {
    const subtitle = options.subtitle ? `<span style="display:block;max-width:52rem">${options.subtitle}</span>` : '';
    return ui.header({ ...options, subtitle });
  }

  JPMS.oversight = {
    adminTabs: (index) => ui.tabs(adminTabs, index),
    salesTabs: (index) => ui.tabs(salesTabs, index),
    stagePill: (stage) => ui.pill(stage, stageTones[stage]),
    projectShell,
    header,
    subText,
    twoLine,
    checkbox,
    select
  };
})();
