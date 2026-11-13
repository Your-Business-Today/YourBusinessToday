import { juneStation } from './juneStation';

export const siteManagerStations = [
	juneStation('site-mobilisation', 'Site mobilisation', 'Open the site, but only once the H&S mobilisation checklist is signed off.',
		{ takesIn: ['Work order', 'Mobilisation checklist'], produces: ['Live site'] }, 'Paper'),
	juneStation('daily-progress', 'Daily progress', 'Capture progress, photos and attendance from the workface every day.',
		{ takesIn: ['Foreman reports', 'Photos', 'Timesheets'], produces: ['Approved site progress'] }, 'Messages and photos'),
	juneStation('quality-snags', 'Quality & snags', 'Inspect work, raise snags and chase them closed, trade by trade.',
		{ takesIn: ['Approved site progress', 'Specification'], produces: ['Snag list', 'Closed snags'] }, 'Paper'),
	juneStation('practical-completion', 'Practical completion', 'Walk the client through, sign off practical completion and trigger settlement.',
		{ takesIn: ['Closed snags', 'Completion pack'], produces: ['PC certificate', 'Settlement trigger'] }, 'Paper'),
	juneStation('defects-aftercare', 'Defects & aftercare', 'Manage the defects period and close out aftercare visits.',
		{ takesIn: ['PC certificate', 'Defect reports'], produces: ['Closed defects'] }, 'Email')
];

export const healthAndSafetyStations = [
	juneStation('hs-framework', 'H&S framework', 'Maintain RAMS templates, policies and the inspection framework.',
		{ takesIn: ['Regulations', 'Insurer requirements'], produces: ['H&S framework'] }, 'Shared folder'),
	juneStation('rams-inductions', 'RAMS & inductions', 'Approve RAMS and induct every operative before they set foot on site.',
		{ takesIn: ['Subcontractor RAMS', 'Operative details'], produces: ['Approved RAMS', 'Mobilisation checklist'] }, 'Paper'),
	juneStation('site-inspections', 'Site inspections', 'Inspect live sites on a fixed cadence and log every observation.',
		{ takesIn: ['Live site', 'Inspection checklist'], produces: ['Inspection reports', 'Observations'] }, 'Paper'),
	juneStation('incidents-actions', 'Incidents & actions', 'Govern incidents and drive corrective actions to closure with a full audit trail.',
		{ takesIn: ['Incident reports', 'Observations'], produces: ['Corrective actions', 'Audit trail'] }, 'Email')
];

const cashflowForecast = juneStation('cashflow-forecast', 'Cashflow forecast',
	'The live cashflow forecast: forward income, commitments and predicted completion across the portfolio.',
	{ takesIn: ['Coded project costs', 'Claim schedule'], produces: ['Portfolio cashflow forecast'] }, 'Spreadsheet');

export const financeDirectorStations = [
	juneStation('cost-capture', 'Cost capture', 'Capture every cost against its cost code: supplier invoices, timesheets, CIS.',
		{ takesIn: ['Supplier invoices', 'Timesheets', 'Work order'], produces: ['Coded project costs'] }, 'Xero'),
	{ ...cashflowForecast, isOutput: true },
	juneStation('settlement-vat', 'Settlement & VAT', 'Run the settlement record and the zero-rated VAT analysis at project completion.',
		{ takesIn: ['Settlement trigger', 'Project ledger'], produces: ['Settlement record', 'VAT analysis'] }, 'Spreadsheet'),
	juneStation('retention-release', 'Retention release', 'Track retention through the defects period and release it on time.',
		{ takesIn: ['Settlement record', 'Defects status'], produces: ['Retention release'] }, 'Spreadsheet')
];
