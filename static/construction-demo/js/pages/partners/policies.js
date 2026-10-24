/* Policies & sign-off — jpms/Pages/Policies.razor with MyPoliciesPanel and PublishedPoliciesPanel. */
(function () {
  const ui = JPMS.ui;

  const documents = [
    ['Health and Safety Policy, Organisation and Arrangements', '4', '02 Sep 2026', 11, 3],
    ['Non-disclosure agreement — staff', '2', '14 Jul 2026', 14, 0],
    ['Staff handbook', '6', '01 Aug 2026', 12, 2],
    ['Drugs & alcohol policy', '3', '01 Aug 2026', 13, 1],
    ['Company vehicle & driving policy', '2', '18 Jun 2026', 7, 0],
    ['Data protection & acceptable IT use', '5', '22 Sep 2026', 4, 10],
    ['Modern slavery statement', '1', '09 May 2026', 14, 0],
    ['Environmental & waste policy', '2', '30 Mar 2026', 14, 0]
  ];

  const signOffs = [
    ['Sophie Turner (sophie.turner@jewel-demo.example)', 'signed 03 Sep 2026, 08:14 as “Sophie Turner”', 'on their login', null],
    ['Liam Carter (liam.carter@jewel-demo.example)', 'signed 04 Sep 2026, 07:02 as “Liam Carter”', 'on their login', null],
    ['Tom Reeves (tom.reeves@jewel-demo.example)', 'not yet signed', 'by link', 'Chase'],
    ['Nina Lowe (nina.lowe@jewel-demo.example)', 'not yet signed', 'on their login', 'Send a link'],
    ['Evenline Plastering — site team (kat@evenline.example)', 'not yet signed', 'by link', 'Chase']
  ];

  function outstanding(count) {
    return count > 0 ? ui.pill(`${count} to chase`, 'negative') : ui.pill('All signed', 'positive');
  }

  function forYouPanel() {
    const body = `<div style="padding:16px 24px"><p class="strong">Data protection &amp; acceptable IT use <span class="subtle" style="font-weight:400">· rev 5</span></p><p class="muted" style="margin-top:4px;max-width:640px">Updated for the new mailbox retention rules and the use of AI assistants with client information.</p><p class="text-xs subtle" style="margin-top:4px">Requested 22 Sep 2026</p><p style="margin-top:4px">${ui.link('Open the policy (PDF)', '#')}</p><div class="row" style="align-items:flex-end;margin-top:12px"><div style="width:16rem">${ui.field('Type your full name to sign', '', { placeholder: 'Your name, exactly' })}</div>${ui.btn('Sign')}</div></div>`;
    return ui.panel('For you to sign', body, { flush: true });
  }

  function signOffRows() {
    return signOffs.map(([who, state, how, action]) => `<div class="row-between" style="padding:4px 0"><p>${who} — <span class="${state.startsWith('signed') ? 'tone-positive' : 'subtle'}">${state}</span><span class="subtle"> · ${how}</span></p>${action ? ui.btn(action) : ''}</div>`).join('');
  }

  function publishedTable() {
    const head = ['Title', 'Rev', 'Published', 'Signed', 'Outstanding', 'PDF', ''].map((label) => `<th>${label}</th>`).join('');
    const body = documents.map(([title, revision, published, signed, open], index) => {
      const row = `<tr class="is-clickable"><td class="strong">${title}</td><td>${revision}</td><td>${published}</td><td>${ui.pill(String(signed), 'positive')}</td><td>${outstanding(open)}</td><td>${ui.link('Open', '#')}</td><td class="num">${ui.btn('Send by link…')}</td></tr>`;
      const declaration = '<p class="muted" style="margin-bottom:8px">Declaration: I have read and understood the Health and Safety Policy, and I will follow its arrangements on every site.</p>';
      return index === 0 ? `${row}<tr><td colspan="7" style="background:var(--surface-raised)">${declaration}${signOffRows()}</td></tr>` : row;
    }).join('');
    return `<h2 class="text-lg strong" style="margin:24px 0 12px">Published documents</h2><div class="panel"><div class="table-wrap"><table class="data-table data-table-dense"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`;
  }

  JPMS.page('/policies', {
    title: 'Policies',
    render() {
      return ui.join([
        JPMS.partners.sectionHeader('Policies &amp; sign-off', '', [ui.btn('Publish for signing', 'primary')]),
        '<p class="muted" style="margin-bottom:20px">Documents that need everyone\'s signature — NDAs, staff policies, H&amp;S. Signing records the typed name and the time against the exact revision read, on a portal login or by form link.</p>',
        forYouPanel(), publishedTable()
      ]);
    }
  });
})();
