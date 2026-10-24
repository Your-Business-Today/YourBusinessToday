/* To-do — jpms/Pages/ProjectTodos.razor with ProjectTodoList.razor and TodoBoard.razor: the
   project's to-do list as a status board (Open / Done), with search, role filter and Add item. */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;

  const openItems = [
    ['TODO-0412', 'Chase Brightwire for revised first-fix quote', '26 Sep 2026', 'Quantity Surveyor', 'sophie.turner@jewel-demo.example'],
    ['TODO-0410', 'Approve Northgate bill against WO-0142', '25 Sep 2026', 'Finance Director', 'emma.walsh@jewel-demo.example'],
    ['TODO-0409', 'Confirm oak flooring sample with client', '18 Sep 2026', 'Project Manager', 'liam.carter@jewel-demo.example', true],
    ['TODO-0407', 'Order steel lintel once V14 is approved', '29 Sep 2026', 'Ravi Patel', 'sophie.turner@jewel-demo.example'],
    ['TODO-0404', 'Book building control — first-floor structure', '02 Oct 2026', 'Project Manager', 'liam.carter@jewel-demo.example'],
    ['TODO-0401', 'Photograph masonry for October valuation', '30 Sep 2026', 'Site Manager', 'ravi.patel@jewel-demo.example'],
    ['TODO-0398', 'Issue revised door ironmongery schedule', '16 Sep 2026', 'Project Manager', 'sophie.turner@jewel-demo.example', true],
    ['TODO-0395', 'Toolbox talk — working at height on the roof', null, 'H&S Officer', 'grace.holloway@jewel-demo.example']
  ];

  const doneItems = [
    ['TODO-0406', 'Issue V14 to Ashdown Rowe for instruction', 'Done 19 Sep 2026', 'Project Manager'],
    ['TODO-0403', 'Prop kitchen wall ahead of the opening', 'Done 17 Sep 2026', 'Site Manager'],
    ['TODO-0399', 'Send RFI-049 to the engineer', 'Done 09 Sep 2026', 'Project Manager'],
    ['TODO-0392', 'Upload August progress photos', 'Done 01 Sep 2026', 'Site Manager']
  ];

  function assignee(role) {
    return `<span class="row" style="gap:4px;flex-wrap:nowrap;white-space:nowrap"><span class="avatar" style="width:18px;height:18px;font-size:9px">${role.split(' ').map((word) => word[0]).join('').slice(0, 2)}</span>${role}</span>`;
  }

  function openCard([reference, title, due, role, addedBy, isOverdue]) {
    const dueHtml = due ? `<span class="${isOverdue ? 'tone-negative semibold' : ''}" style="white-space:nowrap">Due ${due}</span>` : '';
    return `<a class="card" href="#/todos" style="display:block;margin-bottom:8px"><p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span class="mono muted" style="margin-right:8px">${reference}</span>${title}</p><div class="row text-xs subtle" style="gap:12px;margin-top:6px;flex-wrap:nowrap;overflow:hidden">${dueHtml}${assignee(role)}<span style="white-space:nowrap">Added by ${addedBy}</span></div></a>`;
  }

  function doneCard([reference, title, done, role]) {
    return `<a class="card" href="#/todos" style="display:block;margin-bottom:8px;opacity:.75"><p style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:line-through"><span class="mono muted" style="margin-right:8px">${reference}</span>${title}</p><div class="row text-xs subtle" style="gap:12px;margin-top:6px"><span>${done}</span>${assignee(role)}</div></a>`;
  }

  function column(label, cards) {
    return `<div style="border:1px solid var(--line);background:var(--canvas);padding:12px"><div class="row-between" style="margin-bottom:12px"><h3 class="eyebrow">${label}</h3><span class="chip-count">${cards.length}</span></div>${cards.join('')}</div>`;
  }

  JPMS.page('/projects/:project/todos', {
    title: 'To-do',
    render(params) {
      const project = JPMS.project(params.project);
      const total = openItems.length + doneItems.length;
      const heading = `<div class="row-between" style="margin-bottom:4px"><div class="row"><h2 class="semibold" style="font-size:14px">To-do list</h2><span class="text-xs subtle">${doneItems.length} of ${total} done</span></div><div class="row" style="gap:8px"><div class="row" style="gap:4px"><button class="chip is-active" data-chip>Board</button><button class="chip" data-chip>List</button></div><button class="chip">⇅ Oldest first</button>${ui.btn('Add item', 'primary')}</div></div>`;
      const intro = '<p class="text-xs subtle" style="margin-bottom:16px">Items added here or captured from an email in the Control Centre. Click an item for its full detail, linked to-dos and communications, and to mark it done.</p>';
      const filters = `<div class="row" style="gap:8px;margin-bottom:16px;flex-wrap:nowrap"><div style="flex:1">${ui.search('Search keywords — filters the list and finds related requests, variations and drawings')}</div><select class="field" style="width:auto;height:32px;padding:0 12px;font-size:12px"><option>Any role</option><option>Project Manager</option><option>Quantity Surveyor</option><option>Site Manager</option></select></div>`;
      const board = ui.grid(2, [column('Open', openItems.map(openCard)), column('Done', doneItems.map(doneCard))]);
      return records().projectShell(project, [`<section class="panel" style="padding:20px">${heading}${intro}${filters}${board}</section>`]);
    }
  });
})();
