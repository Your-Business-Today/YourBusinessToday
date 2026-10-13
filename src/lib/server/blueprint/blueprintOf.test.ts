import { describe, expect, it } from 'vitest';
import { blueprintOf } from './blueprintOf';
import { entitiesOf } from '$lib/data/blueprint/domainModel';

const manifest = JSON.stringify({
	routes: { Job: '/jobs', Variation: '/variations', Client: '/clients', StaffProfile: '/people/staff' },
	enums: { JobStatus: ['Open', 'Closed'] },
	areas: [
		{
			name: 'Jobs',
			title: 'Jobs and works',
			entities: [
				{ name: 'Client', title: 'Client', plural: 'Clients', parent: null, status: null, fields: [] },
				{
					name: 'Job',
					title: 'Job',
					plural: 'Jobs',
					parent: null,
					status: ['JobStatus', 'Open'],
					fields: [{ name: 'ClientId', type: 'ref', ref: 'Client', required: true }]
				}
			]
		},
		{
			name: 'Projects',
			title: 'Projects',
			entities: [
				{ name: 'Variation', title: 'Variation', plural: 'Variations', parent: 'Job', status: null, fields: [] }
			]
		}
	]
});

const siteDefinition = [
	'# Site definition',
	'## Routes',
	'### `/jobs/{Id}`',
	'`portal/Pages/JobPage.razor`',
	'```',
	'Page{ PageHeader }',
	'```',
	'### `/people/staff`',
	'`portal/Pages/StaffPage.razor`',
	'### `/calendar`'
].join('\n');

describe('blueprintOf', () => {
	const { domain, siteMap } = blueprintOf(manifest, siteDefinition, 'abc123');

	it('turns areas into bounded contexts and parents into aggregates', () => {
		const contexts = domain?.contexts ?? [];
		expect(contexts.map((context) => context.title)).toEqual(['Jobs and works', 'Projects']);
		expect(contexts[1].aggregates[0].rootName).toBe('Job');
		expect(entitiesOf(domain!).find((entity) => entity.name === 'Job')?.statuses).toEqual(['Open', 'Closed']);
	});

	it('draws a reference and a containment for each link between entities', () => {
		expect(domain?.relationships).toEqual([
			{ fromEntityName: 'Job', toEntityName: 'Client', kind: 'reference', fieldName: 'ClientId' },
			{ fromEntityName: 'Variation', toEntityName: 'Job', kind: 'containment', fieldName: '' }
		]);
	});

	it('reads each screen with its view, its layout and the entity whose route it is under', () => {
		const screens = siteMap?.screens ?? [];
		expect(screens.map((screen) => [screen.route, screen.section, screen.entityName])).toEqual([
			['/jobs/{Id}', 'jobs', 'Job'],
			['/people/staff', 'people', 'StaffProfile'],
			['/calendar', 'calendar', null]
		]);
		expect(screens[0].layout).toBe('Page{ PageHeader }');
		expect(screens[0].viewFile).toBe('portal/Pages/JobPage.razor');
	});

	it('leaves out what the repository does not carry', () => {
		const empty = blueprintOf('', 'no routes here', 'main');
		expect(empty.domain).toBeNull();
		expect(empty.siteMap).toBeNull();
	});
});
