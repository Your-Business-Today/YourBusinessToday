/* Invented Xero purchase-ledger lines for the Cost allocation page — the Unallocated queue, the
   Allocated tab with each line's write-back state, and the Work Order bills awaiting one Approve. */
(function () {
  const queue = [
    { supplier: 'Ashlar Stone & Masonry', isDraft: true, description: 'Bath stone ashlar, sawn six sides — front elevation quoins, delivery 2 of 3', date: '22 Sep 2026', number: 'ASM-20417', site: 'Hollowmere', code: '3100 Masonry', net: 18640.0, project: 'Hollowmere House', centre: '3100 · Masonry', hasDocument: true },
    { supplier: 'Kestrel Timber Merchants', isDraft: true, description: 'Green oak frame members, 200x200 posts and 250x150 tie beams', date: '21 Sep 2026', number: 'KT-88213', site: 'Hollowmere', code: '6300 Joinery', net: 9212.5, project: 'Hollowmere House', centre: '6300 · Joinery', hasDocument: true },
    { supplier: 'Harbour Glazing Systems', isDraft: true, description: 'Slimline steel doors — deposit 40% against order HGS/4471', date: '19 Sep 2026', number: 'HGS-10292', site: 'Coach House', code: '4100 Windows & ext doors', net: 14880.0, project: 'The Old Coach House', centre: '4100 · Windows & external doors', hasDocument: true, writeFailed: true },
    { supplier: 'Meridian Builders Supplies', isDraft: false, description: 'Type 1 sub-base 40t, 150mm land drain, geotextile', date: '18 Sep 2026', number: 'MBS-557102', site: 'no site', code: 'no Xero code', net: 3146.28, project: '', centre: '', hasDocument: true },
    { supplier: 'Downland Plant Hire', isDraft: false, description: '8t excavator with operator, week ending 18 Sep', date: '18 Sep 2026', number: 'DPH-7730', site: 'Coach House', code: '2100 Groundworks', net: 2290.0, project: 'The Old Coach House', centre: '2100 · Groundworks & drainage', hasDocument: false },
    { supplier: 'Stoneleigh Tiles & Stone', isDraft: true, description: 'Honed limestone floor tiles 600x600, kitchen and boot room', date: '17 Sep 2026', number: 'STS-3318', site: 'Hollowmere', code: 'no Xero code', net: 7488.0, project: 'Hollowmere House', centre: '', hasDocument: true },
    { supplier: 'Weald Skip & Waste', isDraft: false, description: '12yd skip exchange x3, mixed C&D waste', date: '16 Sep 2026', number: 'WSW-40981', site: 'no site', code: 'no Xero code', net: 845.0, project: '', centre: '', hasDocument: false, bucket: 'Overheads' },
    { supplier: 'Meridian Builders Supplies', isDraft: false, description: 'Credit — returned Celotex 100mm boards, 14 no.', date: '15 Sep 2026', number: 'MBS-CN-1187', site: 'Hollowmere', code: '6100 Plastering', net: -612.4, project: 'Hollowmere House', centre: '6100 · Plastering & drylining', hasDocument: true, isCredit: true },
    { supplier: 'Clearflow Plumbing & Heating', isDraft: true, description: 'Application 4 — first-fix plumbing and UFH manifolds', date: '12 Sep 2026', number: 'CPH-0214', site: 'no site', code: '5100 Mechanical', net: 21650.0, project: '', centre: '5100 · Mechanical services', hasDocument: true, exception: 'the bill total is over WO-0151’s remaining value' },
    { supplier: 'Tallis Scaffolding Ltd', isDraft: true, description: 'Scaffold hire weeks 9–12, rear elevation and chimney stack', date: '11 Sep 2026', number: 'TSL-6604', site: 'no site', code: '1000 Preliminaries', net: 4380.0, project: '', centre: '1000 · Preliminaries', hasDocument: true },
    { supplier: 'Kestrel Timber Merchants', isDraft: false, description: 'Site consumables — fixings, sealants, PPE', date: '10 Sep 2026', number: 'KT-87991', site: 'no site', code: 'no Xero code', net: 486.72, project: '', centre: '', hasDocument: true },
    { supplier: 'Brightwire Electrical Ltd', isDraft: false, description: 'Temporary site supply and distribution board — hire', date: '09 Sep 2026', number: 'BWE-3007', site: 'no site', code: '1000 Preliminaries', net: 1125.0, project: '', centre: '1000 · Preliminaries', hasDocument: false }
  ];

  const allocated = [
    { supplier: 'Northgate Groundworks Ltd', description: 'Valuation 6 — basement dig and muck away, retaining wall base', date: '15 Sep 2026', number: 'NGL-1106', site: 'Hollowmere', code: '2200 Substructure', net: 38420.0, project: 'Hollowmere House', centre: '2200 · Substructure', state: 'approved', at: '23 Sep 2026 10:14', by: 'Emma Walsh', byDate: '23 Sep 2026' },
    { supplier: 'Kestrel Timber Merchants', description: 'Oak cladding boards and battens — split across two jobs', date: '10 Sep 2026', number: 'KT-88006', site: 'Hollowmere', code: '6300 Joinery', net: 6420.0, splits: [['Hollowmere House', '6300 · Joinery', 4180.0], ['The Old Coach House', '6300 · Joinery', 2240.0]], state: 'approved', at: '22 Sep 2026 16:02', by: 'Daniel Price', byDate: '22 Sep 2026' },
    { supplier: 'Brightwire Electrical Ltd', description: 'Application 3 — first-fix electrics, ground and first floor', date: '11 Sep 2026', number: 'BWE-3021', site: 'Hollowmere', code: '5200 Electrical', net: 16975.0, project: 'Hollowmere House', centre: '5200 · Electrical services', state: 'failed', status: 'Draft', error: 'Xero refused the update: the tracking option "Hollowmere" is archived in the Sites category — restore it in Xero, then retry.', by: 'Emma Walsh', byDate: '24 Sep 2026' },
    { supplier: 'Summit Roofing Ltd', description: 'Natural slate, lead flashings and ridge — main roof', date: '08 Sep 2026', number: 'SRL-0877', site: 'Hollowmere', code: '3300 Roof', net: 24310.0, project: 'Hollowmere House', centre: '3300 · Roof structure & covering', state: 'approved', at: '24 Sep 2026 17:40', earlierFailure: '24 Sep 2026 16:12', error: 'Xero was unavailable (503 Service Unavailable) — nothing was written; press Retry Xero.', by: 'Daniel Price', byDate: '24 Sep 2026' },
    { supplier: 'Stoneleigh Tiles & Stone', isDraft: true, description: 'Porcelain wall tiles — family bathroom and en-suite', date: '19 Sep 2026', number: 'STS-3301', site: 'Coach House', code: '7200 Bathrooms', net: 3960.0, project: 'The Old Coach House', centre: '7200 · Bathrooms & sanitaryware', state: 'draft', by: 'Ravi Patel', byDate: '24 Sep 2026' },
    { supplier: 'Evenline Plastering', description: 'Skim coat, ground floor — 212m²', date: '05 Sep 2026', number: 'EVP-0419', site: 'Coach House', code: '6100 Plastering', net: 5830.0, project: 'The Old Coach House', centre: '6100 · Plastering & drylining', state: 'approved', at: '12 Sep 2026 09:31', workOrder: 'WO-0139', by: 'Emma Walsh', byDate: '12 Sep 2026' },
    { supplier: 'Greenway Landscapes', description: 'Final account — soft landscaping and planting', date: '28 Aug 2026', number: 'GWL-2290', site: 'Wrenfield', code: '8100 External works', net: 11240.0, project: 'Wrenfield Barn', centre: '8100 · External works & landscaping', state: 'outside', status: 'Paid', by: 'Daniel Price', byDate: '02 Sep 2026' }
  ];

  const workOrderBills = [
    {
      supplier: 'Timbercraft Joinery', number: 'TCJ-1142', date: '20 Sep 2026', rule: 'Matched by reference', tone: 'positive', net: 12600.0,
      orders: [{ reference: 'WO-0142', title: 'Bespoke oak staircase — manufacture', project: 'Hollowmere House', value: 42000.0, invoiced: 16800.0, thisBill: 12600.0 }],
      lines: [['Staircase stage payment 2 — strings and treads machined', '6300 · Joinery', 12600.0]]
    },
    {
      supplier: 'Northgate Groundworks Ltd', number: 'NGL-1111', date: '23 Sep 2026', rule: "Supplier's orders — figures to set", tone: 'warning', net: 9350.0,
      orders: [
        { reference: 'WO-0144', title: 'Foul and surface water drainage', project: 'The Old Coach House', value: 18400.0, invoiced: 6200.0, thisBill: 6150.0 },
        { reference: 'WO-0147', title: 'Driveway sub-base and edgings', project: 'The Old Coach House', value: 7900.0, invoiced: 0.0, thisBill: 3200.0 }
      ],
      lines: [['Drainage runs 3–5, inspection chambers', '2100 · Groundworks & drainage', 6150.0], ['Driveway dig and Type 1', '8100 · External works & landscaping', 3200.0]]
    }
  ];

  JPMS.allocationData = { queue, allocated, workOrderBills };
})();
