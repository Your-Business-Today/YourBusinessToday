/* Pieces the partners pages share: ProjectPageShell's crumb and header, SectionHeader, and the
   CorrespondenceThreadList card every communication register uses. */
(function () {
  const ui = JPMS.ui;
  const stageTones = { 'On site': 'positive', 'Pre-construction': 'info', Completed: '' };

  function crumbs(items) {
    const parts = items.map(([label, href]) => (href ? `<a class="link subtle" href="${href}">${label}</a>` : `<span class="muted strong">${label}</span>`));
    return `<nav class="text-xs" style="margin-bottom:16px">${parts.join('<span class="subtle" style="margin:0 8px">/</span>')}</nav>`;
  }

  function projectShell(project, body) {
    const arrows = (glyph) => `<span class="subtle" style="font-weight:400;margin:0 8px">${glyph}</span>`;
    const subtitle = `${project.client} · JBB · ${ui.pill(project.stage, stageTones[project.stage])}`;
    return ui.join([
      crumbs([['Projects', '#/projects'], [project.ref, `#/projects/${project.id}`]]),
      ui.header({ eyebrow: project.ref, title: `${arrows('‹')}${project.name}${arrows('›')}`, subtitle }),
      body
    ]);
  }

  function sectionHeader(title, subtitle, actions) {
    const subtitleHtml = subtitle ? `<p class="text-xs subtle" style="margin-top:4px">${subtitle}</p>` : '';
    return `<div class="row-between" style="align-items:flex-end;margin-bottom:20px"><div><h2 class="text-lg strong">${title}</h2>${subtitleHtml}</div><div class="row">${ui.join(actions)}</div></div>`;
  }

  function emailCard(email) {
    const attachment = email.attachment ? ` ${ui.pill('attachment')}` : '';
    const tags = (email.tags || []).map((tag) => ui.pill(tag, 'info')).join(' ');
    const threadToggle = email.thread ? `<a class="link text-xs">Thread · ${email.thread} emails</a>` : '';
    return `<li class="card" style="list-style:none;margin-bottom:8px">
      <div class="row-between" style="align-items:baseline"><span class="strong">${email.from}</span><span class="text-xs subtle">${email.when}</span></div>
      <p style="margin-top:2px">${email.subject}${attachment}</p>
      ${tags ? `<div class="row" style="gap:4px;margin-top:6px">${tags}</div>` : ''}
      <p class="text-xs subtle" style="margin-top:6px">${email.preview}</p>
      <div class="row text-xs" style="margin-top:8px;gap:16px"><a class="link tone-accent">Show full email</a><a class="link tone-accent">↩ Reply</a><a class="link tone-accent">→ Forward</a>${threadToggle}</div>
    </li>`;
  }

  function threadList(emails) {
    return `<ul style="padding:0;margin:0">${emails.map(emailCard).join('')}</ul>`;
  }

  function subcontractorByName(name) {
    return JPMS.data.subcontractors.find((company) => company.name === name) || { contact: '—', trade: '—' };
  }

  JPMS.partners = { crumbs, projectShell, sectionHeader, threadList, subcontractorByName };
})();
