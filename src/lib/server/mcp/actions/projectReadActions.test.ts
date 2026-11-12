import { describe, expect, it, vi } from 'vitest';
import { projectReadActions } from './projectReadActions';
import type { McpCaller } from '../resolveMcpCaller';

const { harbourDental, quayBakery, ownProjects, teamProjects } = vi.hoisted(() => {
	const harbourDental = { id: 'harbour-dental', name: 'Harbour Dental' };
	const quayBakery = { id: 'quay-bakery', name: 'Quay Bakery' };
	const project = (name: string, organisation: { id: string; name: string }) => ({
		id: name.toLowerCase().replaceAll(' ', '-'),
		name,
		status: 'scoping',
		organisationId: organisation.id,
		organisationName: organisation.name,
		isTeamProject: false,
		isInternal: false,
		openTaskCount: 2,
		assignedTaskCount: 0
	});
	const ownProjects = [{ ...project('Florist site', quayBakery), teamProjectsAbove: 1 }];
	const teamProjects = [
		{ ...project('Life record', harbourDental), ownerName: 'Priya Shah' },
		{ ...project('Skill swap', harbourDental), ownerName: 'Priya Shah' }
	];
	return { harbourDental, quayBakery, ownProjects, teamProjects };
});

vi.mock('$lib/server/projects/getProjectsForOwner', () => ({ getProjectsForOwner: async () => ownProjects }));
vi.mock('$lib/server/members/getTeamProjects', () => ({ getTeamProjects: async () => teamProjects }));
vi.mock('$lib/server/projects/getAssignedTaskCounts', () => ({ getAssignedTaskCounts: async () => ({}) }));

const caller = { accountId: 'alex', ownedProjectIds: [], memberProjectIds: [], supabase: {} } as unknown as McpCaller;

function listProjects(input: Record<string, unknown>) {
	const found = projectReadActions.find((action) => action.name === 'list_projects');
	if (found === undefined) throw new Error('No action named list_projects');
	return found.run(caller, input);
}

describe('list_projects', () => {
	it('gives the projects a person owns and the ones they are on as one list, in their order, saying whose each is', async () => {
		expect(await listProjects({})).toBe(
			[
				'Your projects, in your own priority order:',
				'Life record — Scoping for Harbour Dental, 2 open, owned by Priya Shah (priority 1, id: life-record)',
				'Florist site — Scoping for Quay Bakery, 2 open, yours (priority 2, id: florist-site)',
				'Skill swap — Scoping for Harbour Dental, 2 open, owned by Priya Shah (priority 3, id: skill-swap)'
			].join('\n')
		);
	});

	it('keeps each project’s number in the whole list when narrowed to one organisation, as set_project_priority counts it', async () => {
		const answer = await listProjects({ organisationId: harbourDental.id });
		expect(answer).toContain('Life record — Scoping for Harbour Dental, 2 open, owned by Priya Shah (priority 1, id: life-record)');
		expect(answer).toContain('Skill swap — Scoping for Harbour Dental, 2 open, owned by Priya Shah (priority 3, id: skill-swap)');
		expect(answer).not.toContain(quayBakery.name);
	});
});
