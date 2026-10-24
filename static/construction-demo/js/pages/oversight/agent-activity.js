/* Agent Activity — jpms/Pages/AgentActivityLog.razor: every run the assistant has made, newest
   first, with who it ran as, what it touched, how long it took and what it cost. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const outcomeTones = { Ok: 'accent', Failed: 'negative', Refused: 'negative', 'Not configured': 'negative', 'Cut short': '' };

  const runs = [
    ['25 Sep 09:42', 'connector', 'sophie.turner', false, 'perform_action', 'Drafted the RFI-053 reply to Ashdown Rowe', 'Ok', 'get_request_context, describe_action, perform_action', 6.8, 18422, 11.4],
    ['25 Sep 09:15', 'connector', 'ravi.patel', false, 'perform_action', 'Recoded VR-2100-04 to 2200 Substructure', 'Ok', 'get_valuation_context, describe_action, perform_action', 4.2, 12960, 8.1],
    ['25 Sep 08:31', 'assistant', 'daniel.price', false, 'chat', 'Which subcontractor bills are waiting on Hollowmere?', 'Ok', 'list_work_orders, get_aged_payables', 9.1, 24115, 15.0],
    ['25 Sep 07:00', 'morning-sweep', 'system@jewel-demo.example', true, 'sweep', 'Overdue RFIs and lapsed insurance — 3 to-dos raised', 'Ok', 'list_requests, list_compliance_register, add_todo', 21.4, 41208, 26.3],
    ['24 Sep 17:48', 'connector', 'marcus.hale', false, 'perform_action', 'Marked a client email as KPI for Liam Carter', 'Ok', 'search_mailbox, perform_action', 3.6, 9744, 6.2],
    ['24 Sep 16:20', 'strategy-research', 'marcus.hale', false, 'research', 'Researched “Pre-sale uplift — Ashcombe Green”', 'Ok', 'web_search, save_findings', 142.0, 186330, 118.6],
    ['24 Sep 15:02', 'connector', 'liam.carter', false, 'perform_action', 'Tried to approve V16 — needs a director', 'Refused', 'describe_action, perform_action', 2.1, 6310, 3.9],
    ['24 Sep 14:40', 'imagine', 'marcus.hale', true, 'render', 'Concept round 2 for the Harcourt Lane kitchen wing', 'Ok', 'render_concepts', 38.5, 22870, 64.0],
    ['24 Sep 11:12', 'assistant', 'emma.walsh', false, 'chat', 'Match the Kestrel Timber statement to Xero', 'Cut short', 'list_xero_ledger_lines, get_project_supplier_account', 60.0, 98004, 61.2],
    ['23 Sep 19:05', 'document-extraction', 'sophie.turner', false, 'extract', 'Read the door schedule off drawing A-201 rev C', 'Failed', 'bluebeam_extract', 12.9, 3120, 2.0],
    ['23 Sep 16:33', 'connector', 'daniel.price', false, 'perform_action', 'Raised INV-0031 in Xero', 'Ok', 'preview_valuation_invoice_xero_raise, perform_action', 7.7, 15288, 9.6],
    ['23 Sep 07:00', 'morning-sweep', 'system@jewel-demo.example', true, 'sweep', 'Chased two missing timesheets', 'Ok', 'view_labour_chase, add_todo', 18.2, 35611, 22.7]
  ];

  function ranAs(who, isUnattended) {
    const email = who.includes('@') ? who : `${who}@jewel-demo.example`;
    const badge = isUnattended ? `<span class="text-xs subtle" style="display:inline-block;margin-top:2px;border:1px solid var(--line);background:var(--surface-raised);padding:0 6px">unattended</span>` : '';
    return `<span style="display:block">${email}</span>${badge}`;
  }

  function pence(amount) {
    return amount >= 100 ? `£${(amount / 100).toFixed(2)}` : `${amount.toFixed(1)}p`;
  }

  function row([when, agent, who, isUnattended, action, summary, outcome, tools, seconds, tokens, cost]) {
    return [
      `<span style="white-space:nowrap">${when}</span>`,
      agent,
      ranAs(who, isUnattended),
      `<span style="display:block">${action}</span><span class="text-xs subtle">${summary}</span>`,
      ui.pill(outcome, outcomeTones[outcome]),
      `<span class="text-xs subtle">${tools}</span>`,
      `${seconds.toFixed(1)}s`,
      tokens.toLocaleString('en-GB'),
      pence(cost)
    ];
  }

  JPMS.page('/agents/activity', {
    title: 'Agent Activity',
    render() {
      const totalTokens = runs.reduce((sum, run) => sum + run[9], 0);
      const totalCost = runs.reduce((sum, run) => sum + run[10], 0);
      const columns = ['When', 'Agent', 'Ran as', 'Action', 'Outcome', 'Tools', { label: 'Took', num: true }, { label: 'Tokens', num: true }, { label: 'Cost', num: true }];
      return ui.join([
        shared.header({ subtitle: 'Every run the assistant has made, newest first. Rows marked <span style="color:var(--content)">unattended</span> ran with nobody watching.' }),
        `<div style="margin-bottom:16px">${ui.chips(['All runs', 'Unattended only'])}</div>`,
        ui.panel('', ui.table({ columns, rows: runs.map(row), hrefs: runs.map(() => '#/audit') }), { flush: true }),
        `<div class="row text-xs subtle" style="margin-top:16px;gap:24px"><span>${runs.length} runs</span><span>${totalTokens.toLocaleString('en-GB')} tokens</span><span>${pence(totalCost)} total</span></div>`
      ]);
    }
  });
})();
