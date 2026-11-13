import { juneStation } from './juneStation';

const programmeValuationReport = juneStation('pvr', 'PVR',
	'The programme valuation report, built from approved progress and approved variations, issued every claim period.',
	{ takesIn: ['Period valuation', 'Priced variation'], produces: ['Programme valuation report'] }, 'Spreadsheet');

const costValueReconciliation = juneStation('cvr', 'CVR', 'Cost-value reconciliation: live margin per package, actual against forecast against tender.',
	{ takesIn: ['Period valuation', 'Coded project costs'], produces: ['Cost-value reconciliation'] }, 'Spreadsheet');

export const quantitySurveyorStations = [
	juneStation('tender-received', 'Tender received', "Log the architect's tender pack and confirm the bid deadline.",
		{ takesIn: ['Tender pack', 'Drawings'], produces: ['Tender record'] }, 'Email'),
	juneStation('boq-take-off', 'BoQ take-off', 'Measure the drawings and build the bill of quantities, package by package.',
		{ takesIn: ['Drawings'], produces: ['Priced BoQ'] }, 'Spreadsheet'),
	juneStation('tender-submitted', 'Tender submitted', 'Submit the priced tender to the architect and track its outcome.',
		{ takesIn: ['Priced BoQ', 'Prelims schedule'], produces: ['Submitted tender'] }, 'Email'),
	juneStation('subbie-quotes', 'Subbie quotes', 'Invite and level subcontractor quotes against each BoQ package.',
		{ takesIn: ['Priced BoQ', 'Subcontractor quotes'], produces: ['Levelled quote comparison'] }, 'Spreadsheet'),
	juneStation('work-order-award', 'Work order award', 'Award the package, but only once the compliance gate is green.',
		{ takesIn: ['Levelled quote comparison', 'Verified compliance record'], produces: ['Work order'] }, 'Spreadsheet and email'),
	juneStation('variation-pricing', 'Variation pricing', 'Price every variation against the original BoQ headings and the central register.',
		{ takesIn: ['Variation instruction', 'BoQ rates'], produces: ['Priced variation'] }, 'Spreadsheet'),
	juneStation('valuation-assessment', 'Valuation assessment', 'Assess the value of work done this claim period from approved site progress.',
		{ takesIn: ['Approved site progress', 'Priced variation'], produces: ['Period valuation'] }, 'Spreadsheet'),
	{ ...programmeValuationReport, isOutput: true },
	{ ...costValueReconciliation, isOutput: true }
];
