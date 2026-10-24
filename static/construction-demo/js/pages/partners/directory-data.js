/* The invented company directory: every subcontractor and supplier in JPMS.data, with the facts the
   directory shows about them. */
(function () {
  const facts = {
    'Northgate Groundworks Ltd': { town: 'Linford Heath, Surrey', compliance: 'Current', xero: true, email: 'gary@northgate-groundworks.example' },
    'Brightwire Electrical Ltd': { town: 'Ashcombe Green, Surrey', compliance: 'Current', xero: true, email: 'sam@brightwire.example' },
    'Clearflow Plumbing & Heating': { town: 'Coldharbour Vale, Surrey', compliance: 'Expiring soon', xero: true, email: 'jo@clearflow.example' },
    'Ashlar Stone & Masonry': { town: 'Hindmarsh, West Sussex', compliance: 'Current', xero: true, email: 'ben@ashlarstone.example' },
    'Timbercraft Joinery': { town: 'Elmbridge Common, Surrey', compliance: 'Current', xero: true, email: 'callum@timbercraft.example' },
    'Summit Roofing Ltd': { town: 'Kingsmead, Hampshire', compliance: 'Expired', xero: true, email: 'dean@summitroofing.example' },
    'Evenline Plastering': { town: 'Ashcombe Green, Surrey', compliance: 'Current', xero: false, email: 'kat@evenline.example' },
    'Greenway Landscapes': { town: 'Linford Heath, Surrey', compliance: 'Missing', xero: false, email: 'ruth@greenway.example' },
    'Kestrel Timber Merchants': { town: 'Farnleigh, Surrey', compliance: 'Current', xero: true, email: 'orders@kestreltimber.example', contact: 'Trade desk' },
    'Stoneleigh Tiles & Stone': { town: 'Richmond Vale, London', compliance: 'Current', xero: true, email: 'sales@stoneleigh.example', contact: 'Hannah Lyle' },
    'Harbour Glazing Systems': { town: 'Portbury, Hampshire', compliance: 'Expiring soon', xero: true, email: 'projects@harbourglazing.example', contact: 'Mark Deane' },
    'Meridian Builders Supplies': { town: 'Ashcombe Green, Surrey', compliance: 'Current', xero: true, email: 'counter@meridianbs.example', contact: 'Trade counter' }
  };

  const slug = (name) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const subcontractors = JPMS.data.subcontractors.map((company) => ({ ...company, type: 'Subcontractor', trades: [company.trade] }));
  const suppliers = JPMS.data.suppliers.map((company) => ({ ...company, type: 'Supplier', trades: [company.category] }));

  JPMS.partnersDirectory = [...subcontractors, ...suppliers]
    .map((company) => ({ ...company, ...facts[company.name], contact: facts[company.name].contact || company.contact, id: slug(company.name) }))
    .sort((first, second) => first.name.localeCompare(second.name));
})();
