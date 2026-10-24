/* Integrations — jpms/Pages/AdminIntegrations.razor: the portal's shared connections to outside
   services, one panel each, status only. Nothing secret is shown — credentials live in app settings. */
(function () {
  const ui = JPMS.ui;
  const shared = JPMS.oversight;

  const services = [
    { name: 'Microsoft 365', state: 'Connected', tone: 'positive', line: 'Connected as projects@jewel-demo.example since 12 Jan 2026.', detail: 'Mailboxes read live: projects@, sales@, accounts@. Calendar and OneDrive filing for every project.', verified: '25 Sep 2026, 09:30', action: 'Reconnect Microsoft 365' },
    { name: 'Xero', state: 'Connected', tone: 'positive', line: 'Connected to the organisation “Jewel Bespoke Build Ltd (demo)” since 03 Mar 2026.', detail: 'Contacts, bills, sales invoices and tracking categories sync every 15 minutes; valuation invoices are raised from the portal.', verified: '25 Sep 2026, 09:45', action: 'Reconnect Xero' },
    { name: 'Anthropic', state: 'Configured', tone: 'positive', line: 'Claude is available to the assistant, strategy research and document reading.', detail: 'Model and spend rate are set in the API’s app settings. Usage is on Agent Activity.', verified: '25 Sep 2026, 09:42', action: '' },
    { name: 'Bluebeam Studio', state: 'Connected', tone: 'positive', line: 'Connected as studio@jewel-demo.example since 21 Aug 2026.', detail: 'Document data extraction (drawings and any other PDF) runs through this account for every project.', verified: '25 Sep 2026, 02:00 — the nightly keep-alive exercises it so it never lapses', action: '' },
    { name: 'Azure Storage', state: 'Configured', tone: 'positive', line: 'Drawings, site photos and company documents are stored in the portal’s storage account.', detail: '1.8 TB used across 4 projects. Soft delete keeps removed files for 30 days.', verified: '25 Sep 2026, 06:00', action: '' },
    { name: 'HMRC CIS', state: 'Needs attention', tone: 'warning', line: 'Verification service connected; the September return is due in 25 days.', detail: 'Two subcontractors are waiting on verification — Summit Roofing Ltd and a new labour-only operative.', verified: '22 Sep 2026, 14:10', action: 'Verify now' }
  ];

  function servicePanel(service) {
    const body = [
      `<p>${service.line}</p>`,
      `<p class="text-xs subtle" style="margin-top:4px">${service.detail}</p>`,
      `<p class="text-xs subtle" style="margin-top:4px">Connection last verified ${service.verified}.</p>`,
      service.tone === 'warning' ? `<div style="margin-top:12px">${ui.notice('', 'Two verification requests are outstanding. CIS deductions default to the higher rate until they are verified.', 'warning')}</div>` : '',
      `<div class="row" style="border-top:1px solid var(--line);margin-top:20px;padding-top:16px">${service.action ? ui.btn(service.action) : ''}<button type="button" class="btn btn-ghost">Disconnect</button></div>`
    ];
    return ui.panel(service.name, body, { actions: [ui.pill(service.state, service.tone, { dot: true })] });
  }

  JPMS.page('/admin/integrations', {
    title: 'Integrations',
    render() {
      return ui.join([
        shared.adminTabs(3),
        shared.header({ subtitle: 'The portal’s shared connections to outside services. One connection serves everyone — connecting or disconnecting here changes what the whole portal can do.' }),
        ui.grid(2, services.map(servicePanel))
      ]);
    }
  });
})();
