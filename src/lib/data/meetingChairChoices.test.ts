import { describe, expect, it } from 'vitest';
import { chairChoicesOf } from './meetingChairChoices';
import { formerSeat, jeremysSeat, nigelsSeat } from './boardroomMeeting.fixtures';

describe('who a director may put in the chair', () => {
	it('is every other sitting director, by account, and never one who has stood down', () => {
		expect(chairChoicesOf([nigelsSeat, jeremysSeat, formerSeat], 'nigel')).toEqual([{ value: 'jeremy', name: 'Jeremy' }]);
	});

	it('names a director with no account by their name', () => {
		const unlinked = { ...jeremysSeat, accountId: null };
		expect(chairChoicesOf([nigelsSeat, unlinked], 'nigel')).toEqual([{ value: 'Jeremy', name: 'Jeremy' }]);
	});
});
