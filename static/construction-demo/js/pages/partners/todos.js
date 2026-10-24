/* The master to-do list — jpms/Pages/Todos.razor with TodoBoard: filters, then the Open / Done board. */
(function () {
  const ui = JPMS.ui;
  const todos = JPMS.partnersTodos;
  const overdue = new Set(['todo-0139', 'todo-0137']);
  const roleColours = { 'Quantity Surveyor': 'var(--info)', 'Finance Director': 'var(--warning)', 'Project Manager': 'var(--accent)', Accounts: 'var(--brand, #4CDBEE)', 'H&S Officer': 'var(--negative)', 'Managing Director': 'var(--content-muted)' };

  function assigneeBadge(item) {
    const person = item.person ? ` · ${item.person}` : '';
    return `<span class="pill" style="border-color:${roleColours[item.role]};color:${roleColours[item.role]}">${ui.escape(item.role + person)}</span>`;
  }

  function card(item) {
    const due = item.due ? `<span class="${overdue.has(item.id) ? 'tone-negative strong' : ''}">Due ${item.due}</span>` : '';
    const progress = item.inProgress ? ui.pill('In progress', 'warning') : '';
    const done = item.done ? `<span>Done ${item.done}</span>` : '';
    const title = item.done ? `<span class="subtle" style="text-decoration:line-through">${item.title}</span>` : item.title;
    return `<a class="card" href="#/todos/${item.id}" style="display:block;margin-bottom:8px;border-left:3px solid ${roleColours[item.role]}"><p class="mono text-xs subtle">${item.ref}</p><p style="margin-top:2px">${title}</p><div class="row text-xs subtle" style="gap:8px;margin-top:8px">${ui.pill(item.scope, item.scope === 'Company-wide' ? 'accent' : '')}${progress}${due}${done}${assigneeBadge(item)}</div></a>`;
  }

  function column(label, items, dotTone) {
    return `<div style="border:1px solid var(--line);padding:10px"><div class="row" style="gap:8px;margin-bottom:8px"><span style="width:8px;height:8px;border-radius:99px;background:var(--${dotTone})"></span><p class="eyebrow">${label}</p><span class="text-xs subtle">${items.length}</span></div>${items.map(card).join('')}</div>`;
  }

  function filters() {
    const select = (options) => `<select class="field" style="width:auto;max-width:220px;padding:6px 8px;font-size:12px">${options.map((option) => `<option>${option}</option>`).join('')}</select>`;
    const projects = ['All', 'Company-wide', ...JPMS.data.projects.map((project) => `${project.ref} — ${project.name}`)];
    const roles = ['Any role', 'Unassigned', 'Managing Director', 'Finance Director', 'Project Manager', 'Quantity Surveyor', 'Accounts', 'H&S Officer'];
    const people = ['Anyone', ...JPMS.data.staff.map((person) => person.name)];
    return `<div class="row" style="margin-bottom:16px"><div style="flex:1;min-width:220px">${ui.search('Search to-dos — reference (TODO-0011), title or notes')}</div><button class="chip is-active" data-chip>Board</button><button class="chip" data-chip>List</button><button class="chip">⇅ Oldest first</button>${select(projects)}${select(roles)}${select(people)}</div>`;
  }

  JPMS.page('/todos', {
    title: 'Todo',
    render() {
      const open = todos.filter((item) => !item.done);
      const done = todos.filter((item) => item.done);
      const board = `<div class="grid grid-2">${column('Open', open, 'info')}${column('Done', done, 'positive')}</div>`;
      const intro = `<div class="row" style="margin-bottom:4px"><h2 class="strong">To-do board</h2><span class="text-xs subtle">${done.length} of ${todos.length} done</span></div><p class="text-xs subtle" style="margin-bottom:16px">Click a card for its full detail, linked to-dos and communications — or drag it between the columns to mark it done or reopen it.</p>`;
      return ui.join([
        ui.header({ subtitle: 'The master list: every to-do item — company-wide and project items alike. Each project\'s To-do tab shows just its own.', primary: 'Add to-do' }),
        filters(), `<div class="panel panel-body">${intro}${board}</div>`
      ]);
    }
  });
})();
