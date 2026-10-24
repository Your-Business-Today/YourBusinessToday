/* Cost codes — jpms/Pages/CostCodes.razor under the Setup section tabs: the global cost-code
   master every project's financials, valuation report and invoice allocations group by. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const setupTabs = [['Cost codes', '/cost-codes'], ['Rates', '/rate-library']];

  const extraCodes = [
    { code: '1100', name: 'Temporary works & scaffolding' },
    { code: '3200', name: 'Structural steel' },
    { code: '6200', name: 'Screeds & floor finishes' },
    { code: '6400', name: 'Decorations' },
    { code: '7300', name: 'Specialist finishes & ironmongery' }
  ];

  function actions(isActive) {
    const link = (label) => `<a class="muted" style="font-weight:500;margin-left:12px;cursor:pointer">${label}</a>`;
    return `<span style="white-space:nowrap">${link('Edit')}${link(isActive ? 'Retire' : 'Reinstate')}</span>`;
  }

  function codes() {
    return [...JPMS.data.costCodes, ...extraCodes].sort((first, second) => first.code.localeCompare(second.code));
  }

  JPMS.page('/cost-codes', {
    title: 'Cost Codes',
    render() {
      const rows = codes().map((code, index) => [`<span class="strong">${code.code}</span>`, code.name, (index + 1) * 10, ui.pill('Active', 'positive'), actions(true)]);
      return ui.join([
        money.sectionTabs(setupTabs, '/cost-codes'),
        ui.header({ subtitle: 'The global cost-code master. Every project\'s financials, valuation report and invoice allocations group by these codes. Retired codes keep their historical allocations.', primary: 'New cost code' }),
        `<div style="margin-bottom:24px">${money.segmented(['Our cost codes', 'Xero sites', 'Xero cost codes'])}</div>`,
        `<div class="row" style="justify-content:flex-end;gap:16px;margin-bottom:12px">${money.checkbox('Show retired')}${money.exportButton()}</div>`,
        ui.panel('', ui.table({ columns: ['Code', 'Name', { label: 'Sort order', num: true }, 'Status', ''], rows }), { flush: true })
      ]);
    }
  });
})();
