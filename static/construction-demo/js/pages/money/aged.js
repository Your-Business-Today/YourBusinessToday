/* Aged Receivables and Aged Payables — jpms/Pages/AgedReceivables.razor and AgedPayables.razor,
   one layout: the three tiles, By client / By supplier aged like Xero's report but with drafts
   included and badged, one party expanded to its documents, and the All … total row. */
(function () {
  const ui = JPMS.ui;
  const money = JPMS.money;

  const sides = {
    receivables: {
      route: '/finance/aged-receivables', title: 'Aged Receivables', party: 'client', parties: 'clients', noun: ['invoice', 'invoices'],
      subtitle: 'Outstanding sales invoices aged as in Xero — including drafts still being prepared, which Xero\'s own report leaves out.',
      totalLabel: 'Total receivables', draftCaption: 'still being prepared — not in Xero\'s own report', badgeTitle: 'Includes draft invoices still being prepared — not in Xero\'s own aged receivables',
      documents: () => money.ledger.receivables, partyOf: (invoice) => invoice.client
    },
    payables: {
      route: '/finance/aged-payables', title: 'Aged Payables', party: 'supplier', parties: 'suppliers', noun: ['bill', 'bills'],
      subtitle: 'Outstanding supplier bills aged as in Xero — including draft bills still being coded, which Xero\'s own report leaves out.',
      totalLabel: 'Total payables', draftCaption: 'awaiting coding — not in Xero\'s own report', badgeTitle: 'Includes draft bills awaiting coding — not in Xero\'s own aged payables',
      documents: () => money.ledger.payables, partyOf: (bill) => bill.supplier
    }
  };

  function tiles(side, documents) {
    const sum = (list) => list.reduce((total, document) => total + document.amount, 0);
    const drafts = documents.filter((document) => document.isDraft);
    const overdue = sum(documents.filter((document) => document.bucket > 0));
    const tile = (label, value, caption, tone) => `<div class="panel" style="padding:16px 20px"><p class="eyebrow" style="margin-bottom:6px">${label}</p><p class="text-2xl semibold ${tone || ''}">${value}</p><p class="text-xs subtle" style="margin-top:6px">${caption}</p></div>`;
    return `<div class="grid grid-3 grid-gap-sm" style="margin-bottom:24px">${tile(side.totalLabel, ui.money(sum(documents)), `${documents.length} ${side.noun[1]} outstanding · fetched 07:42 today`)}${tile('Of which draft', ui.money(sum(drafts)), `${drafts.length} ${side.draftCaption}`)}${tile('Overdue', ui.money(overdue), 'everything past the Current column', overdue ? 'tone-negative' : '')}</div>`;
  }

  function bucketCell(amount, bucket) {
    if (!amount) return money.dim('—');
    return bucket >= 2 ? `<span class="tone-negative">${ui.money(amount)}</span>` : bucket === 1 ? `<span class="tone-warning">${ui.money(amount)}</span>` : ui.money(amount);
  }

  function partyRows(side, row, isExpanded) {
    const chevron = `<span class="subtle" style="display:inline-block;width:14px">${isExpanded ? '▾' : '▸'}</span>`;
    const badge = row.hasDraft ? money.badge('Incl. draft', side.badgeTitle) : '';
    const head = `<tr class="is-clickable"><td class="strong" style="white-space:nowrap">${chevron}${row.party}${badge}</td>${row.buckets.map((amount, bucket) => `<td class="num">${bucketCell(amount, bucket)}</td>`).join('')}<td class="num strong">${ui.money(row.total)}</td></tr>`;
    if (!isExpanded) return head;
    const lines = row.documents.map((document) => {
      const draft = document.isDraft ? money.badge('Draft', 'Draft in Xero — still being prepared') : '';
      const label = `${document.number}${draft}<span class="subline">${document.date} · due ${document.due}</span>`;
      const cells = money.ledger.bucketLabels.map((name, bucket) => `<td class="num muted">${document.bucket === bucket ? ui.money(document.amount) : ''}</td>`).join('');
      return `<tr><td style="padding-left:48px;background:var(--surface-raised)">${label}</td>${cells.replace(/<td class="num muted">/g, '<td class="num muted" style="background:var(--surface-raised)">')}<td class="num muted" style="background:var(--surface-raised)">${ui.money(document.amount)}</td></tr>`;
    }).join('');
    return head + lines;
  }

  function table(side, rows) {
    const labels = money.ledger.bucketLabels;
    const totals = labels.map((label, bucket) => rows.reduce((sum, row) => sum + row.buckets[bucket], 0));
    const grand = rows.reduce((sum, row) => sum + row.total, 0);
    const head = `<tr><th>${side.party[0].toUpperCase() + side.party.slice(1)}</th>${labels.map((label) => `<th class="num">${label}</th>`).join('')}<th class="num">Total</th></tr>`;
    const foot = `<tr><td>All ${side.parties}</td>${totals.map((total) => `<td class="num">${ui.money(total)}</td>`).join('')}<td class="num">${ui.money(grand)}</td></tr>`;
    const body = rows.map((row, index) => partyRows(side, row, index === 0)).join('');
    return `<div class="panel"><div class="table-wrap"><table class="data-table data-table-dense"><thead>${head}</thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table></div></div>`;
  }

  Object.values(sides).forEach((side) => {
    JPMS.page(side.route, {
      title: side.title,
      render() {
        const documents = side.documents();
        const rows = money.ledger.ageRows(documents, side.partyOf);
        return ui.join([
          ui.header({ subtitle: side.subtitle, actions: [money.exportButton(), money.refreshButton('Refresh from Xero')] }),
          tiles(side, documents),
          `<div class="row-between" style="margin-bottom:12px"><h2 class="strong">By ${side.party}</h2>${money.segmented(['Age by due date', 'Age by invoice date'])}</div>`,
          table(side, rows)
        ]);
      }
    });
  });
})();
