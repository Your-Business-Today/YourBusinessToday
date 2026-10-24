/* Strategies — jpms/Pages/SalesStrategies.razor and SalesStrategyDetail.razor: how we find the
   next project, each strategy a card with its funnel; one strategy's argument, plan, funnel and leads. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const sales = JPMS.sales;
  const statusTones = { Active: 'positive', Paused: 'info' };

  function funnelFigure(value, label, tone) {
    return `<div style="text-align:center"><p class="text-xl ${tone || ''}">${value}</p><p class="text-xs subtle">${label}</p></div>`;
  }

  function researchLine(strategy) {
    if (strategy.research === 'Researching') return `<p class="text-xs subtle" style="margin-bottom:16px">${ui.jewel(12)} Claude is researching this strategy</p>`;
    return `<p class="text-xs subtle" style="margin-bottom:16px">${strategy.research}</p>`;
  }

  function footLine(strategy) {
    const funnel = strategy.funnel;
    const parts = [funnel.pipeline ? `${ui.money(funnel.pipeline)} open` : 'No open value'];
    if (funnel.wonValue) parts.push(`${ui.money(funnel.wonValue)} won`);
    if (!strategy.plan) parts.push('no approach plan yet');
    return `<p class="text-xs subtle" style="margin-top:12px">${parts.join(' · ')}</p>`;
  }

  function card(strategy) {
    const funnel = strategy.funnel;
    const figures = [funnelFigure(funnel.leads, 'leads'), funnelFigure(funnel.engaged, 'engaged'), funnelFigure(funnel.proposals, 'proposals'), funnelFigure(funnel.won, 'won', funnel.won ? 'tone-positive' : '')].join('');
    return `<a class="panel" href="#/sales/strategies/${strategy.id}" style="display:block;padding:24px">
      <div class="row-between" style="align-items:flex-start;margin-bottom:12px"><div><h2 class="text-lg semibold">${strategy.name}</h2><p class="text-xs subtle" style="margin-top:2px">${strategy.audience} · ${strategy.channel} · ${strategy.area}</p></div>${ui.pill(strategy.status, statusTones[strategy.status])}</div>
      <p class="muted" style="margin-bottom:8px">${strategy.hypothesis || strategy.brief}</p>${researchLine(strategy)}
      <div class="grid grid-4 grid-gap-sm" style="border-top:1px solid var(--line);padding-top:16px">${figures}</div>${footLine(strategy)}</a>`;
  }

  JPMS.page('/sales/strategies', {
    title: 'Strategies',
    render() {
      return ui.join([
        shared.salesTabs(2),
        shared.header({ subtitle: 'How we find the next project — each way written down with its justification: who, where, why now, the evidence behind it, how they are reached and what we say. Every lead a strategy finds carries its name, so the funnel below each card is the strategy’s own scorecard.', primary: 'New strategy' }),
        ui.grid(3, sales.strategies.map(card))
      ]);
    }
  });

  function argument(strategy) {
    const pairs = [
      ['The brief — the idea in our words', strategy.brief],
      ['Hypothesis — why these people, why now', strategy.hypothesis || '—'],
      ['Evidence', strategy.evidence || '—'],
      ['Proposition', strategy.proposition || '—'],
      ['Audience', strategy.audience], ['Channel', strategy.channel], ['Where', strategy.area], ['Since', strategy.since]
    ];
    return ui.panel('The argument', pairs.map(([label, value]) => `<p class="eyebrow" style="margin-top:12px">${label}</p><p class="muted" style="margin-top:4px">${value}</p>`));
  }

  function funnelPanel(strategy) {
    const funnel = strategy.funnel;
    const steps = [['Leads found', funnel.leads], ['Contacted', funnel.contacted], ['Engaged', funnel.engaged], ['Proposals', funnel.proposals], ['Won', funnel.won]];
    const bars = steps.map(([label, value]) => `<div style="margin-bottom:10px"><div class="row-between text-xs"><span>${label}</span><span class="subtle">${value}</span></div>${ui.progress(funnel.leads ? (value / funnel.leads) * 100 : 0)}</div>`).join('');
    return ui.panel('Funnel', bars);
  }

  function findings(strategy) {
    if (strategy.research !== 'Researching' && strategy.evidence) {
      const text = `<p class="strong">Where</p><p class="muted" style="margin-bottom:12px">${strategy.area}: the target roads, the plot sizes and the houses last sold before 2015.</p><p class="strong">Why now</p><p class="muted" style="margin-bottom:12px">${strategy.evidence}</p><p class="strong">The pitch</p><p class="muted">${strategy.proposition}</p><p class="text-xs faint" style="margin-top:16px">Researched by Claude ${strategy.research.replace('Researched ', '')} 2026. Every figure carries its source; check the ones a decision rests on.</p>`;
      return ui.panel('Research findings', text);
    }
    return ui.notice('Claude is researching this strategy', 'The where, the evidence and the pitch land here when the research finishes — usually within a few minutes.', 'info');
  }

  function approachPlan(strategy) {
    const actions = [ui.btn('Edit plan'), ui.btn('Draft with Claude')];
    if (!strategy.plan) return ui.panel('Approach plan', `<p class="subtle"><em>No approach plan yet — draft one with Claude from the argument, or write it by hand.</em></p>`, { actions });
    const steps = ['Week 1 — letter and brochure to the first 40 addresses, QR code to the Imagine page.', 'Week 2 — follow-up call to anyone who scanned; offer a walk-round.', 'Week 4 — second letter with a finished project from the same road.', 'Monthly — review who climbed the ladder; drop roads with no scans.'];
    return ui.panel('Approach plan', `<ol style="padding-left:18px">${steps.map((step) => `<li class="muted" style="margin-bottom:6px">${step}</li>`).join('')}</ol>`, { actions });
  }

  function leadsPanel(strategy) {
    const found = sales.leads.filter((lead) => lead.strategy === strategy.id);
    if (!found.length) return ui.panel('Leads this strategy found', `<p class="subtle" style="padding:24px"><em>None yet — Add lead captures one attributed to this strategy.</em></p>`, { flush: true });
    const rows = found.map((lead) => [ui.mono(lead.ref), lead.contact, lead.property, shared.stagePill(lead.stage), ui.money(lead.value), lead.captured]);
    return ui.panel('Leads this strategy found', ui.table({ columns: ['Ref', 'Lead', 'Property', 'Stage', { label: 'Value', num: true }, 'Captured'], rows, hrefs: found.map((lead) => `#/sales/leads/${lead.id}`) }), { flush: true });
  }

  function tiles(strategy) {
    const funnel = strategy.funnel;
    const won = funnel.lost ? `${funnel.won} · ${funnel.lost} lost` : String(funnel.won);
    const stats = [['Leads found', funnel.leads], ['Contacted', funnel.contacted], ['Engaged', funnel.engaged], ['Proposals', funnel.proposals], ['Won', won], ['Open pipeline', ui.money(funnel.pipeline)]];
    return `<div class="grid grid-gap-sm" style="grid-template-columns:repeat(6,minmax(0,1fr));margin-bottom:24px">${stats.map(([label, value]) => ui.stat({ label, value: String(value) })).join('')}</div>`;
  }

  JPMS.page('/sales/strategies/:id', {
    title: 'Strategies',
    render(params) {
      const strategy = sales.strategy(params.id) || sales.strategies[0];
      const actions = [ui.menu(strategy.status, ['Draft', 'Active', 'Paused', 'Retired'].map((label) => ({ label }))), ui.btn('Edit'), ui.btn('Run research')];
      const header = ui.header({ eyebrow: ui.link('Strategies', '#/sales/strategies'), title: strategy.name, subtitle: `${strategy.audience} · ${strategy.channel} · ${strategy.area}`, actions, primary: 'Add lead' });
      const main = `<div class="stack">${findings(strategy)}${approachPlan(strategy)}${leadsPanel(strategy)}</div>`;
      const side = `<div class="stack">${argument(strategy)}${funnelPanel(strategy)}</div>`;
      return ui.join([shared.salesTabs(2), header, tiles(strategy), `<div class="grid grid-sidebar">${main}${side}</div>`]);
    }
  });
})();
