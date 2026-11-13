import { describe, expect, it } from 'vitest';
import { layOutDomain } from './domainLayout';
import type { BoundedContext, DomainEntity, DomainEntityKind } from './domainModel';

function thing(name: string, kind: DomainEntityKind): DomainEntity {
	return { name, kind, title: name, plural: name, contextName: 'joinery', aggregateRootName: name, route: null, statuses: [], fields: [], notes: '' };
}

const things = [thing('job-done', 'event'), thing('price-a-job', 'operation'), thing('measurement', 'detail'), thing('job', 'record')];

const joinery: BoundedContext = {
	name: 'joinery',
	title: 'Joinery',
	aggregates: things.map((entity) => ({ rootName: entity.name, entities: [entity] })),
	groups: [{ name: 'job-file', title: 'Job file', memberNames: ['job'] }]
};

describe('layOutDomain', () => {
	const layout = layOutDomain({ contexts: [joinery] });
	const topOf = (name: string) => layout.entities.find((placed) => placed.name === name)?.y ?? Number.NaN;

	it('draws every kind of thing in its area, with its kind', () => {
		expect(layout.entities.map(({ name, kind }) => ({ name, kind }))).toContainEqual({ name: 'measurement', kind: 'detail' });
		expect(layout.entities).toHaveLength(4);
	});

	it('draws a group round its members, its title on the row above them', () => {
		const [group] = layout.groups;
		expect(group.name).toBe('job-file');
		expect(group.y).toBeLessThan(topOf('job'));
		expect(group.y + group.height).toBeGreaterThan(topOf('job'));
		expect(group.y + group.height).toBeLessThanOrEqual(topOf('measurement'));
	});

	it('lists the things in no group by kind: details, then operations, then events', () => {
		expect(topOf('measurement')).toBeLessThan(topOf('price-a-job'));
		expect(topOf('price-a-job')).toBeLessThan(topOf('job-done'));
	});
});
