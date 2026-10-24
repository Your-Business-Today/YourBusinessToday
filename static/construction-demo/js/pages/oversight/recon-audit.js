/* Reconciliation Audit — jpms/Pages/ProjectReconciliationAudit.razor: every cost-centre move on
   the project's valuation report, newest first. Read-only; the moves happen on the Valuation Report. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;

  const moves = [
    ['2h ago', 'ravi.patel', 'VR-2100-04', 'Moved “Attenuation tank — additional excavation” from 2100 Groundworks & drainage to 2200 Substructure · £8,420'],
    ['5h ago', 'ravi.patel', 'VR-6300-11', 'Moved “Library panelling — oak veneer uplift” from 6300 Joinery to V14 Variations · £12,960'],
    ['1d ago', 'daniel.price', 'VR-1000-02', 'Moved “Scaffold extension — west elevation” from 1000 Preliminaries to 3300 Roof structure & covering · £4,150'],
    ['2d ago', 'sophie.turner', 'VR-5100-07', 'Moved “Plant room pipework” from 5200 Electrical services to 5100 Mechanical services · £18,300'],
    ['3d ago', 'ravi.patel', 'VR-4100-03', 'Moved “Orangery roof lantern” from 3300 Roof structure & covering to 4100 Windows & external doors · £36,750'],
    ['6d ago', 'ravi.patel', 'VR-3100-09', 'Moved “Bath stone quoins — reclaimed allowance” from 8100 External works & landscaping to 3100 Masonry · £9,880'],
    ['8d ago', 'daniel.price', 'VR-2200-01', 'Moved “Basement tanking — Type C membrane” from 2100 Groundworks & drainage to 2200 Substructure · £41,200'],
    ['12d ago', 'sophie.turner', 'VR-7200-02', 'Moved “Principal en-suite sanitaryware” from 7100 Kitchen to 7200 Bathrooms & sanitaryware · £14,620'],
    ['16d ago', 'ravi.patel', 'VR-6100-05', 'Moved “Lime plaster — listed wing” from 6300 Joinery to 6100 Plastering & drylining · £7,340'],
    ['21d ago', 'ravi.patel', 'VR-8100-06', 'Moved “Terrace drainage channels” from 8100 External works & landscaping to 2100 Groundworks & drainage · £3,960']
  ];

  function rowsFor(project) {
    const count = project.id === 'hollowmere' ? moves.length : 4;
    return moves.slice(0, count).map(([when, who, line, move]) => [
      `<span class="subtle" style="white-space:nowrap">${when}</span>`,
      `<span style="white-space:nowrap">${who}@jewel-demo.example</span>`,
      `<span class="mono text-xs muted" style="white-space:nowrap">${line}</span>`,
      move
    ]);
  }

  function emptyPanel() {
    return ui.panel('', `<div style="text-align:center;padding:16px"><p>No cost centre moves recorded yet.</p><p class="text-xs subtle" style="margin-top:4px">When a valuation report line is recoded to a different cost centre, the move appears here with who made it and the value that moved.</p></div>`);
  }

  JPMS.page('/projects/:project/reconciliation-audit', {
    title: 'Reconciliation Audit',
    render(params) {
      const project = JPMS.project(params.project);
      const rows = project.stage === 'Pre-construction' ? [] : rowsFor(project);
      const heading = `<div class="row-between" style="margin-bottom:16px;align-items:flex-end"><div><h2 class="text-lg semibold">Reconciliation Audit</h2><p class="muted" style="margin-top:4px">Cost centre moves on the valuation report — who moved which line, from where to where, and when. The moves themselves are made on the ${ui.link('Valuation Report', `#/projects/${project.id}/valuation`)} tab.</p></div>${rows.length ? `<span class="text-xs subtle">Showing ${rows.length} of ${rows.length}</span>` : ''}</div>`;
      const body = rows.length ? ui.table({ columns: ['When', 'Moved by', 'Line', 'Move'], rows }) : emptyPanel();
      return ui.join([shared.projectShell(project), heading, body]);
    }
  });
})();
