/* The claims behind the Valuation Report, read from the money group's valuation run
   (JPMS.money.valuations) so the report agrees with Financials, Project Cashflow, Payment
   Certificates and Aged Receivables: each claim's period, its valuation invoice (VI-####, net of
   retention) and the Xero sales invoice it was raised as. */
(function () {
  const monthNames = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
  const lateYearMonths = ['Oct', 'Nov', 'Dec'];

  const xeroRuns = {
    hollowmere: { numbers: ['INV-0008', 'INV-0011', 'INV-0014', 'INV-0017', 'INV-0020', 'INV-0024', 'INV-0031'], current: { date: '18 Sep 2026', due: '02 Oct 2026' } },
    'coach-house': { numbers: ['INV-0022', 'INV-0026', 'INV-0030'], current: { date: '04 Sep 2026', due: '18 Sep 2026' } },
    wrenfield: { numbers: ['INV-0002', 'INV-0003', 'INV-0005', 'INV-0007', 'INV-0009', 'INV-0012', 'INV-0015', 'INV-0018', 'INV-0021', 'INV-0028'], current: { date: '14 Aug 2026', due: '28 Aug 2026' } }
  };

  function yearOf(project, month) {
    const startsLastYear = project.start.endsWith('2025');
    return startsLastYear && lateYearMonths.includes(month) ? 2025 : 2026;
  }

  function invoiceNumber(position) {
    return `VI-${String(position).padStart(4, '0')}`;
  }

  function claimsFor(project) {
    const run = JPMS.money && JPMS.money.valuations ? JPMS.money.valuations(project) : [];
    const xero = xeroRuns[project.id] || { numbers: [], current: { date: '25 Sep 2026', due: '09 Oct 2026' } };
    return run.map((valuation, index) => {
      const year = yearOf(project, valuation.month);
      const isLatest = index === run.length - 1;
      const date = isLatest ? xero.current.date : `14 ${valuation.month} ${year}`;
      return { ...valuation, name: `${monthNames[valuation.month]} ${year}`, period: `${valuation.month} ${year}`, invoice: invoiceNumber(valuation.number), xeroNumber: xero.numbers[index] || `INV-00${10 + index}`, date, due: isLatest ? xero.current.due : null };
    });
  }

  JPMS.valuationClaims = { claimsFor, invoiceNumber };
})();
