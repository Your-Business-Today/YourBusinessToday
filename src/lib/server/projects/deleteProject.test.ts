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

const project = { id: 'project-1', name: 'Carp Mania', ownerId: 'james' } as Project;
const nothingFinished = { goalCount: 2, openTaskCount: 5, finishedTaskCount: 0, attachedFileCount: 1 };
const attachmentPaths = ['project-1/spec.pdf'];
const refusedByTheDatabase = { message: 'another record still names it' };

function databaseAnswering(deleteFailure: unknown) {
	const deletedFrom: string[] = [];
	const deleteFrom = (table: string) => {
		deletedFrom.push(table);
		return { eq: async () => ({ error: deleteFailure }) };
	};
	const supabase = { from: (table: string) => ({ delete: () => deleteFrom(table) }) } as unknown as SupabaseClient;
	return { supabase, deletedFrom };
}

describe('deleteProject', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(readProjectContents).mockResolvedValue(nothingFinished);
		vi.mocked(getAttachmentPathsForProject).mockResolvedValue(attachmentPaths);
	});

	it('never touches a project that holds finished tasks, nor its files', async () => {
		vi.mocked(readProjectContents).mockResolvedValue({ ...nothingFinished, finishedTaskCount: 187 });
		const { supabase, deletedFrom } = databaseAnswering(null);
		const refusal = await deleteProject(supabase, project);
		expect(refusal).toContain('Carp Mania cannot be deleted: it has 187 finished tasks');
		expect(deletedFrom).toEqual([]);
		expect(removeAttachmentFiles).not.toHaveBeenCalled();
	});

	it('deletes a project with nothing finished in it, then its files, then closes the gap it leaves', async () => {
		const { supabase, deletedFrom } = databaseAnswering(null);
		expect(await deleteProject(supabase, project)).toBeNull();
		expect(deletedFrom).toEqual(['projects']);
		expect(removeAttachmentFiles).toHaveBeenCalledWith(supabase, attachmentPaths);
		expect(compactProjectBoard).toHaveBeenCalledWith(supabase, project.ownerId);
		expect(compactTaskQueue).toHaveBeenCalledWith(supabase, project.ownerId);
	});

	it('leaves every file where it was when the database refuses the project', async () => {
		const { supabase } = databaseAnswering(refusedByTheDatabase);
		await expect(deleteProject(supabase, project)).rejects.toBe(refusedByTheDatabase);
		expect(removeAttachmentFiles).not.toHaveBeenCalled();
	});
});
