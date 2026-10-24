/* The invented work orders behind the Work Orders tab, its purchase orders and the Work Order bill. */
(function () {
  const order = (id, supplier, code, title, total, invoiced, paid, invoicing, payment, released) => ({ id, ref: id.toUpperCase(), supplier, code, title, total, invoiced, paid, invoicing, payment, released, status: 'Released' });

  const orders = [
    order('wo-0131', 'Northgate Groundworks Ltd', '2100', 'Bulk dig & muck-away — basement', 186400, 186400, 186400, 'Fully invoiced', 'Paid', '09 Mar 2026'),
    order('wo-0134', 'Northgate Groundworks Ltd', '2200', 'Basement slab & retaining walls', 242800, 214600, 198000, 'Part invoiced', 'Part paid', '20 Mar 2026'),
    order('wo-0136', 'Ashlar Stone & Masonry', '3100', 'Bath stone facing & dressings', 154200, 104800, 92500, 'Part invoiced', 'Part paid', '14 Apr 2026'),
    order('wo-0138', 'Timbercraft Joinery', '6300', 'Oak frame orangery — supply & erect', 118750, 59375, 59375, 'Part invoiced', 'Part paid', '05 May 2026'),
    order('wo-0139', 'Summit Roofing Ltd', '3300', 'Natural slate roof covering', 96300, 0, null, 'Not invoiced', 'Not linked', '26 May 2026'),
    order('wo-0140', 'Brightwire Electrical Ltd', '5200', 'Ground-floor electrical first fix', 72480, 24000, 0, 'Part invoiced', 'Unpaid', '08 Jul 2026'),
    order('wo-0141', 'Clearflow Plumbing & Heating', '5100', 'Underfloor heating & plant room', 64900, 18000, 18000, 'Part invoiced', 'Part paid', '29 Jul 2026'),
    order('wo-0142', 'Northgate Groundworks Ltd', '2100', 'External drainage & attenuation tank', 68450, 27380, 27380, 'Part invoiced', 'Part paid', '11 Aug 2026'),
    order('wo-0143', 'Harbour Glazing Systems', '4100', 'Slim-profile glazing — orangery', 88600, 0, null, 'Not invoiced', 'Not linked', '21 Aug 2026'),
    order('wo-0144', 'Evenline Plastering', '6100', 'Lime plaster — ground floor', 38250, 0, null, 'Not invoiced', 'Not linked', '04 Sep 2026'),
    order('wo-0145', 'Kestrel Timber Merchants', '3300', 'Roof timbers & battens', 14820, 14820, 14820, 'Fully invoiced', 'Paid', '10 Sep 2026')
  ];

  const drafts = [
    { id: 'draft-1', title: 'Terrace sub-base & land drainage', supplier: 'Greenway Landscapes', value: 42600, code: '8100' },
    { id: 'draft-2', title: 'Limestone flooring — supply only', supplier: 'Stoneleigh Tiles & Stone', value: 36980, code: '6100' }
  ];

  const bill = {
    supplier: 'Northgate Groundworks Ltd', number: 'NG-2291', date: '22 Sep 2026', net: 22600,
    rule: 'Matched by reference', tone: 'positive',
    orders: [
      { ref: 'WO-0142', title: 'External drainage & attenuation tank', value: 68450, invoiced: 27380, thisBill: 22600 },
      { ref: 'WO-0134', title: 'Basement slab & retaining walls', value: 242800, invoiced: 214600, thisBill: null }
    ],
    lines: [
      ['WO-0142 — attenuation tank supply & install (valuation 3)', '310 – Cost of sales', 16850],
      ['WO-0142 — foul drainage runs MH4–MH7', '310 – Cost of sales', 4950],
      ['WO-0142 — CCTV survey of new drainage', '310 – Cost of sales', 800]
    ]
  };

  const bySupplier = (name) => JPMS.data.subcontractors.find((company) => company.name === name);

  JPMS.partnersWorkOrders = { orders, drafts, bill, bySupplier };
})();
