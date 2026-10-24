/* Xero Cost allocation — jpms/Pages/XeroAllocation.razor: the Financials · Xero section tabs, the
   page header, the matched-lines banner, the status/project tab bar and the open tab's lines. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const data = JPMS.allocationData;
  const rows = JPMS.allocationRows;
  const base = '#/finance/allocation';

  const tabs = [
    { key: 'unallocated', label: 'Unallocated', lines: () => data.queue.filter((line) => !line.project) },
    { key: 'hollowmere', label: 'Hollowmere House', lines: () => data.queue.filter((line) => line.project === 'Hollowmere House') },
    { key: 'coach-house', label: 'The Old Coach House', lines: () => data.queue.filter((line) => line.project === 'The Old Coach House') },
    { key: 'labour', label: 'Labour', count: 4 },
    { key: 'work-order-bills', label: 'Work Order bills', count: data.workOrderBills.length },
    { key: 'allocated', label: 'Allocated', count: 186 },
    { key: 'buckets', label: 'Buckets', count: 23 },
    { key: 'disputed', label: 'Disputed', count: 2 },
    { key: 'ignored', label: 'Ignored', count: 11 }
  ];

  function header() {
    const intro = 'Reconcile the accounts system with the projects: every Xero cost-of-sales purchase line (nominal accounts starting 3) is allocated to a project and master cost centre — or split across several centres. Suggestions come from the line’s Xero tracking — you confirm. Once every line of a draft bill (published from Dext) is allocated, its Sites and Cost Code tracking are confirmed back to Xero and the bill is approved automatically.';
    const links = '<div class="row" style="gap:16px;white-space:nowrap"><button type="button" class="muted" style="text-decoration:underline">Re-check matches</button><button type="button" class="muted" style="text-decoration:underline">Sync from Xero</button></div>';
    return `<header class="row-between" style="align-items:flex-end;margin-bottom:24px;flex-wrap:nowrap"><div><p class="eyebrow" style="margin-bottom:4px">JPMS · Financials · Xero</p><h1 class="text-2xl semibold">Cost allocation</h1><p class="muted" style="margin-top:8px;max-width:900px;line-height:20px">${intro}</p></div>${links}</header>`;
  }

  function tabBar(active) {
    const chips = tabs.map((tab) => {
      const count = tab.lines ? tab.lines().length : tab.count;
      const isActive = tab.key === active ? ' is-active' : '';
      return `<a class="chip${isActive}" href="${base}?tab=${tab.key}" style="border-radius:0;border-width:0 1px 0 0">${tab.label} (${count})</a>`;
    }).join('');
    return `<div style="display:inline-flex;flex-wrap:wrap;border:1px solid var(--line);border-radius:4px;overflow:hidden">${chips}</div>`;
  }

  function banner() {
    const matched = data.queue.filter((line) => line.project && line.centre).length;
    return `<div class="card row" style="margin-bottom:16px;background:var(--surface-raised)"><span class="muted"><span class="strong">${matched} lines</span> have both a project and a cost centre matched from their Xero tracking.</span>${rows.darkButton('Allocate all matched…')}<span class="text-xs subtle">Noted as auto-matched; each line stays reversible via Undo.</span></div>`;
  }

  function queueTable(lines) {
    const columns = ['<input type="checkbox">', 'Line', { label: 'Net', num: true }, 'Project', 'Cost centre', ''];
    return `<section class="panel">${ui.table({ columns, rows: lines.map(rows.queueRow), dense: true })}</section>`;
  }

  function allocatedTable() {
    const xeroChips = ui.chips([{ label: 'All', count: 186 }, { label: 'Draft in Xero', count: 7 }, { label: 'Write-back failed', count: 1 }]);
    const columns = ['<input type="checkbox">', 'Line', { label: 'Net', num: true }, 'Allocated to', 'By', ''];
    return xeroChips + `<section class="panel">${ui.table({ columns, rows: data.allocated.map(rows.allocatedRow), dense: true })}</section>`;
  }

  function toolbarRow(active) {
    const filter = active === 'allocated' ? frame.select(['All projects', ...JPMS.data.projects.map((project) => project.name)], '176px') : '';
    const placeholder = active === 'allocated' ? 'Search supplier, cost centre, number…' : 'Search supplier, description, number…';
    const right = `<div class="row" style="gap:16px">${ui.btn('Export to Excel', 'secondary', { icon: frame.paths.excel })}${filter}<input class="field" style="height:32px;width:256px;font-size:14px;padding:0 12px" placeholder="${placeholder}"></div>`;
    return `<div class="row-between" style="margin-bottom:16px">${tabBar(active)}${right}</div>`;
  }

  function body(active) {
    if (active === 'allocated') return allocatedTable();
    if (active === 'work-order-bills') return JPMS.allocationBills.strip() + data.workOrderBills.map(JPMS.allocationBills.card).join('');
    const tab = tabs.find((entry) => entry.key === active && entry.lines);
    if (!tab) return ui.panel('', ui.empty('Nothing on this tab in the demo — open Unallocated, Allocated or Work Order bills.'));
    return banner() + queueTable(tab.lines());
  }

  JPMS.page('/finance/allocation', {
    title: 'Xero Cost Allocation',
    render() {
      const active = frame.query().tab || 'unallocated';
      const sections = ui.tabs([{ label: 'Allocation', href: base }, { label: 'Transactions', href: '#/finance/xero' }], 0);
      const syncNote = '<div class="card muted" style="margin-bottom:24px;background:var(--surface-raised)">Synced from Xero at 07:40 — 214 purchase lines read, 9 new since yesterday, 3 updated.</div>';
      return ui.join([sections, header(), syncNote, toolbarRow(active), body(active)]);
    }
  });
})();
