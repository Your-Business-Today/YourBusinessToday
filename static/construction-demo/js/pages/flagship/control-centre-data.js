/* A day's post in the invented projects mailbox for the Control Centre — the queue still to be
   distributed, the emails already tagged (one decision each), and the open email's thread. */
(function () {
  const mailbox = 'projects@jewel-demo.example';

  const icons = {
    inbox: "<path d='M3.5 13.5h4l1.5 2.5h6l1.5-2.5h4'/><path d='M5.5 6.5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z'/><path d='M12 3v6M9.5 6.5 12 9l2.5-2.5'/>",
    email: "<path d='m3.5 9.5 8.5-5.5 8.5 5.5v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z'/><path d='m3.5 9.5 8.5 6 8.5-6'/>",
    client: "<circle cx='12' cy='8' r='3.6'/><path d='M5 20.5c.8-4 3.6-6 7-6s6.2 2 7 6'/>",
    subcontractor: "<path d='M4.5 15.5v-1.2A7.5 7.5 0 0 1 9.7 7.2V5.6a1.1 1.1 0 0 1 1.1-1.1h2.4a1.1 1.1 0 0 1 1.1 1.1v1.6a7.5 7.5 0 0 1 5.2 7.1v1.2'/><path d='M3 15.5h18v1.6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z'/>",
    supplier: "<path d='M2.5 6.5h11v10h-11z'/><path d='M13.5 9.5h4l3 3v4h-7'/><circle cx='6.5' cy='17.5' r='1.8'/><circle cx='17' cy='17.5' r='1.8'/>",
    sales: "<path d='m3.5 11 8.5-7 8.5 7'/><path d='M6 9.2V20h12V9.2'/><circle cx='12' cy='13' r='1.9'/><path d='M8.8 20c.4-2.4 1.6-3.6 3.2-3.6s2.8 1.2 3.2 3.6'/>",
    internal: "<path d='M5.5 20.5V4.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16'/><path d='M15.5 9.5h3a1 1 0 0 1 1 1v10'/><path d='M3.5 20.5h17'/><path d='M8.5 7h1.5M11.5 7H13M8.5 10.5h1.5M11.5 10.5H13M8.5 14h1.5M11.5 14H13'/>",
    records: "<path d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5'/><path d='M14 3v5h5v3'/><circle cx='15.5' cy='15.5' r='3.2'/><path d='m17.9 17.9 2.6 2.6'/>",
    xero: "<path d='M15.6 6.9a3.4 3.4 0 0 0-6 2.3c0 1.6.55 2.5.55 4.1 0 1.2-.45 2.4-1.15 3.3h7.6'/><path d='M7.2 13h5.6'/>",
    compose: "<path d='M11 4.5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5'/><path d='M17.8 3.2a1.9 1.9 0 0 1 2.7 2.7l-8 8-3.6.9.9-3.6z'/>",
    outbox: "<path d='M21 3.5 3.3 10.2a.6.6 0 0 0 .05 1.13l6.1 1.9a1.4 1.4 0 0 1 .92.92l1.9 6.1a.6.6 0 0 0 1.13.05L20.5 3z'/><path d='m10.2 13.8 4.6-4.6'/>"
  };

  const queue = [
    { id: 'm1', group: 'Today', from: 'Helen Rowe', email: 'helen@ashdownrowe.example', time: '09:12', subject: 'RE: Hollowmere — kitchen opening, revised lintel detail', preview: 'Please find attached the engineer’s revised detail for the widened opening. This answers RFI-049…', hasAttachments: true, threadTags: ['RFI-049', 'VOQ-0014'], project: 'hollowmere' },
    { id: 'm2', group: 'Today', from: 'Sam Okoro', email: 'sam@brightwire.example', time: '08:47', subject: 'Hollowmere — second fix electrical tender, return', preview: 'Our priced return for the second fix package is attached with clarifications on the lighting control…', hasAttachments: true, threadTags: ['BPI-0006'], project: 'hollowmere' },
    { id: 'm3', group: 'Today', from: 'Oliver Fenwick', email: 'oliver@fenwickhale.example', time: '08:30', subject: 'Coach House — client would like to add a log store', preview: 'Imogen has asked whether we can add an oak-framed log store against the east wall — could you price…', hasAttachments: false, threadTags: [], project: 'coach-house' },
    { id: 'm4', group: 'Today', from: 'Stoneleigh Tiles & Stone', email: 'orders@stoneleigh.example', time: '08:02', subject: 'Delivery confirmation — order STS-3318, Tuesday AM', preview: 'Your order of honed limestone is booked for delivery Tuesday 29 September between 07:30 and 10:00…', hasAttachments: true, threadTags: [], project: 'hollowmere' },
    { id: 'm5', group: 'Today', from: 'Building Control — Linford Heath', email: 'inspections@lhbc.example', time: '07:55', subject: 'Inspection booked — drainage test, The Old Coach House', preview: 'This is to confirm the below-ground drainage inspection on Wednesday 30 September at 11:00…', hasAttachments: false, threadTags: [], project: 'coach-house' },
    { id: 'm6', group: 'Yesterday', from: 'Priya Byrne', email: 'priya@marlowbyrne.example', time: '17:41', subject: 'Wrenfield Barn — sticking door to boot room', preview: 'The client mentions the boot room door is binding at the head since the heating went on…', hasAttachments: true, threadTags: [], project: 'wrenfield' },
    { id: 'm7', group: 'Yesterday', from: 'Jo Whitaker', email: 'jo@clearflow.example', time: '16:05', subject: 'Application 4 — Hollowmere, first fix plumbing', preview: 'Please see attached our application for payment number 4 for works to 18 September…', hasAttachments: true, threadTags: ['WO-0151'], project: 'hollowmere' },
    { id: 'm8', group: 'Yesterday', from: 'Marcus Hale', email: 'marcus.hale@jewel-demo.example', time: '14:20', subject: 'Kingsridge — please book the pre-start with the Trust', preview: 'Can someone get a date in with the trustees before the end of October for the pre-start meeting…', hasAttachments: false, threadTags: [], project: 'kingsridge' },
    { id: 'm9', group: 'Tuesday', from: 'Alex Moreton', email: 'alex.moreton@gmail.example', time: '11:18', subject: 'Enquiry — new house and pool, Coldharbour Vale', preview: 'We have planning for a replacement dwelling and would like a builder’s price. Our architect is…', hasAttachments: true, threadTags: [], project: '' },
    { id: 'm10', group: 'Tuesday', from: 'Mail Delivery System', email: 'postmaster@jewel-demo.example', time: '09:03', subject: 'Undeliverable: Stage 2 drawings', preview: 'Delivery has failed to these recipients or groups: j.carr@oldpractice.example…', hasAttachments: false, threadTags: [], project: '' }
  ];

  const tagged = [
    { from: 'Helen Rowe', time: '08:58', subject: 'Hollowmere — V14 instruction signed', pathway: 'Client', tags: ['VOQ-0014', 'AI-012'] },
    { from: 'Gary Northgate', time: '08:41', subject: 'Coach House drainage — revised levels', pathway: 'Subcontractor', tags: ['WO-0144'] },
    { from: 'Kestrel Timber Merchants', time: '08:35', subject: 'Oak delivery note KT-88213', pathway: 'Supplier', tags: ['Materials'] },
    { from: 'Ravi Patel', time: '08:22', subject: 'Chase Brightwire on first-fix quote', pathway: 'Internal', tags: ['TODO-0058'] },
    { from: 'Oliver Fenwick', time: '08:10', subject: 'Coach House — stair balustrade finish', pathway: 'Client', tags: ['RFI-052'] },
    { from: 'Callum Reid', time: 'Yesterday', subject: 'Joinery package — tender return', pathway: 'Subcontractor', tags: ['BPI-0006'] },
    { from: 'Liam Carter', time: 'Yesterday', subject: 'Site instruction — protect limestone floor', pathway: 'Internal', tags: ['SI-0012'] },
    { from: 'Harbour Glazing Systems', time: 'Yesterday', subject: 'Survey visit Thursday — steel doors', pathway: 'Supplier', tags: ['CAL-0101'] },
    { from: 'noreply@portal-offers.example', time: 'Yesterday', subject: 'Win a site van — this week only', pathway: '', tags: ['Discarded'] }
  ];

  const thread = [
    { from: 'Tom Reeves', date: '18 Sep 2026 16:40', preview: 'RFI-049 — steel lintel size over the widened kitchen opening' },
    { from: 'Helen Rowe', date: '21 Sep 2026 10:05', preview: 'Engineer reviewing — V14 to follow for the widened opening' },
    { from: 'Helen Rowe', date: '25 Sep 2026 09:12', preview: 'Revised lintel detail attached — answers RFI-049' }
  ];

  const attachments = [['SE-104 rev C — kitchen opening lintel.pdf', '1.4 MB', true], ['Photo — temporary propping.jpg', '2.8 MB', false], ['Calcs — beam B7.pdf', '612 KB', true]];

  const recent = [
    ['12 min ago', 'VOQ-0014', 'Email linked to variation V14 — Steel lintel and widened kitchen opening', 'JBB-101 · Demo Administrator'],
    ['19 min ago', 'WO-0144', 'Email linked to work order — Foul and surface water drainage', 'JBB-102 · Demo Administrator'],
    ['26 min ago', 'TODO-0058', 'To-do raised — Chase Brightwire for revised first-fix quote', 'JBB-101 · Demo Administrator'],
    ['41 min ago', 'RFI-052', 'Email linked to RFI — Stair balustrade finish', 'JBB-102 · Sophie Turner'],
    ['Yesterday', 'BPI-0006', 'Tender filed against bid package — Joinery', 'JBB-101 · Ravi Patel'],
    ['Yesterday', 'SI-0012', 'Site instruction raised — Protect limestone floor finish', 'JBB-101 · Liam Carter'],
    ['Yesterday', 'CAL-0101', 'Calendar event raised — Glazing survey visit', 'JBB-102 · Sophie Turner']
  ];

  JPMS.controlCentreData = { mailbox, icons, queue, tagged, thread, attachments, recent };
})();
