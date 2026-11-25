import { describe, expect, it } from 'vitest';
import { departmentTabs, inBoardTab } from './departmentBoard';
import { boardTabs } from './boardTab';
import { departments } from './department';
import { designReviewStates, type DesignReview, type DesignReviewState } from './designReview';
import { taskStatuses } from './taskStatus';

function reviewed(state: DesignReviewState): DesignReview {
	return { state, change: 'Adds a new platform', reason: '', reviewedBy: null, reviewedAt: null };
}

const feature = {
	title: 'As a user I want a password vault',
	department: departments.development,
	status: taskStatuses.backlog,
	goalId: null,
	parentTaskId: null
};
const vault = { ...feature, id: 'vault', designReview: reviewed(designReviewStates.awaiting) };
const vaultChunk = { ...feature, id: 'vault-chunk', title: 'Stand up the vault', parentTaskId: 'vault' };
const chunkStep = { ...feature, id: 'chunk-step', title: 'Deploy it', parentTaskId: 'vault-chunk' };
const approved = { ...feature, id: 'approved', designReview: reviewed(designReviewStates.approved) };
const approvedChunk = { ...feature, id: 'approved-chunk', title: 'Its chunk', parentTaskId: 'approved' };
const plain = { ...feature, id: 'plain', title: 'As a user I want a list' };
const tasks = [vault, vaultChunk, chunkStep, approved, approvedChunk, plain];

describe('a request awaiting YBT on the board', () => {
	it('keeps the request and every chunk beneath it off Features until YBT approves it', () => {
		const shownIds = inBoardTab(tasks, boardTabs.features).map((task) => task.id);
		expect(shownIds).toEqual(['approved', 'approved-chunk', 'plain']);
	});

	it('leaves the requests out of the Features count', () => {
		const features = departmentTabs(tasks, []).find((tab) => tab.tab === boardTabs.features);
		expect(features?.openTaskCount).toBe(3);
	});
});
