import { describe, expect, it } from 'vitest';
import { boardSides } from '$lib/data/boardSide';
import { teamJobsAddressFor } from './teamJobsAddress';

const organisedProject = { organisationId: 'quarry-works' };
const developmentOnly = [boardSides.development];

function addressOf(path: string): URL {
	return new URL(path, 'https://portal.example');
}

describe('teamJobsAddressFor', () => {
	it('sends an old Task Management address to the organisation’s Tasks page', () => {
		const address = addressOf('/projects/harbour-site?department=administration');
		expect(teamJobsAddressFor(organisedProject, address, developmentOnly)).toBe('/organisations/quarry-works/task-management');
	});

	it('leaves the Development tabs and the board with no tab named where they are', () => {
		expect(teamJobsAddressFor(organisedProject, addressOf('/projects/harbour-site?department=bugs'), developmentOnly)).toBeNull();
		expect(teamJobsAddressFor(organisedProject, addressOf('/projects/harbour-site'), developmentOnly)).toBeNull();
	});

	it('leaves a project under no organisation, and a side the page still shows, where they are', () => {
		const salesAddress = addressOf('/projects/harbour-site?department=sales');
		expect(teamJobsAddressFor({ organisationId: null }, salesAddress, developmentOnly)).toBeNull();
		expect(teamJobsAddressFor(organisedProject, salesAddress, [boardSides.internal])).toBeNull();
	});
});
