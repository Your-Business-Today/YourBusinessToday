/* Sales Inbox — jpms/Pages/SalesInbox.razor: the sales mailbox read live, each sender chipped with
   the lead whose contact email it is, and the opened thread with Reply, Log on the lead, New lead. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const sales = JPMS.sales;
  const mailbox = 'sales@jewel-demo.example';

  const messages = [
    ['Richard Ashworth', 'r.ashworth@mailbox.example', '09:12', 'Re: Harcourt Lodge — proposal v2', 'Thank you both. The lantern is exactly what we hoped for — could we talk about the timing of the roof?', false],
    ['Oliver Fenwick', 'oliver@fenwickhale.example', '08:47', 'Sandpit Lane — tender list', 'We are finalising the tender list for Plot 2 this week and would like to include you.', true],
    ['Georgina Hale-Bury', 'georgina.hb@mailbox.example', 'Yesterday', 'Enquiry via the website — barn conversion', 'We have just bought a flint barn near Coldharbour Vale with consent for conversion…', false],
    ['Naomi Varga', 'naomi.varga@mailbox.example', 'Yesterday', 'Basement — party wall question', 'Our neighbour has asked who would act as party wall surveyor. Do you have someone?', false],
    ['Caroline Dunmore', 'c.dunmore@mailbox.example', '23 Sep', 'Pool house — plant room', 'Following the call — the plant room could go under the terrace if that helps the budget.', true],
    ['Linford Heath Property Awards', 'events@lhawards.example', '22 Sep', 'Shortlisted: Best Heritage Restoration', 'Congratulations — Wrenfield Barn has been shortlisted in the heritage category.', false],
    ['Alastair Kemp', 'alastair@kempestates.example', '22 Sep', 'Mill Lane — programme', 'Can you give an indicative programme for three plots running in parallel?', false],
    ['Fiona Hartley', 'hartleys@mailbox.example', '19 Sep', 'Annex proposal — a few questions', 'We have read the proposal twice. Would the lift need its own foundation?', true]
  ];

  function leadChip(email) {
    const lead = sales.leadByEmail(email);
    return lead ? ui.pill(`${lead.ref} · ${lead.stage}`, { Engaged: 'info', 'Site visit': 'info', Proposal: 'info' }[lead.stage]) : '<span class="text-xs faint">no lead</span>';
  }

  function listRow([name, email, when, subject, preview, hasAttachment], index) {
    const clip = hasAttachment ? '<span class="text-xs subtle">📎</span>' : '';
    return `<div class="list-row ${index === 0 ? 'is-selected' : ''}" style="display:block;cursor:pointer"><div class="row-between"><span class="strong">${name}</span><span class="text-xs subtle">${when}</span></div><p class="muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${subject}</p><p class="text-xs subtle" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${preview}</p><div class="row" style="margin-top:6px">${leadChip(email)}${clip}</div></div>`;
  }

  function messageList() {
    const pager = `<div class="row" style="justify-content:flex-end;padding:12px 16px">${ui.btn('First page', 'ghost')}${ui.btn('Older', 'ghost')}</div>`;
    return `<section class="panel"><div class="panel-flush">${messages.map(listRow).join('')}${pager}</div></section>`;
  }

  function threadMessage(from, when, body) {
    return `<div class="message"><div class="message-head"><span class="strong">${from}</span><span class="text-xs subtle">${when}</span></div>${body}</div>`;
  }

  function thread() {
    const lead = sales.lead('ld-0031');
    const head = `<div class="panel-body" style="border-bottom:1px solid var(--line)"><p class="text-lg semibold">Re: Harcourt Lodge — proposal v2</p><p class="text-xs subtle" style="margin-top:4px">3 messages · ${lead.contact} &lt;${lead.email}&gt; · ${leadChip(lead.email)}</p><div class="row" style="margin-top:12px">${ui.btn(`Log on ${lead.ref}`)}${ui.btn('New lead from this email')}${ui.btn('Log on a lead…', 'ghost')}${ui.btn('Reply', 'primary')}</div></div>`;
    const bodies = [
      threadMessage('Marcus Hale', '22 Sep 2026 17:05', '<p class="muted">Richard, Catherine — proposal v2 is attached, with the oak lantern over the kitchen and the reclaimed clay re-roof priced as a separate section so you can phase it. The Imagine page has the revised concept.</p><p class="text-xs subtle" style="margin-top:8px">📎 Harcourt-Lodge-Proposal-v2.pdf</p>'),
      threadMessage('Richard Ashworth', '24 Sep 2026 21:18', '<p class="muted">Thank you both. The lantern is exactly what we hoped for. Two questions: could the roof be done in the spring rather than over winter, and would the kitchen be usable while the orangery goes up?</p>'),
      threadMessage('Richard Ashworth', '25 Sep 2026 09:12', '<p class="muted">One more — our architect friend asked whether the lantern would need building regs sign-off separately. Happy to talk on the phone.</p>')
    ].join('');
    return `<section class="panel">${head}<div style="padding:16px 24px">${bodies}</div><p class="text-xs subtle" style="padding:0 24px 16px">Reply-all from ${mailbox}, your text above the quoted thread.</p></section>`;
  }

  JPMS.page('/sales/inbox', {
    title: 'Inbox',
    render() {
      const actions = [ui.search('Search the mailbox'), ui.btn('Refresh')];
      return ui.join([
        shared.salesTabs(1),
        shared.header({ subtitle: `${mailbox}, live — the conversation with a prospect beside the lead it belongs to. Reply from here; log an email on the lead; raise a lead from an email.`, actions }),
        `<div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,3fr)">${messageList()}${thread()}</div>`
      ]);
    }
  });
})();
