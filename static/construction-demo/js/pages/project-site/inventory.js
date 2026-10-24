/* Inventory — jpms/Pages/ProjectInventory.razor: goods held for the job (INV-####), what the
   product is and where it is kept, with one item's filed emails opened beneath its row. */
(function () {
  const ui = JPMS.ui;
  const site = JPMS.site;

  const items = [
    { ref: 'INV-0031', product: 'Reclaimed oak flooring', details: 'Wide-plank, 220mm, brushed & oiled · 186 m² in 28 packs', location: 'Container 2', added: '23 Sep 2026' },
    { ref: 'INV-0030', product: 'Bath stone window cills', details: '14 cills, sawn finish, sizes per schedule rev C', location: 'Stone compound', added: '21 Sep 2026' },
    { ref: 'INV-0029', product: 'Heritage sash window ironmongery', details: 'Polished brass fasteners and lifts · 22 sets', location: 'Site office', added: '18 Sep 2026' },
    { ref: 'INV-0028', product: 'Underfloor heating manifolds', details: '3 × 10-port stainless manifolds with actuators', location: 'Basement plant room', added: '15 Sep 2026' },
    { ref: 'INV-0027', product: 'Handmade clay roof tiles', details: 'Kiln-fired, weathered red · 4,200 plain + 180 ridge', location: 'Scaffold loading bay', added: '10 Sep 2026' },
    { ref: 'INV-0026', product: 'Kitchen appliances (client supply)', details: 'Range cooker, 2 × integrated fridges, wine cabinet — boxed', location: 'Garage (locked)', added: '04 Sep 2026' },
    { ref: 'INV-0025', product: 'Limestone floor tiles', details: 'Honed, 600×600, 94 m² plus 10% attic stock', location: 'Container 1', added: '28 Aug 2026' },
    { ref: 'INV-0024', product: 'Oak frame pegs & wedges', details: 'Cleft oak pegs, 25mm · 3 bags', location: 'Container 2', added: '20 Aug 2026' },
    { ref: 'INV-0023', product: 'Sanitaryware — principal en-suite', details: 'Freestanding bath, 2 basins, wall-hung WC, brassware kit', location: 'Store room B', added: '12 Aug 2026' }
  ];

  const expandedIndex = 1;

  function register(project) {
    const rows = items.map((item, index) => [ui.mono(item.ref), item.product, ui.escape(item.details), item.location, site.nowrap(item.added), site.rowActions(index === expandedIndex)]);
    const emails = site.filedEmails(items[expandedIndex].ref, [
      { from: 'Stoneleigh Tiles & Stone', when: '21 Sep 2026 · 11:05', subject: `Delivery note — ${project.name} cills`, text: 'Delivered today, 14 cills on 3 pallets, signed for by Tom Reeves. Delivery note attached.' }
    ]);
    return site.expandableRegister(['Ref', 'Product', 'Details', 'Location', 'Added', ''], rows, expandedIndex, emails);
  }

  JPMS.page('/projects/:project/inventory', {
    title: 'Inventory',
    render(params) {
      const project = JPMS.project(params.project);
      const body = project.stage === 'Pre-construction'
        ? ui.empty('No inventory on this project. Add an item here, or file a supplier email to a new item from the Control Centre.')
        : register(project);
      return site.projectShell(project, [site.sectionHeader('Inventory', [ui.btn('Add item', 'primary')]), body]);
    }
  });
})();
