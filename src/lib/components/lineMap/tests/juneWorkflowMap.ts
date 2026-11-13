import type { LineMapModel, MapStation, StationState } from '../layout/lineMapModel';

const stationNames: Record<string, string> = {
	'subbie-onboarding': 'Subbie onboarding',
	'insurance-cis-checks': 'Insurance & CIS checks',
	'expiry-tracking': 'Expiry tracking',
	'project-setup': 'Project setup',
	'drawing-register': 'Drawing register',
	'rfis-submittals': 'RFIs & submittals',
	'claim-issued': 'Claim issued',
	'tender-received': 'Tender received',
	'boq-take-off': 'BoQ take-off',
	'tender-submitted': 'Tender submitted',
	'subbie-quotes': 'Subbie quotes',
	'work-order-award': 'Work order award',
	'variation-pricing': 'Variation pricing',
	'valuation-assessment': 'Valuation assessment',
	pvr: 'PVR',
	cvr: 'CVR',
	'site-mobilisation': 'Site mobilisation',
	'daily-progress': 'Daily progress',
	'quality-snags': 'Quality & snags',
	'practical-completion': 'Practical completion',
	'defects-aftercare': 'Defects & aftercare',
	'hs-framework': 'H&S framework',
	'rams-inductions': 'RAMS & inductions',
	'site-inspections': 'Site inspections',
	'incidents-actions': 'Incidents & actions',
	'cost-capture': 'Cost capture',
	'cashflow-forecast': 'Cashflow forecast',
	'settlement-vat': 'Settlement & VAT',
	'retention-release': 'Retention release'
};

const outputs = ['pvr', 'cvr', 'cashflow-forecast'];
const doneElsewhereAfter = ['drawing-register', 'cost-capture', 'tender-received', 'tender-submitted', 'hs-framework'];
const plannedAfter = ['settlement-vat', 'retention-release', 'incidents-actions'];

function stationsWith(stateOf: (stationId: string) => StationState): Record<string, MapStation> {
	const entries = Object.entries(stationNames).map(([stationId, name]) => {
		const kind = outputs.includes(stationId) ? ('output' as const) : ('task' as const);
		return [stationId, { name, kind, state: stateOf(stationId) }];
	});
	return Object.fromEntries(entries);
}

const juneLines: LineMapModel['lines'] = [
	{ id: 'compliance', name: 'Office & Compliance', colour: 'peach', stops: ['subbie-onboarding', 'insurance-cis-checks', 'expiry-tracking'] },
	{ id: 'project-manager', name: 'Project Manager', colour: 'lilac', stops: ['project-setup', 'drawing-register', 'rfis-submittals', 'claim-issued'] },
	{
		id: 'quantity-surveyor',
		name: 'QS / Estimator',
		colour: 'sky',
		stops: ['tender-received', 'boq-take-off', 'tender-submitted', 'subbie-quotes', 'work-order-award', 'variation-pricing', 'valuation-assessment', 'pvr', 'cvr']
	},
	{
		id: 'site-manager',
		name: 'Site Manager',
		colour: 'teal',
		stops: ['site-mobilisation', 'daily-progress', 'quality-snags', 'practical-completion', 'defects-aftercare']
	},
	{ id: 'health-safety', name: 'Health & Safety', colour: 'rose', stops: ['hs-framework', 'rams-inductions', 'site-inspections', 'incidents-actions'] },
	{ id: 'finance-director', name: 'Finance Director', colour: 'daylight', stops: ['cost-capture', 'cashflow-forecast', 'settlement-vat', 'retention-release'] }
];

const juneHandovers: LineMapModel['handovers'] = [
	{ from: 'insurance-cis-checks', to: 'work-order-award', failure: 'An award can go out on lapsed insurance.' },
	{ from: 'rfis-submittals', to: 'variation-pricing' },
	{ from: 'rams-inductions', to: 'site-mobilisation', failure: 'A site can open before the checklist is signed.' },
	{ from: 'daily-progress', to: 'valuation-assessment', failure: 'Progress is typed again for the valuation.' },
	{ from: 'pvr', to: 'claim-issued' },
	{ from: 'cost-capture', to: 'cvr' },
	{ from: 'practical-completion', to: 'settlement-vat' }
];

function stateAfter(stationId: string): StationState {
	if (plannedAfter.includes(stationId)) return 'planned';
	return doneElsewhereAfter.includes(stationId) ? 'elsewhere' : 'ours';
}

export const juneMapBefore: LineMapModel = { lines: juneLines, stations: stationsWith(() => 'elsewhere'), handovers: juneHandovers };

export const juneMapAfter: LineMapModel = {
	lines: juneLines,
	stations: stationsWith(stateAfter),
	handovers: juneHandovers.map((handover) => ({ from: handover.from, to: handover.to }))
};
