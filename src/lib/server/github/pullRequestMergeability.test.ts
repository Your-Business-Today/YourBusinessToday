import { describe, expect, it } from 'vitest';
import { lookUntilKnown, mergeabilities, mergeabilityOf, type Mergeability } from './pullRequestMergeability';

const { mergeable, conflicting, notYetKnown } = mergeabilities;

function githubAnswering(...answers: Mergeability[]) {
	let looksMade = 0;
	const read = async () => answers[Math.min(looksMade++, answers.length - 1)];
	return Object.assign(read, { looks: () => looksMade });
}

function clockCountingPauses() {
	const pauses: number[] = [];
	return { pause: async (milliseconds: number) => void pauses.push(milliseconds), pauses };
}

describe('what GitHub says of merging a pull request', () => {
	it('reads true as mergeable and false as a conflict', () => {
		expect(mergeabilityOf(true)).toBe(mergeable);
		expect(mergeabilityOf(false)).toBe(conflicting);
	});

	it('reads null, and an answer that leaves it out, as not yet known', () => {
		expect(mergeabilityOf(null)).toBe(notYetKnown);
		expect(mergeabilityOf(undefined)).toBe(notYetKnown);
	});
});

describe('looking until GitHub has worked it out', () => {
	it('takes an answer GitHub already has without pausing', async () => {
		const clock = clockCountingPauses();
		expect(await lookUntilKnown(githubAnswering(mergeable), clock)).toBe(mergeable);
		expect(clock.pauses).toEqual([]);
	});

	it('looks again after a pause while GitHub is still working it out, and finds the conflict', async () => {
		const clock = clockCountingPauses();
		const github = githubAnswering(notYetKnown, notYetKnown, conflicting);
		expect(await lookUntilKnown(github, clock)).toBe(conflicting);
		expect(github.looks()).toBe(3);
		expect(clock.pauses).toEqual([2000, 2000]);
	});

	it('stops after five looks and says GitHub has not worked it out', async () => {
		const clock = clockCountingPauses();
		const github = githubAnswering(notYetKnown);
		expect(await lookUntilKnown(github, clock)).toBe(notYetKnown);
		expect(github.looks()).toBe(5);
		expect(clock.pauses).toHaveLength(4);
	});
});
