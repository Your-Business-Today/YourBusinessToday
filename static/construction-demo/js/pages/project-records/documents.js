/* Documents — jpms/Pages/ProjectDrawings.razor with DrawingsTable.razor (the register grouped in
   folders and sub-folders), and ProjectDrawingDetail.razor (preview, revisions, extracted data). */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;
  const folderIcon = '<path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>';
  const excelIcon = '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8l6 8M15 8l-6 8"/>';

  const folders = [
    { name: 'Architectural', depth: 0, drawings: [
      ['ar-a-100', 'AR-A-100', 'Site plan and location', 'AR-A-100_C.pdf', 'Rev C', 0, 1, true, true],
      ['ar-a-201', 'AR-A-201', 'Ground floor plan', 'AR-A-201_F.pdf', 'Rev F', 1, 3, true, true],
      ['ar-a-202', 'AR-A-202', 'First floor plan', 'AR-A-202_E.pdf', 'Rev E', 0, 2, true, true],
      ['ar-a-220', 'AR-A-220', 'Roof plan and ridge details', 'AR-A-220_D.pdf', 'Rev D', 0, 1, true, false],
      ['ar-a-230', 'AR-A-230', 'Rear elevation — stone sills and mullions', 'AR-A-230_C.pdf', 'Rev C', 0, 2, true, true],
      ['ar-a-312', 'AR-A-312', 'Stair and gallery balustrade', 'AR-A-312_C.pdf', 'Rev B', 1, 0, false, false]
    ] },
    { name: 'Interiors', depth: 1, drawings: [
      ['id-i-120', 'ID-I-120', 'Kitchen layout', 'ID-I-120_C.pdf', 'Rev C', 0, 2, true, true],
      ['id-i-310', 'ID-I-310', 'Library joinery elevations', 'ID-I-310_B.pdf', 'Rev A', 1, 0, true, false]
    ] },
    { name: 'Structural', depth: 0, drawings: [
      ['se-s-010', 'SE-S-010', 'Foundation layout', 'SE-S-010_C.pdf', 'Rev C', 0, 2, true, true],
      ['se-s-110', 'SE-S-110', 'Kitchen / dining wall — structural openings', 'SE-S-110_C.pdf', 'Rev B', 1, 1, true, true]
    ] },
    { name: 'M&E', depth: 0, drawings: [
      ['me-m-201', 'ME-M-201', 'Underfloor heating — ground floor zones', 'ME-M-201_B.pdf', 'Rev B', 0, 1, true, true],
      ['me-m-240', 'ME-M-240', 'MVHR ductwork — first floor', 'ME-M-240_A.pdf', 'Rev A', 0, 0, false, false]
    ] }
  ];

  const allDrawings = folders.flatMap((folder) => folder.drawings.map((drawing) => ({ folder: folder.name, cells: drawing })));

  function statusCell(pending, archived, approved) {
    const parts = [pending ? ui.pill(`${pending} pending`, 'warning') : '', archived ? ui.pill(`${archived} archived`) : '', !pending && !archived && approved ? ui.pill('Approved', 'positive') : ''];
    return parts.filter(Boolean).join(' ');
  }

  function pipelineCell(extracted, analysed) {
    return `${extracted ? ui.pill('Metadata ✓', 'positive') : ui.pill('Not extracted', 'warning')} ${analysed ? ui.pill('Analysed ✓', 'positive') : ui.pill('Not analysed', 'warning')}`;
  }

  function drawingRow(project, depth, [id, code, title, file, approved, pending, archived, extracted, analysed]) {
    const indent = `padding-left:${16 + depth * 24}px`;
    return `<tr class="is-clickable" data-href="#/projects/${project.id}/documents/${id}"><td class="mono muted" style="${indent};white-space:nowrap">${code}</td><td class="strong">${title}</td><td class="text-xs subtle" style="white-space:nowrap">${file}</td><td style="text-align:center">${ui.pill(approved, 'positive')}</td><td style="text-align:center;white-space:nowrap">${statusCell(pending, archived, true)}</td><td style="text-align:center;white-space:nowrap">${pipelineCell(extracted, analysed)}</td><td class="subtle" style="white-space:nowrap">${archived ? '14 May 2026' : '02 Sep 2026'}</td></tr>`;
  }

  function folderRow(folder) {
    const indent = `padding-left:${16 + folder.depth * 24}px`;
    return `<tr style="background:var(--surface-raised)"><td colspan="7" style="${indent};background:var(--surface-raised)"><span class="row" style="gap:8px"><span class="subtle">▾</span>${ui.svg(folderIcon, 'sm')}<span class="strong">${folder.name}</span><span class="text-xs subtle">${folder.drawings.length}</span></span></td></tr>`;
  }

  function register(project) {
    const head = ['Code', 'Title', 'File', 'Latest approved', 'Status', 'Pipeline', 'Added'].map((label, index) => `<th style="${index >= 3 && index <= 5 ? 'text-align:center' : ''}">${label}</th>`).join('');
    const bodies = folders.map((folder) => `<tbody>${folderRow(folder)}${folder.drawings.map((drawing) => drawingRow(project, folder.depth + 1, drawing)).join('')}</tbody>`).join('');
    return `<div class="table-wrap"><table class="data-table data-table-dense"><thead><tr>${head}</tr></thead>${bodies}</table></div>`;
  }

  JPMS.page('/projects/:project/documents', {
    title: 'Documents',
    render(params) {
      const project = JPMS.project(params.project);
      const subtitle = `${allDrawings.length} documents <span class="subtle">· 3 folders · 1 sub-folders</span> ${ui.pill('2 ambiguous', 'warning')}`;
      const actions = [ui.btn('Export to Excel', 'secondary', { icon: excelIcon }), ui.btn('All documents'), ui.btn('Extract all'), ui.btn('+ New folder'), ui.btn('+ Add documents', 'primary')];
      return records().projectShell(project, [records().sectionHeader('Document register', subtitle, actions), register(project)]);
    }
  });

  function revisionsPanel(approved) {
    const letter = approved.replace('Rev ', '');
    const next = String.fromCharCode(letter.charCodeAt(0) + 1);
    const previous = String.fromCharCode(letter.charCodeAt(0) - 1);
    const rows = [
      [`Rev ${next}`, ui.pill('Pending', 'warning'), '23 Sep 2026', 'helen@ashdownrowe.example'],
      [`Rev ${letter}`, ui.pill('Approved', 'positive'), '02 Sep 2026', 'helen@ashdownrowe.example'],
      [`Rev ${previous}`, ui.pill('Archived'), '14 May 2026', 'sophie.turner@jewel-demo.example']
    ];
    return ui.panel('Revisions', ui.table({ columns: ['Revision', 'Status', 'Uploaded', 'By'], rows: rows.map(([revision, ...rest]) => [ui.mono(revision), ...rest]), dense: true, selected: 1 }), { flush: true });
  }

  function extractionPanel(code) {
    const facts = ui.meta([['Title block', code], ['Scale', '1:50 @ A1'], ['Drawn by', 'Ashdown Rowe Architects'], ['Markups', '6 Bluebeam markups'], ['Change analysis', '2 changes against the previous revision']]);
    const notes = `<ul class="stack-sm" style="margin-top:16px">${['Opening width revised to 3600 clear at grid C/3–4', 'Lintel note updated — see structural engineer’s details'].map((note) => `<li class="muted">• ${note}</li>`).join('')}</ul>`;
    return ui.panel('Extracted data', [facts, notes], { actions: [ui.pill('Extracted 23 Sep 2026, 14:12', 'positive')] });
  }

  JPMS.page('/projects/:project/documents/:id', {
    title: 'Documents',
    render(params) {
      const project = JPMS.project(params.project);
      const index = Math.max(0, allDrawings.findIndex((drawing) => drawing.cells[0] === params.id));
      const drawing = allDrawings[index];
      const [, code, title, file, approved] = drawing.cells;
      const previous = allDrawings[index - 1];
      const next = allDrawings[index + 1];
      const pager = `<div class="row" style="gap:8px">${previous ? `<a class="btn btn-secondary" href="#/projects/${project.id}/documents/${previous.cells[0]}">← Previous</a>` : ''}<span class="text-xs subtle">${index + 1} of ${allDrawings.length}</span>${next ? `<a class="btn btn-secondary" href="#/projects/${project.id}/documents/${next.cells[0]}">Next →</a>` : ''}</div>`;
      const top = `<div class="row-between" style="margin-bottom:20px"><a class="subtle" href="#/projects/${project.id}/documents" style="text-decoration:underline">← Back to register</a>${pager}</div>`;
      const identity = `<div><h2 class="text-xl"><span class="mono">${code}</span> · ${title}</h2><p class="muted" style="margin-top:4px">Latest approved: <span class="mono">${approved}</span></p><p class="row muted" style="gap:8px;margin-top:8px">${ui.svg(folderIcon, 'sm')}${drawing.folder}</p></div>`;
      const header = `<div class="row-between" style="align-items:flex-start;margin-bottom:24px">${identity}<div class="row" style="gap:8px">${ui.btn('Extract data')}${ui.btn('+ Upload new version', 'primary')}<button type="button" class="btn btn-danger">Delete drawing</button></div></div>`;
      const preview = `<div class="panel"><div class="photo" style="aspect-ratio:1.414;border:0;align-items:center;justify-content:center;font-size:14px">${code} — ${title}</div><p class="text-xs subtle" style="padding:12px 16px">Showing ${approved} · ${file}</p></div>`;
      return records().projectShell(project, [top, header, `<div class="grid" style="grid-template-columns:minmax(0,3fr) minmax(0,2fr);margin-bottom:24px">${preview}${revisionsPanel(approved)}</div>`, extractionPanel(code)]);
    }
  });
})();
