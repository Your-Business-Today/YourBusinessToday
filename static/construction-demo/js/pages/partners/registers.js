/* The company registers — jpms/Pages/Registers.razor: insurances, subscriptions, vans, trade accounts. */
(function () {
  const ui = JPMS.ui;

  const insurances = [
    ['Contractor’s all risks', 'Harrowgate Underwriting', 'CAR-7781204', 18400, 'Annual', ['01 Oct 2026', 'warning'], null],
    ['Public & products liability', 'Harrowgate Underwriting', 'PL-5520917', 9650, 'Annual', ['01 Oct 2026', 'warning'], null],
    ['Employer’s liability', 'Harrowgate Underwriting', 'EL-5520918', 6200, 'Annual', ['01 Oct 2026', 'warning'], null],
    ['Professional indemnity', 'Northbank Mutual', 'PI-0098341', 4880, 'Annual', ['14 Feb 2027'], null],
    ['Fleet — vans', 'Weyside Motor Insurance', 'FLT-22-40917', 7320, 'Annual', ['19 Jun 2027'], null],
    ['Plant & tools', 'Harrowgate Underwriting', 'PT-1184420', 2140, 'Annual', ['01 Oct 2026', 'warning'], null],
    ['Directors & officers', 'Northbank Mutual', 'DO-0071225', 1960, 'Annual', ['30 Nov 2026'], null],
    ['Cyber', 'Linklock Cover', 'CY-339102', 1180, 'Annual', ['12 Sep 2026', 'negative'], null]
  ];

  function dueCell(date) {
    if (!date) return '<span class="subtle">—</span>';
    const [text, tone] = date;
    if (!tone) return text;
    const label = tone === 'negative' ? 'Overdue' : 'Due soon';
    return `${text} ${ui.pill(label, tone)}`;
  }

  function rows() {
    return insurances.map(([name, insurer, policy, cost, cycle, renewal, other]) => [
      `<span class="strong">${name}</span>`, insurer, ui.mono(policy), ui.money(cost), `<span class="subtle">${cycle}</span>`, dueCell(renewal), dueCell(other),
      `<div class="row" style="justify-content:flex-end;flex-wrap:nowrap">${ui.btn('Edit')}<button type="button" class="btn btn-ghost" style="color:var(--negative)">Deactivate</button></div>`
    ]);
  }

  JPMS.page('/registers', {
    title: 'Registers',
    render() {
      const kinds = ['Insurances', 'Subscriptions', 'Vans', 'Trade accounts'].map((label, index) => `<button type="button" class="btn btn-secondary" style="${index === 0 ? 'background:var(--surface-raised);color:var(--content)' : 'color:var(--content-subtle)'}">${label}</button>`).join('');
      const table = ui.table({ dense: true, columns: ['Name', 'Insurer', 'Policy no.', { label: 'Cost', num: true }, 'Cycle', 'Renewal', 'Other date', ''], rows: rows(), footer: ['Total', '', '', ui.money(insurances.reduce((total, item) => total + item[3], 0)), '', '', '', ''] });
      return ui.join([
        JPMS.partners.sectionHeader('Registers', '', [ui.iconBtn('<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>', 'Refresh'), ui.btn('Export to Excel', 'ghost'), ui.btn('Add item', 'primary')]),
        `<p class="muted" style="margin-bottom:20px">Insurances, subscriptions, vans and trade accounts, with the dates that matter. Anything due inside 30 days is flagged; items deactivate rather than delete, so history survives.</p>`,
        ui.notice('4 insurances renew on 01 Oct 2026', 'Harrowgate’s renewal terms arrived on 18 Sep — contractor’s all risks, liability and plant & tools renew together. Cyber lapsed on 12 Sep.', 'warning'),
        `<div class="row" style="gap:4px;margin:16px 0">${kinds}</div>`,
        ui.panel('Insurances', table, { flush: true })
      ]);
    }
  });
})();
