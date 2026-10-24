/* Labour overview — jpms/Pages/LabourOverview.razor: the month's projected labour spend with the
   submission-confidence bar, the By worker placement grid, and the chase list. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const views = ['By worker', 'By site', 'By cost code', 'Sign-off', 'Settlement'];
  const weeks = [['01 Sep', 36, 36], ['07 Sep', 50, 49], ['14 Sep', 50, 46], ['21 Sep', 40, 27]];

  function forecastPanel(workers) {
    const labour = money.labour;
    const projected = workers.reduce((sum, worker) => sum + labour.projected(worker), 0);
    const timeOff = workers.reduce((sum, worker) => sum + labour.daysOn(worker, 'x') * labour.dayRate(worker), 0);
    const quiet = (label, value, caption) => `<article><p class="subtle">${label}</p><p class="text-xl semibold" style="margin-top:4px">${value}</p><p class="text-xs subtle" style="margin-top:4px">${caption}</p></article>`;
    const segments = weeks.map(([start, elapsed, confirmed]) => `<div title="w/c ${start} — ${confirmed}/${elapsed} days confirmed" style="flex:1;height:8px;border-radius:999px;background:var(--surface-raised);overflow:hidden"><div style="height:100%;width:${Math.round((confirmed / elapsed) * 100)}%;background:var(--accent)"></div></div>`).join('');
    const figures = `<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:24px;align-items:start"><article><p class="subtle">Projected labour spend</p><p class="text-2xl semibold" style="margin-top:8px">${ui.money(projected)}</p></article>${quiet('Time off logged', `− ${ui.money(timeOff)}`, 'holiday and days not worked')}${quiet('Amount due after CIS', ui.money(Math.round(projected * 0.8)), 'net payable this month')}</div>`;
    const bar = `<div style="margin-top:20px"><div class="row-between text-xs subtle" style="margin-bottom:6px"><span>90% of elapsed days confirmed by timesheet</span><span>${ui.money(4180)} unconfirmed</span></div><div class="row" style="gap:4px">${segments}</div></div>`;
    return `<div style="margin-bottom:24px">${ui.panel('', figures + bar)}</div>`;
  }

  function viewSelector() {
    const buttons = views.map((label, index) => `<button type="button" class="btn btn-secondary" style="${index ? 'color:var(--content-subtle)' : 'background:var(--surface-raised)'}">${label}</button>`).join('');
    return `<div class="row" style="gap:4px;margin-bottom:16px">${buttons}</div>`;
  }

  function workersPanel(workers) {
    const labour = money.labour;
    const rows = workers.map((worker) => [
      `<span class="strong">${worker.name}</span>`, ui.money(labour.dayRate(worker)), labour.monthWeekdays, labour.daysWorked(worker), labour.daysOn(worker, 'x') || '—', labour.strip(worker), `<span class="strong">${ui.money(labour.projected(worker))}</span>`
    ]);
    const table = ui.table({ dense: true, columns: ['Name', { label: 'Rate', num: true }, { label: 'Contracted', num: true }, { label: 'Worked', num: true }, { label: 'Off', num: true }, 'Month', { label: 'Projected', num: true }], rows, hrefs: workers.map(() => '#/labour/workers') });
    const legend = `<div class="legend" style="padding:12px 16px 0"><span><i style="background:var(--accent)"></i>Hollowmere House</span><span><i style="background:var(--info)"></i>The Old Coach House</span><span><i style="background:var(--brand)"></i>Kingsridge Lodge</span></div>`;
    const footnote = `<p class="text-xs subtle" style="padding:12px 16px;border-top:1px solid var(--line)">Chips are coloured by site; hatched = recorded absence, hollow = elapsed day with nothing recorded yet. Weekdays always show; round chips are weekend days, drawn only when something was recorded on them. Select a row for the day-by-day detail, absence recording and contract settings.</p>`;
    return `<div style="margin-bottom:24px">${ui.panel('By worker', [table, legend, footnote], { flush: true })}</div>`;
  }

  function chasePanel() {
    const actions = `<span style="white-space:nowrap"><a class="text-xs subtle" style="text-decoration:underline;margin-right:12px">Record absence</a><a class="text-xs subtle" style="text-decoration:underline">Dismiss</a></span>`;
    const items = [
      ['Kieran Blythe', 'Wed 23 Sep', 'No timesheet and no recorded absence'],
      ['Kieran Blythe', 'Thu 24 Sep', 'No timesheet and no recorded absence'],
      ['Ben Crossley', 'Fri 18 Sep', 'Signed in at Hollowmere House — never signed out'],
      ['Callum Dyer', 'Fri 25 Sep', 'No timesheet and no recorded absence'],
      ['Sam Whitlow', 'Thu 24 Sep', 'No timesheet and no recorded absence'],
      ['Sam Whitlow', 'Fri 25 Sep', 'No timesheet and no recorded absence']
    ].map(([name, date, why]) => [`<span class="strong">${name}</span>`, date, why, actions]);
    const table = ui.table({ dense: true, columns: ['Name', 'Date', 'Why', { label: '', num: true }], rows: items });
    return ui.panel(`Chase list (${items.length})`, [table, `<p class="text-xs subtle" style="padding:12px 16px;border-top:1px solid var(--line)">2 days dismissed this month (audited).</p>`], { flush: true });
  }

  JPMS.page('/labour/overview', {
    title: 'Labour overview',
    render() {
      const workers = money.labour.activeWorkers();
      const monthNav = `<div class="row" style="gap:8px">${ui.btn('‹ Prev')}<span class="subtle" style="white-space:nowrap;text-align:center">September 2026</span>${ui.btn('Next ›')}</div>`;
      return ui.join([
        money.sectionHeader('Labour overview', [monthNav, money.refreshButton(), money.exportButton(), ui.btn('Enter a week', 'primary')]),
        money.note('Every JBB project in one view — this page ignores the project picked in the sidebar. Projected cost across every worker for the month, and where each day actually went. Contracted days multiplied by day rate, less every day recorded as holiday, a half day or not worked. Days not yet submitted stay at the full rate, so the figure is only as accurate as the submission rate below.', { lead: true, gap: 20 }),
        forecastPanel(workers), viewSelector(), workersPanel(workers), chasePanel()
      ]);
    }
  });
})();
