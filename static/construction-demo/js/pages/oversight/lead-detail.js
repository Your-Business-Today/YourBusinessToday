/* One lead — jpms/Pages/SalesLeadDetail.razor: the header with Won — create client & project,
   Details, Estimates, Enquiry emails, Imagine, Proposals and the Timeline, with the Stage ladder beside. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const sales = JPMS.sales;

  function header(lead) {
    const actions = [ui.menu('Actions', [{ label: 'Edit lead' }, { label: 'Log activity' }, { label: 'Move to Nurture' }, { label: 'Mark as Lost…' }, { label: 'Delete lead…' }])];
    const primary = lead.stage === 'Won' ? '' : 'Won — create client & project';
    const subtitle = `${shared.stagePill(lead.stage)} <span class="subtle">· ${lead.property}</span>`;
    return ui.header({ eyebrow: `${ui.link('Leads', '#/sales/leads')} · ${lead.ref}`, title: lead.contact, subtitle, actions, primary });
  }

  function details(lead) {
    const strategy = sales.strategy(lead.strategy);
    const pairs = [
      ['Contact', `${lead.contact}<br><span class="subtle text-xs">${lead.email} · ${lead.phone}</span>`],
      ['Company / practice', lead.company || '—'],
      ['Property / site', `${lead.property}<br><span class="subtle text-xs">${lead.postcode}</span>`],
      ['Estimated value', ui.money(lead.value)],
      ['Owner', `${lead.owner}@jewel-demo.example`],
      ['Found by', strategy ? ui.link(strategy.name, `#/sales/strategies/${strategy.id}`) : lead.source],
      ['Captured', lead.captured]
    ];
    if (lead.project) pairs.push(['Became', ui.link('Open the project', `#/projects/${lead.project}`)]);
    if (lead.lostReason) pairs.push(['Why lost', lead.lostReason]);
    return ui.panel('Details', [`<p style="margin-bottom:16px">${lead.work}</p>`, ui.meta(pairs)]);
  }

  function estimates(lead) {
    const rows = [
      [ui.mono(`${lead.ref}-E1`), '<span style="display:block;min-width:220px">Budget estimate — shell, envelope and M&E first fix</span>', '<span style="white-space:nowrap">12 Sep 2026</span>', ui.money(Math.round(lead.value * 0.9)), ui.money(Math.round(lead.value * 0.94)), ui.pill('Submitted', 'info'), ui.btn('Open')],
      [ui.mono(`${lead.ref}-E2`), '<span style="display:block;min-width:220px">Revised — reclaimed clay roof, lime render</span>', '<span style="white-space:nowrap">02 Oct 2026</span>', ui.money(lead.value), '—', ui.pill('Pricing'), ui.btn('Open')]
    ];
    const table = ui.table({ columns: ['Reference', 'Scope', 'Price due', { label: 'Budget', num: true }, { label: 'Total', num: true }, 'Status', ''], rows });
    return ui.panel('Estimates', table, { flush: true, actions: [ui.btn('Add estimate')] });
  }

  function emails(lead) {
    const messages = [
      [lead.contact, '21 Sep 09:12', 'Thank you for the walk-round — we would love to see the kitchen wing with a lantern rather than a flat roof.'],
      ['Marcus Hale', '19 Sep 16:40', `Lovely to meet you both. As promised, the budget is attached with the three options we talked through. Our drawings from the house two doors down are in the brochure.`]
    ].map(([from, when, text]) => `<div class="message"><div class="message-head"><span class="strong">${from}</span><span class="text-xs subtle">${when}</span></div><p class="muted">${text}</p></div>`).join('');
    return ui.panel('Enquiry emails', messages);
  }

  function imagine(lead) {
    const link = `https://imagine.jewel-demo.example/i/${lead.ref.toLowerCase()}-7kq2`;
    const concepts = ['Oak lantern over the kitchen', 'Flint and brick wing', 'Glazed link to the orangery'].map((title, index) => `<div><div class="photo">Concept ${index + 1}</div><p class="text-xs strong" style="margin-top:6px">${index === 0 ? '♥ ' : ''}${title}</p></div>`).join('');
    const body = [`<p class="eyebrow" style="margin-bottom:4px">The link</p><p class="mono text-xs">${link}</p><p class="text-xs subtle" style="margin-top:4px">Issued 04 Sep 2026 10:22 · only this link opens the page — there is no general address.</p>`,
      `<div class="row" style="margin:12px 0 16px">${ui.btn('Copy link')}${ui.btn('Download QR (PNG)')}${ui.btn('Open the page', 'ghost')}</div>`,
      `<p class="strong">Round 2 · Revision</p><p class="muted" style="margin:4px 0 12px">They asked: <em>Could the roof be glass so the kitchen feels like the garden?</em></p>`, ui.grid(3, concepts)];
    return ui.panel('Imagine', body);
  }

  function proposals(lead) {
    const body = `<div class="row-between"><div><p class="strong">v2 · ${ui.money(lead.value)} ${ui.pill('Sent', 'info')}</p><p class="text-xs subtle" style="margin-top:4px">Sent to ${lead.email} on 22 Sep 2026 · viewed twice</p></div><div class="row">${ui.btn('New version from this')}${ui.btn('Withdraw', 'ghost')}</div></div>`;
    return ui.panel('Proposals', body, { actions: [ui.btn('New proposal')] });
  }

  function timeline(lead) {
    const items = [
      ['Proposal sent', '22 Sep 2026', 'Proposal v2 sent with the lantern option.', 'marcus.hale'],
      ['Site visit', '19 Sep 2026', 'Walked the house and garden with both owners; measured the kitchen wing.', 'sophie.turner'],
      ['Imagine', '04 Sep 2026', 'Imagine link issued and printed on the letter.', 'marcus.hale'],
      ['Stage change', `${lead.captured}`, `Captured as New from ${lead.source.toLowerCase()}.`, lead.owner]
    ].map(([kind, when, summary, who]) => `<div class="timeline-item is-done"><p class="text-xs tone-accent">${kind} <span class="subtle">· ${when}</span></p><p>${summary}</p><p class="text-xs faint">${who}@jewel-demo.example</p></div>`).join('');
    return ui.panel('Timeline', `<div class="timeline">${items}</div>`);
  }

  function ladder(lead) {
    const rungs = sales.ladder.map((stage) => {
      const isCurrent = stage === lead.stage;
      return `<div class="list-row ${isCurrent ? 'is-selected' : ''}" style="padding:8px 12px"><span class="${isCurrent ? 'strong' : 'muted'}">${stage}</span>${isCurrent ? shared.stagePill('Current') : `<span class="text-xs subtle">Move here</span>`}</div>`;
    }).join('');
    return ui.panel('Stage', [`<p class="muted" style="margin-bottom:16px">${sales.meanings[lead.stage]}</p>`, rungs, `<p class="text-xs subtle" style="margin-top:12px">Won is the green button above — it creates the client and the project.</p>`]);
  }

  JPMS.page('/sales/leads/:id', {
    title: 'Leads',
    render(params) {
      const lead = sales.lead(params.id);
      const main = `<div class="stack">${details(lead)}${estimates(lead)}${emails(lead)}${imagine(lead)}${proposals(lead)}${timeline(lead)}</div>`;
      return ui.join([shared.salesTabs(0), header(lead), `<div class="grid grid-sidebar">${main}<div>${ladder(lead)}</div></div>`]);
    }
  });
})();
