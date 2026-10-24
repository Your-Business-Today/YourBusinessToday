/* The demo's world. Every company, person, address, project and figure here is invented —
   nothing on these pages comes from the live portal. Pages read this; they never write to it. */
window.JPMS = window.JPMS || {};

JPMS.data = {
  company: 'Jewel Bespoke Build',
  today: '25 Sep 2026',
  signedIn: { name: 'Demo Administrator', email: 'admin@jewel-demo.example', role: 'Administrator' },

  projects: [
    { id: 'hollowmere', ref: 'JBB-101', name: 'Hollowmere House', town: 'Ashcombe Green', client: 'Mr & Mrs Whitfield', architect: 'Ashdown Rowe Architects', stage: 'On site', contract: 'JCT SBC 2016', contractSum: 3480000, valuedToDate: 2156400, margin: 14.2, start: '02 Mar 2026', completion: '30 Apr 2027', progress: 62 },
    { id: 'coach-house', ref: 'JBB-102', name: 'The Old Coach House', town: 'Linford Heath', client: 'Ms Imogen Clarke', architect: 'Fenwick Hale Studio', stage: 'On site', contract: 'JCT IC 2016', contractSum: 1265000, valuedToDate: 498300, margin: 12.8, start: '15 Jun 2026', completion: '12 Mar 2027', progress: 38 },
    { id: 'kingsridge', ref: 'JBB-103', name: 'Kingsridge Lodge', town: 'Coldharbour Vale', client: 'The Aldous Family Trust', architect: 'Ashdown Rowe Architects', stage: 'Pre-construction', contract: 'JCT SBC 2016', contractSum: 5920000, valuedToDate: 0, margin: 15.5, start: '12 Jan 2027', completion: '28 Jul 2028', progress: 0 },
    { id: 'wrenfield', ref: 'JBB-098', name: 'Wrenfield Barn', town: 'Ashcombe Green', client: 'Dr & Mr Okafor', architect: 'Marlow Byrne Architects', stage: 'Completed', contract: 'JCT MW 2016', contractSum: 842000, valuedToDate: 842000, margin: 11.9, start: '06 Oct 2025', completion: '31 Jul 2026', progress: 100 }
  ],

  staff: [
    { name: 'Marcus Hale', role: 'Managing Director', email: 'marcus.hale@jewel-demo.example', initials: 'MH' },
    { name: 'Daniel Price', role: 'Finance Director', email: 'daniel.price@jewel-demo.example', initials: 'DP' },
    { name: 'Sophie Turner', role: 'Project Manager', email: 'sophie.turner@jewel-demo.example', initials: 'ST' },
    { name: 'Ravi Patel', role: 'Quantity Surveyor', email: 'ravi.patel@jewel-demo.example', initials: 'RP' },
    { name: 'Liam Carter', role: 'Site Manager', email: 'liam.carter@jewel-demo.example', initials: 'LC' },
    { name: 'Emma Walsh', role: 'Accounts', email: 'emma.walsh@jewel-demo.example', initials: 'EW' },
    { name: 'Grace Holloway', role: 'H&S Officer', email: 'grace.holloway@jewel-demo.example', initials: 'GH' },
    { name: 'Tom Reeves', role: 'Foreman', email: 'tom.reeves@jewel-demo.example', initials: 'TR' }
  ],

  architects: [
    { firm: 'Ashdown Rowe Architects', contact: 'Helen Rowe', email: 'helen@ashdownrowe.example' },
    { firm: 'Fenwick Hale Studio', contact: 'Oliver Fenwick', email: 'oliver@fenwickhale.example' },
    { firm: 'Marlow Byrne Architects', contact: 'Priya Byrne', email: 'priya@marlowbyrne.example' }
  ],

  subcontractors: [
    { name: 'Northgate Groundworks Ltd', trade: 'Groundworks', contact: 'Gary Northgate', compliance: 'Current' },
    { name: 'Brightwire Electrical Ltd', trade: 'Electrical', contact: 'Sam Okoro', compliance: 'Current' },
    { name: 'Clearflow Plumbing & Heating', trade: 'Mechanical', contact: 'Jo Whitaker', compliance: 'Expiring' },
    { name: 'Ashlar Stone & Masonry', trade: 'Masonry', contact: 'Ben Ashby', compliance: 'Current' },
    { name: 'Timbercraft Joinery', trade: 'Joinery', contact: 'Callum Reid', compliance: 'Current' },
    { name: 'Summit Roofing Ltd', trade: 'Roofing', contact: 'Dean Summers', compliance: 'Lapsed' },
    { name: 'Evenline Plastering', trade: 'Plastering', contact: 'Kat Evans', compliance: 'Current' },
    { name: 'Greenway Landscapes', trade: 'Landscaping', contact: 'Ruth Greenway', compliance: 'Current' }
  ],

  suppliers: [
    { name: 'Kestrel Timber Merchants', category: 'Timber' },
    { name: 'Stoneleigh Tiles & Stone', category: 'Finishes' },
    { name: 'Harbour Glazing Systems', category: 'Glazing' },
    { name: 'Meridian Builders Supplies', category: 'General materials' }
  ],

  costCodes: [
    { code: '1000', name: 'Preliminaries' },
    { code: '2100', name: 'Groundworks & drainage' },
    { code: '2200', name: 'Substructure' },
    { code: '3100', name: 'Masonry' },
    { code: '3300', name: 'Roof structure & covering' },
    { code: '4100', name: 'Windows & external doors' },
    { code: '5100', name: 'Mechanical services' },
    { code: '5200', name: 'Electrical services' },
    { code: '6100', name: 'Plastering & drylining' },
    { code: '6300', name: 'Joinery' },
    { code: '7100', name: 'Kitchen' },
    { code: '7200', name: 'Bathrooms & sanitaryware' },
    { code: '8100', name: 'External works & landscaping' }
  ]
};
