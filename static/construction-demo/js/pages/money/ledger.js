/* The invented Xero ledger the Aged Receivables, Aged Payables, Weekly Cashflow and Xero
   Transactions pages all read, so every one of them ties to the others to the penny. Hollowmere's
   unpaid bills sum to the Project Cashflow's "Unpaid Xero purchase invoices"; INV-0031 is the
   valuation invoice its statement shows as awaiting payment. */
(function () {
  const bucketLabels = ['Current', '1 month', '2 months', '3 months', 'Older'];
  const weekStarts = ['21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct', '2 Nov', '9 Nov', '16 Nov', '23 Nov', '30 Nov', '7 Dec', '14 Dec'];

  const receivables = [
    { number: 'INV-0031', client: 'Mr & Mrs Whitfield', project: 'hollowmere', date: '18 Sep 2026', due: '02 Oct 2026', amount: 182431, bucket: 0, week: 1, description: 'Valuation 7 — net of 3% retention' },
    { number: 'INV-0029', client: 'Mr & Mrs Whitfield', project: 'hollowmere', date: '14 Aug 2026', due: '28 Aug 2026', amount: 3960, bucket: 1, week: 0, description: 'Client-direct extras — wine store racking' },
    { number: 'INV-0030', client: 'Ms Imogen Clarke', project: 'coach-house', date: '04 Sep 2026', due: '18 Sep 2026', amount: 42156, bucket: 1, week: 0, description: 'Valuation 3 — net of 3% retention' },
    { number: 'INV-0032', client: 'The Aldous Family Trust', project: 'kingsridge', date: '24 Sep 2026', due: '08 Oct 2026', amount: 18500, bucket: 0, week: 2, isDraft: true, description: 'Pre-construction services — September' },
    { number: 'INV-0027', client: 'Dr & Mr Okafor', project: 'wrenfield', date: '30 Jul 2026', due: '13 Aug 2026', amount: 6840, bucket: 2, week: 3, isMoved: true, description: 'Final account balance' }
  ];

  const payables = [
    { number: 'AS-2291', supplier: 'Ashlar Stone & Masonry', project: 'hollowmere', code: '3100', date: '31 Aug 2026', due: '30 Sep 2026', amount: 24860, bucket: 0, week: 1 },
    { number: 'HGS-10482', supplier: 'Harbour Glazing Systems', project: 'hollowmere', code: '4100', date: '12 Sep 2026', due: '12 Oct 2026', amount: 31200, bucket: 0, week: 3 },
    { number: 'CPH-0877', supplier: 'Clearflow Plumbing & Heating', project: 'hollowmere', code: '5100', date: '15 Aug 2026', due: '14 Sep 2026', amount: 12480, bucket: 1, week: 0 },
    { number: 'KT-55120', supplier: 'Kestrel Timber Merchants', project: 'hollowmere', code: '6300', date: '19 Sep 2026', due: '19 Oct 2026', amount: 6340, bucket: 0, week: 4, isDraft: true },
    { number: 'BW-3310', supplier: 'Brightwire Electrical Ltd', project: 'hollowmere', code: '5200', date: '29 Jul 2026', due: '28 Aug 2026', amount: 8140, bucket: 1, week: 1, isMoved: true },
    { number: 'MBS-77812', supplier: 'Meridian Builders Supplies', project: 'hollowmere', code: '1000', date: '22 Sep 2026', due: '22 Oct 2026', amount: 3400, bucket: 0, week: 4, isDraft: true },
    { number: 'NG-1140', supplier: 'Northgate Groundworks Ltd', project: 'coach-house', code: '2100', date: '05 Sep 2026', due: '05 Oct 2026', amount: 18920, bucket: 0, week: 2 },
    { number: 'SR-0662', supplier: 'Summit Roofing Ltd', project: 'coach-house', code: '3300', date: '10 Jul 2026', due: '09 Aug 2026', amount: 7450, bucket: 2, week: 0 },
    { number: 'STS-2034', supplier: 'Stoneleigh Tiles & Stone', project: 'coach-house', code: '7200', date: '18 Sep 2026', due: '18 Oct 2026', amount: 5410, bucket: 0, week: 4, isDraft: true },
    { number: 'GL-0419', supplier: 'Greenway Landscapes', project: 'wrenfield', code: '8100', date: '12 Jun 2026', due: '12 Jul 2026', amount: 4260, bucket: 3, week: 0 },
    { number: 'HSS-9021', supplier: 'Halden Site Services', project: null, code: '1000', date: '01 Sep 2026', due: '30 Sep 2026', amount: 2940, bucket: 0, week: 1 },
    { number: 'FVL-2209', supplier: 'Fleetwise Vehicle Leasing', project: null, code: '', date: '01 Sep 2026', due: '15 Sep 2026', amount: 1812, bucket: 1, week: 0 }
  ];

  function siteName(projectId) {
    const project = JPMS.data.projects.find((candidate) => candidate.id === projectId);
    return project ? project.name : '';
  }

  function unpaidFor(projectId) {
    return payables.filter((bill) => bill.project === projectId).reduce((sum, bill) => sum + bill.amount, 0);
  }

  function ageRows(documents, partyOf) {
    const parties = [...new Set(documents.map(partyOf))];
    return parties.map((party) => {
      const owned = documents.filter((document) => partyOf(document) === party);
      const buckets = bucketLabels.map((label, index) => owned.filter((document) => document.bucket === index).reduce((sum, document) => sum + document.amount, 0));
      return { party, documents: owned, buckets, total: owned.reduce((sum, document) => sum + document.amount, 0), hasDraft: owned.some((document) => document.isDraft) };
    }).sort((first, second) => second.total - first.total);
  }

  JPMS.money = Object.assign(JPMS.money || {}, { ledger: { bucketLabels, weekStarts, receivables, payables, siteName, unpaidFor, ageRows }, cashInBank: 412860 });
})();
