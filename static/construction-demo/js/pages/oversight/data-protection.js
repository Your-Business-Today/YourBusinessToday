/* Data protection — jpms/Pages/AdminDataProtection.razor: what the portal holds about one person,
   by email (PersonLookup, PersonDossierPanel), and the anonymisation that follows a request. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const email = 'm.greaves@mailbox.example';

  const records = [
    ['Lead', 'LD-0023 · Martin Greaves', [['Name', 'Martin Greaves'], ['Email', email], ['Phone', '07700 900719'], ['Property', 'Hillcrest, Station Road, Linford Heath'], ['Captured', '14 Jul 2026'], ['Stage', 'Lost']]],
    ['Directory contact', 'Martin Greaves', [['Name', 'Martin Greaves'], ['Email', email], ['Phone', '07700 900719'], ['Company', '—'], ['Added', '14 Jul 2026 by daniel.price@jewel-demo.example']]],
    ['Imagine round', 'LD-0023 · Round 1', [['Brief', 'Loft room for a home office with a view of the downs'], ['Concepts', '3 rendered'], ['Issued', '18 Jul 2026']]]
  ];

  const mentions = [
    ['LeadActivities', 'Summary', 6], ['MailboxMessages', 'FromAddress', 4], ['MailboxMessages', 'ToRecipients', 3],
    ['AuditEvents', 'Detail', 2], ['SalesProposals', 'SentTo', 1], ['Todos', 'Notes', 1]
  ];

  function lookupPanel() {
    const body = `<div class="row" style="align-items:flex-end;flex-wrap:nowrap"><div style="flex:1">${ui.field('Email address', email)}<p class="text-xs subtle" style="margin-top:4px">Exactly as the portal holds it — the address they sign in with, were invited on, or wrote to us from.</p></div>${ui.btn('Read what we hold', 'primary')}</div>`;
    return ui.panel('Find a person', body);
  }

  function recordCard([kind, title, fields]) {
    const values = fields.map(([label, value]) => `<span><span class="subtle">${label}:</span> ${value}</span>`).join('');
    return `<div style="border:1px solid var(--line);padding:12px;margin-bottom:12px"><p class="strong">${kind} — ${title}</p><div class="text-xs muted" style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-top:4px">${values}</div></div>`;
  }

  function dossierPanel() {
    const mentionCount = mentions.reduce((sum, mention) => sum + mention[2], 0);
    const mentionTable = ui.table({ columns: ['Table', 'Column', { label: 'Rows', num: true }], rows: mentions.map(([table, column, count]) => [ui.mono(table), ui.mono(column), count]), dense: true });
    const erasure = `<div style="border-top:1px solid var(--line);margin-top:24px;padding-top:20px">${ui.field('Reason for erasure *', 'Erasure request received by email 23 Sep 2026')}<p class="text-xs subtle" style="margin:4px 0 12px">Written to the audit trail — the request and its date, never the person's name.</p><button type="button" class="btn btn-secondary tone-negative">Anonymise this person…</button></div>`;
    const body = [`<p class="eyebrow" style="margin-bottom:12px">Records that are them (${records.length})</p>`, records.map(recordCard).join(''), `<p class="eyebrow" style="margin:24px 0 12px">Mentions (${mentionCount})</p>`, mentionTable, erasure];
    return ui.panel(`What we hold about ${email}`, body);
  }

  JPMS.page('/admin/data-protection', {
    title: 'Data protection',
    render() {
      return ui.join([
        shared.adminTabs(6),
        shared.header({ subtitle: `What the portal holds about one person, by email — the answer to a subject access request — and the erasure that follows one: their details erased, every mention rewritten to a pseudonym, nothing deleted. The ${ui.link('privacy notice', '#/admin/data-protection')} says what we promise.` }),
        `<div class="stack" style="max-width:64rem">${lookupPanel()}${dossierPanel()}</div>`
      ]);
    }
  });
})();
