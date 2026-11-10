import { describe, expect, it } from 'vitest';
import { areasOfContext, type ContextArea } from './contextAreas';
import type { CompanyContextVersion, ContextPart, ContextPartKind } from './companyContext';

function part(key: string, kind: ContextPartKind, isCore = false): ContextPart {
	return {
		key,
		kind,
		name: key,
		description: null,
		isCore,
		seenIn: null,
		confidence: 'high',
		reviewState: 'not_checked',
		whatIsWrong: null
	};
}

const context: CompanyContextVersion = {
	versionNumber: 1,
	recordedAt: '2026-11-10T12:00:00Z',
	stage: 'map-data-sources',
	connectors: [],
	parts: [
		part('accounts', 'context'),
		part('site-work', 'context', true),
		part('shared-mailbox', 'source'),
		part('job-sheet', 'record'),
		part('invoice', 'record'),
		part('invoicing', 'process'),
		part('bookkeeper', 'role'),
		part('loose-note', 'record')
	],
	steps: [{ processKey: 'invoicing', position: 1, description: 'Raise the invoice', roleKey: 'bookkeeper' }],
	links: [
		{ fromKey: 'site-work', kind: 'goes_next_to', toKey: 'shared-mailbox' },
		{ fromKey: 'shared-mailbox', kind: 'creates', toKey: 'job-sheet' },
		{ fromKey: 'invoice', kind: 'goes_next_to', toKey: 'accounts' },
		{ fromKey: 'invoice', kind: 'goes_next_to', toKey: 'invoicing' }
	]
};

const keysOf = (parts: ContextPart[]) => parts.map((member) => member.key);
const areaKeyOf = ({ area }: ContextArea) => area?.key ?? null;

describe('areasOfContext', () => {
	const areas = areasOfContext(context);

	it('puts the core area first and the parts linked to no area last', () => {
		expect(areas.map(areaKeyOf)).toEqual(['site-work', 'accounts', null]);
	});

	it('places each part in the area it reaches through the fewest links and steps', () => {
		expect(keysOf(areas[0].parts)).toEqual(['shared-mailbox', 'job-sheet']);
		expect(keysOf(areas[1].parts)).toEqual(['invoice', 'invoicing', 'bookkeeper']);
	});

	it('keeps a part with no links together with the others that reach no area', () => {
		expect(keysOf(areas[2].parts)).toEqual(['loose-note']);
	});

	it('draws one region for everything when the context has no areas yet', () => {
		const withoutAreas = { ...context, parts: context.parts.filter((member) => member.kind !== 'context') };
		const [onlyArea] = areasOfContext(withoutAreas);
		expect(onlyArea.area).toBeNull();
		expect(onlyArea.parts).toHaveLength(6);
	});
});
