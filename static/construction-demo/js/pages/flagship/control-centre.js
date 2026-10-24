/* Control Centre — jpms/Pages/TriageQueue.razor: the TriageBar above the split (Dealing with, the
   Project, the Yes/No decisions, "This will …" and the one Apply), then two windows side by side,
   each with the same icon rail (PanelRail), and the Recently processed fold beneath. */
(function () {
  const ui = JPMS.ui;
  const data = JPMS.controlCentreData;
  const inbox = JPMS.controlCentreInbox;
  const pathways = JPMS.controlCentrePathways;
  const base = '#/control-centre';

  const railItems = [
    ['inbox', 'Email inbox — triage and apply'], ['email', 'The open email'],
    ['client', 'Client — tag and action this email on the client side'], ['subcontractor', 'Subcontractor — tag and action this email on the subcontractor side'],
    ['supplier', 'Supplier — tag and action this email on the supplier side'], ['sales', "Sales — tag this enquiry to the prospect's lead, or raise one"],
    ['internal', 'Internal — tag and action this email on the staff side'], ['records', 'Record explorer'], ['xero', 'Xero explorer'],
    ['compose', 'New email'], ['outbox', 'Outbox — emails lined up for Apply']
  ];
  const badges = { client: 2 };

  function hrefMaker(state) {
    return (changes) => `${base}?${new URLSearchParams({ ...state, ...changes })}`;
  }

  function rail(side, active, hrefFor) {
    const buttons = railItems.map(([kind, label]) => {
      const isActive = kind === active;
      const style = isActive ? 'border-color:rgba(102,224,148,.6);background:rgba(102,224,148,.1);color:var(--accent)' : 'border-color:transparent;color:var(--content-subtle)';
      const badge = badges[kind] ? `<span style="position:absolute;top:-4px;right:-4px;min-width:17px;height:17px;border-radius:999px;background:var(--accent);color:var(--accent-ink);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center">${badges[kind]}</span>` : '';
      return `<a href="${hrefFor({ [side]: kind })}" title="${label}" style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:29px;height:29px;border:1px solid;border-radius:4px;${style}">${ui.svg(data.icons[kind], 'sm')}${badge}</a>`;
    }).join('');
    return `<div class="row" style="gap:2px;margin-bottom:8px;flex-wrap:nowrap">${buttons}</div>`;
  }

  function decision(label, answer, title) {
    const half = (text, isPicked, isFirst) => `<button type="button" class="text-xs" style="padding:4px 10px;border:1px solid ${isPicked ? 'rgba(102,224,148,.6)' : 'var(--line)'};${isFirst ? 'border-radius:4px 0 0 4px' : 'border-radius:0 4px 4px 0;border-left:0'};${isPicked ? 'background:var(--surface-raised);color:var(--accent)' : 'color:var(--content-subtle)'}">${text}</button>`;
    return `<div class="row-between" style="gap:12px;flex-wrap:nowrap" title="${title}"><span>${label}</span><span style="display:flex">${half('Yes', answer === true, true)}${half('No', answer === false, false)}</span></div>`;
  }

  function projectPicker(projectId) {
    const project = JPMS.data.projects.find((entry) => entry.id === projectId);
    const label = project ? `${project.ref} · ${project.name}` : 'Pick a project…';
    return `<button type="button" class="btn btn-secondary" title="The email's project — everything staged files against it">${label} ▾</button>`;
  }

  function triageBar(mail) {
    const isRichest = mail.id === 'm1';
    const tags = mail.threadTags.length ? decision(`Use existing tags <span class="subtle">· ${mail.threadTags.map(inbox.tagChip).join(', ')}</span>`, isRichest ? true : null, 'Yes files this email under the records its thread already carries') : '';
    const decisions = `<div class="stack-sm" style="min-width:320px">${decision('Relevant Event for Programme', isRichest ? false : null, 'Yes tags the email to the project’s programme — it appears in the Programme tab’s Relevant Events')}${decision(`Entire thread${isRichest ? ' · 3 emails' : ''}`, isRichest ? true : null, 'Yes means everything you apply also tags every email currently in this conversation')}${tags}</div>`;
    const dealing = `<div style="max-width:360px;min-width:0"><p class="eyebrow">Dealing with</p><p class="strong" style="margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ui.escape(mail.subject)}</p><p class="text-xs subtle" style="margin-top:3px">${ui.escape(mail.from)} · 25 Sep 2026 ${mail.time}</p></div>`;
    const top = `<div class="row" style="gap:12px 32px;align-items:flex-start">${dealing}<div class="row" style="gap:8px"><span class="eyebrow">Project</span>${projectPicker(mail.project)}</div>${decisions}</div>`;
    const matched = mail.project ? '<p class="text-xs tone-accent" style="margin-top:10px">Project matched from the email — change it if that’s wrong.</p>' : '';
    const summary = isRichest
      ? '<p style="flex:1">This will file it under the thread’s existing tags (RFI-049, VOQ-0014), link this email to RFI-049, send 2 attachments to Document Triage and run 1 system action (close RFI-049 with this email as its answer).</p>'
      : '<p class="subtle" style="flex:1;line-height:18px">Write a reply in the email window, or stage tags, new records and to-dos in the pathway panes — Client, Subcontractor, Supplier, Internal — then apply it all in one go here.</p>';
    const bar = `<div class="row" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line);flex-wrap:nowrap">${summary}<button type="button" class="btn btn-secondary subtle">🗑 Discard</button>${ui.btn('Apply', 'primary')}</div>`;
    return `<section class="panel" style="padding:12px 16px;margin-bottom:12px">${top}${matched}${bar}</section>`;
  }

  function placeholder(kind) {
    const titles = { records: ['Record explorer', 'Search any system document — RFIs first — and read it here.'], xero: ['Xero explorer', 'Search Xero transactions by contact, reference or amount.'], compose: ['New email', 'Compose a fresh email from the projects mailbox.'], outbox: ['Outbox', 'Nothing lined up — replies written here are sent when Apply runs.'] };
    const [title, text] = titles[kind];
    return `<section class="panel" style="padding:20px"><h2 class="semibold text-base">${title}</h2><p class="text-xs subtle" style="margin:4px 0 16px">${text}</p>${kind === 'outbox' ? '' : JPMS.ui.search('Search…')}</section>`;
  }

  function content(kind, state, mail, hrefFor) {
    const project = JPMS.project(mail.project || 'hollowmere');
    if (kind === 'inbox') return inbox.inboxPane(state.view, state.m, hrefFor);
    if (kind === 'email') return inbox.emailPane(mail, project);
    if (pathways.configs[kind]) return pathways.pane(kind, mail.subject, state.tab, hrefFor);
    return placeholder(kind);
  }

  function recentFold() {
    const rows = data.recent.map(([ago, reference, detail, meta]) => `<div class="row" style="padding:8px 0;border-top:1px solid var(--line);flex-wrap:nowrap"><span class="text-xs subtle" style="width:72px">${ago}</span><span class="mono text-xs" style="text-decoration:underline">${reference}</span><span class="text-xs muted" style="flex:1">${detail}</span><span class="text-xs subtle">${meta}</span></div>`).join('');
    return `<section class="panel" style="padding:20px;margin-top:16px"><details><summary style="cursor:pointer"><h2 class="semibold" style="display:inline;font-size:14px">Recently processed (${data.recent.length})</h2></summary><div style="margin-top:12px">${rows}</div><p class="text-xs" style="text-align:right;margin-top:12px">${ui.link('Full audit trail', '#/audit')}</p></details></section>`;
  }

  JPMS.page('/control-centre', {
    title: 'Control Centre',
    render() {
      const query = JPMS.flagship.query();
      const state = { left: query.left || 'inbox', right: query.right || 'email', view: query.view || 'queue', m: query.m || 'm1', tab: query.tab || 'tagging' };
      const hrefFor = hrefMaker(state);
      const mail = data.queue.find((entry) => entry.id === state.m) || data.queue[0];
      const windowFor = (side) => `<div style="min-width:0">${rail(side, state[side], hrefFor)}${content(state[side], state, mail, hrefFor)}</div>`;
      const workspace = `<div style="display:grid;grid-template-columns:minmax(0,1fr) 7px minmax(0,2fr);gap:0 8px">${windowFor('left')}<div style="display:flex;justify-content:center;cursor:col-resize" title="Drag to resize the panes"><div style="width:1px;background:var(--line)"></div></div>${windowFor('right')}</div>`;
      return (state.view === 'tagged' ? '' : triageBar(mail)) + workspace + recentFold();
    }
  });
})();
