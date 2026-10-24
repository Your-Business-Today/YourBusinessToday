/* Leads — jpms/Pages/SalesLeads.razor: the one register of everyone Jewel might convince to
   build with it, the four figures above it, stage chips, and the strategy that found each lead. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const sales = JPMS.sales;

  function foundBy(lead) {
    const strategy = sales.strategy(lead.strategy);
    return strategy ? `<a class="tone-info" href="#/sales/strategies/${strategy.id}">${strategy.name}</a>` : lead.source;
  }

  function leadCell(lead) {
    const sub = lead.company ? `${lead.company} · ${lead.kind}` : lead.kind;
    return `<div style="min-width:150px">${shared.twoLine(lead.contact, sub)}</div>`;
  }

  function row(lead) {
    return [
      `<span class="mono text-xs" style="white-space:nowrap">${lead.ref}</span>`,
      leadCell(lead),
      `<p style="min-width:200px">${lead.property}</p>${shared.subText(lead.postcode)}`,
      `<span style="display:block;min-width:240px;max-width:22rem">${lead.work}</span>`,
      `<span style="white-space:nowrap">${foundBy(lead)}</span>`,
      shared.stagePill(lead.stage),
      ui.money(lead.value),
      `<span class="text-xs">${lead.owner}</span>`,
      `<span class="text-xs" style="white-space:nowrap">${lead.captured}</span>`
    ];
  }

  function stageChips() {
    const open = sales.leads.filter(sales.isOpen).length;
    const chips = [{ label: 'Open', count: open }, ...sales.ladder.map((stage) => ({ label: stage, count: sales.leads.filter((lead) => lead.stage === stage).length }))];
    return `<div style="padding:16px 24px;border-bottom:1px solid var(--line)">${ui.chips(chips)}</div>`;
  }

  function register() {
    const open = sales.leads.filter(sales.isOpen);
    const columns = ['Ref', 'Lead', 'Property', 'The work', 'Found by', 'Stage', { label: 'Value', num: true }, 'Owner', 'Captured'];
    const table = ui.table({ columns, rows: open.map(row), hrefs: open.map((lead) => `#/sales/leads/${lead.id}`) });
    const strategyPicker = shared.select(['All strategies', ...sales.strategies.map((strategy) => `${strategy.name} (${strategy.funnel.leads})`)], '14rem');
    return ui.panel('Lead register', [stageChips(), table], { flush: true, actions: [ui.search('Search name, company, postcode, ref'), strategyPicker] });
  }

  JPMS.page('/sales/leads', {
    title: 'Leads',
    render() {
      const open = sales.leads.filter(sales.isOpen);
      const pipeline = open.reduce((sum, lead) => sum + lead.value, 0);
      return ui.join([
        shared.salesTabs(0),
        shared.header({ subtitle: 'Everyone we might convince to build with Jewel — to upgrade their house or have a new one built — and the property the work would be on. Every lead lands here whatever found it; the strategy that found it is named on the row, so a strategy is judged by how far its leads climb.', primary: 'New lead' }),
        `<div style="margin-bottom:24px">${ui.stats([{ label: 'Open leads', value: String(open.length) }, { label: 'Open pipeline', value: ui.money(pipeline) }, { label: 'Won this year', value: '3' }, { label: 'New in the last 30 days', value: '6' }])}</div>`,
        register()
      ]);
    }
  });
})();
