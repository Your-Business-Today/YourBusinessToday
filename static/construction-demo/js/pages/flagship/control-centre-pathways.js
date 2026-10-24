/* The Control Centre's pathway panes — PathwayPane fed by PathwayPaneConfig: Client, Subcontractor,
   Supplier, Sales and Internal, each with its Tagging tab (record sections, candidates first, and
   the record-less registers) and its Actions tab (this side's system actions, staged for Apply). */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;

  const configs = {
    client: { name: 'Client', hint: 'The client, or their architect and team', types: ['Requests / RFIs', 'Variation Orders', 'Building Control Inspections', 'Building Control Cases', 'LADs claims', 'Valuation reports'], registers: [], actions: [['Raise something new', ['Raise RFI', 'Raise Variation Order', 'Raise Building Control Inspection']], ['Move an existing record on', ['Promote request to RFI', 'Reopen RFI', 'Close RFI', 'Approve Variation Order', 'Reject Variation Order']], ['People and to-dos', ['Create to-do items']]] },
    subcontractor: { name: 'Subcontractor', hint: 'A subcontractor — the trades Jewel places work with', types: ['Bid Package Invites', 'Work Orders', 'Defects'], registers: ['General', 'Chaser', 'Programme', 'Health & safety'], actions: [['Raise something new', ['Raise Work Order', 'Create Bid Package Invite', 'Raise Defect']], ['Move an existing record on', ['File Bid Package Tender']], ['People and to-dos', ['Add directory contact']]] },
    supplier: { name: 'Supplier', hint: 'A materials or goods supplier, as distinct from a subcontractor', types: ['Work Orders', 'Inventory items', 'Defects'], registers: ['Materials', 'Deliveries', 'Quotes', 'General'], actions: [['Raise something new', ['Raise Work Order', 'Add inventory item', 'Raise Defect', 'Raise calendar event']], ['People and to-dos', ['Add directory contact']]] },
    sales: { name: 'Sales', hint: 'A prospect — someone who might build with Jewel', types: ['Leads'], registers: [], actions: [['Raise something new', ['Raise lead']]] },
    internal: { name: 'Internal', hint: 'Jewel staff — company admin', types: ['To-do items', 'Site instructions', 'Calendar events'], registers: ['General', 'HR', 'Accounts'], actions: [['Raise something new', ['Raise site instruction', 'Raise calendar event']], ['People and to-dos', ['Create to-do items', 'Complete to-do', 'Add directory contact', 'Mark as KPI']]] }
  };

  const candidates = {
    'Requests / RFIs': { matches: [['RFI-049', 'Steel lintel size over kitchen opening', 'Open · raised 18 Sep', true]], others: [['RFI-051', 'Confirm ridge tile profile', 'Open'], ['RFI-053', 'Underfloor heating zones — ground floor', 'Open'], ['REQ-0061', 'Client to confirm ironmongery finish', 'General'], ['RFI-047', 'Stone sill profile to rear elevation', 'Answered']] },
    'Variation Orders': { matches: [['V14', 'Steel lintel and widened kitchen opening', 'Approved', false]], others: [['V15', 'Additional garden tap and external socket', 'Quoting'], ['V13', 'Upgrade to engineered oak in snug', 'Awaiting AI'], ['V11', 'Boot room joinery — client change', 'Approved']] }
  };

  function candidateRow([reference, title, status, isPicked]) {
    const style = isPicked ? 'border-color:var(--accent);background:rgba(102,224,148,.08)' : '';
    const mark = isPicked ? '<span class="tone-accent text-xs semibold">✓ picked</span>' : '';
    return `<div class="card row-between" style="padding:8px 12px;margin-bottom:4px;flex-wrap:nowrap;${style}"><span style="min-width:0"><span class="mono strong" style="margin-right:8px">${reference}</span><span class="muted">${title}</span></span><span class="row" style="gap:8px;flex-wrap:nowrap"><span class="text-xs subtle">${status}</span>${mark}</span></div>`;
  }

  function openSection(type) {
    const pool = candidates[type];
    if (!pool) return '<p class="text-xs subtle">Nothing matching on this project.</p>';
    const search = `<input class="field" style="height:32px;font-size:14px;margin-bottom:10px;padding:0 12px" placeholder="Search ${type} — reference or title…">`;
    const matches = pool.matches.length ? `<p class="text-xs semibold tone-warning" style="margin-bottom:6px">Possible matches for this email</p>${pool.matches.map(candidateRow).join('')}` : '';
    const others = `<p class="text-xs semibold subtle" style="margin:10px 0 6px">Others on this project</p>${pool.others.map(candidateRow).join('')}`;
    return `${search}${matches}${others}<p class="text-xs subtle" style="margin-top:8px">Click to add, click again to unpick — the email is tagged to every picked record on apply.</p>`;
  }

  function typeSection(type, index) {
    const isOpen = index === 0;
    const picked = candidates[type] && candidates[type].matches.some((row) => row[3]) ? '<span class="chip-count">1</span>' : '';
    const body = isOpen ? `<div style="padding:0 12px 12px">${openSection(type)}</div>` : '';
    return `<div style="border:1px solid var(--line);border-radius:4px;margin-bottom:8px"><div class="row" style="padding:8px 12px;flex-wrap:nowrap">${frame.chevron(isOpen)}<span class="strong" style="flex:1">${type}</span>${picked}</div>${body}</div>`;
  }

  function registerSection(name) {
    return `<div class="row" style="border:1px solid var(--line);border-radius:4px;margin-bottom:8px;padding:8px 12px;flex-wrap:nowrap">${frame.chevron(false)}<span class="strong">${name}</span><span class="text-xs subtle" style="flex:1">register</span><button type="button" class="text-xs muted" style="border:1px solid var(--line);border-radius:999px;padding:4px 12px">Tag as ${name}</button></div>`;
  }

  function tagging(config) {
    const registers = config.registers.length ? `<p class="text-xs subtle" style="margin:12px 0 8px">These registers need no record — "Tag as…" stages the filing and Apply lands this email straight in the register. Expand one to read what's already there.</p>${config.registers.map(registerSection).join('')}` : '';
    return config.types.map(typeSection).join('') + registers;
  }

  function actions(config) {
    const options = config.actions.map(([group, items]) => `<optgroup label="${group}">${items.map((item) => `<option>${item}</option>`).join('')}</optgroup>`).join('');
    const picker = `<select class="field" style="height:36px;font-size:14px;padding:0 12px"><option>Choose an action…</option>${options}</select>`;
    const staged = config.name === 'Client' ? '<div class="row-between" style="border:1px solid rgba(102,224,148,.4);background:rgba(102,224,148,.05);border-radius:4px;padding:8px 12px;margin-bottom:12px;flex-wrap:nowrap"><p><span class="strong tone-accent" style="margin-right:8px">Close RFI</span><span class="muted">Will close RFI-049 with this email as its answer. This email is tagged to it.</span></p><span class="text-xs subtle">Remove</span></div>' : '';
    const when = config.name === 'Client' ? '<p class="text-xs subtle" style="margin-top:8px">This email answers an open RFI — file the answer and close it.</p>' : '';
    return staged + picker + when;
  }

  function pane(key, subject, activeTab, hrefFor) {
    const config = configs[key];
    const picks = key === 'client' ? `<div class="row" style="gap:6px;margin-bottom:12px"><span class="text-xs tone-accent" style="border:1px solid rgba(102,224,148,.5);border-radius:999px;padding:2px 10px">🔗 RFI-049 ×</span></div>` : '';
    const isActions = activeTab === 'actions';
    const tabs = config.actions.length ? `<div class="row" style="gap:4px;border-bottom:1px solid var(--line);margin-bottom:12px"><a class="tab${isActions ? '' : ' is-active'}" href="${hrefFor({ tab: 'tagging' })}">Tagging${key === 'client' ? '<span class="chip-count">1</span>' : ''}</a><a class="tab${isActions ? ' is-active' : ''}" href="${hrefFor({ tab: 'actions' })}">Actions${key === 'client' ? '<span class="chip-count">1</span>' : ''}</a></div>` : '';
    const head = `<div style="margin-bottom:16px"><h2 class="semibold text-base">${config.name}</h2><p class="text-xs subtle" style="margin-top:3px">Staged against: ${ui.escape(subject)}</p></div>`;
    return `<section class="panel" style="padding:20px">${head}${picks}${tabs}${isActions ? actions(config) : tagging(config)}</section>`;
  }

  JPMS.controlCentrePathways = { pane, configs };
})();
