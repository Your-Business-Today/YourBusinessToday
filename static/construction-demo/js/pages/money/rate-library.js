/* Rates — jpms/Pages/RateLibrary.razor with jpms/Components/RateTable.razor, under the Setup
   section tabs: the last price paid for each trade item, stale after 60 days. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;
  const setupTabs = [['Cost codes', '/cost-codes'], ['Rates', '/rate-library']];

  const rates = [
    ['Groundworks', 'Bulk excavation & cart away — basement', 'Northgate Groundworks Ltd', 'm³', 68, '14 Jul 2026'],
    ['Groundworks', 'Below-ground drainage run, 150mm, avg 1.2m deep', 'Northgate Groundworks Ltd', 'm', 142, '02 Sep 2026'],
    ['Masonry', 'Bath stone ashlar, sawn bed, laid', 'Ashlar Stone & Masonry', 'm²', 486, '21 Aug 2026'],
    ['Masonry', 'Handmade clay facing brick, Flemish bond', 'Ashlar Stone & Masonry', 'm²', 214, '09 Jun 2026'],
    ['Roofing', 'Natural slate, 500×250, on battens & membrane', 'Summit Roofing Ltd', 'm²', 118, '18 May 2026'],
    ['Roofing', 'Code 5 lead valley, dressed', 'Summit Roofing Ltd', 'm', 96, '18 May 2026'],
    ['Glazing', 'Bronze-framed fixed light, double glazed', 'Harbour Glazing Systems', 'm²', 1340, '12 Sep 2026'],
    ['Mechanical', 'Wet underfloor heating, screeded system', 'Clearflow Plumbing & Heating', 'm²', 64, '28 Aug 2026'],
    ['Electrical', 'First & second fix per point, LSF', 'Brightwire Electrical Ltd', 'point', 92, '03 Aug 2026'],
    ['Plastering', 'Two-coat lime plaster to masonry', 'Evenline Plastering', 'm²', 38, '11 Sep 2026'],
    ['Joinery', 'Oak internal door, lipped, hung with ironmongery', 'Timbercraft Joinery', 'nr', 1180, '24 Jul 2026'],
    ['Joinery', 'Oak staircase, closed string, per flight', 'Timbercraft Joinery', 'nr', 18400, '24 Jul 2026'],
    ['Landscaping', 'Sawn limestone paving on mortar bed', 'Greenway Landscapes', 'm²', 168, '30 Apr 2026'],
    ['Timber', 'C24 studwork 47×100, supplied', 'Kestrel Timber Merchants', 'm', 3, '19 Sep 2026']
  ];

  const staleDates = ['09 Jun 2026', '18 May 2026', '24 Jul 2026', '30 Apr 2026'];

  JPMS.page('/rate-library', {
    title: 'Rates',
    render() {
      const stale = rates.filter((rate) => staleDates.includes(rate[5])).length;
      const rows = rates.map(([trade, description, supplier, unit, value, priced]) => [`<span class="strong">${trade}</span>`, description, supplier, `<span class="subtle">${unit}</span>`, `<span class="strong">${ui.money(value)}</span>`, priced]);
      const staleLink = '<a class="muted" href="#/rate-library/stale" style="font-weight:500;text-decoration:underline;text-underline-offset:4px">View stale rates →</a>';
      return ui.join([
        money.sectionTabs(setupTabs, '/rate-library'),
        ui.header({ subtitle: `${rates.length} rates · ${stale} stale.`, actions: [money.exportButton(), staleLink] }),
        ui.panel('', ui.table({ columns: ['Trade', 'Description', 'Supplier', { label: 'Unit', num: true }, { label: 'Rate', num: true }, 'Last priced'], rows }), { flush: true })
      ]);
    }
  });
})();
