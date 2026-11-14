import { describe, expect, it } from 'vitest';
import { juneWorkflowMapInput } from '$lib/server/workflowMap/juneMap/juneWorkflowMap';
import { validateWorkflowMap } from '$lib/server/workflowMap/validateWorkflowMap';
import { describeWorkflowMap } from './describeWorkflowMap';
import { lineKind, stationState, type WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const sendStatementLines = {
	key: 'send-statement-lines',
	name: 'Send statement lines',
	summary: 'The bank sends each day.',
	takesIn: [],
	produces: ['Statement lines'],
	doneIn: null,
	isOutput: false,
	state: stationState.elsewhere,
	productId: null,
	takesInThings: [],
	producesThings: []
};

const bankFeed = { key: 'bank-feed', name: 'Bank feed', kind: lineKind.system, stations: [sendStatementLines] };

const enquiry = { whatArrives: 'Subcontractor enquiry', arrivesFrom: 'a subcontractor', stationKey: 'subbie-onboarding' };

function juneWith(arrivals: WorkflowMapVersion['arrivals']): WorkflowMapVersion {
	const draft = validateWorkflowMap(juneWorkflowMapInput());
	if ('refusal' in draft) throw new Error(draft.refusal);
	return { ...draft, lines: [...draft.lines, bankFeed], arrivals, versionNumber: 2, recordedAt: '2026-11-13T05:00:00Z' };
}

const surroundings = { productNames: new Map<string, string>(), standings: {}, confirmation: null };

describe('describeWorkflowMap names each line kind and what arrives from outside', () => {
	const markdown = describeWorkflowMap('Jewel Bespoke Build', juneWith([enquiry]), surroundings);

	it('tallies the arrivals and names each line by its kind', () => {
		expect(markdown).toContain('7 lines, 30 stations, 7 hand-overs and 1 arrivals.');
		expect(markdown).toContain('### Office & Compliance `compliance`, a role');
		expect(markdown).toContain('### Bank feed `bank-feed`, a system');
	});

	it('says what arrives from outside and the station each one starts', () => {
		expect(markdown).toContain(
			'### Arrivals from outside\n- **Subcontractor enquiry** arrives from a subcontractor and starts ' +
				'Subbie onboarding `subbie-onboarding` (Office & Compliance).'
		);
	});

	it('says plainly when nothing is said to arrive from outside', () => {
		const filedBefore = describeWorkflowMap('Jewel Bespoke Build', juneWith([]), surroundings);
		expect(filedBefore).toContain('### Arrivals from outside\n\nNone filed: nothing is said to arrive from outside to start the work.');
	});
});
