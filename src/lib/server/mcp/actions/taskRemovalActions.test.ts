import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noSuchTask } from './describeTask';
import { taskRemovalActions, trueOrFalseRefusal } from './taskRemovalActions';
import type { McpCaller } from '../resolveMcpCaller';

const { story, taskDeleted, whatCameOfIt } = vi.hoisted(() => ({
	story: { id: 'story', projectId: 'my-project', title: 'Rods, reels and end tackle' },
	taskDeleted: vi.fn(),
	whatCameOfIt: 'Nothing is deleted yet.'
}));

vi.mock('$lib/server/projects/getTask', () => ({ getTask: async () => story }));
vi.mock('$lib/server/projects/deleteTask', () => ({ deleteTask: taskDeleted }));
vi.mock('./describeTaskDeletion', () => ({ describeTaskDeletion: () => whatCameOfIt }));

const supabase = {};
const onTheProject = {
	accountId: 'me',
	ownedProjectIds: [],
	memberProjectIds: [story.projectId],
	supabase
} as unknown as McpCaller;
const offTheProject = { ...onTheProject, memberProjectIds: [] } as McpCaller;
const [deleteTaskAction] = taskRemovalActions;
const nothingDecided = { completedParentTitle: null, shouldDeleteOpenSubtasks: false, deletedByAccountId: 'me' };

describe('delete_task', () => {
	beforeEach(() => vi.clearAllMocks());

	it('takes the task id, a name for the completed task and a word on the open subtasks, and needs only the id', () => {
		const { properties, required } = deleteTaskAction.inputSchema as { properties: object; required: string[] };
		expect(Object.keys(properties)).toEqual(['taskId', 'keepFinishedUnderTitle', 'deleteOpenSubtasks']);
		expect(required).toEqual(['taskId']);
	});

	it('does not reach a task on a project the caller is not on', async () => {
		expect(await deleteTaskAction.run(offTheProject, { taskId: story.id })).toBe(noSuchTask);
		expect(taskDeleted).not.toHaveBeenCalled();
	});

	it('asks with nothing decided when only the task id is given, and answers with what came of it', async () => {
		const answer = await deleteTaskAction.run(onTheProject, { taskId: story.id });
		expect(taskDeleted).toHaveBeenCalledWith(supabase, story, nothingDecided);
		expect(answer).toBe(whatCameOfIt);
	});

	it('passes on the name for the completed task and the yes for the open subtasks, as the caller', async () => {
		const decided = { taskId: story.id, keepFinishedUnderTitle: ' Rods shipped ', deleteOpenSubtasks: true };
		await deleteTaskAction.run(onTheProject, decided);
		const everythingDecided = { completedParentTitle: 'Rods shipped', shouldDeleteOpenSubtasks: true, deletedByAccountId: 'me' };
		expect(taskDeleted).toHaveBeenCalledWith(supabase, story, everythingDecided);
	});

	it('refuses a word on the open subtasks that is not true or false, and deletes nothing', async () => {
		const answer = await deleteTaskAction.run(onTheProject, { taskId: story.id, deleteOpenSubtasks: 'yes' });
		expect(answer).toBe(trueOrFalseRefusal);
		expect(taskDeleted).not.toHaveBeenCalled();
	});
});
