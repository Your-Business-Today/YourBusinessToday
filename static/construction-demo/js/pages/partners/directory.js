/* The unified directory — jpms/Pages/Subcontractors.razor (/directory) with CompaniesDirectoryTable,
   and the company page jpms/Pages/SubcontractorDetail.razor. */
(function () {
  const ui = JPMS.ui;
  const companies = JPMS.partnersDirectory;
  const complianceTones = { Current: 'positive', 'Expiring soon': 'warning', Expired: 'negative', Missing: '' };
  const linkIcon = '<svg class="icon icon-xs subtle" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

  function filterRow() {
    const linked = companies.filter((company) => company.xero).length;
    const lapsedCount = companies.filter((company) => company.compliance === 'Expired').length;
    const xeroChips = ui.chips(['All', { label: 'Linked to Xero', count: linked }, { label: 'Not linked to Xero', count: companies.length - linked }]);
    const complianceChips = ui.chips(['All', { label: 'Expired', count: lapsedCount }, { label: 'Expiring soon', count: 2 }, { label: 'Missing', count: 1 }, 'Below £5m PL', { label: 'On site, insurance lapsed', count: 1 }]);
    const type = `<label><span class="form-label">Type</span><select class="field" style="width:auto;max-width:220px;padding:6px 8px;font-size:12px"><option>All types</option><option>Subcontractor</option><option>Supplier</option><option>Client</option><option>Architect</option></select></label>`;
    return `<div class="row" style="align-items:flex-end;margin-bottom:20px"><div style="flex:1;min-width:14rem">${ui.field('Search', '', { placeholder: 'Company, trade, contact, town…' })}</div>${type}${xeroChips}${complianceChips}<p class="muted">${companies.length} companies</p><button class="btn btn-secondary">${linkIcon}Import from Xero</button></div>`;
  }

  function companyRows() {
    return companies.map((company) => [
      '<input type="checkbox">',
      `<span class="strong row" style="gap:6px;flex-wrap:nowrap;white-space:nowrap">${company.name}${company.xero ? linkIcon : ''}</span>`,
      ui.pill(company.type),
      company.trades.map((trade) => ui.pill(trade)).join(' '),
      `${company.contact}<span class="text-xs subtle" style="display:block">${company.email}</span>`,
      `<span class="subtle">${company.town}</span>`,
      ui.pill(company.compliance, complianceTones[company.compliance])
    ]);
  }

  JPMS.page('/directory', {
    title: 'Directory',
    render() {
      const groupChips = ui.chips(['Clients', 'Architects', 'Subcontractors', 'Internal staff'], 2);
      const table = ui.table({ columns: ['', 'Company', 'Type', 'Trade', 'Primary contact', 'Location', 'Compliance'], rows: companyRows(), hrefs: companies.map((company) => `#/directory/${company.id}`) });
      return ui.join([
        ui.header({ subtitle: 'The company directory.', actions: [ui.btn('Export to Excel', 'ghost')], primary: '+ Add company' }),
        `<div style="margin-bottom:20px">${groupChips}</div>`,
        ui.tabs([{ label: 'Companies', href: '#/directory' }, { label: 'Compliance register', href: '#/directory' }]),
        filterRow(), ui.panel('', table, { flush: true })
      ]);
    }
  });

  function detailsPanel(company) {
    const facts = [['Address', `Yard 2, Brook Farm Estate<br>${company.town}`], ['Phone', '01483 000 552'], ['Payment terms', '30 days'], ['CIS status', company.type === 'Supplier' ? 'Not applicable' : 'Gross'], ['Category', company.type], ['Website', `${company.id}.example`]];
    return ui.panel('Details', ui.meta(facts), { actions: ['<span class="text-xs subtle">Printed on this company\'s purchase orders — change them under Edit details</span>'] });
  }

  function complianceTable(company) {
    const rows = [['Public liability insurance', '£10m', '31 Mar 2027', ui.pill('Current', 'positive')], ['Employer’s liability insurance', '£10m', '31 Mar 2027', ui.pill('Current', 'positive')], ['Contractor’s all risks', '£2m', company.compliance === 'Expired' ? '31 Aug 2026' : '12 Oct 2026', ui.pill(company.compliance, complianceTones[company.compliance])], ['RAMS — general', '—', '—', ui.pill('Current', 'positive')]];
    return ui.panel('Compliance documents', ui.table({ columns: ['Document', 'Cover', 'Expires', 'Status'], rows }), { flush: true, actions: [ui.btn('Add document')] });
  }

  function statementPanel() {
    const rows = [['WO-0131', 'Bulk dig & muck-away — basement', '£186,400', '£186,400', '£186,400'], ['WO-0134', 'Basement slab & retaining walls', '£242,800', '£214,600', '£198,000'], ['WO-0142', 'External drainage & attenuation tank', '£68,450', '£27,380', '£27,380']];
    return ui.panel('Statement of account', ui.table({ columns: ['Order', 'Title', { label: 'Value', num: true }, { label: 'Invoiced', num: true }, { label: 'Paid', num: true }], rows, footer: ['Total', '', '£497,650', '£428,380', '£411,780'] }), { flush: true, actions: [ui.link('Hollowmere House', '#/projects/hollowmere/work-orders')] });
  }

  JPMS.page('/directory/:id', {
    title: 'Directory',
    render(params) {
      const company = companies.find((candidate) => candidate.id === params.id) || companies[0];
      const badge = company.xero ? ` <span class="pill">${linkIcon}Linked to Xero</span>` : '';
      const actions = [company.xero ? ui.btn('Push contacts to Xero…') : ui.btn('Link to Xero contact…'), ui.btn('Edit details…')];
      const trades = ui.panel('Trades', company.trades.map((trade) => ui.pill(trade)).join(' '), { actions: [ui.btn('Edit trades')] });
      const access = ui.panel('Portal access', `<p class="muted">${company.contact} · ${company.email} — can see released work orders and accept them.</p>`, { actions: [ui.btn('Invite another person')] });
      return ui.join([
        JPMS.partners.crumbs([['Subcontractors', '#/directory'], [company.name]]),
        ui.header({ title: company.name + badge, subtitle: `${company.contact} · ${company.email}`, actions }),
        `<div class="stack">${detailsPanel(company)}${ui.grid(2, [trades, access])}${complianceTable(company)}${company.name.startsWith('Northgate') ? statementPanel() : ''}</div>`
      ]);
    }
  });
})();
