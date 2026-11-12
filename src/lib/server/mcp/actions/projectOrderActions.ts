import { noReachableProject, reachableProject } from '../projectAccess';
import { moveProject } from '$lib/server/projects/moveProject';
import { objectSchema, readText, textField } from '../actionTypes';
import { placeProject } from '$lib/server/projects/placeProject';
import { setProjectPriority } from '$lib/server/projects/setProjectPriority';
import {
	besidePlacementField,
	directionField,
	priorityField,
	readBesidePlacement,
	readMoveDirection,
	readPriority,
	sayWhichDirection,
	sayWhichPlacement,
	sayWhichPriority
} from './orderingFields';
import type { McpAction } from '../actionTypes';

const projectIdField = textField('The project id');

export const projectOrderActions: McpAction[] = [
	{
		name: 'set_project_priority',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'give a project a priority number in your projects list — the others shift to make room',
		guidance:
			'Your projects list is in priority order: 1 matters most right now. list_projects shows ' +
			'each project’s number, so read it, then set the number the person wants. The projects ' +
			'you own and the ones you are on rank together in the one list. The order among the ones ' +
			'you own is the order everybody on them sees. Where a project you own sits among the ones ' +
			'other people own is yours alone; the ones another person owns follow that owner’s order ' +
			'again when they next reorder them.',
		inputSchema: objectSchema(
			{ projectId: projectIdField, priority: priorityField('project') },
			['projectId', 'priority']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noReachableProject;
			const priority = readPriority(input);
			if (priority === null) return sayWhichPriority;
			await setProjectPriority(caller.supabase, project.id, priority, caller.accountId);
			return `${project.name} is now priority ${priority} in your projects list.`;
		}
	},
	{
		name: 'move_project',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'move a project one place up or down your projects list, past whichever project is next to it',
		guidance: 'To give it a particular number in one call, use set_project_priority.',
		inputSchema: objectSchema({ projectId: projectIdField, direction: directionField }, [
			'projectId',
			'direction'
		]),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noReachableProject;
			const direction = readMoveDirection(input);
			if (direction === null) return sayWhichDirection;
			await moveProject(caller.supabase, project.id, direction, caller.accountId);
			return `${project.name} moved ${direction}.`;
		}
	},
	{
		name: 'place_project',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'place a project directly before or after another in your projects list, whoever owns either',
		inputSchema: objectSchema(
			{
				projectId: projectIdField,
				targetProjectId: textField('The project to place it beside'),
				placement: besidePlacementField
			},
			['projectId', 'targetProjectId', 'placement']
		),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			const targetProject = await reachableProject(caller, readText(input, 'targetProjectId'));
			if (project === null || targetProject === null) return noReachableProject;
			const placement = readBesidePlacement(input);
			if (placement === null) return sayWhichPlacement;
			await placeProject(caller.supabase, project.id, targetProject.id, placement, caller.accountId);
			return `${project.name} now sits ${placement} ${targetProject.name}.`;
		}
	}
];
