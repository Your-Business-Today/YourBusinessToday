/* KPI emails — jpms/Pages/AdminKpis.razor: emails marked as a KPI against a member of staff,
   the person chips, and the register with Open / Edit / Remove. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;

  const kpis = [
    ['KPI-0014', 'Liam Carter', false, 'Re: Orangery handover — thank you', 'Mr & Mrs Whitfield · 24 Sep', 'Client thanked the site team for the tidy handover of the orangery.', '24 Sep 2026', 'marcus.hale'],
    ['KPI-0013', 'Sophie Turner', false, 'V14 — library panelling', 'Ashdown Rowe Architects · 22 Sep', 'Architect praised the speed of the V14 turnaround.', '22 Sep 2026', 'marcus.hale'],
    ['KPI-0012', 'Ravi Patel', false, 'September cost report', 'Fenwick Hale Studio · 19 Sep', 'Architect said it was the clearest cost report they have had.', '19 Sep 2026', 'daniel.price'],
    ['KPI-0011', 'Liam Carter', false, 'Drainage levels — query', 'Northgate Groundworks Ltd · 16 Sep', 'Subcontractor query went four days without a response.', '16 Sep 2026', 'sophie.turner'],
    ['KPI-0010', 'Tom Reeves', false, 'Site tidy — neighbour note', 'Neighbour at Hollowmere · 12 Sep', 'Neighbour wrote to say how considerate the site team has been.', '12 Sep 2026', 'marcus.hale'],
    ['KPI-0009', 'Emma Walsh', false, 'Re: Statement reconciliation', 'Kestrel Timber Merchants · 10 Sep', 'Supplier thanked accounts for clearing the August statement in a day.', '10 Sep 2026', 'daniel.price'],
    ['KPI-0008', 'Sophie Turner', false, 'Kitchen appliance schedule', 'Ms Imogen Clarke · 05 Sep', '—', '05 Sep 2026', 'marcus.hale'],
    ['KPI-0007', 'Callum Reid', true, 'Stair joinery — site fixing', 'Timbercraft Joinery · 02 Sep', 'Client asked for the joiner by name for the next phase.', '02 Sep 2026', 'sophie.turner'],
    ['KPI-0006', 'Ravi Patel', false, 'Valuation 6 — agreed', 'Mr & Mrs Whitfield · 28 Aug', 'Valuation agreed first time with no queries.', '28 Aug 2026', 'daniel.price']
  ];

  function personChips() {
    const counts = {};
    kpis.forEach(([, person]) => { counts[person] = (counts[person] || 0) + 1; });
    const chips = Object.entries(counts).map(([person, count]) => `<button type="button" class="chip">${person}<span class="chip-count">${count}</span></button>`).join('');
    return `<div class="chips" style="margin-bottom:16px">${chips}</div>`;
  }

  function row([reference, person, hasNoLogin, subject, from, note, marked, markedBy]) {
    const noLogin = hasNoLogin ? ' <span class="text-xs subtle" title="Added by name — no portal login">no login</span>' : '';
    const actions = `<div class="row" style="justify-content:flex-end;gap:8px;flex-wrap:nowrap">${ui.btn('Open', 'secondary', { class: 'text-xs' })}${ui.btn('Edit', 'secondary', { class: 'text-xs' })}<button type="button" class="btn btn-ghost text-xs tone-negative">Remove</button></div>`;
    return [
      `<span style="white-space:nowrap">${reference}</span>`,
      `<span class="strong" style="white-space:nowrap">${person}</span>${noLogin}`,
      `<p>${subject}</p>${shared.subText(from)}`,
      note,
      `<span class="text-xs subtle" style="white-space:nowrap">${marked}<br>${markedBy}@jewel-demo.example</span>`,
      actions
    ];
  }

  JPMS.page('/admin/kpis', {
    title: 'KPI emails',
    render() {
      const people = shared.select(['All people', ...new Set(kpis.map(([, person]) => person))], '14rem');
      const table = ui.table({ columns: ['Ref', 'Person', 'Email', 'Note', 'Marked', ''], rows: kpis.map(row), dense: true });
      const note = '<p class="text-xs subtle" style="margin-top:8px">Open hands the email to the Control Centre with it selected. Removing takes the mark off; the email itself is untouched.</p>';
      return ui.join([
        shared.adminTabs(5),
        shared.header({ subtitle: 'Emails marked as a KPI against a member of staff — filed under the person (with or without a portal login), visible to administrators only. Mark one from the Control Centre’s Internal pane (Actions → Mark as KPI); the email is tagged Admin so it leaves the queue — the tag never says KPI.' }),
        `<div style="max-width:72rem">${ui.panel('KPI register', [personChips(), table, note], { actions: [people, ui.btn('Add person', 'secondary', { class: 'text-xs' })] })}</div>`
      ]);
    }
  });
})();
