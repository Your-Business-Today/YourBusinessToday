import { describe, expect, it } from 'vitest';
import { deploySummaryOf, describeDeploySummary, type DeployableTask } from './deploySummary';

const repositoryUrl = 'https://github.com/example/ybt/';
const byNumber: DeployableTask = {
	id: 't1',
	projectId: 'p1',
	title: 'Round the invoice total once',
	branchName: 'fix/invoice-total-rounding',
	pullRequestUrl: 'https://github.com/example/ybt/pull/42'
};
const byBranch: DeployableTask = { id: 't2', projectId: 'p1', title: 'Weekly cashflow grid', branchName: 'feature/weekly-cashflow-grid', pullRequestUrl: '' };
const merged = [
	{ number: 42, branchName: 'fix/invoice-total-rounding' },
	{ number: 43, branchName: 'feature/weekly-cashflow-grid' },
	{ number: 44, branchName: 'chore/bump' }
];

describe('deploySummaryOf', () => {
	it('matches a pull request to the task that recorded its address, or its branch when none did', () => {
		const summary = deploySummaryOf(merged, [byNumber, byBranch]);
		const deployedTasks = summary.deployed.map((deployed) => deployed.task);
		expect(deployedTasks.map((task) => task.id)).toEqual(['t1', 't2']);
		expect(summary.unclaimed).toEqual([{ number: 44, branchName: 'chore/bump' }]);
	});

	it('does not let a task’s branch claim a pull request when the task recorded a different one', () => {
		const elsewhere = { ...byNumber, pullRequestUrl: 'https://github.com/example/ybt/pull/9' };
		expect(deploySummaryOf(merged, [elsewhere]).deployed).toEqual([]);
	});
});

describe('describeDeploySummary', () => {
	it('links each task and its pull request, and names the pull requests no task recorded', () => {
		const lines = describeDeploySummary(deploySummaryOf(merged, [byNumber]), repositoryUrl).split('\n');
		expect(lines[0]).toBe('- [Round the invoice total once](https://yourbusiness.today/projects/p1/tasks/t1) — [#42](https://github.com/example/ybt/pull/42)');
		expect(lines[1]).toBe('- [#43](https://github.com/example/ybt/pull/43) (no task recorded it)');
		expect(lines).toHaveLength(3);
		expect(describeDeploySummary(deploySummaryOf([], []), repositoryUrl)).toBe('');
	});
});
