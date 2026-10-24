/* System — jpms/Pages/AdminSystem.razor: the announced app version with Publish update, and the
   company's tender terms & conditions PDF attached to every tender invite. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;
  const version = 214;

  function versionPanel() {
    const body = [
      `<div class="row" style="align-items:baseline;gap:12px"><p class="mono" style="font-size:30px;line-height:1;font-weight:600">v${version}</p><p class="text-xs subtle">what every tab is currently asked to run</p></div>`,
      `<p class="text-xs subtle" style="margin-top:8px">Published 24 Sep 2026, 18:22 by ${JPMS.data.signedIn.email}</p>`,
      `<div style="border-top:1px solid var(--line);margin-top:20px;padding-top:20px">${ui.btn('Publish update', 'primary')}<p class="text-xs subtle" style="margin-top:8px">Announces v${version + 1} and asks every open tab to refresh.</p></div>`
    ];
    return ui.panel('Announced version', body);
  }

  function termsPanel() {
    const body = [
      `<p><a class="tone-accent strong" href="#/admin/system">JBB-Tender-Terms-and-Conditions-2026.pdf</a><span class="subtle"> · 412 KB · uploaded 03 Jun 2026, 10:48</span></p>`,
      `<p class="text-xs subtle" style="margin-top:4px">Attached automatically to every tender-invite email, on every project, alongside the pricing schedule. Uploading a replacement changes what every invite sends from that moment on.</p>`,
      `<div style="border-top:1px solid var(--line);margin-top:16px;padding-top:16px">${ui.btn('Replace the document')}<p class="text-xs subtle" style="margin-top:8px">PDF only, up to 10&nbsp;MB. Directors and administrators can replace it.</p></div>`
    ];
    return ui.panel('Tender terms &amp; conditions', body);
  }

  JPMS.page('/admin/system', {
    title: 'System',
    render() {
      return ui.join([
        shared.adminTabs(2),
        shared.header({ subtitle: 'The version every signed-in tab is asked to run. Publishing an update raises the refresh bar on every open tab — use it once a deploy has finished, so nobody keeps working on the old build.' }),
        `<div class="stack" style="max-width:42rem">${versionPanel()}${termsPanel()}</div>`
      ]);
    }
  });
})();
