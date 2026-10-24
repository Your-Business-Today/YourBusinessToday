/* Useful Information — jpms/Pages/ProjectUsefulInformation.razor via UsefulInformationPanel.razor:
   the office's internal notes, A–Z by title, with the keyword filter shown once there are over eight. */
(function () {
  const ui = JPMS.ui;
  const site = JPMS.site;

  const notes = [
    { title: 'Alarm panel', body: 'Panel is in the boot room cupboard behind the door. Site code set by Brightwire; unset on arrival, set when the last person leaves.', hasCredential: true, stamp: 'Updated 21 Sep 2026 by liam.carter@jewel-demo.example' },
    { title: 'Client parking', body: 'Mr & Mrs Whitfield park on the gravel by the coach house when they visit. Keep that bay clear of skips and deliveries on Fridays.', stamp: 'Added 14 Jul 2026 by sophie.turner@jewel-demo.example' },
    { title: 'Deliveries — the lane', body: 'Lane is single-track with one passing place by the farm gate. No articulated lorries; rigid vehicles only, not before 08:30. Call Tom 20 minutes out.', stamp: 'Updated 02 Sep 2026 by tom.reeves@jewel-demo.example' },
    { title: 'Front gate code', body: 'Keypad on the right-hand pier. Code changes on the first Monday of each month — the new code goes here the same morning.', hasCredential: true, stamp: 'Updated 07 Sep 2026 by liam.carter@jewel-demo.example' },
    { title: 'Key safe', body: 'Key safe is on the left gatepost behind the ivy. Holds the house keys, garage fob and the plant room key.', hasCredential: true, stamp: 'Added 03 Mar 2026 by liam.carter@jewel-demo.example' },
    { title: 'Neighbours', body: 'Hollybank (east): Mrs Denton, prefers a note through the door before noisy works. Ashcombe Farm (north): tractor movements in the lane 07:00–08:00 during harvest.', stamp: 'Updated 26 Aug 2026 by sophie.turner@jewel-demo.example' },
    { title: 'Site WiFi', body: 'Router in the site office. Network name JBB-Site-Hollowmere. For the site team and visiting subcontractors only.', hasCredential: true, stamp: 'Added 10 Mar 2026 by emma.walsh@jewel-demo.example' },
    { title: 'Stopcock and isolations', body: 'Mains water stopcock in the pavement box by the gate. Temporary builders supply isolator is in the welfare cabin; gas meter isolation in the external box on the west wall.', stamp: 'Updated 18 Jun 2026 by liam.carter@jewel-demo.example' },
    { title: 'Waste & skips', body: 'Skips from Meridian — ring the yard before 10:00 for next-day swaps. Mixed waste only in the grab bay; plasterboard to its own bag.', stamp: 'Added 22 Apr 2026 by tom.reeves@jewel-demo.example' }
  ];

  function noteCard(note) {
    const credential = note.hasCredential ? ui.pill('Credential held') : '';
    return `<button type="button" class="card" style="display:block;width:100%;text-align:left;margin-bottom:8px;padding:8px 12px" title="Open this note to read or edit it">
      <span class="row"><span class="strong">${ui.escape(note.title)}</span>${credential}</span>
      <p class="muted" style="margin-top:2px">${ui.escape(note.body)}</p>
      <p class="text-xs subtle" style="margin-top:4px">${note.stamp}</p>
    </button>`;
  }

  JPMS.page('/projects/:project/useful-information', {
    title: 'Useful Information',
    render(params) {
      const project = JPMS.project(params.project);
      const heading = `<div class="row-between" style="margin-bottom:4px"><h2 class="strong">Useful Information</h2>${ui.btn('Add note', 'primary')}</div>`;
      const intro = '<p class="text-xs subtle" style="margin-bottom:16px">Internal notes for this project — door codes, key safes, access arrangements, anything the office needs to hand. Never visible to clients, architects or subcontractors.</p>';
      const filter = `<div style="margin-bottom:16px">${ui.search('Filter notes by keyword')}</div>`;
      const list = project.stage === 'Pre-construction' ? ui.empty('No useful information on this project yet — add the first note.') : filter + notes.map(noteCard).join('');
      return site.projectShell(project, [ui.panel('', [heading, intro, list])]);
    }
  });
})();
