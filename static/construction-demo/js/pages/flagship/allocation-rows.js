/* Cost allocation rows — LedgerLineIdentityCell, QueueLineRow, AllocatedSummaryRow (with its Xero
   write-back badge) and WorkOrderBillCard from jpms/Features/Xero/Allocation. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const projects = ['Hollowmere House', 'The Old Coach House', 'Kingsridge Lodge', 'Wrenfield Barn'];
  const centres = JPMS.data.costCodes.map((code) => `${code.code} · ${code.name}`);
  const small = 'height:26px;padding:0 10px;font-size:12px';

  function tag(text, title) {
    return `<span class="text-xs" title="${title || ''}" style="margin-left:6px;border:1px solid var(--line);border-radius:4px;padding:1px 6px">${text}</span>`;
  }

  function darkButton(label, title) {
    return `<button type="button" class="text-xs semibold" title="${title || ''}" style="border-radius:4px;padding:5px 10px;white-space:nowrap;background:var(--content);color:var(--canvas)">${ui.escape(label)}</button>`;
  }

  function identity(line) {
    const credit = line.isCredit ? tag('Credit') : '';
    const draft = line.isDraft ? tag('Draft', 'Awaiting approval in Xero — allocating every line of this bill confirms its cost codes to Xero and approves it') : '';
    const clip = line.hasDocument ? `<span title="View the invoice document" style="display:inline-flex">${ui.svg(frame.paths.clip, 'xs')}</span>` : '';
    const meta = `<span class="text-xs subtle" style="display:flex;align-items:center;gap:4px;margin-top:3px;white-space:nowrap">${clip}${line.date} · ${line.number} · ${line.site} · ${line.code}</span>`;
    const exception = line.exception ? `<span class="text-xs tone-warning" style="display:block;margin-top:4px">Not a Work Order bill: ${line.exception}</span>` : '';
    return `<span class="strong">${ui.escape(line.supplier)}</span>${credit}${draft}<span class="muted" style="display:block;margin-top:3px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${ui.escape(line.description)}">${ui.escape(line.description)}</span>${meta}${exception}`;
  }

  function picker(chosen, options, width) {
    const ordered = chosen ? [chosen, ...options.filter((option) => option !== chosen)] : ['—', ...options];
    return frame.select(ordered, width);
  }

  function queueRow(line) {
    const failed = line.writeFailed ? '<span class="text-xs tone-negative" style="display:block;margin-top:3px" title="Xero said: the Sites option could not be set. Press Set to retry.">⚠ Xero write failed</span>' : '';
    const primary = line.bucket ? darkButton(`Allocate to ${line.bucket}`, `Allocate to the ${line.bucket} bucket — no project, no cost centre`) : darkButton('Allocate');
    const actions = `<div class="row" style="gap:6px;justify-content:flex-end;flex-wrap:nowrap">${primary}<button type="button" class="btn btn-secondary" style="${small}">Set</button><button type="button" class="btn btn-secondary" style="${small}">More ▾</button></div>`;
    return ['<input type="checkbox">', identity(line), `<span class="strong">${ui.money(line.net, { pence: true })}</span>`, picker(line.project, projects, '150px') + failed, picker(line.centre, centres, '176px'), actions];
  }

  const badges = {
    approved: (line) => `<span class="text-xs tone-positive" style="display:block;margin-top:3px" title="${line.at}">✓ Approved in Xero by JPMS</span>`,
    failed: (line) => `<span class="text-xs tone-negative" style="display:block;margin-top:3px">⚠ Xero write-back failed — still ${line.status} in Xero</span>`,
    draft: () => '<span class="text-xs tone-warning" style="display:block;margin-top:3px">Draft in Xero — approves once the whole bill is allocated</span>',
    outside: (line) => `<span class="text-xs subtle" style="display:block;margin-top:3px" title="The bill was approved or paid in Xero without the portal's write-back">${line.status} in Xero (outside JPMS)</span>`
  };

  function errorNote(line) {
    if (!line.error) return '';
    const earlier = line.earlierFailure ? `Earlier attempt failed ${line.earlierFailure}: ` : '';
    return `<span class="text-xs subtle" style="display:block;margin-top:3px;max-width:440px;line-height:15px">${earlier}${line.error}</span>`;
  }

  function allocatedTo(line) {
    const place = line.splits
      ? `<span>Multiple projects</span>${line.splits.map(([project, centre, net]) => `<span class="text-xs subtle" style="display:block"><span class="muted">${project} · </span>${centre} · ${ui.money(net, { pence: true })}</span>`).join('')}`
      : `<span>${line.project}</span><span class="text-xs subtle" style="display:block">${line.centre}</span>`;
    const order = line.workOrder ? `<span class="text-xs subtle" style="display:block;margin-top:3px">Work Order bill · ${line.workOrder} · approved by ${line.by} ${line.byDate}</span>` : '';
    return place + order + badges[line.state](line) + errorNote(line);
  }

  function allocatedRow(line) {
    const retry = line.state === 'failed' ? darkButton('Retry Xero', line.error) : '';
    const actions = `<div class="row" style="gap:8px;justify-content:flex-end;flex-wrap:nowrap">${retry}<button type="button" class="text-xs subtle" style="text-decoration:underline">Undo</button><button type="button" class="text-xs subtle" style="text-decoration:underline">Dispute…</button></div>`;
    return ['<input type="checkbox">', identity(line), `<span class="strong">${ui.money(line.net, { pence: true })}</span>`, allocatedTo(line), `<span class="text-xs subtle" style="white-space:nowrap">${line.by}<span style="display:block">${line.byDate}</span></span>`, actions];
  }

  JPMS.allocationRows = { queueRow, allocatedRow, darkButton };
})();
