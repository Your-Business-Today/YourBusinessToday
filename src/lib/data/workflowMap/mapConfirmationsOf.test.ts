import { describe, expect, it } from 'vitest';
import { confirmationOf, confirmedBeforeOf } from './mapConfirmationsOf';
import type { MapConfirmation } from './mapConfirmed';
import type { WorkflowMapVersion } from './workflowMap';

const confirmedAt = '2026-11-13T07:00:00Z';
const confirmed: MapConfirmation[] = [
	{ stage: 'after', versionNumber: 3, confirmedAt },
	{ stage: 'before', versionNumber: 1, confirmedAt },
	{ stage: 'before', versionNumber: 2, confirmedAt }
];
const mapOf = (stage: 'before' | 'after', versionNumber: number) =>
	({ stage, versionNumber, recordedAt: confirmedAt, lines: [], handovers: [] }) satisfies WorkflowMapVersion;

describe('which versions of a workflow map the client confirmed', () => {
	it('finds the confirmation of the very version shown, and none for a version filed since', () => {
		expect(confirmationOf(confirmed, mapOf('after', 3))).toEqual(confirmed[0]);
		expect(confirmationOf(confirmed, mapOf('after', 4))).toBeNull();
		expect(confirmationOf(confirmed, null)).toBeNull();
	});

	it('takes the highest confirmed Before as the one that freezes it', () => {
		expect(confirmedBeforeOf(confirmed)?.versionNumber).toBe(2);
		expect(confirmedBeforeOf([confirmed[0]])).toBeNull();
	});
});
