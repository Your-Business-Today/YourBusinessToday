import { describe, expect, it } from 'vitest';
import { summariseProjectPulse } from './summariseProjectPulse';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { ProjectTask } from './taskRecord';
import type { TaskStatus } from '$lib/data/taskStatus';

const viewerId = 'viewer';

function taskWith(id: string, status: TaskStatus): ProjectTask {
	return { id, status, storyPoints: 1, completionPercent: status === 'done' ? 100 : 0 } as ProjectTask;
}

function turnAwaiting(accountId: string): ConversationTurn {
	return {
		authorAccountId: 'someone',
		postedVia: 'site',
		awaiting: { accountId, kind: 'person' },
		pickedUpAt: null,
		since: '2026-10-01'
	} as ConversationTurn;
}

describe('summariseProjectPulse', () => {
	const tasks = [
		taskWith('a', 'backlog'),
		taskWith('b', 'in_progress'),
		taskWith('c', 'done'),
		taskWith('d', 'on_hold')
	];

	it('counts the open work and how much of it is under way', () => {
		const pulse = summariseProjectPulse({
			tasks,
			assigneeIdsByTask: new Map(),
			turnsByTask: new Map(),
			viewerId
		});
		expect(pulse).toMatchObject({ taskCount: 4, openTaskCount: 3, inProgressCount: 1 });
		expect(pulse.completionPercent).toBe(25);
	});

	it('counts only the open tasks waiting on or assigned to the viewer', () => {
		const pulse = summariseProjectPulse({
			tasks,
			assigneeIdsByTask: new Map([
				['a', [viewerId]],
				['c', [viewerId]],
				['d', ['someone']]
			]),
			turnsByTask: new Map([
				['b', turnAwaiting(viewerId)],
				['c', turnAwaiting(viewerId)],
				['d', turnAwaiting('someone')]
			]),
			viewerId
		});
		expect(pulse.waitingOnViewerCount).toBe(1);
		expect(pulse.assignedToViewerCount).toBe(1);
	});
});
