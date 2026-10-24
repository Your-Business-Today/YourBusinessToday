/* The Valuation Report's arithmetic — section totals, the valuation summary (ValuationSummaryPanel)
   and the valuation invoices drawn against each claim — read off the one bill and the claims. */
(function () {
  const retentionPercent = 3;
  const issuedStages = ['awaiting-payment', 'ready-to-confirm', 'confirmed'];

  function claimed(entry) {
    return entry.claimedAmount;
  }

  function period(entry) {
    return entry.claimedAmount - entry.previousAmount;
  }

  function sum(entries, measure) {
    return entries.reduce((total, entry) => total + measure(entry), 0);
  }

  function sectionTotals(entries) {
    const amount = sum(entries, (entry) => entry.amount);
    const claimedTotal = sum(entries, claimed);
    const percent = amount ? (claimedTotal / amount) * 100 : 0;
    return { amount, claimed: claimedTotal, percent, period: sum(entries, period) };
  }

  function allEntries(bill) {
    return [...bill.contractWorks, ...bill.provisionalSums, ...bill.contingency, ...bill.variations];
  }

  function summary(bill, stage, claims) {
    const latest = claims[claims.length - 1];
    const contractSum = sum([...bill.contractWorks, ...bill.provisionalSums, ...bill.contingency], (entry) => entry.amount);
    const netVariations = sum(bill.variations, (entry) => entry.amount);
    const worksComplete = sum(allEntries(bill), claimed);
    const certifiedBefore = sum(claims.slice(0, -1), (claim) => claim.netDue);
    const invoiceAmount = latest ? latest.netDue : 0;
    const isIssued = issuedStages.includes(stage);
    const certifiedToDate = isIssued ? certifiedBefore + invoiceAmount : certifiedBefore;
    return {
      contractSum, netVariations, revisedSum: contractSum + netVariations, worksComplete, period: sum(allEntries(bill), period),
      retentionHeld: Math.round((worksComplete * retentionPercent) / 100), certifiedBefore, certifiedToDate, invoiceAmount,
      paymentDue: isIssued ? 0 : invoiceAmount, invoiceNumber: latest ? latest.invoice : '', xeroNumber: latest ? latest.xeroNumber : '', invoiceDate: latest ? latest.date : '', invoiceDue: latest ? latest.due : ''
    };
  }

  const currentInvoiceStatus = {
    'invoice-draft': 'Draft',
    'awaiting-approval': 'Awaiting approval',
    approved: 'Approved',
    'awaiting-payment': 'Issued',
    'ready-to-confirm': 'Paid',
    confirmed: 'Paid'
  };

  function invoiceRow(claim, status, isRaisedInXero) {
    return { number: claim.invoice, period: claim.period, amount: claim.netDue, status, paid: status === 'Paid' ? claim.netDue : 0, xeroNumber: isRaisedInXero ? claim.xeroNumber : null };
  }

  function invoices(stage, claims) {
    const earlier = claims.slice(0, -1).map((claim) => invoiceRow(claim, 'Paid', true));
    const status = currentInvoiceStatus[stage];
    if (!status || !claims.length) return earlier;
    return [...earlier, invoiceRow(claims[claims.length - 1], status, issuedStages.includes(stage))];
  }

  JPMS.valuationFigures = { claimed, period, sectionTotals, summary, invoices, retentionPercent };
})();
