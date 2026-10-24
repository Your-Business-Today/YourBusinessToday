/* One to-do's page — jpms/Pages/TodoDetail.razor: Communications beside Detail, Timeline and Linked to-dos. */
(function () {
  const ui = JPMS.ui;
  const partners = JPMS.partners;

  const emails = [
    { from: 'Sam Okoro', when: '24 Sep 2026, 17:22', subject: 'RE: Revised first-fix quote — Hollowmere House', preview: 'Sophie, apologies for the delay — the orangery circuits add £6,840 + VAT. Revised schedule attached; we can hold the price to 31 Oct…', tags: ['V14', 'BP-0017'], attachment: true, thread: 3 },
    { from: 'Ravi Patel', when: '23 Sep 2026, 09:40', subject: 'Revised first-fix quote — orangery circuits', preview: 'Sam, can you price the additional circuits to the orangery per the lighting designer’s rev C layout? We need it by Friday…', tags: ['BP-0017'] }
  ];

  const aboutHrefs = { 'BP-0017': '#/projects/hollowmere/bid-package-invites/bp-0017', 'WO-0142': '#/projects/hollowmere/work-orders/wo-0142/po' };

  function statusOf(item) {
    if (item.done) return ['Done', 'positive'];
    return item.inProgress ? ['In progress', 'warning'] : ['Open', 'info'];
  }

  function communicationsPanel() {
    const actions = ['<span class="text-xs subtle">3 emails</span>', ui.btn('Find emails…'), ui.iconBtn('<path d="M4 6h16v12H4z"/><path d="M4 6l8 7 8-7"/>', 'New email'), ui.iconBtn('<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>', 'Refresh')];
    return ui.panel('Communications', partners.threadList(emails), { actions });
  }

  function factsPanel(item) {
    const assignee = item.person ? `${item.role} · ${item.person}` : item.role;
    const facts = [['Scope', `${item.scope} <a class="link text-xs">Move</a>`], ['Assigned to', `${assignee} <a class="link text-xs">Reassign</a>`], ['About', item.about ? ui.link(`${item.about} →`, aboutHrefs[item.about]) : '—'], ['Due', item.due || '—'], ['Added', item.added]];
    if (item.inProgress) facts.push(['In progress since', '23 Sep 2026 by ravi.patel@jewel-demo.example']);
    if (item.done) facts.push(['Completed', item.done]);
    const notes = item.notes ? `<p class="muted" style="margin-bottom:16px">${item.notes}</p>` : '';
    return ui.panel('Detail', notes + ui.meta(facts));
  }

  function timelinePanel() {
    const entries = [['Logged progress — Sam says Thursday at the latest', '24 Sep 2026 · Ravi Patel'], ['Marked in progress', '23 Sep 2026 · Ravi Patel'], ['Added', '21 Sep 2026 · Sophie Turner']];
    const items = entries.map(([what, when]) => `<div class="timeline-item is-done"><p>${what}</p><p class="text-xs subtle">${when}</p></div>`).join('');
    return ui.panel('Timeline', `<div class="timeline">${items}</div><div style="margin-top:8px">${ui.field('Log progress', '', { placeholder: 'What happened — it goes on the timeline' })}</div>`);
  }

  function linkedPanel() {
    const rows = [['TODO-0133', 'Issue V14 to Ashdown Rowe for instruction', 'todo-0133'], ['TODO-0141', 'Approve Northgate bill against WO-0142', 'todo-0141']];
    return ui.panel('Linked to-dos', rows.map(([ref, title, id]) => `<p style="margin-bottom:6px"><span class="mono text-xs subtle" style="margin-right:8px">${ref}</span>${ui.link(title, `#/todos/${id}`)}</p>`).join(''));
  }

  JPMS.page('/todos/:id', {
    title: 'Todo',
    render(params) {
      const item = JPMS.partnersTodos.find((candidate) => candidate.id === params.id) || JPMS.partnersTodos[0];
      const [status, tone] = statusOf(item);
      const primary = item.done ? 'Reopen' : 'Mark done';
      const actions = [ui.btn('Delete', 'ghost'), item.done || item.inProgress ? '' : ui.btn('Working on it')];
      return ui.join([
        `<p style="margin-bottom:12px">${ui.link('← All to-dos', '#/todos')}</p>`,
        ui.header({ eyebrow: item.ref, title: `${item.title} ${ui.pill(status, tone)}`, actions, primary }),
        `<div class="grid grid-sidebar" style="align-items:start">${communicationsPanel()}<div class="stack">${factsPanel(item)}${timelinePanel()}${linkedPanel()}</div></div>`
      ]);
    }
  });
})();
