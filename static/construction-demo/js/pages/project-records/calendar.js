/* Calendar — jpms/Pages/ProjectCalendar.razor: the month grid with kind-dotted event chips (the
   Client pill on client-visible ones), the month controls, Add event, and the Upcoming agenda. */
(function () {
  const ui = JPMS.ui;
  const records = () => JPMS.records;
  const kindColours = { 'Site visit': 'var(--info)', Delivery: 'var(--warning)', Meeting: 'var(--accent)', 'Subcontractor attendance': 'var(--positive)', Other: 'var(--content-faint)' };
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDay = 25;

  const events = [
    [1, '08:00', 'Ashlar Stone — rear elevation masonry', 'Subcontractor attendance'],
    [3, '10:00', 'Client site walk-round', 'Site visit', true],
    [7, '07:30', 'Scaffold adaptation — chimney', 'Subcontractor attendance'],
    [8, '09:30', 'Structural engineer — kitchen wall', 'Site visit'],
    [10, '14:00', 'Design team meeting #14', 'Meeting', true],
    [14, '07:30', 'Roof slates delivery — Meridian', 'Delivery'],
    [15, '11:00', 'Building control — DPC and drainage', 'Site visit'],
    [17, '08:00', 'Summit Roofing start', 'Subcontractor attendance'],
    [22, '07:30', 'Rooflights delivery — Harbour Glazing', 'Delivery'],
    [24, '10:00', 'Design team meeting #15', 'Meeting', true],
    [24, '14:00', 'Kitchen showroom — final sign-off', 'Meeting', true],
    [25, '08:00', 'Brightwire first fix — ground floor', 'Subcontractor attendance'],
    [25, '11:30', 'H&S audit — monthly', 'Other'],
    [25, '15:00', 'Oak flooring samples to client', 'Site visit', true],
    [28, '07:30', 'Steel lintel delivery — kitchen opening', 'Delivery'],
    [29, '09:00', 'Valuation walk-round with QS', 'Site visit'],
    [30, '10:00', 'Client progress meeting', 'Meeting', true]
  ];

  const nextMonth = [
    ['Thu 01 Oct', '07:30', 'Handmade ridge tiles delivery', 'Delivery'],
    ['Mon 05 Oct', '08:00', 'Timbercraft — kitchen wall set-out', 'Subcontractor attendance'],
    ['Thu 08 Oct', '14:00', 'Design team meeting #16', 'Meeting', true]
  ];

  function chip([, time, title, kind, isClientVisible]) {
    const client = isClientVisible ? ui.pill('Client', 'info') : '';
    return `<div class="row" style="gap:6px;flex-wrap:nowrap;min-width:0;overflow:hidden;padding:2px 6px;border-radius:4px;font-size:12px;line-height:14px" title="CAL · ${kind} · ${time} — ${ui.escape(title)}"><span style="width:8px;height:8px;border-radius:999px;flex-shrink:0;background:${kindColours[kind]}"></span><span class="subtle">${time}</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0">${ui.escape(title)}</span>${client}</div>`;
  }

  function dayCell(day, inMonth) {
    const dayEvents = inMonth ? events.filter(([date]) => date === day) : [];
    const shown = dayEvents.slice(0, 3).map(chip).join('');
    const more = dayEvents.length > 3 ? `<p class="text-xs subtle" style="padding:0 6px">+${dayEvents.length - 3} more</p>` : '';
    const isToday = inMonth && day === todayDay;
    const number = `<span class="text-xs" style="width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;${isToday ? 'background:var(--accent);color:var(--accent-ink);font-weight:600' : inMonth ? 'color:var(--content-muted)' : 'color:var(--content-faint)'}">${day}</span>`;
    return `<div style="min-width:0;overflow:hidden;min-height:104px;border-right:1px solid var(--line);padding:6px;${inMonth ? '' : 'background:rgba(40,42,49,.4)'}"><div style="text-align:right;margin-bottom:4px">${number}</div><div style="display:grid;gap:2px">${shown}${more}</div></div>`;
  }

  function monthGrid() {
    const leading = [31];
    const cells = [...leading.map((day) => dayCell(day, false))];
    for (let day = 1; day <= 30; day++) cells.push(dayCell(day, true));
    for (let day = 1; cells.length % 7; day++) cells.push(dayCell(day, false));
    const weeks = [];
    for (let index = 0; index < cells.length; index += 7) weeks.push(`<div class="grid" style="grid-template-columns:repeat(7,minmax(0,1fr));gap:0;border-bottom:1px solid var(--line)">${cells.slice(index, index + 7).join('')}</div>`);
    const head = `<div class="grid" style="grid-template-columns:repeat(7,minmax(0,1fr));gap:0;border-bottom:1px solid var(--line)">${dayNames.map((name) => `<div class="eyebrow" style="text-align:center;padding:8px">${name}</div>`).join('')}</div>`;
    return `<section class="panel" style="margin-bottom:24px">${head}${weeks.join('')}</section>`;
  }

  function agendaRow([, time, title, kind]) {
    return `<div class="row" style="gap:12px;flex-wrap:nowrap;padding:4px 6px"><span style="width:8px;height:8px;border-radius:999px;flex-shrink:0;background:${kindColours[kind]}"></span><span class="subtle" style="width:48px">${time}</span><span style="flex:1">${ui.escape(title)}</span><span class="text-xs subtle">${kind}</span></div>`;
  }

  function upcoming() {
    const groups = [
      ['Fri 25 Sep · Today', events.filter(([day]) => day === 25)],
      ['Mon 28 Sep', events.filter(([day]) => day === 28)],
      ['Tue 29 Sep', events.filter(([day]) => day === 29)],
      ['Wed 30 Sep', events.filter(([day]) => day === 30)],
      ...nextMonth.map((entry) => [entry[0], [entry]])
    ];
    const blocks = groups.map(([label, rows]) => `<div style="padding:12px 16px;border-bottom:1px solid var(--line)"><p class="eyebrow" style="margin-bottom:6px">${label}</p>${rows.map(agendaRow).join('')}</div>`).join('');
    return `<section><h3 class="muted" style="margin-bottom:12px">Upcoming</h3><div class="panel">${blocks}</div></section>`;
  }

  JPMS.page('/projects/:project/calendar', {
    title: 'Calendar',
    render(params) {
      const project = JPMS.project(params.project);
      const actions = [ui.btn('‹ Prev'), '<span class="subtle" style="width:128px;text-align:center">September 2026</span>', ui.btn('Next ›'), ui.btn('Today'), ui.btn('Add event', 'primary')];
      return records().projectShell(project, [records().sectionHeader('Calendar', '', actions), monthGrid(), upcoming()]);
    }
  });
})();
