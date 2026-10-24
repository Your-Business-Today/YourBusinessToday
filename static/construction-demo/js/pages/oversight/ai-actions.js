/* AI Actions — jpms/Pages/AiActionsAdmin.razor: every action a connected AI tool can perform,
   grouped by area, with the skills attached to each area or action. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;

  const areas = [
    { name: 'Variations', count: 17, skills: ['Variation lifecycle'], isOpen: true, actions: [
      ['create_voq_from_rfq', 'Creates the variation order (VOQ, in Quoting) from a request’s RFQ — one per request.', false, []],
      ['create_manual_variation_order', 'Creates a standalone variation order with no request behind it; lands in Issued with its priced build-up staged.', false, []],
      ['set_variation_order_estimate', 'Sets the estimate on a variation in Quoting from its priced lines.', false, []],
      ['approve_variation_order', 'APPROVES a variation order — records the client’s instruction and writes the lines to the Valuation Report.', true, ['Jewel — Second Brain']],
      ['reject_variation_order', 'Rejects a variation; the history is kept.', true, []],
      ['return_variation_order_to_quoting', 'Sends an issued variation back to Quoting for re-pricing.', false, []]
    ] },
    { name: 'Valuation invoices', count: 12, skills: ['Valuation cycle'], isOpen: true, actions: [
      ['create_valuation_invoice', 'Creates the valuation invoice from the frozen statement.', false, []],
      ['raise_valuation_invoice_in_xero', 'Raises the valuation invoice in Xero as a draft sales invoice.', true, ['Xero allocation']],
      ['issue_valuation_invoice', 'Emails the valuation invoice to the client from the projects mailbox.', true, []],
      ['record_valuation_invoice_xero_number', 'Records the Xero invoice number against the valuation invoice.', false, []]
    ] },
    { name: 'Commercial', count: 34, skills: ['Valuation cycle', 'Cash forecast'] },
    { name: 'Procurement', count: 34, skills: ['Tender award'] },
    { name: 'Labour', count: 23, skills: ['Labour rules'] },
    { name: 'Subcontractors', count: 17, skills: [] },
    { name: 'Progress & programme', count: 16, skills: [] },
    { name: 'Requests & RFIs', count: 14, skills: ['Email triage'] },
    { name: 'Documents', count: 12, skills: ['Document filing'] },
    { name: 'Building control', count: 11, skills: [] },
    { name: 'Health & safety', count: 9, skills: [] },
    { name: 'Correspondence', count: 9, skills: ['Email triage'] },
    { name: 'Cashflow', count: 8, skills: ['Cash forecast'] },
    { name: 'To-dos', count: 5, skills: [] }
  ];

  function skillChip(name, isViaArea) {
    const tone = isViaArea ? 'subtle' : '';
    return `<span class="text-xs ${tone}" style="display:inline-flex;align-items:center;border:1px solid var(--line);background:var(--surface-raised);border-radius:999px;padding:1px 8px">${name}${isViaArea ? ' · area' : ''}</span>`;
  }

  function actionRow([name, summary, isConfirmFirst, skills], area) {
    const confirm = isConfirmFirst ? ' <span class="subtle" title="Confirm-first: the first call is refused until the user says yes.">· confirm-first</span>' : '';
    const chips = [...skills.map((skill) => skillChip(skill)), ...area.skills.map((skill) => skillChip(skill, true))].join('');
    return `<div class="list-row" style="padding:10px 16px;align-items:flex-start"><div style="flex:1;min-width:0"><span class="mono text-xs">${name}${confirm}</span><p class="text-xs subtle" style="margin-top:2px">${summary}</p></div><div class="row" style="gap:6px">${chips}<a class="text-xs muted" style="text-decoration:underline" href="#/admin/ai-actions">Skills</a></div></div>`;
  }

  function areaPanel(area) {
    const head = `<div class="row" style="padding:12px 16px;background:var(--surface-raised);border-bottom:1px solid var(--line)"><span class="text-xs subtle" style="width:12px">${area.isOpen ? '▾' : '▸'}</span><span class="strong">${area.name}</span><span class="text-xs subtle">${area.count} actions</span><div class="row" style="margin-left:auto;gap:6px">${area.skills.map((skill) => skillChip(skill)).join('')}${ui.btn('Area skills', 'secondary', { class: 'text-xs' })}</div></div>`;
    const body = area.isOpen ? area.actions.map((action) => actionRow(action, area)).join('') : '';
    return `<section class="panel" style="margin-bottom:12px">${head}${body}</section>`;
  }

  JPMS.page('/admin/ai-actions', {
    title: 'AI Actions',
    render() {
      const total = areas.reduce((sum, area) => sum + area.count, 0);
      const attachments = areas.reduce((sum, area) => sum + area.skills.length, 0) + 3;
      return ui.join([
        shared.header({ subtitle: `Every action a connected AI tool can perform, and the ${ui.link('skills', '#/admin/skills')} attached to each. An attached skill’s doctrine is served with the action’s contract, so the model reads it in the same breath as the schema — before it performs anything. Attach to a whole <span style="color:var(--content)">area</span> for discipline-wide doctrine, or to a single action for the exceptions. Changes are in force immediately.` }),
        ui.toolbar([`<span class="text-xs subtle">${total} actions · ${attachments} attachments</span>`], [`<input class="field" style="width:18rem;height:32px;font-size:14px;padding:0 12px" placeholder="Search actions…">`]),
        areas.map(areaPanel).join('')
      ]);
    }
  });
})();
