/* Valuation Report — jpms/Pages/ProjectValuation.razor inside ProjectPageShell: the section header
   with the working-copy PDF / Excel / client-references toolbar, the claim picker and New claim,
   the claim card, the bill, the valuation invoices, the correspondence and the summary. */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const data = JPMS.valuationData;
  const figures = JPMS.valuationFigures;
  const card = JPMS.valuationCard;

  const defaultStages = { wrenfield: 'confirmed' };

  function claimPicker(claims, stageStatus) {
    const newestFirst = [...claims].reverse();
    const options = newestFirst.map((claim, index) => `${claim.name} — ${index === 0 ? stageStatus : 'Confirmed'} (${claim.date})`);
    return frame.select(options, '340px');
  }

  function sectionActions(claims, stageStatus) {
    const tools = frame.toolbar([
      frame.toolButton('download', 'Download PDF — working copy of the report as it stands'),
      frame.toolButton('excel', 'Export to Excel — the report as it stands, with the Pending variations tab'),
      '<span style="width:1px;height:20px;background:var(--line);margin:0 2px"></span>',
      frame.toolButton('tag', "Client references — map cost centres to the client's schedule-of-works item numbers for the PDF")
    ]);
    const picker = claims.length ? claimPicker(claims, stageStatus) : '';
    return [tools, picker, ui.btn('New claim')];
  }

  function emptyClaim() {
    return '<p class="subtle" style="font-style:italic;margin-bottom:16px">No claim selected. Build the bill below, then start a claim to value works complete.</p>';
  }

  function draftTools(isDraft) {
    if (!isDraft) return '';
    return `<div class="row" style="justify-content:flex-end;margin-bottom:8px">${ui.btn('Bulk edit %')}${ui.btn('Add line')}</div>`;
  }

  function stageKeyFor(project, claims) {
    if (!claims.length) return null;
    const requested = frame.query().stage;
    return card.stages[requested] ? requested : defaultStages[project.id] || 'awaiting-payment';
  }

  JPMS.page('/projects/:project/valuation', {
    title: 'Valuation Reports',
    render(params) {
      const project = JPMS.project(params.project);
      const claims = JPMS.valuationClaims.claimsFor(project);
      const latest = claims[claims.length - 1];
      const stageKey = stageKeyFor(project, claims);
      const bill = data.billFor(project, latest);
      const sums = { ...figures.summary(bill, stageKey, claims), claimName: latest ? latest.name : '', confirmedDate: latest ? latest.due || latest.date : '' };
      const isDraft = !stageKey || stageKey === 'draft';
      const stageStatus = stageKey ? card.stages[stageKey].status : '';
      const claimCard = stageKey ? card.notices(stageKey, project, sums) + card.card(stageKey, sums, `#/projects/${project.id}/valuation`) : emptyClaim();
      const invoices = figures.invoices(stageKey, claims);
      return frame.projectShell(project, [
        frame.sectionHeader('Valuation Report', sectionActions(claims, stageStatus)),
        claimCard,
        draftTools(isDraft),
        JPMS.valuationReport.bill(bill, isDraft, project.id),
        JPMS.valuationExtras.invoicesSection(invoices),
        JPMS.valuationExtras.correspondence(project, latest),
        JPMS.valuationExtras.summaryPanel(sums)
      ]);
    }
  });
})();
