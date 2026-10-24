/* Project settings — jpms/Pages/ProjectSettings.razor: the Details, Deposits/retentions & valuation,
   Contract and Correspondence panes (ProjectDetailsEditor, NextValuationDateEditor,
   ProjectRetentionPanel, ProjectContractPanel, ProjectCorrespondencePanel). */
(function () {
  const ui = JPMS.ui;
  const site = JPMS.site;
  const panes = [['details', 'Details'], ['retention', 'Deposits, retentions & valuation'], ['contract', 'Contract'], ['correspondence', 'Correspondence']];
  const retentionRate = 0.03;
  const depositRate = 0.1;

  const tile = (label, value) => `<div style="border:1px solid var(--line);background:var(--surface);padding:10px 12px"><p class="eyebrow">${label}</p><p class="text-base semibold" style="margin-top:2px">${value}</p></div>`;
  const statTile = (label, value) => `<article class="stat"><p class="stat-label">${label}</p><p style="margin-top:8px">${value}</p></article>`;
  const routingSelect = (value) => `<select class="field" style="height:30px;padding:2px 8px;font-size:12px;width:auto">${['Off', 'To', 'CC', 'BCC'].map((name) => `<option${name === value ? ' selected' : ''}>${name}</option>`).join('')}</select>`;

  function currentPane() {
    const pane = (location.hash.split('?')[1] || '').replace('pane=', '');
    return panes.some(([key]) => key === pane) ? pane : 'details';
  }

  function paneBar(project, active) {
    const link = ([key, label]) => {
      const style = key === active ? 'background:var(--accent);color:var(--accent-ink);font-weight:500' : 'color:var(--content-muted)';
      return `<a href="#/projects/${project.id}/settings?pane=${key}" style="padding:6px 12px;border-radius:4px;${style}">${ui.escape(label)}</a>`;
    };
    return `<div class="row" style="margin-bottom:20px;flex-wrap:wrap">${panes.map(link).join('')}</div>`;
  }

  function detailsPane(project) {
    const tiles = [['Stage', project.stage], ['Entity', 'JBB'], ['Project Manager', 'sophie.turner@jewel-demo.example'], ['Client', project.client], ['Site address', `Hollow Lane, ${project.town}, GU5 9ZZ`], ['Xero site', `${project.ref} ${project.name}`], ['Xero contact', project.client]];
    return [
      `<div class="row" style="justify-content:flex-end;margin-bottom:12px">${ui.btn('Edit details')}</div>`,
      `<div class="grid grid-3 grid-gap-sm" style="margin-bottom:12px">${tiles.map(([label, value]) => statTile(label, value)).join('')}</div>`,
      '<p class="text-xs subtle">Created 12 Jan 2026</p>'
    ].join('');
  }

  function retentionPane(project) {
    const heldToDate = project.valuedToDate * retentionRate;
    const deposit = project.contractSum * depositRate;
    const depositReleased = project.valuedToDate * depositRate;
    const nextValuation = `<div class="grid grid-4 grid-gap-sm" style="margin-bottom:24px"><div class="stat"><p class="eyebrow" style="margin-bottom:4px">Next Valuation</p><div class="row-between"><div><p>30 Sep 2026</p><p class="text-xs subtle">Monthly · moves on when a claim is locked</p></div>${ui.btn('Set date')}</div></div></div>`;
    const release = (label, detail, amount) => `<div class="row-between" style="border:1px solid var(--line);background:var(--surface);padding:10px 12px;margin-bottom:8px"><div><p>${label}</p><p class="text-xs subtle">${detail}</p></div><div class="row"><p class="semibold">${ui.money(amount)}</p>${ui.btn('Confirm release')}</div></div>`;
    const body = [
      '<h4 class="eyebrow" style="margin-bottom:8px">Cash up front deposit</h4>',
      `<p class="subtle" style="margin-bottom:12px">10% of the contract sum received before works start · released back to the client as works complete — each valuation claim's payment due is reduced by 10% of the works claimed on contract works, PC sums and contingency (variations excluded).</p>`,
      `<div class="grid grid-3 grid-gap-sm" style="margin-bottom:16px">${tile('Received', ui.money(deposit))}${tile('Released to date', ui.money(depositReleased))}${tile('Still to release', ui.money(deposit - depositReleased))}</div>`,
      '<h4 class="eyebrow" style="margin-bottom:8px">Retention</h4>',
      `<p class="subtle" style="margin-bottom:12px">3% held on works complete until practical completion · 50% released at completion · balance 12 months later · practical completion ${project.completion}</p>`,
      `<div class="grid grid-3 grid-gap-sm" style="margin-bottom:16px">${tile('Held to date', ui.money(heldToDate))}${tile('Released to date', ui.money(0))}${tile('Outstanding', ui.money(heldToDate))}</div>`,
      release('50% at practical completion', `Due ${project.completion} · not yet released`, heldToDate / 2),
      release('Balance 12 months after completion', 'Due after the defects period · not yet released', heldToDate / 2)
    ].join('');
    const panel = `<div class="panel"><div class="panel-body"><div class="row-between" style="margin-bottom:12px"><h3 class="strong">Deposit &amp; retention</h3>${ui.btn('Edit terms')}</div>${body}</div></div>`;
    return nextValuation + panel;
  }

  function contractPane(project) {
    const terms = [['Form', project.contract], ['Contract sum', ui.money(project.contractSum)], ['LADs', '£2,500 / week'], ['Employer', project.client], ['Contract administrator', project.architect], ['Contractor', 'Jewel Bespoke Build Ltd'], ['Possession', project.start], ['Completion', project.completion], ['Defects liability', '12 months'], ['Retention', '3% → 1.5%'], ['Valuation cut-off', 'Day 25'], ['Payment notices', '5d notice · 5d pay-less · 14d final date'], ['OH&amp;P', '12% direct · 10% sub · 5% attendance'], ['Daywork', '15% labour · 12.5% materials · 10% plant']];
    const document = `<div class="row-between" style="border:1px solid var(--line);background:var(--surface);padding:10px 12px"><div><p class="strong">${project.ref} ${project.name} — executed contract.pdf</p><p class="text-xs subtle" style="margin-top:2px">8.4 MB · uploaded 20 Feb 2026 by marcus.hale@jewel-demo.example</p></div><div class="row">${ui.btn('Download', 'ghost')}${ui.btn('Replace')}</div></div>`;
    const amendment = `<div class="row-between" style="border:1px solid var(--line);background:var(--surface);padding:10px 12px"><div><p class="strong">Side letter — basement extent</p><p class="text-xs muted" style="margin-top:2px">Extends the basement under the orangery; contract sum adjusted by instruction.</p><p class="text-xs subtle" style="margin-top:2px">14 May 2026 · side-letter-basement.pdf</p></div><div class="row"><a class="text-xs tone-accent">Edit</a><a class="text-xs tone-negative">Remove</a></div></div>`;
    const termsList = `<dl class="meta">${terms.map(([label, value]) => `<div><dt class="eyebrow">${label}</dt><dd>${value}</dd></div>`).join('')}</dl><p class="text-xs subtle" style="margin-top:12px">Last updated 03 Mar 2026 by ravi.patel@jewel-demo.example</p>`;
    const body = [
      `<section style="margin-bottom:24px"><h4 class="eyebrow" style="margin-bottom:8px">Executed contract</h4>${document}</section>`,
      `<section style="margin-bottom:24px"><h4 class="eyebrow" style="margin-bottom:8px">Amendments</h4>${amendment}<div style="margin-top:8px">${ui.btn('Add amendment')}</div></section>`,
      `<section><h4 class="eyebrow" style="margin-bottom:8px">Terms</h4>${termsList}</section>`
    ];
    return ui.panel('Contract', body, { actions: [ui.btn('Edit terms')] });
  }

  function correspondencePane(project) {
    const architect = JPMS.data.architects.find((firm) => firm.firm === project.architect) || JPMS.data.architects[0];
    const partyRows = [
      [`${architect.contact} ${ui.pill('Primary', 'info')}`, architect.email, routingSelect('To')],
      ['Tom Ashdown', 'tom@ashdownrowe.example', `${routingSelect('CC')} <span class="eyebrow" style="margin-left:8px">overridden</span>`],
      ['Studio inbox', 'studio@ashdownrowe.example', routingSelect('Off')]
    ];
    const contactRows = [
      [project.client, 'whitfield.family@clientmail.example', 'Client', 'Client', routingSelect('CC')],
      ['Mark Leland', 'mark@lelandqs.example', 'Leland Cost Consultants', 'Consultant', routingSelect('CC')],
      ['Joanna Frith', 'joanna@frithstructures.example', 'Frith Structures', 'Engineer', routingSelect('BCC')],
      ['Peter Vane', 'peter@vaneinteriors.example', 'Vane Interiors', 'Consultant', routingSelect('Off')]
    ].map((row) => [...row, '<a class="text-xs muted" style="margin-right:12px">Edit</a><a class="text-xs tone-negative">Remove</a>']);
    const intro = `<p style="margin-bottom:12px">Corresponds with <span class="strong">${project.architect}</span> <span class="subtle">(architect)</span> — request documents are addressed to the practice's primary contact; CC/BCC contacts are copied on every issue.</p>`;
    const form = `<div class="grid grid-4 grid-gap-sm" style="margin-top:16px;align-items:end">${ui.field('Name', '')}${ui.field('Email', '')}${ui.field('Organisation', '')}<div>${ui.btn('Add contact')}</div></div>`;
    return ui.panel('', [
      '<h3 class="eyebrow" style="margin-bottom:12px">Correspondence</h3>', intro,
      `<div style="margin-bottom:16px">${ui.table({ columns: ['Contact', 'Email', 'On this project'], rows: partyRows, dense: true })}</div>`,
      '<h4 class="eyebrow" style="margin-bottom:8px">Project contacts</h4>',
      ui.table({ columns: ['Contact', 'Email', 'Organisation', 'Role', 'Routing', ''], rows: contactRows, dense: true }),
      form
    ]);
  }

  const renderers = { details: detailsPane, retention: retentionPane, contract: contractPane, correspondence: correspondencePane };

  JPMS.page('/projects/:project/settings', {
    title: 'Project Settings',
    render(params) {
      const project = JPMS.project(params.project);
      const pane = currentPane();
      return site.projectShell(project, [paneBar(project, pane), renderers[pane](project)]);
    }
  });
})();
