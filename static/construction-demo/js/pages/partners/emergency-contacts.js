/* Emergency contacts — jpms/Pages/EmergencyContacts.razor: one EmergencyContactCardView per person. */
(function () {
  const ui = JPMS.ui;

  const contacts = [
    ['Marcus Hale', 'Claire Hale', 'Wife', '07700 900 114', 'claire.hale@mail.example', '03 Mar 2026', true],
    ['Daniel Price', 'Anita Price', 'Wife', '07700 900 267', '', '03 Mar 2026', true],
    ['Sophie Turner', 'Peter Turner', 'Father', '07700 900 381', 'p.turner@mail.example', '11 Mar 2026', true],
    ['Ravi Patel', 'Meera Patel', 'Sister', '07700 900 455', 'meera.p@mail.example', '11 Mar 2026', true],
    ['Liam Carter', 'Hayley Carter', 'Partner', '07700 900 522', '', '17 Mar 2026', true],
    ['Emma Walsh', 'Peter Walsh', 'Husband', '07700 900 639', 'peter.walsh@mail.example', '24 Mar 2026', true],
    ['Grace Holloway', 'Ruth Holloway', 'Mother', '07700 900 748', '', '02 Apr 2026', false],
    ['Tom Reeves', 'Dan Reeves', 'Brother', '07700 900 813', '', '14 May 2026', true],
    ['Nina Lowe', 'Adam Lowe', 'Husband', '07700 900 906', 'adam.lowe@mail.example', '23 Sep 2026', true]
  ];

  function card([person, contact, relationship, phone, email, given, isOwnLink]) {
    const emailLine = email ? `<a class="link tone-info">${email}</a>` : '';
    const origin = isOwnLink ? '' : ' · sent from the open form, not their own link';
    return `<div class="card" style="display:flex;flex-direction:column;gap:4px"><span class="text-base strong">${person}</span><span class="muted">${contact} · ${relationship}</span><a class="text-lg strong tone-info">${phone}</a>${emailLine}<span class="text-xs subtle">Given ${given}${origin}</span><div style="margin-top:8px">${ui.btn('Show health answers')}</div></div>`;
  }

  JPMS.page('/emergency-contacts', {
    title: 'Emergency contacts',
    render() {
      return ui.join([
        ui.header({ subtitle: 'Each person\'s latest emergency contact, for whoever is on site when something happens.', actions: [ui.search('Find a person')] }),
        `<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(16rem,1fr))">${contacts.map(card).join('')}</div>`
      ]);
    }
  });
})();
