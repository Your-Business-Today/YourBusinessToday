/* AI Connections — jpms/Pages/AiConnections.razor: the AI tools connected to the portal over the
   MCP connector, each signed in as a portal user with their own email and password. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const connectorUrl = 'https://portal.jewel-demo.example/mcp';

  const connections = [
    ['Claude', 'marcus.hale', '02 Sep 2026, 08:14', '25 Sep 2026, 09:51'],
    ['Claude', 'sophie.turner', '04 Sep 2026, 17:30', '25 Sep 2026, 09:42'],
    ['Claude', 'ravi.patel', '04 Sep 2026, 17:52', '25 Sep 2026, 09:15'],
    ['Claude', 'daniel.price', '08 Sep 2026, 07:45', '25 Sep 2026, 08:31'],
    ['Claude Code', 'admin', '10 Sep 2026, 12:02', '24 Sep 2026, 18:20'],
    ['Claude', 'emma.walsh', '15 Sep 2026, 10:11', '24 Sep 2026, 11:12'],
    ['Claude', 'liam.carter', '16 Sep 2026, 06:58', '24 Sep 2026, 15:02'],
    ['Perplexity', 'marcus.hale', '19 Sep 2026, 21:40', '21 Sep 2026, 08:03'],
    ['Claude', 'grace.holloway', '22 Sep 2026, 13:25', '—']
  ];

  function row([tool, who, connected, lastUsed]) {
    const email = who === 'admin' ? JPMS.data.signedIn.email : `${who}@jewel-demo.example`;
    return [`<span class="strong" style="white-space:nowrap">${tool}</span>`, email, `<span style="white-space:nowrap">${connected}</span>`, `<span style="white-space:nowrap">${lastUsed}</span>`, `<div style="text-align:right">${ui.btn('Disconnect', 'secondary', { class: 'text-xs' })}</div>`];
  }

  function step(number, text) {
    return `<div class="row" style="align-items:flex-start;flex-wrap:nowrap;margin-bottom:10px"><span class="chip-count" style="min-width:22px;text-align:center">${number}</span><p class="muted">${text}</p></div>`;
  }

  function setupPanel() {
    const address = `<div class="row" style="margin:4px 0 16px"><span class="mono" style="padding:8px 12px;border:1px solid var(--line);background:var(--surface-raised)">${connectorUrl}</span>${ui.btn('Copy address')}</div>`;
    const steps = [
      step(1, 'In Claude, open <b>Settings → Connectors → Add custom connector</b> and paste the address above.'),
      step(2, 'Claude opens the portal’s sign-in page. Sign in with <b>your own</b> portal email and password — never a shared login.'),
      step(3, 'Allow access. The connector now appears in the tools menu of every conversation, working as you.'),
      step(4, 'Everything it reads is what you can read; everything it writes is logged under your name on the System Audit Trail, marked “via Claude (connector)”.')
    ].join('');
    const facts = ui.meta([['Connector address', ui.mono(connectorUrl)], ['Protocol', 'MCP · OAuth sign-in'], ['Tools', '<span class="strong">85</span> tools'], ['Actions behind perform_action', '221 across 14 areas']]);
    const left = `<div><p class="eyebrow">The portal’s address</p>${address}${steps}</div>`;
    const right = `<div style="border-left:1px solid var(--line);padding-left:24px">${facts}</div>`;
    return ui.panel('Connect your AI tool', `<div class="grid grid-sidebar">${left}${right}</div>`);
  }

  JPMS.page('/settings/ai-connections', {
    title: 'AI Connections',
    render() {
      const subtitle = '<span style="display:block;max-width:42rem">The AI tools (Claude, Perplexity…) connected to the portal as any user through the connector. Connect one from the tool itself using the portal’s address — it signs in with your portal email and password. Disconnect revokes its access immediately.</span>';
      const table = ui.table({ columns: ['Tool', 'User', 'Connected', 'Last used', ''], rows: connections.map(row), dense: true });
      return ui.join([
        shared.header({ subtitle, actions: [shared.checkbox('Everyone’s connections', true)] }),
        `<div class="stack">${setupPanel()}${ui.panel('Connections', table, { flush: true, actions: [`<span class="text-xs subtle">${connections.length} live · 7 people</span>`] })}</div>`
      ]);
    }
  });
})();
