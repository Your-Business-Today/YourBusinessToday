/* Trades — jpms/Pages/AdminTrades.razor: the curated list every directory record and bid package
   picks its trade from, with how many companies carry each. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;

  const trades = [
    ['Bricklaying', 3], ['Carpentry — first fix', 4], ['Decorating', 2], ['Drylining', 3], ['Electrical', 5],
    ['Glazing', 2], ['Groundworks', 4], ['Joinery — bespoke', 3], ['Landscaping', 2], ['Leadwork', 0],
    ['Masonry — stone', 2], ['Mechanical', 4], ['Plastering — lime', 2], ['Roofing — clay & slate', 3],
    ['Scaffolding', 3], ['Steel fabrication', 1], ['Tanking & waterproofing', 2], ['Tiling', 2]
  ];

  function row([name, usage]) {
    const usedBy = usage === 0 ? '—' : `${usage} compan${usage === 1 ? 'y' : 'ies'}`;
    const actions = `<div class="row" style="justify-content:flex-end;gap:8px">${ui.btn('Rename', 'secondary', { class: 'text-xs' })}<button type="button" class="btn btn-ghost text-xs tone-negative" ${usage ? 'disabled style="opacity:.5"' : ''}>Delete</button></div>`;
    return [`<span class="strong">${name}</span>`, usedBy, actions];
  }

  JPMS.page('/admin/trades', {
    title: 'Trades',
    render() {
      const adder = `<div class="row" style="margin-bottom:16px;flex-wrap:nowrap"><input class="field" style="flex:1" placeholder="e.g. Electrician">${ui.btn('Add trade', 'primary')}</div>`;
      const table = ui.table({ columns: ['Trade', 'In use by', ''], rows: trades.map(row), dense: true });
      const note = `<p class="text-xs subtle" style="margin-top:8px">“In use by” counts every company record carrying the trade — including tender-only prospects that aren't shown in the Directory. Existing bid packages keep the trade name they were created with, so renames and deletes never rewrite tender history.</p>`;
      return ui.join([
        shared.adminTabs(4),
        shared.header({ subtitle: 'The curated list every directory record and bid package picks its trade from. Renaming updates every directory record carrying the trade; deleting is only possible once no record carries it.' }),
        `<div style="max-width:42rem">${ui.panel('Curated trades', [adder, table, note])}</div>`
      ]);
    }
  });
})();
