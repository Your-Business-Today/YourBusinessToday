/* Site Instructions — jpms/Pages/ProjectSiteInstructions.razor: written instructions to site
   (SI-####) with title, instruction and location, one row's filed emails opened beneath it. */
(function () {
  const ui = JPMS.ui;
  const site = JPMS.site;

  const instructions = [
    { ref: 'SI-0012', title: 'Hold on orangery floor screed', text: 'Do not pour the orangery screed until the underfloor heating pressure test certificate is on file. Clearflow to test Monday.', location: 'Orangery', raised: '24 Sep 2026' },
    { ref: 'SI-0011', title: 'Protect limestone steps', text: 'Board and fleece the front limestone steps before scaffold strike. No barrows over the steps — use the side path.', location: 'Front entrance', raised: '22 Sep 2026' },
    { ref: 'SI-0010', title: 'Revised socket heights — study', text: 'Client has asked for desk-height sockets on the north wall: 1050mm to centre, 4 doubles, per marked-up drawing E-201 rev D.', location: 'Ground floor study', raised: '18 Sep 2026' },
    { ref: 'SI-0009', title: 'Lime mortar only on the rear elevation', text: 'NHL 3.5 lime mortar for all repointing and new work on the rear elevation. No cement. Match the sample panel by the kitchen door.', location: 'Rear elevation', raised: '15 Sep 2026' },
    { ref: 'SI-0008', title: 'Tree protection zone — oak by gate', text: 'Heras fencing to stay in place around the root protection area. No storage, parking or mixing inside the fence.', location: 'Front garden, by the gate', raised: '09 Sep 2026' },
    { ref: 'SI-0007', title: 'Basement waterproofing inspection', text: 'Stop backfilling on the east wall until the waterproofing specialist has signed off the cavity drain membrane laps.', location: 'Basement, east wall', raised: '02 Sep 2026' },
    { ref: 'SI-0006', title: 'Working hours — neighbour agreement', text: 'Noisy works 08:00–17:00 weekdays only; nothing noisy on Saturdays. Deliveries not before 08:30 in the lane.', location: 'Whole site', raised: '26 Aug 2026' },
    { ref: 'SI-0005', title: 'Oak frame joint check before roofing', text: 'Timbercraft to re-drive pegs and check all frame joints after two weeks of drying before Summit start felt and batten.', location: 'Orangery roof', raised: '19 Aug 2026' }
  ];

  const expandedIndex = 2;

  function register(project) {
    const rows = instructions.map((instruction, index) => [ui.mono(instruction.ref), instruction.title, ui.escape(instruction.text), instruction.location, site.nowrap(instruction.raised), site.rowActions(index === expandedIndex)]);
    const emails = site.filedEmails(instructions[expandedIndex].ref, [
      { from: 'Brightwire Electrical Ltd', when: '19 Sep 2026 · 08:12', subject: `Study sockets — ${project.name}`, text: 'Noted — we will set the back boxes at 1050mm on Tuesday. Can you confirm the floor finish thickness so we measure from finished level?' },
      { from: 'Sophie Turner', when: '18 Sep 2026 · 15:30', subject: `Study sockets — ${project.name}`, text: 'Please see the site instruction attached following the client walkround this morning.' }
    ]);
    return site.expandableRegister(['Ref', 'Title', 'Instruction', 'Location', 'Raised', ''], rows, expandedIndex, emails);
  }

  JPMS.page('/projects/:project/site-instructions', {
    title: 'Site Instructions',
    render(params) {
      const project = JPMS.project(params.project);
      const body = project.stage === 'Pre-construction'
        ? ui.empty('No site instructions on this project. Raise one here, or write one from an email in the Control Centre (Internal pathway → Raise Site Instruction).')
        : register(project);
      return site.projectShell(project, [site.sectionHeader('Site Instructions', [ui.btn('Raise instruction', 'primary')]), body]);
    }
  });
})();
