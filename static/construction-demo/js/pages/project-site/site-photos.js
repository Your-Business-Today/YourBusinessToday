/* Site photos — jpms/Pages/SitePhotos.razor: the company-wide pool, the drop zone, the
   project / whole-pool scope chips, the Unfiled / Filed / Archived / All chips and the photo cards. */
(function () {
  const ui = JPMS.ui;

  const photos = [
    { file: 'IMG_4812.jpeg', caption: 'Basement slab pour — east bay', standing: 'unfiled', dropped: '24 Sep' },
    { file: 'IMG_4815.jpeg', caption: 'Oak frame pegs — orangery ridge', standing: 'unfiled', dropped: '24 Sep' },
    { file: 'IMG_4819.jpeg', caption: 'Bath stone quoins delivered', standing: 'unfiled', dropped: '24 Sep' },
    { file: 'IMG_4821.jpeg', caption: 'First-fix electrics — study', standing: 'unfiled', dropped: '24 Sep' },
    { file: 'IMG_4826.jpeg', caption: 'Tanking membrane lapped at wall', standing: 'unfiled', dropped: '23 Sep' },
    { file: 'IMG_4830.jpeg', caption: 'Scaffold adapted for chimney', standing: 'unfiled', dropped: '23 Sep' },
    { file: 'IMG_4702.jpeg', caption: 'Steel ring beam craned in', standing: 'filed', filedTo: 'Thu 17 Sep 2026' },
    { file: 'IMG_4706.jpeg', caption: 'Lead valley to rear roof', standing: 'filed', filedTo: 'Thu 17 Sep 2026' },
    { file: 'IMG_4711.jpeg', caption: 'Underfloor heating manifolds', standing: 'filed', filedTo: 'Fri 18 Sep 2026' },
    { file: 'IMG_4715.jpeg', caption: 'Sash windows glazed — front', standing: 'filed', filedTo: 'Mon 21 Sep 2026' },
    { file: 'IMG_4720.jpeg', caption: 'Limecrete floor laid — hall', standing: 'filed', filedTo: 'Mon 21 Sep 2026' },
    { file: 'IMG_4724.jpeg', caption: 'Drainage run CCTV survey', standing: 'filed', filedTo: 'Tue 22 Sep 2026' },
    { file: 'Screenshot 2026-09-18.png', caption: 'WhatsApp thread screenshot', standing: 'archived', reason: 'Screenshot' },
    { file: 'IMG_4709.jpeg', caption: 'Marked-up section drawing', standing: 'archived', reason: 'Document or drawing' },
    { file: 'IMG_4713.jpeg', caption: 'Chipped skirting — snag photo', standing: 'archived', reason: 'Snag or defect' },
    { file: 'IMG_4717.jpeg', caption: 'Van in the lane', standing: 'archived', reason: 'Not progress' }
  ];

  function standingLine(photo, project) {
    if (photo.standing === 'filed') return `${ui.pill('Filed', 'positive')} <a class="link" style="margin-left:4px" href="#/projects/${project.id}/progress">${project.ref} · ${photo.filedTo}</a>`;
    if (photo.standing === 'archived') return `${ui.pill('Archived', 'warning')} <span style="margin-left:4px">${photo.reason}</span>`;
    return `${ui.pill('Unfiled')} <span style="margin-left:4px">${photo.dropped}</span>`;
  }

  function photoCard(photo, project) {
    const isWaiting = photo.standing === 'unfiled';
    const restore = photo.standing === 'archived' ? ui.btn('Restore') : '';
    return `<div style="display:flex;flex-direction:column;border:1px solid var(--line);background:var(--surface);${isWaiting ? '' : 'opacity:0.7'}">
      <div class="photo" style="border:0;aspect-ratio:auto;height:128px">${ui.escape(photo.caption)}</div>
      <div class="stack-sm" style="padding:8px;display:flex;flex-direction:column;gap:6px">
        <span class="text-xs" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ui.escape(photo.file)}</span>
        <span class="text-xs subtle">${standingLine(photo, project)}</span>
        <div class="row">${restore}${ui.btn('Delete', 'ghost')}</div>
      </div>
    </div>`;
  }

  const dropZone = `<label style="display:block;margin-bottom:20px;border:1px dashed var(--line-strong);background:var(--surface);padding:24px;text-align:center;cursor:pointer">
    <span class="strong" style="display:block">Drop the week's photographs here, or click to choose</span>
    <span class="text-xs subtle" style="display:block;margin-top:4px">JPEG, PNG or HEIC · up to 50 at a time · the same files you export from WhatsApp, so the report run can find them</span>
  </label>`;

  JPMS.page('/site-photos', {
    title: 'Site Photos',
    render() {
      const project = JPMS.project();
      const counts = { unfiled: 6, filed: 6, archived: 4 };
      const scope = ui.chips([{ label: project.ref }, { label: 'Whole pool' }], 0);
      const standing = ui.chips([{ label: 'Unfiled', count: 23 }, { label: 'Filed', count: counts.filed }, { label: 'Archived', count: counts.archived }, { label: 'All', count: 16 }], 3);
      const grid = `<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(9rem,1fr))">${photos.map((photo) => photoCard(photo, project)).join('')}</div>`;
      return ui.join([
        ui.header({ subtitle: `148 photographs filed to ${project.ref} ${project.name} · 23 waiting to be filed across the pool.`, actions: [scope, standing] }),
        dropZone,
        ui.notice('', '12 stored · 2 already in the pool.', 'positive'),
        `<div style="margin-top:16px">${grid}</div>`
      ]);
    }
  });
})();
