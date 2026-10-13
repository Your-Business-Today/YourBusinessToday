import { describe, expect, it } from 'vitest';
import { toPortalProject } from './portalProjectRecord';

function goalRow(id: string, title: string, status: string, horizon: string) {
	return { id, title, measure: `${title}, measured`, status, horizon, priority: 1 };
}

const launchGoal = goalRow('goal-launch', 'Launch the booking site', 'open', 'current');
const laterGoal = goalRow('goal-later', 'Open a second branch', 'open', 'long_term');
const metGoal = goalRow('goal-met', 'Choose the brand', 'met', 'current');

function taskRow(
	id: string,
	goalId: string | null,
	status: string,
	parentTaskId: string | null = null
) {
	return {
		id,
		goal_id: goalId,
		parent_task_id: parentTaskId,
		kind: 'work',
		title: `Task ${id}`,
		details: 'staff notes',
		status,
		story_points: 2,
		completion_percent: status === 'done' ? 100 : 0,
		branch_name: 'feature/secret'
	};
}

const projectRow = {
	id: 'project-1',
	name: 'Booking system',
	status: 'building',
	client_id: 'client-acme',
	environment_url: 'https://bookings.example.com',
	goals: [launchGoal, laterGoal, metGoal],
	tasks: [
		taskRow('done-1', launchGoal.id, 'done'),
		taskRow('open-1', launchGoal.id, 'backlog'),
		taskRow('open-child', null, 'in_progress', 'open-1'),
		taskRow('later-1', laterGoal.id, 'backlog')
	]
};

describe('toPortalProject', () => {
	const project = toPortalProject(projectRow);

	it('carries the project’s state and its live system link', () => {
		expect(project.status).toBe('building');
		expect(project.environmentUrl).toBe('https://bookings.example.com');
		expect(project.clientId).toBe('client-acme');
	});

	it('shows only the open current goals, with how far each has come', () => {
		expect(project.currentGoals).toEqual([
			{
				id: launchGoal.id,
				title: launchGoal.title,
				measure: launchGoal.measure,
				completionPercent: 33,
				openTaskCount: 2
			}
		]);
	});

	it('counts percent done over current work only', () => {
		expect(project.completionPercent).toBe(33);
	});

	it('lists open current tasks in client words, under the goal they count toward', () => {
		const goalTitle = launchGoal.title;
		expect(project.openTasks).toEqual([
			{ id: 'open-1', title: 'Task open-1', statusLabel: 'Planned', goalTitle },
			{ id: 'open-child', title: 'Task open-child', statusLabel: 'In progress', goalTitle }
		]);
	});

	it('never hands staff-only fields to the page', () => {
		const serialised = JSON.stringify(project);
		expect(serialised).not.toContain('staff notes');
		expect(serialised).not.toContain('feature/secret');
	});
});
