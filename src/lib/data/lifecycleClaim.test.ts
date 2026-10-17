import { describe, expect, it } from 'vitest';
import { standingClaim, type ClaimingStep } from './lifecycleClaim';

const now = new Date('2026-10-17T10:00:00Z');

function step(step: ClaimingStep['step'], agent: string, createdAt: string): ClaimingStep {
	return { step, agent, createdAt };
}

describe('standing claims', () => {
	it('holds the work for the agent considering it', () => {
		const claim = standingClaim([step('considering', 'session A', '2026-10-17T09:30:00Z')], now);
		expect(claim?.agent).toBe('session A');
	});

	it('lets the claim run out when its lease ends', () => {
		const steps = [step('building', 'session A', '2026-10-17T07:00:00Z')];
		expect(standingClaim(steps, now)).toBeNull();
	});

	it('ends the claim when its holder records a step that does not hold', () => {
		const steps = [
			step('considering', 'session A', '2026-10-17T09:30:00Z'),
			step('considered', 'session A', '2026-10-17T09:40:00Z')
		];
		expect(standingClaim(steps, now)).toBeNull();
	});

	it('keeps the claim when another agent only notes something', () => {
		const steps = [
			step('building', 'session A', '2026-10-17T09:30:00Z'),
			step('considered', 'session B', '2026-10-17T09:40:00Z')
		];
		expect(standingClaim(steps, now)?.agent).toBe('session A');
	});

	it('ends the claim when the work merges', () => {
		const steps = [
			step('building', 'session A', '2026-10-17T09:30:00Z'),
			step('merged', 'GitHub', '2026-10-17T09:50:00Z')
		];
		expect(standingClaim(steps, now)).toBeNull();
	});
});
