import { describe, expect, it } from 'vitest';
import { comesAfter, readTaskSequence, taskWaitingFor } from './taskSequence';
import { followersOf } from './taskSequenceSteps';
import { sequenceChoicesFor, sequenceStandingsOf, waitsForRefusal } from './taskSequenceStanding';
import type { SequencedTask } from './taskSequence';
import type { TaskStatus } from './taskStatus';

function step(id: string, waitsForTaskId: string | null, status: TaskStatus = 'backlog'): SequencedTask {
	return { id, title: `Step ${id}`, status, waitsForTaskId, priority: 1, createdAt: `2026-10-0${id}` };
}

const createAccount = step('1', null, 'done');
const verifyIdentity = step('2', '1', 'in_progress');
const payTheFee = step('3', '2');
const uploadBuild = step('4', '3');
const unrelated = step('9', null);
const sequence = [createAccount, verifyIdentity, payTheFee, uploadBuild, unrelated];

describe('readTaskSequence', () => {
	it('puts every step in order round the task and says which step the task is', () => {
		const read = readTaskSequence(payTheFee, sequence);
		expect(read?.steps.map(({ task }) => task.id)).toEqual(['1', '2', '3', '4']);
		expect(read?.stepCount).toBe(4);
		expect(read?.thisStepNumber).toBe(3);
		expect(read?.steps[2].isThisTask).toBe(true);
	});

	it('is nothing for a task that waits for no task and that no task waits for', () => {
		expect(readTaskSequence(unrelated, sequence)).toBeNull();
	});

	it('names the step still holding the task up, and nothing once that step is done', () => {
		expect(readTaskSequence(payTheFee, sequence)?.waitingFor).toEqual(verifyIdentity);
		expect(readTaskSequence(payTheFee, sequence)?.waitingForStepNumber).toBe(2);
		expect(readTaskSequence(payTheFee, sequence)?.steps[1].isWaitedFor).toBe(true);
		expect(readTaskSequence(verifyIdentity, sequence)?.waitingFor).toBeNull();
	});

	it('survives a chain that loops back on itself', () => {
		const loopedBack = [step('a', 'b'), step('b', 'a')];
		expect(readTaskSequence(loopedBack[0], loopedBack)?.steps).toHaveLength(2);
	});
});

describe('taskWaitingFor', () => {
	it('is nothing for a done task, whatever it waited for', () => {
		expect(taskWaitingFor(step('5', '2', 'done'), sequence)).toBeNull();
	});
});

describe('followersOf', () => {
	it('lists the tasks that wait for a task in the order they are worked', () => {
		const first = { ...step('b', '1'), priority: 1 };
		const second = { ...step('c', '1'), priority: 2 };
		expect(followersOf(createAccount, [createAccount, second, first])).toEqual([first, second]);
	});
});

describe('waitsForRefusal', () => {
	it('lets a task wait for an earlier task, or for no task', () => {
		expect(waitsForRefusal(payTheFee, createAccount.id, sequence)).toBeNull();
		expect(waitsForRefusal(payTheFee, null, sequence)).toBeNull();
	});

	it('refuses itself, a task that comes after it, and a task not on the project', () => {
		expect(waitsForRefusal(payTheFee, payTheFee.id, sequence)).toContain('itself');
		expect(waitsForRefusal(verifyIdentity, uploadBuild.id, sequence)).toContain('comes after');
		expect(waitsForRefusal(payTheFee, 'elsewhere', sequence)).toContain('own project');
	});
});

describe('comesAfter', () => {
	it('is true down the chain and false across it', () => {
		expect(comesAfter(uploadBuild, createAccount, sequence)).toBe(true);
		expect(comesAfter(createAccount, uploadBuild, sequence)).toBe(false);
		expect(comesAfter(unrelated, createAccount, sequence)).toBe(false);
	});
});

describe('sequenceChoicesFor', () => {
	it('offers the open tasks that do not come after the task, and the one it waits for now', () => {
		const choiceIds = sequenceChoicesFor(verifyIdentity, sequence).map((choice) => choice.id);
		expect(choiceIds).toEqual(['1', '9']);
	});
});

describe('sequenceStandingsOf', () => {
	it('says which tasks are held up and which merely follow a finished step', () => {
		const standings = sequenceStandingsOf(sequence);
		expect(standings['2']).toEqual({ waitedForId: '1', waitedForTitle: 'Step 1', isWaiting: false });
		expect(standings['3'].isWaiting).toBe(true);
		expect(standings['1']).toBeUndefined();
	});
});
