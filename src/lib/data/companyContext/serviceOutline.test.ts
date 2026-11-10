import { describe, expect, it } from 'vitest';
import { outlineServices } from './serviceOutline';
import type { CompanyContextVersion, ContextPart } from './companyContext';
import type { ServedPart } from './serviceOutline';

function part(key: string, kind: ContextPart['kind'], isCore = false): ContextPart {
	const name = key.replace('-', ' ');
	const review = { reviewState: 'right', whatIsWrong: null } as const;
	return { key, kind, name, description: null, isCore, seenIn: null, confidence: 'high', ...review };
}

const context: CompanyContextVersion = {
	versionNumber: 4,
	recordedAt: '2026-11-10T17:00:00Z',
	stage: 'map-data-sources',
	connectors: [],
	parts: [
		part('mailbox', 'source'),
		part('rates-sheet', 'source'),
		part('job-book', 'source', true),
		part('quote', 'record'),
		part('invoice', 'record'),
		part('invoicing', 'process'),
		part('quoting', 'process', true),
		part('estimator', 'role')
	],
	steps: [{ processKey: 'quoting', position: 1, description: 'Price the job', roleKey: 'estimator' }],
	links: [
		{ fromKey: 'rates-sheet', kind: 'creates', toKey: 'quote' },
		{ fromKey: 'rates-sheet', kind: 'creates', toKey: 'invoice' },
		{ fromKey: 'mailbox', kind: 'creates', toKey: 'quote' },
		{ fromKey: 'quoting', kind: 'creates', toKey: 'quote' }
	]
};

function keysOf(servedParts: ServedPart[]): string[] {
	return servedParts.map(({ part }) => part.key);
}

describe('the services a confirmed context suggests', () => {
	const outline = outlineServices(context);

	it('takes the core source first, then the sources that create the most records', () => {
		expect(keysOf(outline.sourcesToTake)).toEqual(['job-book', 'rates-sheet', 'mailbox']);
		expect(outline.sourcesToTake[1].servesNames).toEqual(['quote', 'invoice']);
	});

	it('puts the core process first, each with the records and roles it serves', () => {
		expect(keysOf(outline.processes)).toEqual(['quoting', 'invoicing']);
		expect(outline.processes[0].servesNames).toEqual(['quote', 'estimator']);
		expect(outline.processes[1].servesNames).toEqual([]);
	});
});
