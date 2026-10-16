import { beforeEach, describe, expect, it, vi } from 'vitest';
import { acceptanceCriterionActions } from './acceptanceCriterionActions';
import { noSuchTask } from './describeTask';
import type { McpCaller } from '../resolveMcpCaller';

const { otherOrganisationsTask, theirCriterion, criteriaRead, criterionTicked, criterionDropped } =
	vi.hoisted(() => ({
		otherOrganisationsTask: { id: 'task-of-another-organisation', projectId: 'their-project' },
		theirCriterion: { id: 'criterion-1', description: 'Their criterion', isMet: false },
		criteriaRead: vi.fn(),
		criterionTicked: vi.fn(),
		criterionDropped: vi.fn()
	}));

vi.mock('$lib/server/projects/getTask', () => ({ getTask: async () => otherOrganisationsTask }));
vi.mock('$lib/server/projects/getTaskAcceptanceCriteria', () => ({
	getTaskAcceptanceCriteria: async (...read: unknown[]) => {
		criteriaRead(...read);
		return [theirCriterion];
	}
}));
vi.mock('$lib/server/projects/setCriterionMet', () => ({ setCriterionMet: criterionTicked }));
vi.mock('$lib/server/projects/deleteAcceptanceCriterion', () => ({
	deleteAcceptanceCriterion: criterionDropped
}));

const outsider = {
	accountId: 'client-contact-elsewhere',
	ownedProjectIds: [],
	memberProjectIds: [],
	supabase: {}
} as unknown as McpCaller;

function actionNamed(name: string) {
	const found = acceptanceCriterionActions.find((action) => action.name === name);
	if (found === undefined) throw new Error(`No action named ${name}`);
	return found;
}

const theirIds = { taskId: otherOrganisationsTask.id, criterionId: theirCriterion.id, isMet: true };

describe('acceptance criteria on a task the caller cannot reach', () => {
	beforeEach(() => vi.clearAllMocks());

	it('cannot be ticked', async () => {
		const answer = await actionNamed('set_acceptance_criterion_met').run(outsider, theirIds);
		expect(answer).toBe(noSuchTask);
		expect(criteriaRead).not.toHaveBeenCalled();
		expect(criterionTicked).not.toHaveBeenCalled();
	});

	it('cannot be dropped', async () => {
		const answer = await actionNamed('delete_acceptance_criterion').run(outsider, theirIds);
		expect(answer).toBe(noSuchTask);
		expect(criteriaRead).not.toHaveBeenCalled();
		expect(criterionDropped).not.toHaveBeenCalled();
	});
});
