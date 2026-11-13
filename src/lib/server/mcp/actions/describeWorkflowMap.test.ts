import { describe, expect, it } from 'vitest';
import { juneWorkflowMapInput } from '$lib/server/workflowMap/juneMap/juneWorkflowMap';
import { validateWorkflowMap } from '$lib/server/workflowMap/validateWorkflowMap';
import { describeWorkflowMap, noWorkflowMapYet } from './describeWorkflowMap';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

const portalId = '6a1f4f2e-3c55-4a3e-9d0b-2f5c1e7b8a90';

function juneAfter(): WorkflowMapVersion {
	const draft = validateWorkflowMap(juneWorkflowMapInput());
	if ('refusal' in draft) throw new Error(draft.refusal);
	const [compliance, ...otherLines] = draft.lines;
	const [onboarding, checks, ...rest] = compliance.stations;
	const inThePortal = { ...checks, state: 'ours' as const, productId: portalId, doneIn: null, producesThings: ['compliance-record'] };
	const plannedOnboarding = { ...onboarding, state: 'planned' as const, productId: portalId };
	const lines = [{ ...compliance, stations: [plannedOnboarding, inThePortal, ...rest] }, ...otherLines];
	return { ...draft, stage: 'after', lines, versionNumber: 3, recordedAt: '2026-11-13T05:00:00Z' };
}

describe('describeWorkflowMap', () => {
	const markdown = describeWorkflowMap('Jewel Bespoke Build', juneAfter(), new Map([[portalId, 'JPMS portal']]));

	it('heads the map with its stage, version and day, and tallies it', () => {
		expect(markdown).toContain('## After: workflow map of Jewel Bespoke Build, version 3, filed 2026-11-13');
		expect(markdown).toContain('6 lines, 29 stations and 7 hand-overs. Stations: 1 in our products, 1 planned, 27 done elsewhere.');
	});

	it('lists each line with its stations in order, keys and all, and marks the outputs', () => {
		expect(markdown).toContain('### QS / Estimator `quantity-surveyor`');
		expect(markdown).toContain('8. **PVR** `pvr`, an output the business runs on: The programme valuation report');
		expect(markdown).toContain('   - Takes in: Levelled quote comparison; Verified compliance record');
	});

	it('says where each station is done, naming our product and the Domain things it touches', () => {
		expect(markdown).toContain(`   - Done in our product JPMS portal (\`${portalId}\`)`);
		expect(markdown).toContain(`   - Planned for our product JPMS portal (\`${portalId}\`), done today in Email and a shared folder`);
		expect(markdown).toContain('   - Domain things produced: `compliance-record`');
		expect(markdown).toContain('   - Done in Paper');
	});

	it('reads every hand-over as a sentence, with how it goes wrong today', () => {
		expect(markdown).toContain(
			'- Insurance & CIS checks `insurance-cis-checks` (Office & Compliance) hands **Verified compliance record** to ' +
				'Work order award `work-order-award` (QS / Estimator). Goes wrong today: Cover is checked on a spreadsheet'
		);
	});

	it('says plainly when a stage has no map yet', () => {
		expect(noWorkflowMapYet('Jewel Bespoke Build', 'before')).toBe('No Before map has been filed for Jewel Bespoke Build yet.');
	});
});
