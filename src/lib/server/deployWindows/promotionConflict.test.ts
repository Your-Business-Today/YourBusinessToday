import { describe, expect, it } from 'vitest';
import { conflictNote, conflictTaskDetails, conflictTaskTitle, hasOpenConflictTask } from './promotionConflict';
import { taskStatuses } from '$lib/data/taskStatus';

const portal = { defaultBranch: 'main', repositoryUrl: 'https://github.com/example/portal' };
const promotionUrl = 'https://github.com/example/portal/pull/12';

describe('what a promotion says when staging conflicts with the default branch', () => {
	it('says nothing deploys, names the pull request, and says what puts it right', () => {
		expect(conflictNote(portal, promotionUrl)).toBe(
			'staging conflicts with main, so https://github.com/example/portal/pull/12 cannot merge and nothing deploys. ' +
				'Merge main into a branch cut from staging, settle the conflict there, and send it into staging.'
		);
	});

	it('names the project’s own default branch', () => {
		const onTrunk = { ...portal, defaultBranch: 'trunk' };
		expect(conflictNote(onTrunk, promotionUrl)).toContain('staging conflicts with trunk');
		expect(conflictNote(onTrunk, promotionUrl)).toContain('Merge trunk into a branch cut from staging');
	});
});

describe('the task that puts a conflict right', () => {
	it('is a fix named for both branches and the repository', () => {
		expect(conflictTaskTitle(portal)).toBe('FIX: staging conflicts with main in portal, so nothing deploys');
	});

	it('gives the pull request, the usual cause and the way to put it right', () => {
		const details = conflictTaskDetails(portal, promotionUrl);
		expect(details).toContain(`The deploy window opened ${promotionUrl} to send staging into main`);
		expect(details).toContain('The window tries again every hour.');
		expect(details).toContain('work merged straight into main');
		expect(details).toContain('Cut a branch from fresh staging, merge main into it');
		expect(details).toContain('never a squash');
	});
});

describe('whether the task that puts a conflict right is already raised', () => {
	const title = conflictTaskTitle(portal);

	it('is, while one of that title is not done', () => {
		expect(hasOpenConflictTask([{ title, status: taskStatuses.backlog }], portal)).toBe(true);
		expect(hasOpenConflictTask([{ title, status: taskStatuses.inProgress }], portal)).toBe(true);
	});

	it('is not, once the earlier one is done', () => {
		expect(hasOpenConflictTask([{ title, status: taskStatuses.done }], portal)).toBe(false);
	});

	it('is not, when the project holds only other tasks', () => {
		const otherTask = { title: 'FIX: Run test suite failed on main in portal', status: taskStatuses.backlog };
		expect(hasOpenConflictTask([otherTask], portal)).toBe(false);
		expect(hasOpenConflictTask([], portal)).toBe(false);
	});
});
