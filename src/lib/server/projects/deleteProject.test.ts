import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compactProjectBoard, compactTaskQueue } from '$lib/server/ordering/compactInDatabase';
import { deleteProject } from './deleteProject';
import { getAttachmentPathsForProject, removeAttachmentFiles } from './attachmentFiles';
import { readProjectContents } from './readProjectContents';
import type { Project } from './projectRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('$lib/server/ordering/compactInDatabase', () => ({ compactProjectBoard: vi.fn(), compactTaskQueue: vi.fn() }));
vi.mock('./attachmentFiles', () => ({ getAttachmentPathsForProject: vi.fn(), removeAttachmentFiles: vi.fn() }));
vi.mock('./readProjectContents', () => ({ readProjectContents: vi.fn() }));

const databaseStep = vi.fn();
const supabase = { rpc: databaseStep } as unknown as SupabaseClient;
const project = { id: 'project-1', name: 'Carp Mania', ownerId: 'james' } as Project;
const deletedByAccountId = 'member-1';
const nothingFinished = { goalCount: 2, openTaskCount: 5, finishedTaskCount: 0, attachedFileCount: 1 };
const attachmentPaths = ['project-1/spec.pdf'];
const refusedByTheDatabase = { message: 'Project "Carp Mania" holds finished tasks' };
const databaseDeleted = 'database deleted the project';
const filesRemoved = 'files removed';

describe('deleteProject', () => {
	const steps: string[] = [];

	beforeEach(() => {
		vi.clearAllMocks();
		steps.length = 0;
		vi.mocked(readProjectContents).mockResolvedValue(nothingFinished);
		vi.mocked(getAttachmentPathsForProject).mockResolvedValue(attachmentPaths);
		vi.mocked(removeAttachmentFiles).mockImplementation(async () => {
			steps.push(filesRemoved);
		});
		databaseStep.mockImplementation(async () => {
			steps.push(databaseDeleted);
			return { error: null };
		});
	});

	it('never touches a project that holds finished tasks, nor its files', async () => {
		vi.mocked(readProjectContents).mockResolvedValue({ ...nothingFinished, finishedTaskCount: 187 });
		const refusal = await deleteProject(supabase, project, deletedByAccountId);
		expect(refusal).toContain('Carp Mania cannot be deleted: it has 187 finished tasks');
		expect(databaseStep).not.toHaveBeenCalled();
		expect(removeAttachmentFiles).not.toHaveBeenCalled();
	});

	it('deletes a project with nothing finished in it in one step of the database, saying who for the record', async () => {
		expect(await deleteProject(supabase, project, deletedByAccountId)).toBeNull();
		const step = { target_project_id: 'project-1', deleting_account_id: 'member-1' };
		expect(databaseStep).toHaveBeenCalledTimes(1);
		expect(databaseStep).toHaveBeenCalledWith('delete_project', step);
	});

	it('removes its files only once the database has deleted it, then closes the gap it leaves', async () => {
		await deleteProject(supabase, project, deletedByAccountId);
		expect(steps).toEqual([databaseDeleted, filesRemoved]);
		expect(removeAttachmentFiles).toHaveBeenCalledWith(supabase, attachmentPaths);
		expect(compactProjectBoard).toHaveBeenCalledWith(supabase, project.ownerId);
		expect(compactTaskQueue).toHaveBeenCalledWith(supabase, project.ownerId);
	});

	it('leaves every file where it was when the database refuses the project', async () => {
		databaseStep.mockResolvedValue({ error: refusedByTheDatabase });
		await expect(deleteProject(supabase, project, deletedByAccountId)).rejects.toBe(refusedByTheDatabase);
		expect(removeAttachmentFiles).not.toHaveBeenCalled();
		expect(compactProjectBoard).not.toHaveBeenCalled();
	});
});
