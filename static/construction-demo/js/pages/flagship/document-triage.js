/* Document Triage — jpms/Pages/DocumentControl.razor with DocumentListItem, DocumentPreview and
   SourceEmailCard: the attachment queue the Control Centre feeds, list left, open document right,
   filed to project documents, a payment certificate or a subcontractor's documents. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const base = '#/document-triage';

  const documents = [
    { id: 'd1', file: 'SE-104 rev C — kitchen opening lintel.pdf', size: '1.4 MB', received: '09:12', from: 'Helen Rowe', subject: 'RE: Hollowmere — kitchen opening, revised lintel detail', project: 'Hollowmere House', sentBy: 'Demo Administrator', sentAt: '25 Sep 2026' },
    { id: 'd2', file: 'Calcs — beam B7.pdf', size: '612 KB', received: '09:12', from: 'Helen Rowe', subject: 'RE: Hollowmere — kitchen opening, revised lintel detail', project: 'Hollowmere House', sentBy: 'Demo Administrator', sentAt: '25 Sep 2026' },
    { id: 'd3', file: 'Payment certificate 6 — Hollowmere.pdf', size: '284 KB', received: '24 Sep', from: 'Helen Rowe', subject: 'Certificate 6 — August valuation', project: 'Hollowmere House', sentBy: 'Emma Walsh', sentAt: '24 Sep 2026' },
    { id: 'd4', file: 'Clearflow — public liability 2026-27.pdf', size: '1.1 MB', received: '24 Sep', from: 'Jo Whitaker', subject: 'Updated insurance certificate', project: null, sentBy: 'Grace Holloway', sentAt: '24 Sep 2026' },
    { id: 'd5', file: 'CH-A-210 rev B — ground floor plan.pdf', size: '3.2 MB', received: '23 Sep', from: 'Oliver Fenwick', subject: 'Coach House — revised GA plans', project: 'The Old Coach House', sentBy: 'Sophie Turner', sentAt: '23 Sep 2026', isFresh: true },
    { id: 'd6', file: 'CH-A-211 rev B — first floor plan.pdf', size: '2.9 MB', received: '23 Sep', from: 'Oliver Fenwick', subject: 'Coach House — revised GA plans', project: 'The Old Coach House', sentBy: 'Sophie Turner', sentAt: '23 Sep 2026', isFresh: true },
    { id: 'd7', file: 'Brightwire — RAMS second fix.docx', size: '418 KB', received: '22 Sep', from: 'Sam Okoro', subject: 'RAMS for second fix', project: 'Hollowmere House', sentBy: 'Liam Carter', sentAt: '22 Sep 2026' }
  ];

  const filed = [
    { id: 'f1', file: 'HH-A-301 rev D — sections.pdf', size: '2.2 MB', received: '19 Sep', from: 'Helen Rowe', subject: 'Sections rev D', project: 'Hollowmere House', label: 'Documents · HH-A-301 rev D' },
    { id: 'f2', file: 'Certificate 5 — Hollowmere.pdf', size: '266 KB', received: '28 Aug', from: 'Helen Rowe', subject: 'Certificate 5', project: 'Hollowmere House', label: 'Payment certificate · PC-005' },
    { id: 'f3', file: 'Ashlar Stone — RAMS masonry.pdf', size: '940 KB', received: '15 Sep', from: 'Ben Ashby', subject: 'RAMS', project: null, label: 'Ashlar Stone & Masonry · RAMS' }
  ];

  function defaultDestination(item) {
    if (!item) return 'drawing';
    if (item.file.startsWith('Payment')) return 'certificate';
    return item.project ? 'drawing' : 'subcontractor';
  }

  function listItem(item, selectedId, view) {
    const isOpen = item.id === selectedId;
    const style = isOpen ? 'border-color:var(--accent);background:rgba(102,224,148,.1);box-shadow:0 0 0 2px rgba(102,224,148,.4)' : item.isFresh ? 'border-color:rgba(242,181,68,.4);background:rgba(242,181,68,.1)' : '';
    const bar = isOpen ? '<span style="position:absolute;left:0;top:6px;bottom:6px;width:4px;border-radius:0 4px 4px 0;background:var(--accent)"></span>' : '';
    const pills = [item.isFresh ? ui.pill('Extracted', 'warning') : '', `<span class="text-xs subtle">${item.size}</span>`, item.project ? ui.pill(item.project, 'info') : '', item.label ? ui.pill(item.label, 'positive') : ''].join('');
    return `<a href="${base}?view=${view}&d=${item.id}" class="card" style="display:block;position:relative;padding:10px 12px 10px 16px;margin-bottom:6px;${style}">${bar}<div class="row-between" style="flex-wrap:nowrap"><span class="${isOpen ? 'semibold' : 'strong'}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.file}</span><span class="text-xs subtle">${item.received}</span></div><p class="text-xs subtle" style="margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.from} — ${item.subject}</p><div class="row" style="gap:6px;margin-top:6px">${pills}</div></a>`;
  }

  function preview(item) {
    if (!item.file.endsWith('.pdf')) return `<div class="card" style="text-align:center;padding:32px"><p class="muted">No preview for this file type — download it to read it.</p></div>`;
    const sheet = `<svg viewBox="0 0 420 260" style="width:100%;display:block"><rect width="420" height="260" fill="#f5f5f2"/><rect x="18" y="18" width="384" height="224" fill="none" stroke="#333" stroke-width="1.5"/><path d="M60 180h300M60 180V90h120v90M180 120h180M250 90v90" stroke="#333" stroke-width="3" fill="none"/><rect x="175" y="112" width="80" height="10" fill="#9ab"/><text x="290" y="228" font-size="10" fill="#333">${item.file.split(' — ')[0]}</text></svg>`;
    return `<div style="border:1px solid var(--line);border-radius:4px;overflow:hidden;background:var(--surface-raised);padding:12px">${sheet}<p class="text-xs subtle" style="margin-top:8px">${item.file} · page 1 of 2</p></div>`;
  }

  function sourceEmail(item) {
    return `<div class="card" style="background:var(--surface-raised)"><div class="row-between"><p class="eyebrow">Source email</p><span class="text-xs tone-accent">Show</span></div><p style="margin-top:8px"><span class="strong">${item.from}</span><span class="subtle"> — ${item.received === '09:12' ? '25 Sep 2026 09:12' : item.received + ' 2026'}</span></p><p style="margin-top:6px">${item.subject}</p></div>`;
  }

  function filingForm(item, destination) {
    const tabs = [['drawing', 'Project documents'], ['certificate', 'Payment certificate'], ['subcontractor', 'Subcontractor document']].map(([key, label]) => `<a class="chip${key === destination ? ' is-active' : ''}" href="${base}?d=${item.id}&dest=${key}">${label}</a>`).join('');
    return `<div style="padding-top:12px;border-top:1px solid var(--line)"><p class="eyebrow" style="margin-bottom:10px">File this document</p><div class="row" style="gap:8px;margin-bottom:12px">${tabs}</div>${JPMS.documentTriageForms[destination](item)}</div>`;
  }

  function detail(item, destination) {
    if (!item) return ui.panel('', '<p class="subtle" style="text-align:center">Select a document to preview it, read its email and file it.</p>');
    const head = `<div><div class="row-between" style="align-items:flex-start;flex-wrap:nowrap"><h2 class="text-lg semibold">${item.file}</h2><span class="text-xs tone-accent" style="text-decoration:underline">Download</span></div><p class="text-xs subtle" style="margin-top:6px">${item.size} · Received ${item.received} · Sent to Document Triage by ${item.sentBy || 'Emma Walsh'}, ${item.sentAt || item.received}</p></div>`;
    const outcome = item.label ? ui.notice('Filed', `Filed to ${item.label}. ${ui.link('Open it', '#/projects/hollowmere/documents')}`, 'positive') : '';
    const form = item.label ? '' : filingForm(item, destination);
    return `<section class="panel" style="padding:20px"><div class="stack-sm">${head}${outcome}${preview(item)}${sourceEmail(item)}${form}</div></section>`;
  }

  JPMS.page('/document-triage', {
    title: 'Document Triage',
    render() {
      const query = frame.query();
      const view = query.view || 'queue';
      const items = view === 'filed' ? filed : view === 'discarded' ? [] : documents;
      const selected = items.find((item) => item.id === query.d) || items[0];
      const destination = query.dest || defaultDestination(selected);
      const tabs = `<div class="row" style="gap:4px;border-bottom:1px solid var(--line);margin-bottom:16px">${['queue', 'filed', 'discarded'].map((key) => `<a class="tab${key === view ? ' is-active' : ''}" href="${base}?view=${key}">${key[0].toUpperCase() + key.slice(1)}</a>`).join('')}</div>`;
      const list = items.length ? items.map((item) => listItem(item, selected && selected.id, view)).join('') : ui.panel('', '<p style="text-align:center">No discarded documents.</p>');
      const header = ui.header({ subtitle: `${documents.length} documents waiting to be filed.`, actions: [frame.select(['All projects', ...JPMS.data.projects.map((project) => project.name)], '220px')] });
      return header + `<div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,3fr);align-items:start"><div>${tabs}${list}</div><div>${detail(selected, destination)}</div></div>`;
    }
  });
})();
