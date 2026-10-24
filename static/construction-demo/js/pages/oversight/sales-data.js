/* The invented sales world the Leads, Inbox and Strategies pages read: leads on the ladder
   New → Contacted → Engaged → Site visit → Proposal → Won / Lost, Nurture, and the strategies that found them. */
(function () {
  const strategies = [
    { id: 'st-01', name: 'Pre-sale uplift — Ashcombe Green', audience: 'Homeowners', channel: 'Post — letters and brochures', area: 'Ashcombe Green & Linford Heath', status: 'Active', research: 'Researched 14 Sep', since: 'Jun 2026',
      brief: 'Homeowners in the lanes where values are about to move, sold building now as an investment before they sell.',
      hypothesis: 'Detached houses on large plots bought 2008–2014 are sitting on headroom: a basement or orangery adds more than it costs, and owners planning a sale in three to five years want the uplift in the price, not the next buyer’s.',
      evidence: 'Land Registry sales on the eleven target roads averaged 38% above 2019. Three neighbouring approvals for basements in the last 18 months; none refused. Our own Wrenfield Barn resold at a figure the agent put down to the new wing.',
      proposition: 'A fixed-price feasibility, a concept the owner can see before they spend, and a builder who has done the house next door.',
      funnel: { leads: 9, contacted: 7, engaged: 4, proposals: 2, won: 1, lost: 1, pipeline: 2860000, wonValue: 842000 }, plan: true },
    { id: 'st-02', name: 'Architects whose jobs overrun', audience: 'Architects', channel: 'In person — door, office, site', area: 'Surrey Hills practices', status: 'Active', research: 'Researched 02 Sep', since: 'Jul 2026',
      brief: 'The architects whose jobs the portal would make run more smoothly — show them a live RFI trail.',
      hypothesis: 'Practices doing two to six super-prime houses a year lose fee to contractors who answer late. A builder who shows the RFI and variation trail in one place is the easy recommendation.',
      evidence: 'Nine practices within 20 miles list three or more residential projects over £2m on their sites. Two have already tendered us once.',
      proposition: 'Invite them to watch a live project in the portal: every RFI answered, every variation priced, nothing chased by email.',
      funnel: { leads: 6, contacted: 5, engaged: 3, proposals: 1, won: 0, lost: 0, pipeline: 4150000, wonValue: 0 }, plan: true },
    { id: 'st-03', name: 'Estate agents’ new-instruction list', audience: 'Referrers (agents, planners, trades)', channel: 'Partnerships and referrers', area: 'Linford Heath', status: 'Paused', research: 'Researched 21 Jul', since: 'May 2026',
      brief: 'Country-house agents pass on buyers who want work done before they move in.',
      hypothesis: 'Buyers of dated houses above £3m budget for works before completion and ask the agent who to call.',
      evidence: 'Two agents confirmed they are asked weekly; one referral already converted to a site visit.',
      proposition: 'A same-week walk-round with an indicative budget the buyer can take to their lender.',
      funnel: { leads: 3, contacted: 3, engaged: 1, proposals: 0, won: 0, lost: 1, pipeline: 650000, wonValue: 0 }, plan: false },
    { id: 'st-04', name: 'Past clients — five years on', audience: 'Past clients', channel: 'Email', area: 'Surrey & SW London', status: 'Active', research: 'Researched 30 Aug', since: 'Aug 2026',
      brief: 'The families we built for five or more years ago — their next phase, or their friends’.',
      hypothesis: 'Clients whose children have grown want the pool house, the annex or the garden room they cut from the first budget.',
      evidence: 'Of fourteen clients from 2016–2021, six mentioned a “phase two” at handover.',
      proposition: 'A catch-up visit, the original drawings brought along, and a first-look budget for phase two.',
      funnel: { leads: 4, contacted: 3, engaged: 2, proposals: 1, won: 0, lost: 0, pipeline: 1320000, wonValue: 0 }, plan: true },
    { id: 'st-05', name: 'Planning approvals watch — basements', audience: 'Homeowners', channel: 'Post — letters and brochures', area: 'Coldharbour Vale', status: 'Draft', research: 'Researching', since: 'Sep 2026',
      brief: 'Write to owners the week their basement consent is granted, before they go to tender.',
      hypothesis: '', evidence: '', proposition: '',
      funnel: { leads: 0, contacted: 0, engaged: 0, proposals: 0, won: 0, lost: 0, pipeline: 0, wonValue: 0 }, plan: false }
  ];

  const leads = [
    { id: 'ld-0034', ref: 'LD-0034', contact: 'Harriet Lomax', company: '', kind: 'Homeowner', property: 'Brackenfold, Pheasant Rise, Ashcombe Green', postcode: 'GU5 9ZZ', work: 'Two-storey oak-framed garden wing with a boot room and a guest suite over.', strategy: 'st-01', source: 'Sales strategy', stage: 'New', value: 680000, owner: 'marcus.hale', captured: '24 Sep 2026', email: 'harriet.lomax@mailbox.example', phone: '07700 900412' },
    { id: 'ld-0033', ref: 'LD-0033', contact: 'Oliver Fenwick', company: 'Fenwick Hale Studio', kind: 'Architect', property: 'Plot 2, Sandpit Lane, Linford Heath', postcode: 'GU6 4ZZ', work: 'New-build Arts & Crafts house, 640 m², basement pool.', strategy: '', source: 'Architect introduction', stage: 'Engaged', value: 4200000, owner: 'marcus.hale', captured: '22 Sep 2026', email: 'oliver@fenwickhale.example', phone: '01483 960221' },
    { id: 'ld-0032', ref: 'LD-0032', contact: 'Naomi & Theo Varga', company: '', kind: 'Homeowner', property: 'The Glebe House, Church Walk, Linford Heath', postcode: 'GU6 4ZZ', work: 'Basement under the east wing — cinema, gym and wine store.', strategy: 'st-01', source: 'Sales strategy', stage: 'Site visit', value: 1150000, owner: 'sophie.turner', captured: '15 Sep 2026', email: 'naomi.varga@mailbox.example', phone: '07700 900178' },
    { id: 'ld-0031', ref: 'LD-0031', contact: 'Richard Ashworth', company: '', kind: 'Homeowner', property: 'Harcourt Lodge, Harcourt Lane, Ashcombe Green', postcode: 'GU5 9ZZ', work: 'Kitchen wing and orangery; re-roof in reclaimed clay.', strategy: 'st-01', source: 'Sales strategy', stage: 'Proposal', value: 920000, owner: 'marcus.hale', captured: '03 Sep 2026', email: 'r.ashworth@mailbox.example', phone: '07700 900355' },
    { id: 'ld-0030', ref: 'LD-0030', contact: 'Priya Byrne', company: 'Marlow Byrne Architects', kind: 'Architect', property: 'Wychcombe Farm, Coldharbour Vale', postcode: 'RH5 6ZZ', work: 'Listed farmhouse restoration and a stone barn conversion.', strategy: 'st-02', source: 'Sales strategy', stage: 'Contacted', value: 2300000, owner: 'marcus.hale', captured: '01 Sep 2026', email: 'priya@marlowbyrne.example', phone: '01306 960114' },
    { id: 'ld-0029', ref: 'LD-0029', contact: 'Caroline Dunmore', company: '', kind: 'Homeowner', property: 'Five Oaks, Heathside Road, Linford Heath', postcode: 'GU6 4ZZ', work: 'Pool house with changing rooms and plant; landscaping.', strategy: 'st-04', source: 'Sales strategy', stage: 'Engaged', value: 540000, owner: 'sophie.turner', captured: '28 Aug 2026', email: 'c.dunmore@mailbox.example', phone: '07700 900261' },
    { id: 'ld-0028', ref: 'LD-0028', contact: 'Alastair Kemp', company: 'Kemp Estates Ltd', kind: 'Developer', property: 'Former Nursery Site, Mill Lane, Ashcombe Green', postcode: 'GU5 9ZZ', work: 'Three detached houses to shell-and-core, one finished as show house.', strategy: '', source: 'Referral', stage: 'Contacted', value: 3600000, owner: 'daniel.price', captured: '26 Aug 2026', email: 'alastair@kempestates.example', phone: '01483 960877' },
    { id: 'ld-0027', ref: 'LD-0027', contact: 'Fiona & Mark Hartley', company: '', kind: 'Homeowner', property: 'Larkhill, Coombe Bottom, Coldharbour Vale', postcode: 'RH5 6ZZ', work: 'Annex over the garage for a returning parent; lift.', strategy: 'st-04', source: 'Sales strategy', stage: 'Proposal', value: 410000, owner: 'sophie.turner', captured: '19 Aug 2026', email: 'hartleys@mailbox.example', phone: '07700 900508' },
    { id: 'ld-0026', ref: 'LD-0026', contact: 'Helen Rowe', company: 'Ashdown Rowe Architects', kind: 'Architect', property: 'Beech Hanger, The Ridgeway, Linford Heath', postcode: 'GU6 4ZZ', work: 'Full refurbishment and a rear glazed extension.', strategy: 'st-02', source: 'Sales strategy', stage: 'Site visit', value: 1850000, owner: 'marcus.hale', captured: '12 Aug 2026', email: 'helen@ashdownrowe.example', phone: '01483 960309' },
    { id: 'ld-0025', ref: 'LD-0025', contact: 'Sebastian Moore', company: '', kind: 'Homeowner', property: 'Old Rectory Cottage, Ashcombe Green', postcode: 'GU5 9ZZ', work: 'Sympathetic extension to a Grade II cottage.', strategy: '', source: 'Inbound enquiry', stage: 'Nurture', value: 380000, owner: 'sophie.turner', captured: '30 Jul 2026', email: 's.moore@mailbox.example', phone: '07700 900633' },
    { id: 'ld-0024', ref: 'LD-0024', contact: 'Imogen Clarke', company: '', kind: 'Homeowner', property: 'The Old Coach House, Linford Heath', postcode: 'GU6 4ZZ', work: 'Coach house conversion to a family home.', strategy: 'st-01', source: 'Sales strategy', stage: 'Won', value: 1265000, owner: 'marcus.hale', captured: '02 Apr 2026', email: 'imogen.clarke@mailbox.example', phone: '07700 900144', project: 'coach-house' },
    { id: 'ld-0023', ref: 'LD-0023', contact: 'Martin Greaves', company: '', kind: 'Homeowner', property: 'Hillcrest, Station Road, Linford Heath', postcode: 'GU6 4ZZ', work: 'Loft conversion and dormers.', strategy: 'st-03', source: 'Sales strategy', stage: 'Lost', value: 160000, owner: 'daniel.price', captured: '14 Jul 2026', email: 'm.greaves@mailbox.example', phone: '07700 900719', lostReason: 'Below the size of job we take on; referred to a local builder.' }
  ];

  const openStages = ['New', 'Contacted', 'Engaged', 'Site visit', 'Proposal'];

  JPMS.sales = {
    ladder: ['New', 'Contacted', 'Engaged', 'Site visit', 'Proposal', 'Won', 'Lost', 'Nurture'],
    meanings: {
      New: 'Found or received — nobody has spoken to them yet.', Contacted: 'We have reached out; no reply or conversation yet.',
      Engaged: 'They are talking to us about a possible project.', 'Site visit': 'A visit is booked or has happened.',
      Proposal: 'A proposal or budget has gone to them.', Won: 'They have chosen Jewel — a client and a project exist.',
      Lost: 'Not going ahead with us.', Nurture: 'Not now, but worth keeping in touch with.'
    },
    strategies,
    leads,
    isOpen: (lead) => openStages.includes(lead.stage),
    lead: (id) => leads.find((lead) => lead.id === id) || leads[3],
    strategy: (id) => strategies.find((strategy) => strategy.id === id),
    leadByEmail: (email) => leads.find((lead) => lead.email === email)
  };
})();
