/* Progress — jpms/Pages/ProjectProgress.razor: the client-facing Progress reports, then Progress
   of the works — dated groups of photos with a description and the day's weather. */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;

  const reports = [
    ['September 2026 progress report', '01 Sep – 30 Sep 2026', 4, '24 Sep 2026', 'sophie.turner@jewel-demo.example'],
    ['August 2026 progress report', '01 Aug – 31 Aug 2026', 5, '01 Sep 2026', 'sophie.turner@jewel-demo.example'],
    ['July 2026 progress report', '01 Jul – 31 Jul 2026', 4, '03 Aug 2026', 'sophie.turner@jewel-demo.example']
  ];

  const updates = [
    ['Kitchen wall propped ahead of the widened opening', '24 Sep 2026', 'liam.carter@jewel-demo.example', 'Needles and Acrow props in to grid C/3–4; existing angle lintels exposed. Awaiting the steel on V14.', 'Dry, 16°C, light wind', ['Props in to kitchen wall', 'Needles from dining side', 'Existing lintels exposed']],
    ['Rear elevation masonry to first-floor sills', '22 Sep 2026', 'liam.carter@jewel-demo.example', 'Ashlar Stone at first-floor sill level across the rear elevation. Stone sills bedded on the stair window.', 'Sunny intervals, 18°C', ['Rear elevation', 'Stone sills to stair window', 'Mullion templates', 'Brick and flint panel']],
    ['Roof trusses and ridge beam', '17 Sep 2026', 'tom.reeves@jewel-demo.example', 'Oak ridge beam lifted in; rafters to the east pitch complete. Breather membrane started.', 'Overcast, 15°C', ['Ridge beam lift', 'East pitch rafters', 'Membrane starting']],
    ['Basement tanking complete', '09 Sep 2026', 'liam.carter@jewel-demo.example', 'Cavity drain membrane and sump pumps commissioned. Screed booked for w/c 14 Sep.', 'Showers, 14°C', ['Cavity drain membrane', 'Sump chamber', 'Pump commissioning']]
  ];

  function reportRow([title, period, groups, created, by]) {
    return `<li class="panel row-between" style="padding:12px 16px;margin-bottom:8px"><div><p class="strong">${title}</p><p class="text-xs subtle" style="margin-top:4px">${period} · ${groups} photo groups · created ${created} by ${by}</p></div><div class="row" style="gap:8px">${ui.btn('Download PDF')}${ui.btn('Edit')}${ui.btn('Delete')}</div></li>`;
  }

  function updateCard([title, date, by, description, weather, photos]) {
    const tiles = photos.map((caption) => `<div class="photo" style="width:144px;height:112px;aspect-ratio:auto">${caption}</div>`).join('');
    const addTile = '<div class="photo" style="width:144px;height:112px;aspect-ratio:auto;align-items:center;justify-content:center;border-style:dashed;background:none">+ Add photos</div>';
    return `<li style="border:1px solid var(--line);background:var(--surface);padding:16px;margin-bottom:16px"><div class="row-between" style="align-items:flex-start;margin-bottom:8px"><div><p class="semibold">${title}</p><p class="text-xs subtle" style="margin-top:2px">${date} · ${photos.length} photos · ${by}</p></div>${ui.btn('Delete')}</div><p class="muted" style="margin-bottom:12px;line-height:20px">${description}</p><p class="text-xs subtle" style="margin-bottom:12px">Weather: ${weather}</p><div class="row" style="gap:8px">${tiles}${addTile}</div></li>`;
  }

  JPMS.page('/projects/:project/progress', {
    title: 'Progress',
    render(params) {
      const project = JPMS.project(params.project);
      return records().projectShell(project, [
        records().sectionHeader('Progress reports', 'Client-facing reports assembled from the progress updates below. The PDF is regenerated from the register on every download.', [ui.btn('+ New report')]),
        `<ul style="margin-bottom:32px">${reports.map(reportRow).join('')}</ul>`,
        records().sectionHeader('Progress of the works', `${updates.length} updates · groups of photos with a description, recorded as the works progress`, [ui.btn("Contractor's Reports…"), ui.btn('+ Record progress', 'primary')]),
        `<ul>${updates.map(updateCard).join('')}</ul>`
      ]);
    }
  });
})();
