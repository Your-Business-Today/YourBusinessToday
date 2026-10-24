/* The flagship pages' shared frame: ProjectPageShell.razor (breadcrumb, reference eyebrow, name
   with prev/next arrows, client · JBB · stage), SectionHeader, the Toolbar icon buttons, the
   compact select, and the portfolio the Projects and Owner Overview pages both read. */
(function () {
  const ui = JPMS.ui;

  const paths = {
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    download: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14"/>',
    excel: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8l6 8M15 8l-6 8"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    document: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    pound: '<path d="M16 7a4 4 0 0 0-7 2.5V18M6 13h7M6 18h11"/>',
    clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>'
  };

  const stageTones = { 'On site': 'positive', 'Pre-construction': 'info', Procurement: 'info', Mobilisation: 'warning', 'Defects period': 'accent', Completed: '' };

  const portfolioExtras = [
    { id: null, ref: 'JBB-104', name: 'Larch Hollow Orangery', town: 'Coldharbour Vale', client: 'Mr Julian Starling', stage: 'Procurement', contractSum: 1180000, nextValuation: null },
    { id: null, ref: 'JBB-105', name: 'Fernleigh Court Basement', town: 'Linford Heath', client: 'The Pemberton-Hayes Family', stage: 'Mobilisation', contractSum: 2640000, nextValuation: '19 Oct 2026' },
    { id: null, ref: 'JBB-099', name: 'Stonebridge Farmhouse', town: 'Ashcombe Green', client: 'Mr & Mrs Delacourt', stage: 'Defects period', contractSum: 1935000, nextValuation: '22 Sep 2026' },
    { id: null, ref: 'JBB-096', name: 'Millrace Cottage', town: 'Linford Heath', client: 'Ms Harriet Vane-Lowry', stage: 'Completed', contractSum: 612000, nextValuation: null }
  ];

  const nextValuations = { hollowmere: '30 Sep 2026', 'coach-house': '23 Sep 2026', kingsridge: null, wrenfield: null };

  function portfolio() {
    const known = JPMS.data.projects.map((project) => ({ ...project, nextValuation: nextValuations[project.id] }));
    return [...known, ...portfolioExtras];
  }

  function stageBadge(stage) {
    return ui.pill(stage, stageTones[stage], { dot: true });
  }

  function breadcrumb(project) {
    return `<nav class="text-xs" style="margin-bottom:16px"><a class="subtle" href="#/projects" style="text-decoration:underline">Projects</a><span class="subtle" style="margin:0 8px">/</span><a class="subtle" href="#/projects/${project.id}" style="text-decoration:underline">${project.ref}</a></nav>`;
  }

  function projectShell(project, body) {
    const title = `<span class="row" style="gap:4px">${ui.iconBtn(paths.left, 'Previous project')}<span>${ui.escape(project.name)}</span>${ui.iconBtn(paths.right, 'Next project')}</span>`;
    const subtitle = `${ui.escape(project.client)} · JBB · ${stageBadge(project.stage)}`;
    return ui.join([breadcrumb(project), ui.header({ eyebrow: project.ref, title, subtitle }), ui.join(body)]);
  }

  function sectionHeader(title, actions) {
    return `<div class="row-between" style="gap:12px 24px;margin-bottom:16px"><h2 class="text-lg semibold">${title}</h2><div class="row">${ui.join(actions)}</div></div>`;
  }

  function toolbar(buttons) {
    return `<div class="row" style="gap:4px;padding:2px;border:1px solid var(--line);border-radius:4px">${buttons.join('')}</div>`;
  }

  function toolButton(pathKey, title) {
    return `<button type="button" class="btn-icon" style="border:0" title="${ui.escape(title)}">${ui.svg(paths[pathKey], 'sm')}</button>`;
  }

  function select(options, width) {
    const items = options.map((option) => `<option>${ui.escape(option)}</option>`).join('');
    return `<select class="field" style="height:32px;padding:0 10px;font-size:14px;width:${width || 'auto'}">${items}</select>`;
  }

  function query() {
    const text = location.hash.split('?')[1] || '';
    return Object.fromEntries(new URLSearchParams(text));
  }

  function chevron(isOpen) {
    const turn = isOpen ? 'transform:rotate(90deg);' : '';
    return `<svg class="icon icon-sm subtle" style="${turn}" viewBox="0 0 24 24">${paths.chevron}</svg>`;
  }

  JPMS.flagship = { paths, portfolio, stageBadge, projectShell, sectionHeader, toolbar, toolButton, select, query, chevron };
})();
