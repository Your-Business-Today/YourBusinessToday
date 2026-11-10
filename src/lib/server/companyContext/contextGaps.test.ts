import { describe, expect, it } from 'vitest';
import { contextGaps } from './contextGaps';
import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';

const emptyVersion: CompanyContextVersion = {
	versionNumber: 1,
	recordedAt: '2026-11-10T17:00:00Z',
	stage: 'map-data-sources',
	connectors: [],
	parts: [],
	steps: [],
	links: []
};

const invoicing = {
	key: 'invoicing',
	kind: 'process',
	name: 'Invoicing',
	description: null,
	isCore: false,
	seenIn: null,
	confidence: 'high',
	reviewState: 'not_checked',
	whatIsWrong: null
} as const;

describe('what a kept company context still lacks', () => {
	it('names the core, every kind of part and the connectors when nothing is recorded', () => {
		const gaps = contextGaps(emptyVersion);
		expect(gaps).toContain('No area is marked as the core of the business.');
		expect(gaps).toContain('No roles yet.');
		expect(gaps).toContain('No connectors are recorded as switched on.');
	});

	it('names a process with no steps', () => {
		const gaps = contextGaps({ ...emptyVersion, parts: [invoicing] });
		expect(gaps).toContain('Invoicing has no steps yet.');
		expect(gaps).not.toContain('No processes yet.');
	});
});
