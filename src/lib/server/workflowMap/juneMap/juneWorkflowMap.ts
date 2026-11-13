import { officeAndComplianceStations, projectManagerStations } from './juneOfficeStations';
import { financeDirectorStations, healthAndSafetyStations, siteManagerStations } from './juneSiteStations';
import { quantitySurveyorStations } from './juneSurveyorStations';

const juneLines = [
	{ key: 'compliance', name: 'Office & Compliance', stations: officeAndComplianceStations },
	{ key: 'project-manager', name: 'Project Manager', stations: projectManagerStations },
	{ key: 'quantity-surveyor', name: 'QS / Estimator', stations: quantitySurveyorStations },
	{ key: 'site-manager', name: 'Site Manager', stations: siteManagerStations },
	{ key: 'health-safety', name: 'Health & Safety', stations: healthAndSafetyStations },
	{ key: 'finance-director', name: 'Finance Director', stations: financeDirectorStations }
];

const juneHandovers = [
	{ fromKey: 'insurance-cis-checks', toKey: 'work-order-award', handedOver: 'Verified compliance record',
		goesWrong: 'Cover is checked on a spreadsheet, so an award can go out on lapsed insurance.' },
	{ fromKey: 'rfis-submittals', toKey: 'variation-pricing', handedOver: 'Variation instruction' },
	{ fromKey: 'rams-inductions', toKey: 'site-mobilisation', handedOver: 'Mobilisation checklist',
		goesWrong: 'The checklist is on paper and a site can open before it is signed.' },
	{ fromKey: 'daily-progress', toKey: 'valuation-assessment', handedOver: 'Approved site progress',
		goesWrong: 'Progress arrives by message and is typed again for the valuation.' },
	{ fromKey: 'pvr', toKey: 'claim-issued', handedOver: 'Programme valuation report' },
	{ fromKey: 'cost-capture', toKey: 'cvr', handedOver: 'Coded project costs' },
	{ fromKey: 'practical-completion', toKey: 'settlement-vat', handedOver: 'Settlement trigger' }
];

/** The June 2026 map of Jewel Bespoke Build as Before: six roles, 29 tasks and seven hand-overs (git 193171e0). */
export function juneWorkflowMapInput(): Record<string, unknown> {
	return { stage: 'before', lines: structuredClone(juneLines), handovers: structuredClone(juneHandovers) };
}
