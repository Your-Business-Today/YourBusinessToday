/* One set of project figures behind Financials, Project Cashflow, Cash Forecast and Profit
   Summary — the portal's own arithmetic (FinancialsTable, ProjectCashflow): target cost is the
   contract sales value with the assumed 10% markup backed out, drawdown/overspend split by sign,
   locked lines realise their remainder to profit / loss. Hollowmere is priced by hand. */
(function () {
  const markup = 1.1;
  const retentionRate = 0.03;

  const centres = [
    { code: '1000', share: 412000, claim: 267800, wo: 0, nonWo: 238400, acos: 238400, invoiced: 0, costPct: 62 },
    { code: '2100', share: 268000, claim: 268000, wo: 188600, nonWo: 7400, acos: 183600, invoiced: 176200, costPct: 100, isLocked: true },
    { code: '2200', share: 596000, claim: 596000, wo: 441200, nonWo: 16300, acos: 457500, invoiced: 441200, costPct: 100, isLocked: true },
    { code: '3100', share: 342000, claim: 314640, wo: 268400, nonWo: 13600, acos: 262950, invoiced: 249350, costPct: 95, isLocked: true },
    { code: '3300', share: 238000, claim: 206760, wo: 181200, nonWo: 7300, acos: 176800, invoiced: 169500, costPct: 90, isLocked: true },
    { code: '4100', share: 286000, claim: 228800, wo: 263900, nonWo: 7500, acos: 214300, invoiced: 206800, costPct: 78 },
    { code: '5100', share: 318000, claim: 127200, wo: 212600, nonWo: 5800, acos: 104650, invoiced: 98850, costPct: 38 },
    { code: '5200', share: 214000, claim: 85600, wo: 148900, nonWo: 3200, acos: 71400, invoiced: 68200, costPct: 42 },
    { code: '6100', share: 146000, claim: 29200, wo: 96400, nonWo: 1900, acos: 24600, invoiced: 22700, costPct: 22 },
    { code: '6300', share: 262000, claim: 26200, wo: 176500, nonWo: 12800, acos: 31900, invoiced: 19100, costPct: 12 },
    { code: '7100', share: 148000, claim: 0, wo: 118600, nonWo: 0, acos: 0, invoiced: 0, costPct: 0 },
    { code: '7200', share: 126000, claim: 0, wo: 0, nonWo: 0, acos: 0, invoiced: 0, costPct: 0 },
    { code: '8100', share: 124000, claim: 6200, wo: 0, nonWo: 2100, acos: 2100, invoiced: 0, costPct: 4 }
  ];
  const hollowmereSum = 3480000;

  function spread(total, weights) {
    const weightSum = weights.reduce((sum, weight) => sum + weight, 0) || 1;
    const parts = weights.map((weight) => Math.round((total * weight) / weightSum));
    parts[parts.length - 1] += total - parts.reduce((sum, part) => sum + part, 0);
    return parts;
  }

  function completedCentre(target) {
    const committed = Math.round(target * 0.969);
    const wo = Math.round(committed * 0.94);
    return { wo, nonWo: committed - wo, acos: committed, invoiced: wo, costPct: 100, isLocked: true };
  }

  function liveCentre(centre, target, share) {
    const handPriced = Math.round(centre.share / markup) || 1;
    const ratio = (field) => centre[field] / handPriced;
    const at = (field, scale) => Math.round(target * ratio(field) * scale);
    return { wo: at('wo', Math.min(1, share + 0.2)), nonWo: at('nonWo', share), acos: at('acos', share), invoiced: at('invoiced', share), costPct: Math.round(centre.costPct * share), isLocked: false };
  }

  function idleCentre() {
    return { wo: 0, nonWo: 0, acos: 0, invoiced: 0, costPct: 0, isLocked: false };
  }

  function costSide(project, centre, target) {
    if (project.stage === 'Completed') return completedCentre(target);
    if (project.stage === 'Pre-construction') return idleCentre();
    return liveCentre(centre, target, Math.min(1, project.progress / 62));
  }

  function scaledCentres(project) {
    if (project.id === 'hollowmere') return centres.map((centre) => ({ ...centre, sales: centre.share }));
    const sales = spread(project.contractSum, centres.map((centre) => centre.share));
    const claimWeights = sales.map((value, index) => (project.progress ? value * Math.min(1, centres[index].claim / centres[index].share + 0.2) : 0));
    const claims = spread(project.valuedToDate, claimWeights);
    return centres.map((centre, index) => ({ code: centre.code, sales: sales[index], claim: claims[index], ...costSide(project, centre, Math.round(sales[index] / markup)) }));
  }

  function lineFigures(centre) {
    const name = JPMS.data.costCodes.find((code) => code.code === centre.code).name;
    const target = Math.round(centre.sales / markup);
    const committed = centre.wo + centre.nonWo;
    const remainder = target - committed;
    const drawdown = centre.isLocked ? 0 : Math.max(0, remainder);
    const overspend = centre.isLocked ? 0 : Math.min(0, remainder);
    const forecast = committed + drawdown;
    const profitLoss = centre.isLocked ? centre.sales - forecast : null;
    const complete = centre.sales ? (centre.claim / centre.sales) * 100 : 0;
    return { ...centre, name, target, committed, drawdown, overspend, forecast, profitLoss, complete };
  }

  function total(lines, field) {
    return lines.reduce((sum, line) => sum + (line[field] || 0), 0);
  }

  function cvr(project) {
    const lines = scaledCentres(project).map(lineFigures);
    const fields = ['sales', 'claim', 'target', 'wo', 'nonWo', 'committed', 'drawdown', 'overspend', 'forecast', 'profitLoss', 'acos', 'invoiced'];
    const totals = Object.fromEntries(fields.map((field) => [field, total(lines, field)]));
    totals.complete = totals.sales ? (totals.claim / totals.sales) * 100 : 0;
    return { lines, totals };
  }

  function variationsApproved(project) {
    return Math.round(project.contractSum * (148600 / hollowmereSum));
  }

  function cash(project) {
    const { totals } = cvr(project);
    const retentionHeld = Math.round(totals.claim * retentionRate);
    const awaitingPayment = project.stage === 'On site' ? Math.round(totals.claim * 0.0846) : 0;
    const received = totals.claim - retentionHeld - awaitingPayment;
    const allocated = received + retentionHeld;
    const toWithhold = Math.round((totals.sales - totals.claim) * retentionRate);
    const leftToClaim = totals.sales - allocated - toWithhold;
    const uninvoicedWos = totals.wo - totals.invoiced;
    const unpaidBills = JPMS.money.ledger.unpaidFor(project.id);
    const release = Math.round((totals.sales * retentionRate) / 2);
    const release1 = project.stage === 'Completed' ? 0 : release;
    const release2 = release;
    const practical = leftToClaim - totals.drawdown - uninvoicedWos - unpaidBills + release1;
    const completion = practical + release2;
    return { totals, retentionHeld, awaitingPayment, received, allocated, toWithhold, leftToClaim, uninvoicedWos, unpaidBills, release1, release2, practical, completion, buyBack: -totals.overspend };
  }

  function profit(project) {
    const { totals } = cvr(project);
    const variations = variationsApproved(project);
    const initial = project.contractSum - variations;
    const budgeted = initial - Math.round(initial / markup);
    const certified = totals.claim;
    const costToDate = totals.acos;
    const finalSales = totals.sales;
    const finalCost = totals.forecast;
    return { initial, variations, budgeted, certified, retention: Math.round(certified * retentionRate), costToDate, current: certified - costToDate, leftToCertify: finalSales - certified, costToComplete: finalCost - costToDate, toFinish: finalSales - certified - (finalCost - costToDate), finalSales, finalCost, forecast: finalSales - finalCost, costMovement: Math.round(initial / markup) - finalCost };
  }

  const valuationRuns = {
    hollowmere: [['Mar', 118600], ['Apr', 342900], ['May', 701400], ['Jun', 1096800], ['Jul', 1512200], ['Aug', 1968327], ['Sep', 2156400]],
    'coach-house': [['Jul', 196500], ['Aug', 454840], ['Sep', 498300]],
    wrenfield: [['Nov', 64200], ['Dec', 131800], ['Jan', 212400], ['Feb', 296900], ['Mar', 388100], ['Apr', 486300], ['May', 590700], ['Jun', 702500], ['Jul', 801600], ['Aug', 842000]]
  };

  function valuations(project) {
    const run = valuationRuns[project.id] || [];
    return run.map(([month, cumulative], index) => {
      const movement = cumulative - (index ? run[index - 1][1] : 0);
      return { number: index + 1, month, cumulative, movement, netDue: Math.round(movement * (1 - retentionRate)) };
    });
  }

  function percentOf(part, whole) {
    return whole ? `${((part / whole) * 100).toFixed(1)}%` : '—';
  }

  JPMS.money = Object.assign(JPMS.money || {}, { cvr, cash, profit, valuations, spread, percentOf, retentionRate });
})();
