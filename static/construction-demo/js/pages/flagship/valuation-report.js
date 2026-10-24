/* The Valuation Report's bill — ValuationReportTable.razor: one accordion per section (Contract
   Works by area, Provisional Sums, Contingency Sums, Variations consolidated per V-number), each
   line's cumulative % complete against its cost centre, and the claimed / this-period figures. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const figures = JPMS.valuationFigures;
  const pct = (value) => ui.percent(value, 1);

  function accordionHeader(title, lineCount, totals, unit, isOpen) {
    const count = `${lineCount} ${lineCount === 1 ? unit : unit + 's'}`;
    const claim = `<span><span class="eyebrow" style="margin-right:6px">Claimed</span><span class="muted">${ui.money(totals.claimed)} (${pct(totals.percent)})</span></span><span><span class="eyebrow" style="margin-right:6px">This period</span><span class="muted">${ui.money(totals.period)}</span></span>`;
    return `<summary class="row" style="padding:12px 16px;cursor:pointer;list-style:none;flex-wrap:nowrap">${frame.chevron(isOpen)}<span class="semibold" style="white-space:nowrap">${title}</span><span class="text-xs subtle" style="white-space:nowrap">${count}</span><span class="row" style="margin-left:auto;gap:24px;flex-wrap:nowrap;white-space:nowrap">${claim}<span><span class="eyebrow" style="margin-right:6px">Total</span><span class="strong">${ui.money(totals.amount)}</span></span></span></summary>`;
  }

  function percentCell(entry, isDraft) {
    if (!isDraft) return `<span class="muted">${pct(entry.percent)}</span>`;
    return `<input class="field" style="height:26px;width:72px;font-size:13px;padding:0 6px;text-align:right" value="${entry.percent.toFixed(1)}">`;
  }

  function lineRow(entry, isDraft) {
    const period = figures.period(entry);
    const periodCell = period === 0 ? `<span class="subtle">${ui.money(0)}</span>` : ui.money(period);
    const edit = isDraft ? ['<span class="text-xs subtle" style="text-decoration:underline">Edit</span> <span class="text-xs tone-negative" style="text-decoration:underline;margin-left:6px">Remove</span>'] : [];
    return `<tr>${[ui.mono(entry.code), `<span class="strong">${entry.title}</span>`, `<span class="muted">${entry.centre}</span>`, entry.quantity, entry.rate.toLocaleString('en-GB'), `<span class="strong">${entry.amount.toLocaleString('en-GB')}</span>`, `<span class="subtle">${pct(entry.previous)}</span>`, percentCell(entry, isDraft), ui.money(figures.claimed(entry)), periodCell, ...edit].map((cell, index) => `<td class="${index > 2 && index < 10 ? 'num' : ''}">${cell}</td>`).join('')}</tr>`;
  }

  function areaRow(area, columnCount) {
    return `<tr><td colspan="${columnCount}" class="text-xs semibold" style="height:auto;padding-top:14px;padding-bottom:6px">${area}</td></tr>`;
  }

  function rollUpRow(entry, isDraft, projectId) {
    const period = figures.period(entry);
    const title = `<span class="row" style="gap:6px;flex-wrap:nowrap;align-items:flex-start">${frame.chevron(false)}<span><span class="strong">${entry.title}</span><span class="text-xs subtle" style="display:block">${entry.lineCount} lines consolidated</span></span></span>`;
    const edit = isDraft ? ['<span class="text-xs subtle" style="text-decoration:underline">Show lines</span>'] : [];
    const cells = [ui.link(entry.reference, `#/projects/${projectId}/variations/${entry.reference.toLowerCase()}`), title, entry.centre, '—', '—', `<span class="strong">${entry.amount.toLocaleString('en-GB')}</span>`, `<span class="subtle">${pct(entry.previous)}</span>`, `<span class="muted">${pct(entry.percent)}</span>`, ui.money(figures.claimed(entry)), ui.money(period), ...edit];
    return `<tr style="background:var(--surface-raised)">${cells.map((cell, index) => `<td class="${index > 2 && index < 10 ? 'num' : ''}">${cell}</td>`).join('')}</tr>`;
  }

  function head(isDraft) {
    const labels = ['Code', 'Description', 'Cost centre', 'Qty', 'Rate £', 'Amount £', 'Prev. %', '% Complete', 'Claimed £', 'Period £', ...(isDraft ? [''] : [])];
    return `<thead><tr>${labels.map((label, index) => `<th class="${index > 2 && index < 10 ? 'num' : ''}">${label}</th>`).join('')}</tr></thead>`;
  }

  function linesBody(entries, isDraft, isGrouped) {
    let currentArea = '';
    return entries.map((entry) => {
      const startsArea = isGrouped && entry.area !== currentArea;
      currentArea = entry.area;
      return (startsArea ? areaRow(entry.area, isDraft ? 11 : 10) : '') + lineRow(entry, isDraft);
    }).join('');
  }

  function section(title, entries, options) {
    const totals = figures.sectionTotals(entries);
    const body = options.isRollUp ? entries.map((entry) => rollUpRow(entry, options.isDraft, options.projectId)).join('') : linesBody(entries, options.isDraft, options.isGrouped);
    const table = `<div class="table-wrap" style="border-top:1px solid var(--line)"><table class="data-table data-table-dense">${head(options.isDraft)}<tbody>${body}</tbody></table></div>`;
    return `<details class="panel" style="margin-bottom:12px" ${options.isOpen ? 'open' : ''}>${accordionHeader(title, entries.length, totals, 'line', options.isOpen)}${table}</details>`;
  }

  function bill(billData, isDraft, projectId) {
    return [
      section('Contract Works', billData.contractWorks, { isDraft, isGrouped: true, isOpen: true }),
      section('Provisional Sums', billData.provisionalSums, { isDraft }),
      section('Contingency Sums', billData.contingency, { isDraft }),
      section('Variations', billData.variations, { isDraft, isRollUp: true, isOpen: true, projectId })
    ].join('');
  }

  JPMS.valuationReport = { bill, accordionHeader };
})();
