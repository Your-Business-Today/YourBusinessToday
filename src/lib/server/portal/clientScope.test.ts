import { describe, expect, it } from 'vitest';
import { isProjectOfClient, projectsOfClient } from './clientScope';

const acmeId = 'client-acme';
const globexId = 'client-globex';

const acmeProject = { id: 'project-1', clientId: acmeId };
const globexProject = { id: 'project-2', clientId: globexId };
const internalProject = { id: 'project-3', clientId: null };

describe('isProjectOfClient', () => {
	it('knows a project YBT runs for the contact’s own client', () => {
		expect(isProjectOfClient(acmeProject, acmeId)).toBe(true);
	});

	it('never lets a contact reach another client’s project', () => {
		expect(isProjectOfClient(globexProject, acmeId)).toBe(false);
	});

	it('never lets a contact reach a project that belongs to no client', () => {
		expect(isProjectOfClient(internalProject, acmeId)).toBe(false);
	});
});

describe('projectsOfClient', () => {
	it('keeps only the contact’s own client’s projects', () => {
		const projects = [acmeProject, globexProject, internalProject];
		expect(projectsOfClient(projects, acmeId)).toEqual([acmeProject]);
		expect(projectsOfClient(projects, globexId)).toEqual([globexProject]);
	});
});
