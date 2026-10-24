/* The invented bill behind the Valuation Report: contract works by area, provisional and
   contingency sums, approved variations read as V-numbers, the claims and valuation invoices.
   Hollowmere is the full bill; every other project reads the same bill scaled to its own size. */
(function () {
  const contractWorks = [
    ['Preliminaries', '1000', 'Site set-up, welfare and hoarding', 1, 48500, 100, 100],
    ['Preliminaries', '1000', 'Site management and supervision', 58, 2450, 48, 55],
    ['Preliminaries', '1000', 'Scaffolding — full perimeter and chimney stacks', 1, 64800, 70, 80],
    ['Groundworks & substructure', '2100', 'Basement excavation, muck away and dewatering', 1, 186400, 100, 100],
    ['Groundworks & substructure', '2100', 'Below-ground foul and surface water drainage', 1, 58300, 85, 95],
    ['Groundworks & substructure', '2200', 'Basement RC box, waterproofing and sump', 1, 412600, 90, 100],
    ['Superstructure', '3100', 'Bath stone facing and ashlar dressings', 1, 298200, 45, 60],
    ['Superstructure', '3100', 'Blockwork inner leaf and cavity insulation', 1, 86900, 80, 95],
    ['Superstructure', '3300', 'Green oak roof structure and trusses', 1, 164500, 60, 85],
    ['Superstructure', '3300', 'Natural slate, leadwork and rainwater goods', 1, 118700, 10, 40],
    ['Superstructure', '4100', 'Slimline steel windows and garden doors', 1, 226400, 0, 30],
    ['Services', '5100', 'Mechanical first fix including underfloor heating', 1, 196800, 35, 55],
    ['Services', '5200', 'Electrical first fix, containment and data', 1, 142300, 30, 50],
    ['Finishes', '6100', 'Plastering, drylining and lime render', 1, 124600, 0, 15],
    ['Finishes', '6300', 'Bespoke joinery including oak staircase', 1, 268000, 5, 12],
    ['Finishes', '7100', 'Kitchen — supply and install', 1, 142000, 0, 0],
    ['Finishes', '7200', 'Bathrooms and sanitaryware', 1, 96500, 0, 0],
    ['Externals', '8100', 'Hard landscaping, terraces and driveway', 1, 168900, 0, 0]
  ];

  const provisionalSums = [
    ['', '5200', 'PS — Home automation and AV', 1, 65000, 0, 0],
    ['', '8100', 'PS — Swimming pond liner and filtration', 1, 48000, 0, 0],
    ['', '7100', 'PS — Appliances to client selection', 1, 38000, 0, 0]
  ];

  const contingency = [['', '1000', 'Contract contingency', 1, 120000, 0, 0]];

  const variations = [
    ['V3', 'Enlarged basement lightwell', '2200', 38400, 100, 100, 3],
    ['V7', 'Oak cladding to garage elevation', '6300', 24600, 20, 60, 2],
    ['V9', 'Upgrade to air source heat pump', '5100', 31200, 0, 40, 4],
    ['V11', 'Boot room joinery — client change', '6300', 12850, 0, 0, 2],
    ['V12', 'Omit feature pond planting', '8100', -14200, 0, 0, 1],
    ['V14', 'Steel lintel and widened kitchen opening', '3100', 8960, 0, 100, 3]
  ];

  const sum = (values) => values.reduce((total, value) => total + value, 0);

  function centreName(code) {
    const entry = JPMS.data.costCodes.find((costCode) => costCode.code === code);
    return entry ? `${code} · ${entry.name}` : code;
  }

  function spread(total, weights) {
    const weightSum = sum(weights) || 1;
    const parts = weights.map((weight) => Math.round((total * weight) / weightSum));
    parts[parts.length - 1] += total - sum(parts);
    return parts;
  }

  function roomFor(caps, result) {
    return caps.map((cap, index) => cap - result[index]);
  }

  function openWeights(weights, room) {
    const open = weights.map((weight, index) => (room[index] > 0.01 && weight > 0 ? weight : 0));
    return open.some(Boolean) ? open : room.map((space) => Math.max(0, space));
  }

  function roundExactly(result, total, caps) {
    const rounded = result.map(Math.round);
    const gap = total - sum(rounded);
    const room = roomFor(caps, rounded);
    const absorber = room.indexOf(Math.max(...room));
    rounded[absorber] += gap;
    return rounded;
  }

  function fill(total, weights, caps) {
    const result = caps.map(() => 0);
    for (let pass = 0; pass < 40 && total - sum(result) > 0.01; pass += 1) {
      const remaining = total - sum(result);
      const room = roomFor(caps, result);
      const open = openWeights(weights, room);
      const openSum = sum(open);
      if (!openSum) break;
      open.forEach((weight, index) => { result[index] += Math.min(room[index], (remaining * weight) / openSum); });
    }
    return roundExactly(result, total, caps);
  }

  function variationsTotalFor(project) {
    if (JPMS.money && JPMS.money.profit) return JPMS.money.profit(project).variations;
    return Math.round(project.contractSum * (148600 / 3480000));
  }

  function baseLines(project, variationsTotal) {
    const rows = [...contractWorks.map((row) => ['contractWorks', row]), ...provisionalSums.map((row) => ['provisionalSums', row]), ...contingency.map((row) => ['contingency', row])];
    const target = project.contractSum - variationsTotal;
    const factor = target / sum(rows.map(([, row]) => row[3] * row[4]));
    const lines = rows.map(([section, [area, code, title, quantity, rate, previous, percent]]) => {
      const scaledRate = Math.round(rate * factor);
      return { section, area, code, title, quantity, rate: scaledRate, amount: quantity * scaledRate, rawPrevious: previous, rawPercent: percent, centre: centreName(code) };
    });
    const last = lines[lines.length - 1];
    last.amount += target - sum(lines.map((line) => line.amount));
    last.rate = last.amount;
    return lines;
  }

  function variationLines(variationsTotal) {
    const amounts = spread(variationsTotal, variations.map((row) => row[3]));
    return variations.map(([reference, title, code, , previous, percent, lineCount], index) => ({ section: 'variations', reference, title, code, amount: amounts[index], rawPrevious: previous, rawPercent: percent, lineCount, centre: centreName(code) }));
  }

  function settle(entries, latest) {
    const cumulative = latest ? latest.cumulative : 0;
    const before = latest ? latest.cumulative - latest.movement : 0;
    const caps = entries.map((entry) => Math.max(0, entry.amount));
    const claimedAmounts = fill(cumulative, entries.map((entry) => Math.max(0, entry.amount) * entry.rawPercent), caps);
    const movementWeights = entries.map((entry) => Math.max(0, entry.amount) * Math.max(0, entry.rawPercent - entry.rawPrevious));
    const movements = fill(cumulative - before, movementWeights, claimedAmounts);
    const previousAmounts = claimedAmounts.map((amount, index) => amount - movements[index]);
    return entries.map((entry, index) => {
      const percentOf = (value) => (entry.amount > 0 ? (value / entry.amount) * 100 : 0);
      return { ...entry, claimedAmount: claimedAmounts[index], previousAmount: previousAmounts[index], percent: percentOf(claimedAmounts[index]), previous: percentOf(previousAmounts[index]) };
    });
  }

  function billFor(project, latest) {
    const variationsTotal = variationsTotalFor(project);
    const entries = settle([...baseLines(project, variationsTotal), ...variationLines(variationsTotal)], latest);
    const of = (section) => entries.filter((entry) => entry.section === section);
    return { contractWorks: of('contractWorks'), provisionalSums: of('provisionalSums'), contingency: of('contingency'), variations: of('variations') };
  }

  JPMS.valuationData = { billFor };
})();
