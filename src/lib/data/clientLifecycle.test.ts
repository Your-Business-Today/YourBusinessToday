import { describe, expect, it } from 'vitest';
import { clientStageOrder, validateClientStage } from './clientLifecycle';

describe('validateClientStage', () => {
	it('accepts every stage the lifecycle_stage column allows', () => {
		const refusals = clientStageOrder.map(validateClientStage);
		expect(refusals.every((refusal) => refusal === null)).toBe(true);
	});

	it('refuses a stage the column does not allow, listing the ones it does', () => {
		expect(validateClientStage('customer')).toBe(
			'There is no customer stage. Use one of: lead, prospect, client, dormant, lost.'
		);
		expect(validateClientStage('')).toContain('There is no  stage');
	});
});
