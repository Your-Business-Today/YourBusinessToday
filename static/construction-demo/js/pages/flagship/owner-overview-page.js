/* Owner Overview's page body — the project performance table on one pound scale, the owed-each-way
   tiles and the "Not yet calculated" panel (OwnerProjectsTable, OwnerGapsPanel). */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const owner = JPMS.ownerOverview;

  function profitTone(value) {
    return value < 0 ? 'tone-negative' : 'tone-positive';
  }

  function scaleBar(profit, largest) {
    const width = (Math.abs(profit) / largest) * 100;
    const colour = profit < 0 ? 'var(--negative)' : 'var(--positive)';
    return `<div class="bar" title="${ui.money(profit)}"><span style="width:${width}%;background:${colour}"></span></div>`;
  }

  function projectCell(job) {
    const name = job.id ? `<a class="strong" href="#/projects/${job.id}/financials" style="text-decoration:underline">${job.name}</a>` : `<span class="strong">${job.name}</span>`;
    return `${name}<span class="text-xs subtle" style="display:block;margin-top:2px">${job.ref}</span>`;
  }

  function jobRow(job, largest) {
    const profit = `<span class="semibold ${profitTone(job.profit)}">${ui.money(job.profit)}</span><span class="text-xs subtle" style="display:block">${ui.percent(job.margin)}</span>`;
    const toFinish = `<span class="${profitTone(job.toFinish)}">${ui.money(job.toFinish)}</span>`;
    const complete = job.complete === null ? '—' : `<span class="muted">${ui.percent(job.complete)}</span>`;
    return [projectCell(job), frame.stageBadge(job.stage), profit, scaleBar(job.profit, largest), toFinish, complete];
  }

  function performance() {
    const largest = Math.max(...owner.jobs.map((job) => Math.abs(job.profit)));
    const header = `<div class="row-between" style="margin-bottom:12px"><div><h2 class="text-lg semibold">Project performance</h2><p class="muted" style="margin-top:4px">Forecast profit at completion and the profit still to come, every live job — the Profit Summary's rows.</p></div>${ui.link('Open the Profit Summary', '#/finance/profit-summary')}</div>`;
    const columns = ['Project', 'Stage', { label: 'Forecast profit', num: true }, 'Same scale', { label: 'Profit to finish', num: true }, { label: 'Complete', num: true }];
    const table = ui.table({ columns, rows: owner.jobs.map((job) => jobRow(job, largest)), dense: true });
    return `<div style="margin-bottom:24px">${header}<section class="panel">${table}</section></div>`;
  }

  function owedTiles() {
    return `<div class="grid grid-4 grid-gap-sm" style="margin-bottom:24px">${[
      owner.tile('Owed to suppliers', ui.money(318760), '£86,240 overdue · 41 bills, 6 drafts'),
      owner.tile('Owed by clients', ui.money(401920), '£142,680 overdue · 5 invoices'),
      owner.tile('Left to certify', ui.money(11864300), 'against £10.21m cost to complete'),
      owner.tile('Open leads', '11', `pipeline value not yet calculated · ${ui.link('Leads', '#/sales/leads')}`)
    ].join('')}</div>`;
  }

  function gapsPanel() {
    const intro = '<p class="text-xs muted" style="padding:16px 24px 8px;line-height:16px">Figures the owner view asks for that no finance page calculates today. Each needs its definition agreeing before it can be shown — a number here would be a guess.</p>';
    const rows = owner.gaps.map(([title, whyNot]) => `<div class="list-row" style="display:block"><p class="strong">${title}</p><p class="text-xs muted" style="margin-top:4px;line-height:16px">${whyNot}</p></div>`).join('');
    return ui.panel('Not yet calculated', [intro, rows], { flush: true });
  }

  JPMS.page('/owner-overview', {
    title: 'Owner Overview',
    render() {
      const subtitle = 'Cash, forecast profit and the decisions that protect both — every figure the one its finance page calculates.';
      const ahead = `<div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);margin-bottom:24px">${owner.cashPanel()}${owner.decisionsPanel()}</div>`;
      return ui.join([ui.header({ title: 'Owner Overview', subtitle }), owner.nowTiles(), ahead, performance(), owedTiles(), gapsPanel()]);
    }
  });
})();
