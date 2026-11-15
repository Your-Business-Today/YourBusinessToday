import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compactTaskQueue, compactTaskSiblingRanks } from '$lib/server/ordering/compactInDatabase';
import { deleteTasksTogether } from './deleteTasksTogether';
import { getAttachmentPathsForTasks, removeAttachmentFiles } from './attachmentFiles';
import { getOwnerIdOfProject } from './getOwnerIdOfProject';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('./attachmentFiles', () => ({ getAttachmentPathsForTasks: vi.fn(), removeAttachmentFiles: vi.fn() }));
vi.mock('./getOwnerIdOfProject', () => ({ getOwnerIdOfProject: vi.fn() }));
vi.mock('$lib/server/ordering/compactInDatabase', () => ({
	compactTaskQueue: vi.fn(),
	compactTaskSiblingRanks: vi.fn()
}));

const databaseStep = vi.fn();
const supabase = { rpc: databaseStep } as unknown as SupabaseClient;
const named = { projectId: 'project-1', taskIds: ['story', 'unbuilt'], deletedByAccountId: 'me' };
const filesOfThoseTasks = ['project-1/story/brief.pdf'];
const databaseDeleted = 'database deleted the tasks';
const filesRemoved = 'files removed';

describe('deleting tasks together', () => {
	const steps: string[] = [];

	beforeEach(() => {
		vi.clearAllMocks();
		steps.length = 0;
		vi.mocked(getAttachmentPathsForTasks).mockResolvedValue(filesOfThoseTasks);
		vi.mocked(getOwnerIdOfProject).mockResolvedValue('owner-1');
		vi.mocked(removeAttachmentFiles).mockImplementation(async () => {
			steps.push(filesRemoved);
		});
		databaseStep.mockImplementation(async () => {
			steps.push(databaseDeleted);
			return { error: null };
		});
	});

	it('asks nothing of the database when no task is named', async () => {
		await deleteTasksTogether(supabase, { ...named, taskIds: [] });
		expect(databaseStep).not.toHaveBeenCalled();
		expect(getAttachmentPathsForTasks).not.toHaveBeenCalled();
	});

	it('deletes every task named in one step of the database, saying who for the record', async () => {
		await deleteTasksTogether(supabase, named);
		const step = { target_task_ids: ['story', 'unbuilt'], deleting_account_id: 'me' };
		expect(databaseStep).toHaveBeenCalledTimes(1);
		expect(databaseStep).toHaveBeenCalledWith('delete_tasks', step);
	});

	it('removes their files only once the database has deleted them', async () => {
		await deleteTasksTogether(supabase, named);
		expect(steps).toEqual([databaseDeleted, filesRemoved]);
		expect(removeAttachmentFiles).toHaveBeenCalledWith(supabase, filesOfThoseTasks);
	});

	it('leaves every file where it was when the database refuses', async () => {
		const refused = new Error('Task "Branch 1" is finished');
		databaseStep.mockResolvedValue({ error: refused });
		await expect(deleteTasksTogether(supabase, named)).rejects.toBe(refused);
		expect(removeAttachmentFiles).not.toHaveBeenCalled();
		expect(compactTaskSiblingRanks).not.toHaveBeenCalled();
	});

	it('closes the gaps the deleted tasks leave among their siblings and in the owner’s queue', async () => {
		await deleteTasksTogether(supabase, named);
		expect(compactTaskSiblingRanks).toHaveBeenCalledWith(supabase, 'project-1');
		expect(compactTaskQueue).toHaveBeenCalledWith(supabase, 'owner-1');
	});
});
