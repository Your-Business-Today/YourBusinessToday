/* Users and Revoked — jpms/Pages/AdminUsers.razor (ApprovedUsersPanel) and AdminRevokedUsers.razor
   (RevokedUsersPanel): everyone who can sign in with their role chips, and those shut out. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const roleDots = { Administrator: 'var(--accent)', 'Managing Director': 'var(--accent)', 'Finance Director': 'var(--info)', 'Project Manager': 'var(--warning)', 'Quantity Surveyor': 'var(--warning)', 'Site Manager': 'var(--brand)', Architect: 'var(--content-faint)', Client: 'var(--content-faint)', Subcontractor: 'var(--content-faint)' };

  const users = [
    ['Demo Administrator', JPMS.data.signedIn.email, ['Administrator'], true],
    ['Marcus Hale', 'marcus.hale@jewel-demo.example', ['Managing Director', 'Administrator']],
    ['Daniel Price', 'daniel.price@jewel-demo.example', ['Finance Director']],
    ['Sophie Turner', 'sophie.turner@jewel-demo.example', ['Project Manager']],
    ['Ravi Patel', 'ravi.patel@jewel-demo.example', ['Quantity Surveyor']],
    ['Liam Carter', 'liam.carter@jewel-demo.example', ['Site Manager']],
    ['Emma Walsh', 'emma.walsh@jewel-demo.example', ['Accounts']],
    ['Grace Holloway', 'grace.holloway@jewel-demo.example', ['H&S Officer']],
    ['Tom Reeves', 'tom.reeves@jewel-demo.example', ['Foreman']],
    ['Nina Lowe', 'nina.lowe@jewel-demo.example', ['Office Admin']],
    ['Helen Rowe', 'helen@ashdownrowe.example', ['Architect'], false, 'Hollowmere House, Kingsridge Lodge'],
    ['Oliver Fenwick', 'oliver@fenwickhale.example', ['Architect'], false, 'The Old Coach House'],
    ['Imogen Clarke', 'imogen.clarke@mailbox.example', ['Client']],
    ['Sam Okoro', 'sam@brightwire.example', ['Subcontractor']]
  ];

  const revoked = [
    ['Jack Pemberton', 'jack.pemberton@jewel-demo.example', ['Site Manager'], '14 Aug 2026, 17:02', 'marcus.hale@jewel-demo.example'],
    ['Kirsty Doyle', 'kirsty@evenline.example', ['Subcontractor'], '02 Jul 2026, 09:40', 'admin@jewel-demo.example'],
    ['Ben Ashby', 'ben@ashlarstone.example', ['Subcontractor'], '18 Jun 2026, 11:15', 'sophie.turner@jewel-demo.example']
  ];

  function roleChip(role, isFaint, canEdit) {
    const dot = isFaint ? 'var(--content-faint)' : roleDots[role] || 'var(--content-subtle)';
    const remove = canEdit ? '<span class="faint" style="margin-left:2px">×</span>' : '';
    return `<span class="text-xs muted" style="display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line-strong);border-radius:999px;padding:2px 8px;background:var(--surface-raised)"><span style="width:6px;height:6px;border-radius:999px;background:${dot}"></span>${role}${remove}</span>`;
  }

  function userRow([name, email, roles, isYou, projects]) {
    const actions = isYou ? '<span class="text-xs faint">You</span>' : `${ui.btn('Send reset', 'ghost')}${ui.btn('Revoke', 'ghost')}`;
    const addRole = isYou ? '' : `<select class="field" style="width:auto;height:24px;font-size:12px;padding:0 8px"><option>+ Add role</option></select>`;
    const architect = projects ? `<p class="text-xs subtle" style="margin-top:6px">Projects: ${projects}</p>` : '';
    return `<li style="padding:12px 20px;border-bottom:1px solid var(--line)"><div class="row-between" style="align-items:flex-start"><div><p class="strong">${name}</p><p class="muted">${email}</p></div><div class="row">${actions}</div></div><div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">${roles.map((role) => roleChip(role, false, !isYou)).join('')}${addRole}</div>${architect}</li>`;
  }

  function revokedRow([name, email, roles, when, by]) {
    return `<li style="padding:12px 20px;border-bottom:1px solid var(--line)"><div class="row-between" style="align-items:flex-start"><div><p class="strong">${name}</p><p class="muted">${email}</p></div><div class="row">${ui.btn('Restore')}${ui.btn('Delete…', 'ghost')}</div></div><div class="row" style="margin-top:8px;gap:6px">${roles.map((role) => roleChip(role, true)).join('')}<span class="text-xs faint">Revoked ${when} by ${by}</span></div></li>`;
  }

  function listPanel(title, count, items, extra) {
    const actions = [`<span class="text-xs subtle">${count}</span>`, extra || ''];
    return ui.panel(title, `<ul>${items}</ul>`, { flush: true, actions });
  }

  JPMS.page('/admin/users', {
    title: 'Users',
    render() {
      return ui.join([
        shared.adminTabs(0),
        shared.header({ subtitle: 'Everyone who can sign in, and the roles that decide what they see. Revoking a user moves them to the Revoked tab, where they can be restored or permanently deleted.' }),
        listPanel('Users', users.length, users.map(userRow).join(''), '<a class="text-xs tone-accent strong" href="#/admin/users">+ Add user</a>')
      ]);
    }
  });

  JPMS.page('/admin/users/revoked', {
    title: 'Users',
    render() {
      return ui.join([
        shared.adminTabs(1),
        shared.header({ subtitle: 'People whose access has been revoked. They can’t sign in, but their record and old roles are kept — restore brings them back exactly as they were; permanent deletion removes the record for good.' }),
        listPanel('Revoked users', revoked.length, revoked.map(revokedRow).join(''))
      ]);
    }
  });
})();
