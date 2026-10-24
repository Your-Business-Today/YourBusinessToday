/* The invented to-do items behind the master list, the board and each item's page. */
(function () {
  const todo = (number, title, scope, role, facts = {}) => ({ id: `todo-${number}`, ref: `TODO-${number}`, title, scope, role, ...facts });

  JPMS.partnersTodos = [
    todo('0142', 'Chase Brightwire for revised first-fix quote', 'JBB-101 Hollowmere House', 'Quantity Surveyor', { due: '26 Sep 2026', inProgress: true, person: 'Ravi Patel', about: 'BP-0017', added: '21 Sep 2026 by sophie.turner@jewel-demo.example', notes: 'The orangery circuits were added under V14. Brightwire’s first quote omitted them — we need the revised figure before V14 goes to Ashdown Rowe for instruction.' }),
    todo('0141', 'Approve Northgate bill against WO-0142', 'JBB-101 Hollowmere House', 'Finance Director', { due: '29 Sep 2026', about: 'WO-0142', added: '22 Sep 2026 by emma.walsh@jewel-demo.example' }),
    todo('0139', 'Book building control inspection — drainage', 'JBB-102 The Old Coach House', 'Project Manager', { due: '24 Sep 2026', added: '17 Sep 2026 by liam.carter@jewel-demo.example' }),
    todo('0138', 'Confirm oak flooring sample with client', 'JBB-101 Hollowmere House', 'Project Manager', { due: '02 Oct 2026', person: 'Sophie Turner', added: '16 Sep 2026 by marcus.hale@jewel-demo.example' }),
    todo('0137', 'Renew Summit Roofing insurance certificate', 'Company-wide', 'Accounts', { due: '18 Sep 2026', added: '12 Sep 2026 by grace.holloway@jewel-demo.example' }),
    todo('0136', 'Send Kingsridge groundworks invites', 'JBB-103 Kingsridge Lodge', 'Quantity Surveyor', { due: '09 Oct 2026', added: '15 Sep 2026 by ravi.patel@jewel-demo.example' }),
    todo('0135', 'Van LV24 KDE — MOT booking', 'Company-wide', 'Accounts', { due: '14 Oct 2026', added: '10 Sep 2026 by daniel.price@jewel-demo.example' }),
    todo('0134', 'Fire extinguisher check — site cabins', 'JBB-102 The Old Coach House', 'H&S Officer', { inProgress: true, added: '09 Sep 2026 by grace.holloway@jewel-demo.example' }),
    todo('0133', 'Issue V14 to Ashdown Rowe for instruction', 'JBB-101 Hollowmere House', 'Project Manager', { done: '22 Sep 2026', added: '04 Sep 2026 by sophie.turner@jewel-demo.example' }),
    todo('0131', 'File September valuation statement', 'JBB-102 The Old Coach House', 'Quantity Surveyor', { done: '19 Sep 2026', added: '01 Sep 2026 by daniel.price@jewel-demo.example' }),
    todo('0129', 'Wrenfield Barn — final account agreed', 'JBB-098 Wrenfield Barn', 'Managing Director', { done: '15 Sep 2026', added: '20 Aug 2026 by marcus.hale@jewel-demo.example' })
  ];
})();
