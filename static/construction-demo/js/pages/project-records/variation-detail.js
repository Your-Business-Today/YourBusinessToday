/* Variation detail — jpms/Pages/ProjectVariationDetail.razor: VariationHeaderBar (status pill,
   one primary, Actions), RecordTabBar, the Architect's Instruction strip, the official document,
   Line items, Conversation, Communications, and the details / approved-figures sidebar. */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;

  const statusOptions = [
    { label: 'Quoting', hint: 'Being priced' },
    { label: 'Issued', hint: 'With the client' },
    { label: 'Awaiting AI', hint: "Waiting on a formal Architect's Instruction" },
    { label: 'Approved', hint: 'Approve & raise VO — writes the contract figures' },
    { label: 'Rejected', hint: 'Decline — confirms first' }
  ];

  const lines = [
    ['1000', 'Temporary works design and propping hire — 3 weeks', 1, 2160],
    ['2200', 'Precast padstones 440 × 215 × 140, bedded in M12 mortar', 2, 685],
    ['3100', 'Supply and install 203 × 133 × 30 UB lintel, 4.2 m, with intumescent coating', 1, 5940],
    ['3100', 'Form widened opening, needle and prop, make good brick reveals', 1, 4310],
    ['6100', 'Make good plaster to reveals and soffit', 1, 1180],
    ['7100', 'Re-set out kitchen run to the wider opening (Timbercraft)', 1, 2480]
  ];

  const sections = {
    scope: 'Widen the kitchen / dining opening at grid C/3–4 from 3.0 m to 3.6 m clear to suit the revised kitchen layout ID-I-120 rev C. Replace the specified angle lintels with a 203 × 133 × 30 UB on precast padstones, per engineer’s calculation SC-HH-014, and make good all finishes.',
    basis: 'Priced from the architect’s response to RFI-049 at contract rates where they apply; steel and joinery re-set-out at quoted rates from Ashlar Stone & Masonry and Timbercraft Joinery.',
    programme: 'No effect on completion if instructed by 29 Sep 2026. Kitchen wall task extends 4 working days; kitchen installation holds w/c 12 Oct.',
    exclusions: 'Changes to the kitchen units themselves; any further structural alteration beyond grid C/3–4.'
  };

  const conversation = [
    { who: 'Ravi Patel', role: 'Quantity Surveyor', when: '18 Sep 2026, 14:20', text: 'Priced at £17,440 across six lines. Steel from Ashlar at £5,940 installed; Timbercraft re-set-out at £2,480. Ready to issue.', isInternal: true },
    { who: 'Sophie Turner', role: 'Project Manager', when: '19 Sep 2026, 09:02', text: 'Issued V14 to Mr & Mrs Whitfield and copied Ashdown Rowe for the instruction.' },
    { who: 'Richard Whitfield', role: 'Client', when: '21 Sep 2026, 19:48', text: 'Thanks — the wider opening is exactly what we wanted. Happy to go ahead at £17,440.' },
    { who: 'Helen Rowe', role: 'Ashdown Rowe Architects', when: '24 Sep 2026, 11:30', text: 'Instruction AI-031 attached, covering the widened opening and the steel. Filed as AI-012 on your side, I understand.', isReply: true },
    { who: 'Daniel Price', role: 'Finance Director', when: '24 Sep 2026, 12:10', text: 'Once approved this lands on the October valuation — I’ve pencilled £17,440 into the cashflow for w/c 26 Oct.', isInternal: true }
  ];

  const emails = [
    { from: 'helen@ashdownrowe.example', to: 'projects@jewel-demo.example', when: '24 Sep 2026, 11:31', subject: 'Hollowmere House — Architect’s Instruction AI-031 (kitchen opening)', text: 'Please find attached AI-031 instructing the widened kitchen opening and the 203 UB lintel as per your variation V14.', tag: 'JPMS/VOQ-0014' },
    { from: 'sophie.turner@jewel-demo.example', to: 'Mr & Mrs Whitfield', when: '19 Sep 2026, 09:00', subject: 'V14 — Steel lintel and widened kitchen opening', text: 'Please find attached Variation Order V14 for your approval. The value is £17,440 excluding VAT.', tag: 'JPMS/VOQ-0014' }
  ];

  function actionItems(row) {
    const common = [{ label: 'Download Variation Order PDF' }, { label: 'Email to the client…' }, { label: 'Edit title…' }, { label: 'Edit document sections…' }];
    if (row.status === 'Approved') return [...common, { label: 'Issue work order' }, { label: 'Edit line items…' }, { label: 'Revise value…' }, { label: 'Return to quoting…' }, { label: 'Reject variation order…' }];
    return [...common, { label: 'Edit line items…' }, { label: 'Record agreed tender…' }, { label: 'Edit estimate…' }, { label: 'Decline variation…' }, { label: 'Delete variation…' }];
  }

  function linesFor(row) {
    if (row.id === 'v14') return lines;
    return [['6300', row.title, 1, row.value || 0]];
  }

  function linesPanel(row) {
    const rows = linesFor(row);
    const total = rows.reduce((sum, [, , quantity, rate]) => sum + quantity * rate, 0);
    const pence = (value) => value.toLocaleString('en-GB', { minimumFractionDigits: 2 });
    const table = ui.table({
      columns: ['Cost centre', 'Description', { label: 'Qty', num: true }, { label: 'Rate £', num: true }, { label: 'Amount £', num: true }],
      rows: rows.map(([code, description, quantity, rate]) => [ui.mono(code), description, `<span class="mono">${quantity}</span>`, `<span class="mono">${pence(rate)}</span>`, `<span class="mono">${pence(quantity * rate)}</span>`]),
      footer: ['', 'Total', '', '', `<span class="mono">${pence(total)}</span>`],
      dense: true
    });
    const note = row.status === 'Approved' ? 'Lines on the Valuation Report' : `${rows.length} lines held on the record`;
    return ui.panel('Line items', table, { flush: true, actions: [`<span class="text-xs subtle">${note}</span>`] });
  }

  function documentPanel(row) {
    const section = (label, text) => `<div><h4 class="eyebrow" style="margin-bottom:4px">${label}</h4><p class="muted" style="line-height:20px">${text}</p></div>`;
    const content = row.id === 'v14' ? sections : { scope: `${row.title}.`, basis: 'Contract rates where they apply; otherwise the quoted subcontract rate plus overheads and profit.', programme: 'No effect on completion.', exclusions: '—' };
    return `<div class="panel" style="padding:20px"><h3 class="eyebrow" style="margin-bottom:16px">Official Variation Order document</h3><div class="stack-sm">${section('Scope of works', content.scope)}${section('Commercial basis', content.basis)}${section('Programme impact', content.programme)}${section('Exclusions', content.exclusions)}</div></div>`;
  }

  function conversationPanel(row) {
    const thread = row.id === 'v14' ? conversation.map(records().message).join('') : '<p class="subtle">No messages yet.</p>';
    const composer = `<div style="margin-top:16px">${ui.field('Reply to the shared thread', '', { textarea: true, placeholder: 'The client and architect read this thread…' })}<div class="row" style="justify-content:space-between;margin-top:8px"><label class="text-xs subtle"><input type="checkbox"> Internal note</label>${ui.btn('Post')}</div></div>`;
    return ui.panel('Conversation', [thread, composer]);
  }

  function communicationsPanel(row) {
    const body = row.id === 'v14' ? emails.map(records().email).join('') : `<p class="subtle" style="font-style:italic">No emails are tagged to this variation yet. Tag an email to <span class="strong">${row.quote}</span> in mailbox triage and it appears here.</p>`;
    return `<div class="panel" style="padding:20px"><div class="row-between" style="margin-bottom:12px"><h3 class="eyebrow">Communications</h3>${ui.btn('Reload', 'ghost')}</div>${body}</div>`;
  }

  function instructionStrip(project, row) {
    const linked = records().instructions(project.id).filter((instruction) => instruction.links.includes(row.ref));
    if (linked.length) {
      const refs = linked.map((instruction) => `<a class="mono strong" href="#/projects/${project.id}/architect-instructions" title="${ui.escape(instruction.title)}">${instruction.ref}</a>`).join(' ');
      const state = linked.some((instruction) => instruction.file) ? '· document on file' : '· document still awaited';
      return `<div class="row" style="gap:8px;padding:8px 12px;margin-bottom:16px;border:1px solid var(--line);background:var(--surface-raised);border-radius:4px"><span class="eyebrow">Architect's Instruction</span>${refs}<span class="text-xs subtle">${state}</span></div>`;
    }
    if (row.status !== 'Awaiting AI') return '';
    return `<div class="subtle" style="padding:8px 12px;margin-bottom:16px;border:1px solid var(--line);background:var(--surface-raised);border-radius:4px">Waiting on a formal Architect's Instruction. None is linked yet — <a class="tone-accent" href="#/projects/${project.id}/architect-instructions">file or link one</a> when it arrives, then approve the variation to write the contract figures.</div>`;
  }

  function sidebar(row) {
    const isV14 = row.id === 'v14';
    const details = records().sidePanel('Details', [
      records().factRow('Estimate', row.value ? ui.money(row.value) : '—'),
      records().factRow('Selected sub', isV14 ? 'Ashlar Stone &amp; Masonry' : '—'),
      records().factRow('Issued', row.issued),
      row.status === 'Approved' ? records().factRow('Approved', row.approved) : '',
      records().factRow('Created', isV14 ? '16 Sep 2026' : row.issued)
    ]);
    if (row.status !== 'Approved') return details;
    const approved = records().sidePanel('Approved figures', [`<p class="mono semibold">${row.ref}</p>`, records().factRow('Value', ui.money(row.value)), records().factRow('Cost centre', '<span class="mono">6300</span>'), '<p class="text-xs subtle">Added to the Valuation Report and committed to the cost centre.</p>']);
    return details + approved;
  }

  function primaryLabel(row) {
    if (row.status === 'Rejected') return '';
    if (row.status === 'Approved') return ui.btn('Issue work order', 'primary');
    return ui.btn(row.id === 'v14' ? 'Approve & raise VO…' : 'Approve manually & raise VO…', 'primary');
  }

  function tabs(project, row) {
    const request = row.requestId && records().findRequest(row.requestId);
    const list = [];
    if (request) {
      list.push({ id: 'request', eyebrow: 'Request', label: request.number || request.ref, href: `#/projects/${project.id}/requests/view/${request.id}` });
      if (request.number) list.push({ id: 'official', eyebrow: 'RFI', label: request.ref, href: `#/projects/${project.id}/requests/view/${request.id}` });
    }
    list.push({ id: 'variation', eyebrow: 'Variation', label: row.ref, href: `#/projects/${project.id}/variations/${row.id}` });
    return records().recordTabBar(list, 'variation');
  }

  JPMS.page('/projects/:project/variations/:id', {
    title: 'Variation Orders',
    render(params) {
      const project = JPMS.project(params.project);
      const row = records().findVariation(params.id) || records().findVariation('v14');
      const tone = records().variationTones[row.status] || 'muted';
      const header = records().headerBar({ reference: row.ref, secondary: row.quote, kind: 'Variation Order', pills: [records().statusMenu(row.status, tone, statusOptions)], title: ui.escape(row.title), actions: [primaryLabel(row), ui.menu('Actions', actionItems(row))] });
      const back = row.requestId ? records().backLink('Originating request', `#/projects/${project.id}/requests/view/${row.requestId}`) : records().backLink('Variations', `#/projects/${project.id}/variations`);
      const unlinked = row.request ? '' : `<div style="margin-bottom:16px">${ui.notice('', "This variation isn't linked to the request (RFI) it was raised from, so its history can't be traced yet. Link it from Actions to complete the chain.", 'warning')}</div>`;
      const main = `<div class="stack">${documentPanel(row)}${linesPanel(row)}${conversationPanel(row)}${communicationsPanel(row)}</div>`;
      return records().projectShell(project, [back, header, tabs(project, row), unlinked, instructionStrip(project, row), `<div class="grid grid-sidebar"><div>${main}</div><div class="stack">${sidebar(row)}</div></div>`]);
    }
  });
})();
