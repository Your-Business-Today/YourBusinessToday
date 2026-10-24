/* Architect's Instructions — jpms/Pages/ProjectArchitectInstructions.razor: the register of formal
   instructions, each linked to the variations it covers, with its document or "Awaited". */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;

  function variationChips(project, instruction) {
    const variations = records().variations(project.id);
    const chips = instruction.links.map((ref) => {
      const variation = variations.find((row) => row.ref === ref) || { id: ref.toLowerCase(), title: '', status: '' };
      return `<a href="#/projects/${project.id}/variations/${variation.id}" title="${ui.escape(variation.title)} — ${variation.status}" class="mono text-xs muted" style="display:inline-flex;padding:2px 8px;border-radius:999px;border:1px solid var(--line);background:var(--surface-raised);margin-right:4px">${ref}</a>`;
    }).join('');
    const empty = instruction.links.length ? '' : '<span class="text-xs subtle">Not linked</span>';
    return `<div>${chips}${empty}</div><a class="text-xs tone-accent" style="display:inline-block;margin-top:4px;white-space:nowrap">Link a variation…</a>`;
  }

  function documentCell(instruction) {
    if (!instruction.file) return '<span class="text-xs subtle" title="No document has been attached yet">Awaited</span>';
    return `<a class="text-xs tone-accent" style="text-decoration:underline">${instruction.file}</a>`;
  }

  JPMS.page('/projects/:project/architect-instructions', {
    title: "Architect's Instructions",
    render(params) {
      const project = JPMS.project(params.project);
      const instructions = records().instructions(project.id);
      const table = ui.table({
        columns: ['Ref', 'Title', 'Instructed', 'Issued by', 'Variations', 'Document', ''],
        rows: instructions.map((instruction) => [
          `<span class="mono strong">${instruction.ref}</span><span class="mono text-xs subtle" style="display:block;white-space:nowrap">${instruction.architectRef}</span>`,
          `<span class="strong">${ui.escape(instruction.title)}</span>${instruction.notes ? `<span class="text-xs subtle" style="display:block;margin-top:2px">${ui.escape(instruction.notes)}</span>` : ''}`,
          `<span style="white-space:nowrap">${instruction.instructed}</span>`,
          `${instruction.by}<span class="text-xs subtle" style="display:block">${instruction.source}</span>`,
          variationChips(project, instruction),
          documentCell(instruction),
          '<a class="text-xs subtle">Delete…</a>'
        ]),
        dense: true
      });
      const body = instructions.length ? table : `<p class="subtle" style="padding:24px">No instructions recorded on this project yet. File one when it arrives — by email or straight from the architect.</p>`;
      return records().projectShell(project, [
        records().sectionHeader("Architect's Instructions", 'The formal instructions authorising varied work, and the variations each one covers.', [ui.btn('File an instruction', 'primary')]),
        `<section class="panel">${body}</section>`
      ]);
    }
  });
})();
