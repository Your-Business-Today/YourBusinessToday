/* Document Triage's three filing forms — Project documents (new document or revision), Payment
   certificate (against a valuation claim) and Subcontractor document (kind, expiry, cover). */
(function () {
  const ui = JPMS.ui;
  const frame = JPMS.flagship;
  const compact = 'height:36px;font-size:14px;padding:0 12px';

  function labelled(label, control, isRequired) {
    return `<label style="display:block"><span class="form-label" style="display:block;margin-bottom:6px">${label}${isRequired ? ' <span class="tone-negative">*</span>' : ''}</span>${control}</label>`;
  }

  function input(value, placeholder) {
    return `<input class="field" style="${compact}" value="${ui.escape(value || '')}" placeholder="${ui.escape(placeholder || '')}">`;
  }

  function projectSelect(item) {
    const chosen = JPMS.data.projects.find((project) => project.name === item.project);
    const options = chosen ? [`${chosen.ref} — ${chosen.name}`] : ['Select a project…'];
    return frame.select([...options, ...JPMS.data.projects.filter((project) => project !== chosen).map((project) => `${project.ref} — ${project.name}`)], '100%');
  }

  function footer(label) {
    return `<div class="row" style="margin-top:12px">${ui.btn(label, 'primary')}<button type="button" class="muted">Discard</button></div>`;
  }

  function twoColumns(items) {
    return `<div class="grid grid-2" style="gap:12px;margin-top:12px">${items.join('')}</div>`;
  }

  function drawing(item) {
    const note = '<p class="text-xs muted" style="line-height:16px">The file lands as an <span class="strong">unapproved revision</span> — a new (or blank) code registers a new document in the project’s Documents register, named by its file until it is given a code or title; approval follows the normal documents workflow.</p>';
    const mode = '<div class="row" style="gap:8px;margin-top:12px"><button type="button" class="chip">New document</button><button type="button" class="chip is-active">Revision of existing document</button></div>';
    const code = item.file.split(' — ')[0];
    const existing = frame.select([`${code.replace(/ rev [A-Z]/, '')} — ${item.file.split(' — ')[1].replace(/\.[a-z]+$/, '')} (rev B, approved)`, 'Select a document…'], '100%');
    return note + mode + twoColumns([labelled('Project', projectSelect(item), true), labelled('Existing document', existing, true), labelled('Revision label', input(code.includes('rev') ? code.split('rev ')[1] : 'C'))]) + footer('File to project documents');
  }

  function certificate(item) {
    const note = '<p class="text-xs muted">Lands in <span class="strong">Finance → Payment Certificates</span>, viewable by project.</p>';
    const claim = frame.select(['August 2026', 'Not tied to a claim', 'September 2026', 'July 2026'], '100%');
    return note + twoColumns([labelled('Project', projectSelect(item), true), labelled('Valuation claim', claim)]) + `<div class="grid grid-3" style="gap:12px;margin-top:12px">${labelled('Certificate number', input('PC-006'), true)}${labelled('Certified amount (£)', input('353393'))}${labelled('Issued date', input('24/09/2026'), true)}</div>` + footer('File as payment certificate');
  }

  function subcontractor() {
    const note = '<p class="text-xs muted">Lands on the subcontractor’s record as the current version of its kind — superseding, never replacing, exactly like a portal upload.</p>';
    const fields = [labelled('Subcontractor', input('Clearflow Plumbing & Heating'), true), labelled('Kind', input('Insurance', 'RAMS, Insurance, Drawings / Specifications…'), true), labelled('Expiry date', input('30/09/2027')), labelled('Public liability cover (£)', input('5000000', 'e.g. 5000000'))];
    return note + `<div class="grid grid-4" style="gap:12px;margin-top:12px">${fields.join('')}</div>` + footer('File to subcontractor');
  }

  JPMS.documentTriageForms = { drawing, certificate, subcontractor };
})();
