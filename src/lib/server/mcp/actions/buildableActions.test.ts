import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildableActions } from './buildableActions';
import { onlyDevelopmentIsBuilt } from '$lib/data/department';
import type { McpCaller } from '../resolveMcpCaller';

const { insurance, taggedBuildable } = vi.hoisted(() => ({
	insurance: {
		id: 'insurance',
		projectId: 'project-1',
		title: 'Put insurance in place',
		storyPoints: 2,
		department: 'administration'
	},
	taggedBuildable: vi.fn()
}));

vi.mock('$lib/server/projects/getTask', () => ({ getTask: async () => insurance }));
vi.mock('$lib/server/projects/setTaskBuildable', () => ({ setTaskBuildable: taggedBuildable }));
vi.mock('$lib/server/buildModels/getBuildModelSettings', () => ({
	getBuildModelSettings: async () => ({ models: [] })
}));

const owner = {
	accountId: 'james',
	isStaff: true,
	ownedProjectIds: [insurance.projectId],
	memberProjectIds: [],
	supabase: {}
} as unknown as McpCaller;

const [setTaskBuildable] = buildableActions;

describe('set_task_buildable', () => {
	beforeEach(() => vi.clearAllMocks());

	it('refuses to put a business task in the build queue', async () => {
		const answer = await setTaskBuildable.run(owner, { taskId: insurance.id, isBuildable: true });
		expect(answer).toBe(onlyDevelopmentIsBuilt);
		expect(taggedBuildable).not.toHaveBeenCalled();
	});

	it('still lets a business task be tagged not buildable', async () => {
		await setTaskBuildable.run(owner, { taskId: insurance.id, isBuildable: false });
		expect(taggedBuildable).toHaveBeenCalledTimes(1);
	});
});
