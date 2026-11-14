import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noSuchProject } from './describeProject';
import { projectRemovalActions } from './projectRemovalActions';
import type { McpCaller } from '../resolveMcpCaller';

const { scratch, nothingFinished, contentsRead, projectDeleted } = vi.hoisted(() => ({
	scratch: { id: 'scratch', name: 'Scratch', ownerId: 'me' },
	nothingFinished: { goalCount: 2, openTaskCount: 5, finishedTaskCount: 0, attachedFileCount: 1 },
	contentsRead: vi.fn(),
	projectDeleted: vi.fn()
}));

vi.mock('$lib/server/projects/getProject', () => ({ getProject: async () => scratch }));
vi.mock('$lib/server/projects/readProjectContents', () => ({ readProjectContents: contentsRead }));
vi.mock('$lib/server/projects/deleteProject', () => ({ deleteProject: projectDeleted }));

const supabase = {};
const onTheProject = {
	accountId: 'me',
	ownedProjectIds: [],
	memberProjectIds: [scratch.id],
	supabase
} as unknown as McpCaller;
const offTheProject = { ...onTheProject, memberProjectIds: [] } as McpCaller;
const [deleteProjectAction] = projectRemovalActions;
const asNamed = `"${scratch.name}"`;
const namedBack = { projectId: scratch.id, confirmProjectName: ' Scratch ' };
const finishedSinceTheLook = 'Scratch cannot be deleted: it has one finished task.';

describe('delete_project', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		contentsRead.mockResolvedValue(nothingFinished);
		projectDeleted.mockResolvedValue(null);
	});

	it('takes the project id and the project’s name given back, and needs only the id', () => {
		const { properties, required } = deleteProjectAction.inputSchema as { properties: object; required: string[] };
		expect(Object.keys(properties)).toEqual(['projectId', 'confirmProjectName']);
		expect(required).toEqual(['projectId']);
	});

	it('does not reach a project the caller is not on', async () => {
		expect(await deleteProjectAction.run(offTheProject, namedBack)).toBe(noSuchProject);
		expect(projectDeleted).not.toHaveBeenCalled();
	});

	it('deletes nothing on the project id alone, and answers with what the project holds', async () => {
		const answer = await deleteProjectAction.run(onTheProject, { projectId: scratch.id });
		expect(answer).toContain(`Nothing is deleted yet. Deleting ${asNamed} deletes everything in it:`);
		expect(answer).toContain('- 5 open tasks, subtasks included');
		expect(projectDeleted).not.toHaveBeenCalled();
	});

	it('deletes nothing when another name is given, and says it is not the project’s', async () => {
		const answer = await deleteProjectAction.run(onTheProject, { ...namedBack, confirmProjectName: 'Scratchpad' });
		expect(answer).toContain('"Scratchpad" is not this project’s name');
		expect(projectDeleted).not.toHaveBeenCalled();
	});

	it('refuses a project that holds finished tasks, even with its name given back', async () => {
		contentsRead.mockResolvedValue({ ...nothingFinished, finishedTaskCount: 187 });
		const answer = await deleteProjectAction.run(onTheProject, namedBack);
		expect(answer).toContain('Scratch cannot be deleted: it has 187 finished tasks');
		expect(answer).toContain('Nothing was deleted.');
		expect(projectDeleted).not.toHaveBeenCalled();
	});

	it('deletes the project once its name is given back, and says what went with it', async () => {
		const answer = await deleteProjectAction.run(onTheProject, namedBack);
		expect(projectDeleted).toHaveBeenCalledWith(supabase, scratch);
		expect(answer).toContain(`${asNamed} deleted, with 2 goals, 5 open tasks and one attached file.`);
	});

	it('says the project stays when a task in it was finished after the look', async () => {
		projectDeleted.mockResolvedValue(finishedSinceTheLook);
		const answer = await deleteProjectAction.run(onTheProject, namedBack);
		expect(answer).toContain(finishedSinceTheLook);
		expect(answer).toContain('Nothing was deleted.');
	});
});
