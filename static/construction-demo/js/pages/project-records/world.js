/* The records group's invented registers: RFIs and legacy requests, variations, Architect's
   Instructions. Hollowmere carries the full book; the other projects read a shorter slice. */
(function () {
  const requestTones = { 'Needs action': 'warning', 'Needs variation': 'warning', 'Open / Awaiting response': 'info', Closed: '' };
  const variationTones = { Quoting: '', Issued: 'info', 'Awaiting AI': 'warning', Approved: 'positive', Rejected: 'negative' };

  const rfis = [
    { id: 'rfi-054', ref: 'RFI-054', number: 'REQ-0196', title: 'Balustrade glass fixing to gallery landing', drawing: 'AR-A-312 rev C', issued: '24 Sep 2026', due: '08 Oct 2026', days: 1, status: 'Needs action' },
    { id: 'rfi-053', ref: 'RFI-053', number: 'REQ-0194', title: 'Underfloor heating zones — ground floor', drawing: 'ME-M-201 rev B', issued: '22 Sep 2026', due: '06 Oct 2026', days: 3, status: 'Open / Awaiting response' },
    { id: 'rfi-051', ref: 'RFI-051', number: 'REQ-0191', title: 'Confirm ridge tile profile', drawing: 'AR-A-220 rev D', issued: '17 Sep 2026', due: '29 Sep 2026', days: 8, status: 'Open / Awaiting response' },
    { id: 'rfi-050', ref: 'RFI-050', number: 'REQ-0189', title: 'Tile setting-out to en-suite 2', drawing: 'ID-I-104 rev A', issued: '15 Sep 2026', due: '29 Sep 2026', days: 10, status: 'Open / Awaiting response' },
    { id: 'rfi-049', ref: 'RFI-049', number: 'REQ-0187', title: 'Steel lintel size over kitchen opening', drawing: 'SE-S-110 rev B', issued: '09 Sep 2026', due: '16 Sep 2026', days: 16, status: 'Needs variation', isCriticalPath: true, variation: 'V14' },
    { id: 'rfi-047', ref: 'RFI-047', number: 'REQ-0183', title: 'Door ironmongery schedule — ground floor', drawing: 'AR-A-501 rev A', issued: '02 Sep 2026', due: '16 Sep 2026', days: 23, status: 'Needs action', isOverdue: true },
    { id: 'rfi-046', ref: 'RFI-046', number: 'REQ-0180', title: 'Oak floor finish — client sample approval', drawing: '—', issued: '28 Aug 2026', due: '11 Sep 2026', days: 28, status: 'Open / Awaiting response', isOverdue: true, isCriticalPath: true },
    { id: 'rfi-045', ref: 'RFI-045', number: 'REQ-0176', title: 'Library joinery — shelf depths and lighting', drawing: 'ID-I-310 rev B', issued: '19 Aug 2026', due: '02 Sep 2026', days: 14, status: 'Closed', variation: 'V13' },
    { id: 'rfi-044', ref: 'RFI-044', number: 'REQ-0171', title: 'MVHR duct route through first floor', drawing: 'ME-M-240 rev A', issued: '06 Aug 2026', due: '20 Aug 2026', days: 9, status: 'Closed' },
    { id: 'rfi-043', ref: 'RFI-043', number: 'REQ-0166', title: 'Stone sill profile to rear elevation', drawing: 'AR-A-230 rev C', issued: '22 Jul 2026', due: '05 Aug 2026', days: 11, status: 'Closed', variation: 'V11' },
    { id: 'rfi-041', ref: 'RFI-041', number: 'REQ-0158', title: 'Rooflight kerb detail', drawing: 'AR-A-260 rev B', issued: '30 Jun 2026', due: '14 Jul 2026', days: 7, status: 'Closed', variation: 'V07' },
    { id: 'rfi-038', ref: 'RFI-038', number: 'REQ-0149', title: 'Foundation depth at north-east corner', drawing: 'SE-S-010 rev C', issued: '08 Apr 2026', due: '15 Apr 2026', days: 5, status: 'Closed' }
  ];

  const generals = [
    { id: 'req-0190', ref: 'REQ-0190', title: 'Scaffold adaptation around chimney stack', issued: '12 Sep 2026', status: 'Needs action', value: 1850 },
    { id: 'req-0181', ref: 'REQ-0181', title: 'Skip location for terrace works', issued: '26 Aug 2026', status: 'Open / Awaiting response' },
    { id: 'req-0172', ref: 'REQ-0172', title: 'Client query on skirting heights', issued: '11 Aug 2026', status: 'Closed' }
  ];

  const variations = [
    { id: 'v17', ref: 'V17', quote: 'VOQ-0017', title: 'Terrace lighting to landscape scheme', request: null, status: 'Quoting', value: null, issued: '—', approved: '—' },
    { id: 'v16', ref: 'V16', quote: 'VOQ-0016', title: 'Heated towel rails to en-suites 1–3', request: 'RFI-050', requestId: 'rfi-050', status: 'Quoting', value: 2750, issued: '—', approved: '—' },
    { id: 'v15', ref: 'V15', quote: 'VOQ-0015', title: 'Handmade clay ridge tiles in lieu of concrete', request: 'RFI-051', requestId: 'rfi-051', status: 'Quoting', value: 3600, issued: '—', approved: '—' },
    { id: 'v14', ref: 'V14', quote: 'VOQ-0014', title: 'Steel lintel and widened kitchen opening', request: 'RFI-049', requestId: 'rfi-049', status: 'Awaiting AI', value: 17440, issued: '19 Sep 2026', approved: '—', workOrders: [] },
    { id: 'v13', ref: 'V13', quote: 'VOQ-0013', title: 'Bespoke library joinery — oak shelving and ladder rail', request: 'RFI-045', requestId: 'rfi-045', status: 'Issued', value: 28900, issued: '12 Sep 2026', approved: '—' },
    { id: 'v12', ref: 'V12', quote: 'VOQ-0012', title: 'Additional sockets and data to study', request: 'RFI-044', requestId: 'rfi-044', status: 'Approved', value: 3280, issued: '14 Aug 2026', approved: '21 Aug 2026', workOrders: ['WO-0149'] },
    { id: 'v11', ref: 'V11', quote: 'VOQ-0011', title: 'Stone mullions to stair window', request: 'RFI-043', requestId: 'rfi-043', status: 'Approved', value: 15720, issued: '07 Aug 2026', approved: '18 Aug 2026', workOrders: ['WO-0146'] },
    { id: 'v10', ref: 'V10', quote: 'VOQ-0010', title: 'Underfloor heating extended to boot room', request: 'REQ-0172', requestId: 'req-0172', status: 'Approved', value: 4960, issued: '24 Jul 2026', approved: '31 Jul 2026', workOrders: ['WO-0141'] },
    { id: 'v09', ref: 'V09', quote: 'VOQ-0009', title: 'Relocate plant room door', request: 'RFI-040', requestId: 'rfi-038', status: 'Rejected', value: 2140, issued: '09 Jul 2026', approved: '—' },
    { id: 'v08', ref: 'V08', quote: 'VOQ-0008', title: 'Oak frame porch canopy', request: 'RFI-039', requestId: 'rfi-038', status: 'Approved', value: 9380, issued: '19 Jun 2026', approved: '02 Jul 2026', workOrders: ['WO-0131', 'WO-0133'] },
    { id: 'v07', ref: 'V07', quote: 'VOQ-0007', title: 'Triple-glazed rooflights in lieu of double', request: 'RFI-041', requestId: 'rfi-041', status: 'Approved', value: 12450, issued: '16 Jul 2026', approved: '23 Jul 2026', workOrders: ['WO-0138'] },
    { id: 'v05', ref: 'V05', quote: 'VOQ-0005', title: 'Additional drainage run to rear terrace', request: null, status: 'Approved', value: 6820, issued: '14 Apr 2026', approved: '28 Apr 2026', workOrders: ['WO-0118'] }
  ];

  const instructions = [
    { ref: 'AI-012', architectRef: 'ARA-HH-AI-031', title: 'Kitchen opening widened to 3.6m — 203 × 133 UB lintel', notes: 'Covers the structural change and making good; confirms engineer’s padstone detail.', instructed: '24 Sep 2026', by: 'helen@ashdownrowe.example', source: 'From email', links: ['V14'], file: 'ARA-HH-AI-031.pdf' },
    { ref: 'AI-011', architectRef: 'ARA-HH-AI-029', title: 'Library joinery — proceed on V13 subject to client sign-off', notes: '', instructed: '22 Sep 2026', by: 'helen@ashdownrowe.example', source: 'Uploaded', links: [], file: null },
    { ref: 'AI-010', architectRef: 'ARA-HH-AI-026', title: 'Additional sockets and data to study', notes: '', instructed: '20 Aug 2026', by: 'helen@ashdownrowe.example', source: 'From email', links: ['V12'], file: 'ARA-HH-AI-026.pdf' },
    { ref: 'AI-009', architectRef: 'ARA-HH-AI-024', title: 'Stone mullions to stair window', notes: 'Bath stone to match existing, per revised elevation AR-A-230 rev C.', instructed: '17 Aug 2026', by: 'helen@ashdownrowe.example', source: 'From email', links: ['V11'], file: 'ARA-HH-AI-024.pdf' },
    { ref: 'AI-008', architectRef: 'ARA-HH-AI-021', title: 'UFH to boot room and rooflight upgrade', notes: 'One instruction covering two variations.', instructed: '22 Jul 2026', by: 'helen@ashdownrowe.example', source: 'From email', links: ['V07', 'V10'], file: 'ARA-HH-AI-021.pdf' },
    { ref: 'AI-007', architectRef: 'ARA-HH-AI-018', title: 'Oak frame porch canopy', notes: '', instructed: '01 Jul 2026', by: 'helen@ashdownrowe.example', source: 'Uploaded', links: ['V08'], file: 'porch-canopy-instruction.pdf' },
    { ref: 'AI-006', architectRef: 'ARA-HH-AI-015', title: 'Omit plant room door relocation', notes: 'Client decided against the change.', instructed: '15 Jul 2026', by: 'helen@ashdownrowe.example', source: 'From email', links: ['V09'], file: 'ARA-HH-AI-015.pdf' },
    { ref: 'AI-005', architectRef: 'ARA-HH-AI-009', title: 'Additional drainage run to rear terrace', notes: '', instructed: '27 Apr 2026', by: 'helen@ashdownrowe.example', source: 'Uploaded', links: ['V05'], file: 'ARA-HH-AI-009.pdf' }
  ];

  const slices = { hollowmere: 99, 'coach-house': 7, kingsridge: 3, wrenfield: 6 };

  function forProject(list, projectId) {
    const rows = list.slice(0, slices[projectId] || list.length);
    if (projectId !== 'wrenfield') return rows;
    return rows.map((row) => Object.assign({}, row, { status: row.status in variationTones ? 'Approved' : 'Closed', isOverdue: false }));
  }

  JPMS.records = Object.assign(JPMS.records || {}, {
    requestTones,
    variationTones,
    rfis: (projectId) => forProject(rfis, projectId),
    generals: (projectId) => forProject(generals, projectId),
    variations: (projectId) => forProject(variations, projectId),
    instructions: (projectId) => forProject(instructions, projectId),
    findRequest: (id) => rfis.concat(generals).find((row) => row.id === id),
    findVariation: (id) => variations.find((row) => row.id === id)
  });
})();
