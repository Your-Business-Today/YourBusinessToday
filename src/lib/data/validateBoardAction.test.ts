import { describe, expect, it } from 'vitest';
import { validateBoardAction } from './validateBoardAction';
import { boardActionLimits, boardActionRefusals } from './boardroomActionRules';
import { accountsProjectId } from './boardroomAction.fixtures';

const given = { itemNumber: 1, what: 'File the accounts', owner: 'jeremy' };

describe('an action is checked against its columns as it is given, and refused, never repaired', () => {
	it('keeps an action for the owner’s own list, with no project and no date', () => {
		expect(validateBoardAction(given)).toEqual({ ...given, dueOn: null, projectId: null, department: null });
	});

	it('keeps an action on a project in the department of a person’s job, with its date', () => {
		const onProject = { ...given, dueOn: '2026-11-30', projectId: accountsProjectId, department: 'administration' };
		expect(validateBoardAction(onProject)).toEqual(onProject);
	});

	it('never raises a development task from a meeting', () => {
		const development = { ...given, projectId: accountsProjectId, department: 'development' };
		expect(validateBoardAction(development)).toBe(boardActionRefusals.developmentNotAsked);
	});

	it('takes a department only with a project, and a project only with a department', () => {
		expect(validateBoardAction({ ...given, department: 'sales' })).toBe(boardActionRefusals.departmentWithoutProject);
		expect(validateBoardAction({ ...given, projectId: accountsProjectId })).toBe(boardActionRefusals.departmentUnknown);
		expect(validateBoardAction({ ...given, projectId: 'accounts', department: 'sales' })).toBe(boardActionRefusals.projectNotAnId);
	});

	it('refuses a date that is not a real day, and words too long for a title', () => {
		expect(validateBoardAction({ ...given, dueOn: '2026-02-30' })).toBe(boardActionRefusals.dueOnNotADate);
		expect(validateBoardAction({ ...given, dueOn: '30/11/2026' })).toBe(boardActionRefusals.dueOnNotADate);
		const tooLong = 'x'.repeat(boardActionLimits.longestWhat + 1);
		expect(validateBoardAction({ ...given, what: tooLong })).toBe(boardActionRefusals.whatMissing);
		expect(validateBoardAction({ ...given, owner: ' ' })).toBe(boardActionRefusals.ownerMissing);
	});
});
