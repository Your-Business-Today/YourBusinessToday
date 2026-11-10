import { describe, expect, it } from 'vitest';
import { contextChanges, hasChanges } from './contextChanges';
import type { CompanyContextVersion, ContextPart } from './companyContext';

const quote: ContextPart = {
	key: 'quote',
	kind: 'record',
	name: 'Quote',
	description: null,
	isCore: false,
	seenIn: null,
	confidence: 'high',
	reviewState: 'right',
	whatIsWrong: null
};
const estimator: ContextPart = { ...quote, key: 'estimator', kind: 'role', name: 'Estimator' };
const invoice: ContextPart = { ...quote, key: 'invoice', name: 'Invoice' };

function version(versionNumber: number, parts: ContextPart[]): CompanyContextVersion {
	const recordedAt = '2026-11-10T17:00:00Z';
	return { versionNumber, recordedAt, stage: 'map-data-sources', connectors: [], parts, steps: [], links: [] };
}

describe('what a version changed since the one before', () => {
	it('names the parts added, put differently and taken out, by their keys', () => {
		const earlier = version(1, [quote, estimator]);
		const later = version(2, [{ ...quote, name: 'Quotation' }, invoice]);
		const changes = contextChanges(earlier, later);
		expect(changes.sinceVersion).toBe(1);
		expect(changes.added.map((part) => part.name)).toEqual(['Invoice']);
		expect(changes.changed.map((part) => part.name)).toEqual(['Quotation']);
		expect(changes.removed.map((part) => part.name)).toEqual(['Estimator']);
	});

	it("counts neither Claude's confidence nor the client's review as a change", () => {
		const later = version(2, [{ ...quote, confidence: 'low', reviewState: 'not_checked' }]);
		expect(hasChanges(contextChanges(version(1, [quote]), later))).toBe(false);
	});
});
