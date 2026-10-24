/* Request detail — jpms/Pages/ProjectRequestDetail.razor: RequestHeaderBar, RecordTabBar,
   RequestFactsStrip, the official RFI form, Response, Attachments, Conversation, History,
   Request type & recipients and the Variation card. RFI-049 carries the full story. */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;
  const downloadIcon = '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14"/>';
  const emailIcon = '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>';

  const statusOptions = [
    { label: 'Needs action', hint: 'The ball is with us — issue the document, act on the response.' },
    { label: 'Open / Awaiting response', hint: 'With the correspondent; we are waiting on their answer.' },
    { label: 'Needs variation', hint: 'The response needs a variation order quote raising.' },
    { label: 'Closed', hint: "Closes with today's date — the agent gate still applies." }
  ];

  const actionItems = [
    { label: 'Record response…' }, { label: 'Close request…' }, { label: 'Edit subject & reference…' },
    { label: 'Edit dates & references…' }, { label: 'Edit description…' }, { label: 'Edit official form' },
    { label: 'Create Variation Order Quote…', hint: 'Price the work this RFI has led to' },
    { label: 'Return to Control Centre…' }, { label: 'Delete request…' }
  ];

  const story = {
    basis: 'Opening-up of the existing kitchen / dining wall on 07 Sep 2026 found the opening shown on SE-S-110 rev B (3.0 m clear) conflicts with the client’s revised kitchen layout ID-I-120 rev C, which needs 3.6 m clear. The specified 2 no. 100 × 65 angle lintels are not adequate at the wider span.',
    action: 'Confirm the lintel section, bearing length and padstone detail for a 3.6 m clear opening, and confirm whether the widened opening is instructed.',
    impact: 'The kitchen wall and first-fix M&E in the kitchen are on hold. Kitchen installation (Timbercraft, w/c 12 Oct) would slip, and plastering behind it by two weeks.',
    items: [
      ['1', 'SE-S-110 rev B', 'Kitchen / dining wall, grid C/3–4', 'Lintel section for a 3.6 m clear span?', '203 × 133 × 30 UB, S355, 150 mm bearing each end, intumescent coating to 30 min.'],
      ['2', 'SE-S-110 rev B', 'Padstones, both ends', 'Padstone size and grade?', '440 × 215 × 140 precast concrete padstones, 10 N/mm², bedded in M12 mortar.'],
      ['3', 'ID-I-120 rev C', 'Kitchen run', 'Is the widened opening to proceed?', 'Yes — proceed with the widened opening; price it as a variation for the client.']
    ],
    response: 'Engineer’s calc attached (SC-HH-014). Use a 203 × 133 × 30 UB with 440 × 215 × 140 padstones, 150 mm bearing. Widened opening to 3.6 m is to proceed — please price as a variation and send to the client; we will issue an instruction once they confirm.',
    conversation: [
      { who: 'Liam Carter', role: 'Site Manager', when: '08 Sep 2026, 07:52', text: 'Opened up the kitchen wall this morning. The new kitchen layout needs 3.6 m clear, drawing shows 3.0 m on two angle lintels — not going to work. Photos attached. Need an answer before we can prop and cut.', isInternal: true },
      { who: 'Sophie Turner', role: 'Project Manager', when: '08 Sep 2026, 09:15', text: 'Raised as RFI-049 to Ashdown Rowe with the engineer copied in. Flagged critical path — kitchen fit is booked for w/c 12 Oct.', isInternal: true },
      { who: 'Helen Rowe', role: 'Ashdown Rowe Architects', when: '15 Sep 2026, 16:40', text: 'Our engineer has sized the steel — see the response on the RFI. Client is keen on the wider opening; please price it and we’ll instruct once they confirm.' },
      { who: 'Ravi Patel', role: 'Quantity Surveyor', when: '16 Sep 2026, 10:05', text: 'Raised V14 to price it. Northgate for padstones, Ashlar for the steel and brick reveals, Timbercraft to re-set the kitchen run.', isInternal: true, isReply: true }
    ],
    history: [
      ['08 Sep 2026', 'Request REQ-0187 raised from site by liam.carter@jewel-demo.example'],
      ['09 Sep 2026', 'Promoted to RFI-049 · issued to Ashdown Rowe Architects'],
      ['09 Sep 2026', 'RFI document drafted to the projects mailbox'],
      ['15 Sep 2026', 'Response recorded — status Needs variation'],
      ['16 Sep 2026', 'Variation Order Quote V14 raised by ravi.patel@jewel-demo.example'],
      ['19 Sep 2026', 'V14 issued to the client'],
      ['24 Sep 2026', 'AI-012 filed against V14']
    ]
  };

  function officialForm(row, isRich) {
    const toolbar = `<div class="row" style="gap:8px">${ui.iconBtn(downloadIcon, 'Download the RFI PDF')}${ui.iconBtn(emailIcon, 'Email this RFI')}</div>`;
    const section = (label, text) => `<div><h4 class="eyebrow" style="margin-bottom:4px">${label}</h4><p class="muted" style="line-height:20px">${text}</p></div>`;
    const items = isRich ? story.items : [['1', row.drawing || '—', '—', ui.escape(row.title), '—']];
    const table = ui.table({ columns: ['#', 'Drawing ref', 'Member / area', 'Query', 'Response (when received)'], rows: items, dense: true });
    const sections = isRich ? [section('Basis of queries', story.basis), section('Response / action required', story.action), section('Impact if not received by the required date', story.impact)] : [section('Basis of queries', 'Raised from the site team’s query and the drawing referenced above.')];
    return `<div class="panel" style="padding:20px"><div class="row-between" style="margin-bottom:16px"><h3 class="eyebrow">Official RFI form</h3>${toolbar}</div><div class="stack-sm">${sections.join('')}<div><p class="eyebrow" style="margin-bottom:8px">Itemised queries</p><div style="border:1px solid var(--line)">${table}</div></div></div></div>`;
  }

  function responsePanel() {
    return ui.panel('Response', `<p class="text-xs subtle" style="margin-bottom:8px">Recorded 15 Sep 2026 · helen@ashdownrowe.example</p><p class="muted" style="line-height:20px">${story.response}</p>`);
  }

  function attachmentsPanel(isRich) {
    const actions = [ui.btn('Attach documents'), ui.btn('Upload files')];
    if (!isRich) return ui.panel('Attachments', `<p class="subtle">No attachments yet.</p>`, { actions });
    const drawing = `<div class="list-row" style="padding:10px 0"><span class="row" style="gap:8px"><span class="mono">SE-S-110</span><span>Kitchen / dining wall — structural openings</span>${ui.pill('Rev B', 'positive')}</span><span class="text-xs subtle">Linked drawing</span></div>`;
    const calc = `<div class="list-row" style="padding:10px 0"><span class="row" style="gap:8px"><span class="mono">SC-HH-014.pdf</span><span>Engineer’s calculation — kitchen opening</span></span><span class="text-xs subtle">Uploaded 15 Sep</span></div>`;
    const photos = `<div class="grid grid-3 grid-gap-sm" style="margin-top:12px"><div class="photo">Kitchen wall opened up</div><div class="photo">Existing angle lintels</div><div class="photo">Grid C/3 bearing</div></div>`;
    return ui.panel('Attachments', [drawing, calc, photos], { actions });
  }

  function conversationPanel(isRich) {
    const messages = isRich ? story.conversation.map(records().message).join('') : `<p class="subtle">No messages yet.</p>`;
    const composer = `<div style="margin-top:16px">${ui.field('Add to the conversation', '', { textarea: true, placeholder: 'Write a message…' })}<div class="row" style="justify-content:flex-end;margin-top:8px">${ui.btn('Post')}</div></div>`;
    return ui.panel('Conversation', [messages, composer]);
  }

  function historyPanel(isRich) {
    const entries = (isRich ? story.history : [['—', 'Request raised']]).map(([when, what]) => `<div class="timeline-item is-done"><p class="text-xs subtle">${when}</p><p class="muted" style="margin-top:2px">${what}</p></div>`).join('');
    return records().sidePanel('History', `<div class="timeline">${entries}</div>`);
  }

  function partyPanel(project) {
    const architect = JPMS.data.architects.find((firm) => firm.firm === project.architect) || JPMS.data.architects[0];
    return records().sidePanel('Request type &amp; recipients', [
      records().factRow('Type', 'RFI — Request for Information'),
      records().factRow('Corresponds with', architect.firm),
      records().factRow('On behalf of', project.client),
      `<p class="eyebrow">Draft will be addressed to</p><p class="text-xs muted">To: ${architect.email}<br>CC: sophie.turner@jewel-demo.example, projects@jewel-demo.example</p>`
    ]);
  }

  function variationCard(project, row) {
    if (!row.variation) {
      return records().sidePanel('Variation', [`<p class="text-xs subtle" style="line-height:16px">Price the work this RFI has led to. You decide the title, the value and which lines to keep. It stays in Quoting until the client approves it.</p>`, ui.btn('Create Variation Order Quote', 'secondary', { class: 'btn-block' })]);
    }
    const variation = records().findVariation(row.variation.toLowerCase());
    return records().sidePanel('Variation', [`<p><span class="mono semibold">${variation.ref}</span><span class="subtle" style="margin-left:8px">${variation.status}</span></p>`, `<a class="btn btn-secondary btn-block" href="#/projects/${project.id}/variations/${variation.id}">Open variation</a>`]);
  }

  function tabsFor(project, row) {
    const tabs = [{ id: 'request', eyebrow: 'Request', label: row.number || row.ref, href: `#/projects/${project.id}/requests/view/${row.id}` }];
    if (row.number) tabs.push({ id: 'official', eyebrow: 'RFI', label: row.ref, href: `#/projects/${project.id}/requests/view/${row.id}` });
    if (row.variation) tabs.push({ id: 'variation', eyebrow: 'Variation', label: row.variation, href: `#/projects/${project.id}/variations/${row.variation.toLowerCase()}` });
    return records().recordTabBar(tabs, row.number ? 'official' : 'request');
  }

  function render(params) {
    const project = JPMS.project(params.project);
    const row = records().findRequest(params.id) || records().findRequest('rfi-049');
    const isRich = row.id === 'rfi-049';
    const isRfi = Boolean(row.number);
    const pills = [records().statusMenu(row.status, records().requestTones[row.status] || 'muted', statusOptions), row.variation && row.status !== 'Closed' ? ui.pill('Variation', 'warning') : '', row.isCriticalPath ? ui.pill('Critical path', 'negative') : ''];
    const header = records().headerBar({ reference: row.ref, secondary: row.number, kind: isRfi ? 'RFI' : 'General', pills, title: ui.escape(row.title), actions: [ui.btn(isRfi ? 'Email RFI' : 'Promote to RFI', 'primary'), ui.menu('Actions', actionItems)] });
    const facts = records().factsStrip([
      ['Raised by', isRich ? 'liam.carter@jewel-demo.example' : 'sophie.turner@jewel-demo.example'],
      ['Issued', row.issued], ['Response due', row.due || '—'],
      ['Days outstanding', row.days ?? '—', row.isOverdue ? 'negative' : ''],
      ['Drawing / detail', row.drawing || '—'], ['Related drawing / spec', isRich ? 'SC-HH-014' : '—'], ['Created', isRich ? '08 Sep 2026' : row.issued]
    ]);
    const main = `<div class="stack">${isRfi ? officialForm(row, isRich) : ui.panel('Detail', `<p class="muted">${ui.escape(row.title)}.</p>`)}${isRich ? responsePanel() : ''}${attachmentsPanel(isRich)}${conversationPanel(isRich)}</div>`;
    const side = `<div class="stack">${historyPanel(isRich)}${partyPanel(project)}${isRfi ? variationCard(project, row) : ''}</div>`;
    return records().projectShell(project, [records().backLink('Request register', `#/projects/${project.id}/requests`), header, tabsFor(project, row), facts, `<div class="grid grid-sidebar">${main}${side}</div>`]);
  }

  JPMS.page('/projects/:project/requests/view/:id', { title: 'RFIs', render });
})();
