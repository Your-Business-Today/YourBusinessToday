/* The day-rate operatives the Time pages share — the worker registry, where each one was in
   September 2026, and the site colours the placement grid paints them in. All invented. */
(function () {
  const siteColours = { hollowmere: 'var(--accent)', 'coach-house': 'var(--info)', kingsridge: 'var(--brand)' };

  const workers = [
    { name: 'Reece Hollis', email: 'reece.hollis@jewel-demo.example', company: null, hourly: 30, sites: 'hhhhhhhhhhhhhxhhhhh', isActive: true },
    { name: 'Luca Bellini', email: 'luca.bellini@jewel-demo.example', company: 'Timbercraft Joinery', hourly: 31.25, sites: 'hhhhhhhhhhhhhhhhhh.', isActive: true },
    { name: 'Arturas Petrenas', email: 'arturas.p@jewel-demo.example', company: 'Ashlar Stone & Masonry', hourly: 28.75, sites: 'hhhhhxxxxxhhhhhhhhh', isActive: true },
    { name: 'Callum Dyer', email: 'callum.dyer@jewel-demo.example', company: null, hourly: 27.5, sites: 'hhhhhhhhhhcccchhhh.', isActive: true },
    { name: 'Kieran Blythe', email: 'kieran.blythe@jewel-demo.example', company: null, hourly: 26.25, sites: 'hhhhhhhhhhhhhhh..h.', isActive: true },
    { name: 'Jonah Pike', email: 'jonah.pike@jewel-demo.example', company: null, hourly: 25, sites: 'hhhhhhhhhhhhhhhhhhh', isActive: true },
    { name: 'Deon Marsh', email: 'deon.marsh@jewel-demo.example', company: 'Northgate Groundworks Ltd', hourly: 24, sites: 'ccccccccccccccccccc', isActive: true },
    { name: 'Mateusz Kowal', email: 'mateusz.kowal@jewel-demo.example', company: 'Evenline Plastering', hourly: 23.75, sites: 'cccccccxcccccccccc.', isActive: true },
    { name: 'Owen Faulkner', email: 'owen.faulkner@jewel-demo.example', company: null, hourly: 22.5, sites: 'hhhhhccccchhhhhkkkh', isActive: true },
    { name: 'Sam Whitlow', email: 'sam.whitlow@jewel-demo.example', company: null, hourly: 21.25, sites: 'ccccccccccxxccccc..', isActive: true },
    { name: 'Ben Crossley', email: '', company: null, hourly: 22, sites: 'hhhhhhhhhh.........', isActive: true, isUnlinked: true },
    { name: 'Harvey Tolland', email: '', company: null, hourly: 22, sites: '', isActive: false, isRetired: true }
  ];

  const siteByLetter = { h: 'hollowmere', c: 'coach-house', k: 'kingsridge' };
  const monthWeekdays = 22;
  const elapsedWeekdays = 19;

  function dayRate(worker) {
    return worker.hourly * 8;
  }

  function daysOn(worker, letter) {
    return [...worker.sites].filter((day) => day === letter).length;
  }

  function daysWorked(worker) {
    return ['h', 'c', 'k'].reduce((sum, letter) => sum + daysOn(worker, letter), 0);
  }

  function projected(worker) {
    return (monthWeekdays - daysOn(worker, 'x')) * dayRate(worker);
  }

  function chip(day, index) {
    const base = 'display:inline-block;width:9px;height:14px;border-radius:2px;margin-right:2px';
    if (index >= elapsedWeekdays) return `<i style="${base};border:1px solid var(--line)"></i>`;
    if (day === 'x') return `<i style="${base};background:repeating-linear-gradient(45deg,var(--warning) 0 2px,transparent 2px 4px)"></i>`;
    if (day === '.') return `<i style="${base};border:1px solid var(--content-faint)"></i>`;
    return `<i style="${base};background:${siteColours[siteByLetter[day]]}"></i>`;
  }

  function strip(worker) {
    const days = worker.sites.padEnd(monthWeekdays, ' ');
    return `<span style="white-space:nowrap">${[...days].map(chip).join('')}</span>`;
  }

  function activeWorkers() {
    return workers.filter((worker) => worker.isActive);
  }

  JPMS.money = Object.assign(JPMS.money || {}, { labour: { workers, activeWorkers, siteColours, dayRate, daysOn, daysWorked, projected, strip, monthWeekdays, elapsedWeekdays } });
})();
