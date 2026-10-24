/* The Control Centre's inbox and email windows — InboxPaneHeader, QueueInboxList / TriageEmailRow
   (date groups, thread chips), TaggedInboxBrowser (pathway filter, one filing per email) and
   TriageMessageDetail (header, attachments with the document-triage tick, body, thread tabs). */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const data = JPMS.controlCentreData;
  const pathwayTones = { Client: 'positive', Subcontractor: 'warning', Supplier: 'info', Sales: 'accent', Internal: '' };

  function tagChip(tag) {
    return `<span class="text-xs" title="JPMS/${tag}" style="border:1px solid rgba(102,224,148,.4);color:var(--accent);border-radius:999px;padding:1px 8px">${tag}</span>`;
  }

  function rowShell(isSelected, href, inner) {
    const border = isSelected ? 'var(--accent)' : 'var(--line)';
    const background = isSelected ? 'var(--surface-raised)' : 'transparent';
    return `<a href="${href}" style="display:block;border:1px solid ${border};background:${background};border-radius:4px;padding:8px 12px;margin-bottom:8px">${inner}</a>`;
  }

  function queueRow(mail, selectedId, hrefFor) {
    const clip = mail.hasAttachments ? `<span class="subtle" title="Has attachments">${ui.svg(frame.paths.clip, 'xs')}</span>` : '';
    const draft = mail.id === 'm3' ? '<span class="text-xs semibold tone-accent" title="Unfinished triage — open the email to carry on where you left off">✎ draft</span>' : '';
    const thread = mail.threadTags.length ? `<div class="row" style="gap:4px;margin-top:6px"><span class="text-xs subtle">Thread:</span>${mail.threadTags.map(tagChip).join('')}</div>` : '';
    const inner = `<div class="row-between" style="flex-wrap:nowrap"><span class="semibold" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ui.escape(mail.from)}</span><span class="text-xs subtle">${mail.time}</span></div><div class="row" style="gap:6px;margin-top:3px;flex-wrap:nowrap"><span class="muted" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ui.escape(mail.subject)}</span>${draft}${clip}</div><p class="text-xs subtle" style="margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ui.escape(mail.preview)}</p>${thread}`;
    return rowShell(mail.id === selectedId, hrefFor({ m: mail.id }), inner);
  }

  function queueList(selectedId, hrefFor) {
    let lastGroup = '';
    const rows = data.queue.map((mail) => {
      const heading = mail.group !== lastGroup ? `<p class="subtle" style="padding:8px 4px 4px;font-weight:500">${mail.group}</p>` : '';
      lastGroup = mail.group;
      return heading + queueRow(mail, selectedId, hrefFor);
    }).join('');
    const sort = '<div class="row text-xs" style="gap:12px;padding:0 4px"><span class="strong" style="text-decoration:underline">Oldest first</span><span class="subtle">Newest first</span></div>';
    const pager = '<div class="row-between text-xs subtle" style="padding:8px 4px"><span>Page 1 of 3 · 23 emails</span><span class="row" style="gap:12px"><span>‹ Previous</span><span class="strong">Next ›</span></span></div>';
    return sort + rows + pager;
  }

  function taggedRow(mail) {
    const pathway = mail.pathway ? ui.pill(mail.pathway, pathwayTones[mail.pathway]) : '';
    const tags = mail.tags.map((tag) => `<span title="JPMS/${tag}">${ui.pill(tag, 'info')}</span>`).join('');
    const inner = `<div class="row-between" style="flex-wrap:nowrap"><span class="semibold">${ui.escape(mail.from)}</span><span class="text-xs subtle">${mail.time}</span></div><p class="muted" style="margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ui.escape(mail.subject)}</p><div class="row" style="gap:4px;margin-top:6px">${pathway}${tags}</div>`;
    return rowShell(false, '#/control-centre?view=tagged', inner);
  }

  function taggedList() {
    const search = `<div style="margin-bottom:12px">${ui.search('Search tagged emails — subject or sender, or a record reference (WO-0045)')}</div>`;
    const pathways = ['All', 'Client', 'Subcontractor', 'Supplier', 'Sales', 'Internal'].map((label, index) => `<button type="button" class="chip${index === 0 ? ' is-active' : ''}" data-chip style="height:26px;font-size:12px">${label}</button>`).join('');
    const filter = '<div class="row" style="gap:8px;margin-bottom:16px"><span class="eyebrow">Filter</span><button type="button" class="text-xs muted" style="border:1px solid var(--line);border-radius:999px;padding:4px 12px">All tags ▾</button></div>';
    return `${search}<div class="row" style="gap:8px;margin-bottom:12px"><span class="eyebrow">Pathway</span>${pathways}</div>${filter}${data.tagged.map(taggedRow).join('')}`;
  }

  function inboxPane(view, selectedId, hrefFor) {
    const isTagged = view === 'tagged';
    const strapline = isTagged ? '148 tagged emails — add or remove tags to manage which processes use them.' : '23 emails in the inbox waiting to be assigned to a request.';
    const tabs = `<div class="row" style="gap:4px;border-bottom:1px solid var(--line);margin:12px 0"><a class="tab${isTagged ? '' : ' is-active'}" href="${hrefFor({ view: 'queue' })}">Queue</a><a class="tab${isTagged ? ' is-active' : ''}" href="${hrefFor({ view: 'tagged' })}">Tagged</a></div>`;
    const header = `<p class="eyebrow">JPMS · ${data.mailbox}</p><p class="muted" style="margin-top:4px">${strapline}</p>`;
    return header + tabs + (isTagged ? taggedList() : queueList(selectedId, hrefFor));
  }

  function attachmentList(mail) {
    if (!mail.hasAttachments) return '';
    const files = mail.id === 'm1' ? data.attachments : [[`${mail.subject.split(' — ')[0].replace(/^RE: /, '')}.pdf`, '842 KB', false]];
    const rows = files.map(([name, size, isTicked]) => `<li class="row-between" style="padding:3px 0;flex-wrap:nowrap"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span><span class="row text-xs" style="gap:12px;flex-wrap:nowrap;white-space:nowrap"><span class="subtle">${size}</span><span class="tone-accent">Preview</span><span class="tone-accent">Download</span><label class="row muted" style="gap:6px;flex-wrap:nowrap"><input type="checkbox" ${isTicked ? 'checked' : ''}>Send to document triage</label></span></li>`).join('');
    return `<div class="card" style="background:var(--surface-raised);padding:12px"><div class="row-between" style="margin-bottom:8px"><p class="eyebrow">${files.length} attachment${files.length === 1 ? '' : 's'}</p><span class="text-xs tone-accent">Select all</span></div><ul>${rows}</ul></div>`;
  }

  function threadTabs() {
    const chips = data.thread.map((member, index) => {
      const isCurrent = index === data.thread.length - 1;
      return `<button type="button" class="chip${isCurrent ? ' is-active' : ''}" style="height:24px;padding:0 8px;font-size:12px" title="${member.from} — ${member.date}">${index + 1}${isCurrent ? ' ·' : ''}</button>`;
    }).join('');
    return `<div class="card row" style="background:var(--surface-raised);padding:8px 12px;gap:6px"><span class="eyebrow" style="margin-right:4px">Thread · email 3 of 3</span>${chips}</div>`;
  }

  function emailBody(mail, project) {
    if (mail.id !== 'm1') return `<div class="card" style="background:#fff;color:#1a1a1a;line-height:20px;padding:16px">Hello,<br><br>${ui.escape(mail.preview.replace('…', '.'))}<br><br>Kind regards,<br>${ui.escape(mail.from)}</div>`;
    return `<div class="card" style="background:#fff;color:#1a1a1a;line-height:20px;padding:16px">Dear Liam,<br><br>Further to RFI-049, please find attached the engineer’s revised detail SE-104 rev C for the widened kitchen opening at ${ui.escape(project.name)}. The lintel is now a 203x133 UB with padstones as shown; propping to remain until the engineer has inspected the bearings.<br><br>This answers RFI-049. V14 has been signed by the client and AI-012 is issued under separate cover.<br><br>Kind regards,<br>Helen Rowe<br>Ashdown Rowe Architects</div>`;
  }

  function emailPane(mail, project) {
    const header = `<h2 class="text-lg semibold">${ui.escape(mail.subject)}</h2><div class="row" style="gap:12px;margin-top:12px;flex-wrap:nowrap;align-items:flex-start"><span class="avatar" style="background:rgba(102,224,148,.15);color:var(--accent)">${mail.from.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span><div style="flex:1;min-width:0"><div class="row-between"><p><span class="semibold">${ui.escape(mail.from)}</span><span class="subtle"> &lt;${mail.email}&gt;</span></p><span class="text-xs subtle">25 Sep 2026 ${mail.time}</span></div><p class="text-xs subtle" style="margin-top:3px">To: ${data.mailbox}; liam.carter@jewel-demo.example</p><p class="text-xs subtle" style="margin-top:3px">Cc: sophie.turner@jewel-demo.example</p></div></div>`;
    const buttons = `<div class="row">${ui.btn('↩ Reply')}${ui.btn('→ Forward')}</div>`;
    return `<section class="panel" style="padding:20px"><div class="stack-sm">${header}${attachmentList(mail)}${emailBody(mail, project)}${mail.id === 'm1' ? threadTabs() : ''}${buttons}</div></section>`;
  }

  JPMS.controlCentreInbox = { inboxPane, emailPane, tagChip };
})();
