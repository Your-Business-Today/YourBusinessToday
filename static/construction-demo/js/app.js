/* The shell: registers pages, routes on the hash, draws the rail and the top bar exactly as
   jpms's MainLayout + SideNav do, and renders the page a route names. */
window.JPMS = window.JPMS || {};

(function () {
  const pages = [];
  const loading = [];
  const state = { projectId: 'hollowmere', isCollapsed: false, openFolders: new Set(['Project']) };

  JPMS.page = function (pattern, definition) {
    const names = [];
    const source = pattern.replace(/:[a-zA-Z]+/g, (match) => { names.push(match.slice(1)); return '([^/]+)'; });
    pages.push({ pattern, regex: new RegExp(`^${source}$`), names, ...definition });
  };

  JPMS.include = function (folder, files) {
    const chain = files.reduce((previous, file) => previous.then(() => loadScript(`js/pages/${folder}/${file}`)), Promise.resolve());
    loading.push(chain);
  };

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => { console.error(`Could not load ${src}`); resolve(); };
      document.head.appendChild(script);
    });
  }

  JPMS.project = function (id) {
    return JPMS.data.projects.find((project) => project.id === (id || state.projectId)) || JPMS.data.projects[0];
  };

  JPMS.href = function (route) {
    return '#' + route.replace('{project}', state.projectId);
  };

  function currentPath() {
    const path = location.hash.replace(/^#/, '') || '/dashboard';
    return path.split('?')[0];
  }

  function match(path) {
    for (const page of pages) {
      const found = path.match(page.regex);
      if (!found) continue;
      const params = {};
      page.names.forEach((name, index) => { params[name] = decodeURIComponent(found[index + 1]); });
      return { page, params };
    }
    return null;
  }

  function navLabelFor(path) {
    const rows = [JPMS.navigation.home, ...JPMS.navigation.standalone, ...JPMS.navigation.folders.flatMap((folder) => folder.rows)];
    const exact = rows.find((row) => JPMS.href(row.href).slice(1) === path);
    return exact ? exact.label : null;
  }

  function isActive(row, path) {
    const target = JPMS.href(row.href).slice(1);
    if (row.href === '/dashboard') return path === target;
    return path === target || path.startsWith(target + '/');
  }

  function renderRail(path) {
    const ui = JPMS.ui;
    const nav = JPMS.navigation;
    const project = JPMS.project();
    const link = (row) => `<li><a class="rail-link ${isActive(row, path) ? 'is-active' : ''}" href="${JPMS.href(row.href)}" title="${ui.escape(row.label)}">${ui.icon(row.href)}<span class="label">${ui.escape(row.label)}</span></a></li>`;
    const folder = (entry) => {
      const isOpen = state.openFolders.has(entry.label) || entry.rows.some((row) => isActive(row, path));
      const rows = isOpen ? entry.rows.map((row) => `<li><a class="rail-row ${isActive(row, path) ? 'is-active' : ''}" href="${JPMS.href(row.href)}">${ui.escape(row.label)}</a></li>`).join('') : '';
      const collapsedIcon = `<svg class="icon" viewBox="0 0 24 24">${JPMS.icons[entry.icon] || JPMS.icons['#fallback']}</svg>`;
      return `<li><button type="button" class="rail-folder ${isOpen ? 'is-open' : ''}" data-folder="${ui.escape(entry.label)}" title="${ui.escape(entry.label)}">${state.isCollapsed ? collapsedIcon : `<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg><span class="eyebrow label">${ui.escape(entry.label)}</span>`}</button></li>${rows}`;
    };
    const options = JPMS.data.projects.map((candidate) => `<button type="button" class="picker-option ${candidate.id === project.id ? 'is-current' : ''}" data-project="${candidate.id}"><span class="mono subtle" style="margin-right:8px">${candidate.ref}</span>${ui.escape(candidate.name)}</button>`).join('');
    const picker = `<li class="picker"><button type="button" class="picker-toggle" data-picker><span style="flex:1;min-width:0"><span class="picker-ref">${project.ref}</span><span class="picker-name">${ui.escape(project.name)}</span></span><svg class="icon icon-sm subtle" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button><div class="picker-menu" hidden>${options}<a class="picker-option text-xs" href="#/projects">Project portfolio · New project →</a></div></li>`;
    const user = JPMS.data.signedIn;
    return `
      <div class="rail-head">
        <a class="rail-brand" href="#/dashboard">${ui.jewel(20)}<span class="label">JPMS</span></a>
        <button type="button" class="btn-icon" style="border:0" data-collapse title="Toggle navigation"><svg class="icon icon-sm" viewBox="0 0 24 24"><path d="${state.isCollapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'}"/></svg></button>
      </div>
      <nav class="rail-nav">
        <ul>${link(nav.home)}${picker}${nav.folders.map(folder).join('')}</ul>
        <ul class="rail-foot">${nav.standalone.map(link).join('')}</ul>
      </nav>
      <div class="rail-user"><div class="who"><p class="eyebrow">Signed in as</p><p class="name">${user.name}</p><p class="email">${user.email}</p></div>
        <button type="button" class="btn btn-secondary btn-block"><svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M15 12H3m0 0l4-4m-4 4l4 4M11 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/></svg><span class="label">Sign out</span></button></div>`;
  }

  function render() {
    const path = currentPath();
    const projectInPath = path.match(/^\/projects\/([^/]+)/);
    if (projectInPath && JPMS.data.projects.some((project) => project.id === projectInPath[1])) state.projectId = projectInPath[1];
    const found = match(path);
    const title = found ? (found.page.title instanceof Function ? found.page.title(found.params) : found.page.title) || navLabelFor(path) : 'Not found';
    let body;
    try {
      body = found ? found.page.render(found.params) : `<div class="not-found"><p class="text-xl">This page is not in the demo</p><p style="margin-top:12px">${JPMS.ui.link('Back to Home', '#/dashboard')}</p></div>`;
    } catch (error) {
      console.error(error);
      body = JPMS.ui.notice('This demo page failed to draw', JPMS.ui.escape(error.message), 'negative');
    }
    document.getElementById('rail').innerHTML = renderRail(path);
    document.getElementById('rail').classList.toggle('is-collapsed', state.isCollapsed);
    document.getElementById('shell').classList.toggle('is-collapsed', state.isCollapsed);
    document.getElementById('page-title').textContent = title || '';
    document.title = `${title || 'JPMS'} · JPMS demo`;
    document.getElementById('page').innerHTML = `<section class="page ${found && found.page.narrow ? 'page-narrow' : ''}">${body}</section>`;
    window.scrollTo(0, 0);
  }

  function handleClick(event) {
    const target = event.target;
    const folder = target.closest('[data-folder]');
    if (folder) {
      const label = folder.dataset.folder;
      if (state.isCollapsed) { const entry = JPMS.navigation.folders.find((item) => item.label === label); location.hash = JPMS.href(entry.rows[0].href); return; }
      state.openFolders.has(label) ? state.openFolders.delete(label) : state.openFolders.add(label);
      return render();
    }
    if (target.closest('[data-collapse]')) { state.isCollapsed = !state.isCollapsed; return render(); }
    if (target.closest('[data-picker]')) { const menu = document.querySelector('.picker-menu'); menu.hidden = !menu.hidden; return; }
    const option = target.closest('[data-project]');
    if (option) {
      const previous = state.projectId;
      state.projectId = option.dataset.project;
      const path = currentPath();
      if (path.startsWith(`/projects/${previous}`)) { location.hash = '#' + path.replace(`/projects/${previous}`, `/projects/${state.projectId}`); return; }
      return render();
    }
    const menu = target.closest('[data-menu]');
    document.querySelectorAll('[data-menu].is-open').forEach((open) => { if (open !== menu) open.classList.remove('is-open'); });
    if (menu && target.closest('button')) { menu.classList.toggle('is-open'); return; }
    const chip = target.closest('[data-chip]');
    if (chip) { chip.parentElement.querySelectorAll('.chip').forEach((other) => other.classList.remove('is-active')); chip.classList.add('is-active'); return; }
    const tab = target.closest('[data-tab]');
    if (tab) { tab.closest('ul').querySelectorAll('.tab').forEach((other) => other.classList.remove('is-active')); tab.classList.add('is-active'); return; }
    const row = target.closest('[data-href]');
    if (row && !target.closest('a')) location.hash = row.dataset.href;
  }

  JPMS.start = function () {
    document.addEventListener('click', handleClick);
    window.addEventListener('hashchange', render);
    Promise.all(loading).then(render);
  };
})();
