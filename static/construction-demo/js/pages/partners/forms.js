/* Forms received — jpms/Pages/FormsReceived.razor: status chips, the Forms tabs and the received register. */
(function () {
  const ui = JPMS.ui;
  const statusTones = { New: 'info', 'In progress': 'warning', Handled: 'positive' };

  const received = [
    ['25 Sep 2026, 07:58', 'Toolbox Talk', 'Liam Carter', 'Hollowmere House', 'One-time link', 'New'],
    ['24 Sep 2026, 16:21', 'Site Incident Report', 'Tom Reeves', 'The Old Coach House', 'One-time link', 'In progress'],
    ['24 Sep 2026, 11:05', 'Insurance Update', 'Dean Summers', 'Summit Roofing Ltd', 'Open address', 'New'],
    ['23 Sep 2026, 09:40', 'Emergency Contact Form', 'Nina Lowe', 'Nina Lowe', 'New starter pack', 'Handled'],
    ['23 Sep 2026, 09:34', 'Right to Work', 'Nina Lowe', 'Nina Lowe', 'New starter pack', 'In progress'],
    ['23 Sep 2026, 09:31', 'New Starter Form', 'Nina Lowe', 'Nina Lowe', 'New starter pack', 'Handled'],
    ['22 Sep 2026, 14:12', 'Ladder Inspection', 'Tom Reeves', 'Hollowmere House', 'One-time link', 'Handled'],
    ['19 Sep 2026, 10:47', 'Subcontractor Questionnaire', 'Ruth Greenway', 'Greenway Landscapes', 'Open address', 'New'],
    ['18 Sep 2026, 15:30', 'Training Certificate', 'Sam Okoro', 'Brightwire Electrical Ltd', 'One-time link', 'Handled'],
    ['17 Sep 2026, 08:02', 'Fire Extinguishers Check', 'Grace Holloway', 'The Old Coach House', 'One-time link', 'Handled'],
    ['15 Sep 2026, 12:18', 'Workstation Assessment', 'Emma Walsh', 'Emma Walsh', 'One-time link', 'Handled'],
    ['12 Sep 2026, 17:44', 'Accident Report', 'Callum Reid', 'Timbercraft Joinery', 'Open address', 'Handled']
  ];

  JPMS.page('/forms', {
    title: 'Forms',
    render() {
      const toHandle = received.filter((row) => row[5] !== 'Handled').length;
      const chips = ui.chips([{ label: 'To handle', count: toHandle }, 'Handled', 'Everything'], 2);
      const tabs = ui.tabs([['Received', '/forms'], ['New starter packs', '/forms/packs'], ['Sent out', '/forms/sent'], ['Right to work', '/forms/right-to-work'], ['Training', '/forms/training'], ['Workstations', '/forms/workstations'], ['People & companies', '/forms/folders']].map(([label, route]) => ({ label, href: `#${route}` })));
      const rows = received.map(([when, form, from, filed, cameBy, status]) => [`<span style="white-space:nowrap">${when}</span>`, form, from, filed, `<span style="white-space:nowrap">${cameBy}</span>`, ui.pill(status, statusTones[status])]);
      return ui.join([
        ui.header({ subtitle: `${received.length} of ${received.length} forms`, actions: [chips] }),
        tabs,
        ui.panel('', ui.table({ dense: true, columns: ['Received', 'Form', 'From', 'Filed under', 'Came by', 'Status'], rows, hrefs: received.map(() => '#/forms') }), { flush: true })
      ]);
    }
  });
})();
