/* Xero mapping — jpms/Pages/LabourXeroMapping.razor: the effective-dated bridges from each site
   to Xero's Sites tracking option and from each cost code to its tracking option and accounts. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;

  const siteOptions = { hollowmere: 'Hollowmere', 'coach-house': 'Old Coach House', kingsridge: 'Kingsridge', wrenfield: 'Wrenfield Barn' };
  const siteSince = { hollowmere: '02 Mar 2026', 'coach-house': '15 Jun 2026', kingsridge: '01 Sep 2026', wrenfield: '06 Oct 2025' };
  const accounts = {
    '1000': ['310', '312', '493', '01 Apr 2026'], '2100': ['310', '312', '', '01 Apr 2026'], '2200': ['310', '312', '', '01 Apr 2026'],
    '3100': ['310', '312', '493', '01 Apr 2026'], '3300': ['310', '312', '493', '01 Apr 2026'], '4100': ['', '312', '', '14 May 2026'],
    '5100': ['311', '313', '493', '01 Apr 2026'], '5200': ['311', '313', '493', '01 Apr 2026'], '6100': ['310', '312', '', '01 Apr 2026'],
    '6300': ['310', '312', '493', '07 Aug 2026']
  };

  function formRow(fields) {
    return `<div class="row" style="flex-wrap:wrap;align-items:flex-end;gap:8px;margin-bottom:16px">${fields.join('')}${ui.btn('Set mapping')}</div>`;
  }

  function sitesPanel() {
    const form = formRow([money.select('Project', ['Project…', ...JPMS.data.projects.map((project) => project.name)]), money.select('Xero Sites option', ['Sites option…', ...Object.values(siteOptions)])]);
    const rows = JPMS.data.projects.map((project) => [project.name, siteOptions[project.id], `<span class="subtle">${siteSince[project.id]}</span>`]);
    return `<div style="margin-bottom:24px">${ui.panel('Sites → Xero tracking', [form, `<div style="max-width:760px">${ui.table({ dense: true, columns: ['Project', 'Xero Sites option', 'Since'], rows })}</div>`])}</div>`;
  }

  function codesPanel() {
    const input = (label, placeholder) => `<label style="display:block"><span class="form-label">${label}</span><input class="field" style="width:112px" placeholder="${placeholder}"></label>`;
    const form = formRow([money.select('Cost code', ['Cost code…', ...JPMS.data.costCodes.map((code) => `${code.code} — ${code.name}`)]), input('Labour account', 'e.g. 310'), input('Materials account', 'e.g. 312'), input('Travel account', 'e.g. 493')]);
    const explain = money.note('The cost-code tracking option defaults to the code itself (the approval flow already creates missing options in Xero); the account codes decide where each line nature posts — CIS labour, CIS materials, travel.');
    const blank = (value) => value || '<span class="faint">—</span>';
    const rows = Object.entries(accounts).map(([code, [labour, materials, travel, since]]) => [ui.mono(code), blank(labour), blank(materials), blank(travel), `<span class="subtle">${since}</span>`]);
    return ui.panel('Cost codes → Xero tracking & accounts', [form, explain, `<div style="max-width:760px">${ui.table({ dense: true, columns: ['Cost code', 'Labour', 'Materials', 'Travel', 'Since'], rows })}</div>`]);
  }

  JPMS.page('/labour/xero-mapping', {
    title: 'Xero mapping',
    render() {
      return ui.join([
        money.sectionHeader('Xero mapping', [money.refreshButton()]),
        money.note('Where each site and cost code lands in Xero. Changing a mapping starts a new dated row and closes the old one — history keeps reporting through the mapping that was in force at the time, so renames in Xero never rewrite the past.', { lead: true, gap: 20 }),
        sitesPanel(), codesPanel()
      ]);
    }
  });
})();
