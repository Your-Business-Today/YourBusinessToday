/* AI Skills — jpms/Pages/AiSkillsAdmin.razor: the skill store's list, and one skill open in the
   editor with its reference documents and the version History panel (SkillHistoryPanel). */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const skills = JPMS.skills;

  function row(skill) {
    return [
      shared.twoLine(skill.name, skill.key),
      `<span style="white-space:nowrap">${skill.discipline.split(' — ')[0]}</span>`,
      skill.pinned ? ui.pill('Pinned', 'accent') : '<span class="muted">On demand</span>',
      skill.active ? 'Active' : '<span class="subtle">Off</span>',
      `v${skill.version}`,
      `${skill.size.toFixed(1)} KB`,
      skill.references,
      `<span style="display:block;white-space:nowrap">${skill.updated}</span><span class="text-xs subtle">${skill.by}@jewel-demo.example</span>`
    ];
  }

  const subtitle = 'The working knowledge the team’s own Claude reads through the connector — doctrine, method, standing rules — written as markdown and versioned on every save. A skill saved here is in force from the next conversation. Which skills ride with which actions is set on AI Actions; <span style="color:var(--content)">Pinned</span> marks house doctrine that belongs everywhere.';

  JPMS.page('/admin/skills', {
    title: 'AI Skills',
    render() {
      const columns = ['Skill', 'Discipline', 'Pinned', 'Active', { label: 'Version', num: true }, { label: 'Size', num: true }, { label: 'References', num: true }, 'Updated'];
      const table = ui.table({ columns, rows: skills.all.map(row), hrefs: skills.all.map((skill) => `#/admin/skills/${skill.key}`) });
      return ui.join([
        shared.header({ subtitle }),
        ui.toolbar([`<span class="text-xs subtle">${skills.all.length} skills</span>`], [ui.btn('New skill', 'primary')]),
        ui.panel('', table, { flush: true })
      ]);
    }
  });

  function editor(skill) {
    const disciplines = ['Shared — every discipline', 'Commercial', 'Bid packages', 'Timesheets'];
    const ordered = [skill.discipline, ...disciplines.filter((name) => name !== skill.discipline)];
    const fields = [
      `<div class="grid grid-2">${ui.field('Skill key', skill.key)}<label style="display:block"><span class="form-label">Discipline</span>${shared.select(ordered, '100%')}</label></div>`,
      ui.field('Display name', skill.name),
      ui.field('Description', skill.body.split('\n')[2].replace('description: ', ''), { textarea: true }),
      `<div class="row" style="gap:24px">${shared.checkbox('Pinned — house doctrine, always in force', skill.pinned)}${shared.checkbox('Active', skill.active)}</div>`,
      `<label style="display:block"><span class="form-label">Body (markdown) <span class="subtle">— paste a SKILL.md whole; a ---frontmatter--- block fills the fields above on paste.</span></span><textarea class="field mono text-xs" rows="24" spellcheck="false" style="width:100%;height:auto;font-size:12px;line-height:1.6;font-family:ui-monospace, SFMono-Regular, Menlo, monospace">${ui.escape(skill.body)}</textarea></label>`
    ];
    return `<section class="panel"><div class="panel-body stack-sm">${fields.join('')}</div></section>`;
  }

  function referencesPanel(skill) {
    const documents = [['Client letter templates', 'The five letters we send clients, word for word', '3.4 KB'], ['JCT clause map', 'Which clause decides what, for SBC and IC', '8.9 KB'], ['Glossary', 'Our words and the ones we never use', '1.6 KB']].slice(0, skill.references);
    const rows = documents.map(([name, description, size]) => `<div class="list-row" style="padding:10px 12px;border:1px solid var(--line);margin-bottom:8px"><div><p class="strong">${name}</p><p class="text-xs subtle">${description}</p></div><span class="text-xs subtle">${size}</span></div>`).join('');
    return ui.panel('Reference documents', [`<p class="text-xs subtle" style="margin-bottom:16px;max-width:42rem">The larger source material a skill names but does not inline — clause maps, methodologies, precedent libraries. The assistant loads one only when a task needs it, so size costs nothing until it is used.</p>`, rows || ui.empty('No reference documents yet.'), ui.btn('Add reference document')]);
  }

  function linesChanged(skill) {
    if (skill.pinned) return pinnedChange;
    const tail = skill.body.split('\n').slice(-3);
    return [[' ', tail[0]], [' ', tail[1]], ['+', tail[2]]];
  }

  const pinnedChange = [
    [' ', '## What you never do'],
    [' ', '- Approve a variation, a valuation or a payment. Those are a director\'s.'],
    ['-', '- Send anything to a client.'],
    ['+', '- Cross the client wall: nothing from the subcontractor pathway is sent to, or filed with, a client.'],
    ['+', '- Promise a completion date. The programme does that.']
  ];

  function diff(skill) {
    const lines = linesChanged(skill);
    const tones = { '-': 'background:rgba(255,64,60,.12);color:var(--negative)', '+': 'background:rgba(102,224,148,.12);color:var(--positive)', ' ': '' };
    return `<pre class="mono text-xs" style="border:1px solid var(--line);padding:12px;white-space:pre-wrap;margin:0">${lines.map(([mark, text]) => `<span style="display:block;${tones[mark]}">${mark} ${ui.escape(text)}</span>`).join('')}</pre>`;
  }

  function historyPanel(skill) {
    const versions = skills.versionsOf(skill);
    const rows = versions.map((version, index) => [`v${version.version}${index === 0 ? ' ' + ui.pill('In force', 'positive') : ''}`, version.written, `${version.by}@jewel-demo.example`, version.replaced || '—', `${version.size} KB`]);
    const table = ui.table({ columns: ['Version', 'Written', 'By', 'Replaced', { label: 'Size', num: true }], rows, dense: true, selected: 1 });
    const shown = versions[1] || versions[0];
    const chips = skill.references ? `<div style="margin-bottom:12px">${ui.chips(['SKILL.md', 'Client letter templates', 'JCT clause map', 'Glossary'].slice(0, skill.references + 1))}</div>` : '';
    const viewer = ui.panel(`Version ${shown.version}`, [`<label style="display:block;max-width:20rem;margin-bottom:16px"><span class="form-label">Compare with</span>${shared.select([`Version ${versions[0].version} (in force)`, 'Nothing — show this version\'s text'])}</label>`, diff(skill)], { actions: [ui.btn('Restore this version')] });
    const heading = `<div style="margin:24px 0 12px"><h2 class="text-lg semibold">History</h2><p class="text-xs subtle">Every version is kept. Pick one to read it, compare it with another, or restore it.</p></div>`;
    return heading + chips + table + `<div style="margin-top:16px">${viewer}</div>`;
  }

  JPMS.page('/admin/skills/:key', {
    title: 'AI Skills',
    render(params) {
      const skill = skills.find(params.key);
      const bar = ui.toolbar([ui.btn('Back to the list', 'secondary', { href: '#/admin/skills' })], [`<span class="text-xs tone-positive">Saved — live on the next message.</span>`, ui.btn('Save new version', 'primary')]);
      return ui.join([shared.header({ subtitle }), bar, editor(skill), `<div style="margin-top:16px">${referencesPanel(skill)}</div>`, historyPanel(skill)]);
    }
  });
})();
