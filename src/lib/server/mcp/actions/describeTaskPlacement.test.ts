import { describe, expect, it } from 'vitest';
import { describeTaskPlacement, type PlacementStory } from './describeTaskPlacement';

const placedAfterRelease: PlacementStory = {
	taskTitle: 'Bring the ledger across',
	targetTitle: 'Ship the release',
	placement: 'after',
	parentMove: null,
	goalMove: null,
	goalKeptBesideAnother: null
};

const sitsAfterRelease = '"Bring the ledger across" now sits after "Ship the release".';

describe('describeTaskPlacement', () => {
	it('says only the new position when nothing else changed', () => {
		expect(describeTaskPlacement(placedAfterRelease)).toBe(sitsAfterRelease);
	});

	it('says which parent the task left when it comes back to the top level', () => {
		const parentMove = { leftName: 'Close the year', joinedName: null };
		expect(describeTaskPlacement({ ...placedAfterRelease, parentMove })).toBe(
			`${sitsAfterRelease}\n` +
				'It left "Close the year" and is a top level task again, because a task is ordered ' +
				'among the tasks that share its parent.'
		);
	});

	it('names every change on a line of its own, and a missing goal as no goal', () => {
		const parentMove = { leftName: 'Close the year', joinedName: 'Ship the release' };
		const goalMove = { leftName: 'Accounts', joinedName: null };
		const answer = describeTaskPlacement({ ...placedAfterRelease, parentMove, goalMove });
		expect(answer.split('\n')).toEqual([
			sitsAfterRelease,
			'It left "Close the year" and is now a subtask of "Ship the release", because a task is ' +
				'ordered among the tasks that share its parent.',
			'Its goal changed from "Accounts" to no goal.'
		]);
	});
});
