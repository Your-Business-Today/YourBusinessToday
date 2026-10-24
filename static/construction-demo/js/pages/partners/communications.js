/* Subcontractor, Supplier and Internal Communications — jpms/Pages/SubcontractorCommunications.razor:
   one page serving three families; a category segment preselects its chip. */
(function () {
  const ui = JPMS.ui;

  const families = {
    subcontractor: { pathway: 'Subcontractor', label: 'subcontractor communication', route: '/subcontractors/communications', chips: [['general', 'General'], ['chaser', 'Chaser'], ['info-request', 'Info request'], ['h-s', 'H&S']] },
    supplier: { pathway: 'Supplier', label: 'supplier communication', route: '/suppliers/communications', chips: [['materials', 'Materials'], ['finishes', 'Finishes']] },
    internal: { pathway: 'Internal', label: 'internal communication', route: '/internal/communications', chips: [['general', 'General']] }
  };

  function chipRow(family, category) {
    const chips = [['', 'All'], ...family.chips].map(([slug, label]) => {
      const href = slug ? `${family.route}/${slug}` : family.route;
      return `<a class="chip${slug === category ? ' is-active' : ''}" href="#${href}">${ui.escape(label)}</a>`;
    });
    return `<div class="chips" style="margin-bottom:16px">${chips.join('')}</div>`;
  }

  function subtitle(family, category, count) {
    const chip = family.chips.find(([slug]) => slug === category);
    const tagged = chip ? `tagged ${chip[1]}` : `tagged as ${family.label}`;
    return `${count} email${count === 1 ? '' : 's'} ${tagged}.`;
  }

  function emptyState(family, chip) {
    const said = chip ? `Nothing tagged ${chip[1]} yet.` : `No ${family.label}s yet.`;
    return `<div class="panel" style="padding:32px;text-align:center"><p>${ui.escape(said)}</p><p class="text-xs subtle" style="margin-top:4px">Tick "${family.label[0].toUpperCase()}${family.label.slice(1)}" — or one of its categories — in the Control Centre's ${family.pathway} pane and the thread appears here.</p></div>`;
  }

  function render(key, category = '') {
    const family = families[key];
    const emails = JPMS.partnersEmails[key].filter((email) => !category || email.category === category);
    const chip = family.chips.find(([slug]) => slug === category);
    const list = emails.length ? JPMS.partners.threadList(emails) : emptyState(family, chip);
    const loadMore = emails.length > 6 ? `<div style="margin-top:16px;text-align:center">${ui.btn('Load more')}</div>` : '';
    return ui.join([ui.header({ eyebrow: family.pathway, subtitle: emails.length ? subtitle(family, category, emails.length) : '' }), chipRow(family, category), list, loadMore]);
  }

  Object.entries(families).forEach(([key, family]) => {
    JPMS.page(family.route, { title: 'Communications', render: () => render(key) });
    JPMS.page(`${family.route}/:category`, { title: (params) => (params.category === 'general' ? 'Communications' : null), render: (params) => render(key, params.category) });
  });
})();
