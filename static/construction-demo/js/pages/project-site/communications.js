/* Communications — jpms/Pages/ProjectCommunications.razor: every email tagged to one of the
   project's records, with the pathway control, search, the "Tagged to" filter and the tag chips. */
(function () {
  const ui = JPMS.ui;
  const site = JPMS.site;
  const pathwayTones = { Client: 'positive', Subcontractor: 'warning', Supplier: 'info' };

  const typeOptions = ['Cost centres', 'Requests (RFI/RFA/…)', 'Bid package invites', 'Work orders', 'Relevant events (Programme)', 'To-dos', 'Calendar events', 'LADs', 'Variation orders', 'VO quotes', 'Defects', 'Inventory', 'Site instructions', 'Valuation reports'];

  const emails = [
    { from: 'Helen Rowe', pathway: 'Client', when: '25 Sep 2026, 09:41', subject: 'RE: Steel lintel over the kitchen opening', preview: 'Engineer has confirmed the 203 UC is acceptable with the padstones as drawn. Revised calc attached.', hasAttachment: true, links: [['Request', 'RFI-049', 'Steel lintel size over kitchen opening'], ['Cost centre', '2200', 'Substructure']] },
    { from: 'Brightwire Electrical Ltd', pathway: 'Subcontractor', when: '24 Sep 2026, 16:18', subject: 'Revised first-fix quote — study and cinema', preview: 'Please find our revised quotation reflecting the new socket heights and the additional cinema circuits.', hasAttachment: true, links: [['Work order', 'WO-0142', 'First-fix electrical'], ['Site instruction', 'SI-0010', 'Revised socket heights — study']] },
    { from: 'Stoneleigh Tiles & Stone', pathway: 'Supplier', when: '24 Sep 2026, 11:02', subject: 'Worktop replacement — lead time', preview: 'We can template on Tuesday; the replacement section is ten working days from template.', hasAttachment: false, links: [['Defect', 'DEF-0014', 'Kitchen — island']] },
    { from: 'Mr & Mrs Whitfield', pathway: 'Client', when: '23 Sep 2026, 20:15', subject: 'Oak flooring sample', preview: 'We both prefer the lighter brushed finish — could you confirm it is the same price as the sample we saw in July?', hasAttachment: false, links: [['VO', 'V14', 'Oak flooring upgrade']] },
    { from: 'Sophie Turner', pathway: 'Internal', when: '23 Sep 2026, 14:30', subject: 'Programme — orangery roof slip', preview: 'Summit have pushed the lead valley by a week; I have logged it as a relevant event and moved the follow-on trades.', hasAttachment: false, links: [['Relevant Event', 'RE-0019', 'Orangery roof covering delayed']] },
    { from: 'Harbour Glazing Systems', pathway: 'Supplier', when: '22 Sep 2026, 10:47', subject: 'Roof lantern unit — condensation', preview: 'Our surveyor will attend on Monday to inspect the sealed unit and arrange a replacement under warranty.', hasAttachment: false, links: [['Defect', 'DEF-0013', 'Orangery']] },
    { from: 'Alan Pryce', pathway: 'Internal', when: '17 Sep 2026, 10:22', subject: 'Site inspection report — Drainage', preview: 'Please find attached my site inspection report following yesterday\'s visit.', hasAttachment: true, links: [], unresolved: ['BCI-0003'] },
    { from: 'Northgate Groundworks Ltd', pathway: 'Subcontractor', when: '16 Sep 2026, 17:05', subject: 'Application for payment No. 7', preview: 'Our application for the period ending 15 September is attached, together with the drainage day-work sheets.', hasAttachment: true, links: [['Work order', 'WO-0138', 'Groundworks & drainage'], ['Cost centre', '2100', 'Groundworks & drainage']] }
  ];

  const tagChip = ([type, reference, title]) => `<span class="pill pill-accent" style="border-radius:999px" title="JPMS/${reference}">${type} <span class="mono">${reference}</span> · ${ui.escape(title)}</span>`;
  const action = (label) => `<button type="button" class="text-xs tone-accent" style="background:none;border:0;padding:0;font-weight:500;cursor:pointer">${label}</button>`;

  function emailCard(email) {
    const pathway = ui.pill(email.pathway, pathwayTones[email.pathway]);
    const attachment = email.hasAttachment ? ` <span style="margin-left:8px">${ui.pill('attachment')}</span>` : '';
    const tags = [...email.links.map(tagChip), ...(email.unresolved || []).map((stem) => ui.pill(stem))].join('');
    return `<li class="card" style="margin-bottom:8px">
      <div class="row-between"><span class="row"><span class="strong">${ui.escape(email.from)}</span>${pathway}</span><span class="text-xs subtle">${email.when}</span></div>
      <p style="margin-top:2px">${ui.escape(email.subject)}${attachment}</p>
      <p class="text-xs subtle" style="margin-top:4px">${ui.escape(email.preview)}</p>
      <div class="row" style="margin-top:8px;gap:4px;flex-wrap:wrap">${tags}</div>
      <div class="row" style="margin-top:8px;gap:16px">${action('↩ Reply')}${action('→ Forward')}${action('+ Add tag')}</div>
    </li>`;
  }

  function filters() {
    const pathway = ui.chips(['All', 'Client', 'Subcontractor', 'Supplier', 'Internal'], 0);
    const select = `<label class="row"><span class="subtle">Tagged to</span><select class="field" style="width:208px;height:36px;padding:4px 12px;font-size:14px"><option>All types</option>${typeOptions.map((option) => `<option>${option}</option>`).join('')}</select></label>`;
    const search = `<div style="width:256px">${ui.search('Search emails…')}</div>`;
    return pathway + ui.toolbar([search, select], [`<p class="text-xs subtle">Showing ${emails.length} of 214</p>`]);
  }

  JPMS.page('/projects/:project/communications', {
    title: 'Communications',
    render(params) {
      const project = JPMS.project(params.project);
      const list = `<ul>${emails.map(emailCard).join('')}</ul><div style="margin-top:16px;text-align:center">${ui.btn('Load more')}</div>`;
      return site.projectShell(project, [filters(), list]);
    }
  });
})();
