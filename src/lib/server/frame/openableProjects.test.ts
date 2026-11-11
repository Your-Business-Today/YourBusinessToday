import { describe, expect, it } from 'vitest';
import { projectsTheyCanOpen } from './openableProjects';
import type { ReachableOrganisationProject } from '$lib/server/organisations/markReachableProjects';

const organisationProject = {
	status: 'scoping',
	ownerId: 'owner',
	organisationId: 'harbour',
	organisationName: 'Harbour Builders'
} as const;

const notOnIt: ReachableOrganisationProject = {
	...organisationProject,
	id: 'high-rise',
	name: 'High Rise Website',
	isReachable: false
};
const onIt: ReachableOrganisationProject = { ...organisationProject, id: 'air-con', name: 'Air Con', isReachable: true };

describe('projectsTheyCanOpen', () => {
	it('offers only the projects whose page opens for the person, in the order given', () => {
		expect(projectsTheyCanOpen([notOnIt, onIt])).toEqual([{ id: 'air-con', name: 'Air Con' }]);
	});

	it('offers nothing when the person is on none of the organisation’s projects', () => {
		expect(projectsTheyCanOpen([notOnIt])).toEqual([]);
	});
});
