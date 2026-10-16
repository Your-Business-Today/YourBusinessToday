import { describe, expect, it } from 'vitest';
import { openQuestionsAmong, questionsOnOpenTasks } from './openQuestion';

const podcastTask = 'podcast-figures';
const cashflowTask = 'weekly-cashflow';
const askedJeremy = {
	id: 'to-jeremy',
	taskId: podcastTask,
	goalId: null,
	createdAt: '2026-10-13T12:00:00Z'
};
const askedJeremyAgain = {
	...askedJeremy,
	id: 'to-jeremy-again',
	createdAt: '2026-10-13T15:00:00Z'
};
const askedOnCashflow = {
	...askedJeremy,
	id: 'cashflow',
	taskId: cashflowTask,
	createdAt: '2026-10-12T09:00:00Z'
};
const jeremyAnswered = {
	taskId: podcastTask,
	goalId: null,
	createdAt: '2026-10-13T13:00:00Z'
};

describe('the questions still open for Jeremy', () => {
	it('keeps a question to him when a later message on the same task waits on Nigel', () => {
		expect(openQuestionsAmong([askedJeremy], [])).toEqual([askedJeremy]);
	});

	it('drops a question once he has spoken after it', () => {
		expect(openQuestionsAmong([askedJeremy], [jeremyAnswered])).toEqual([]);
	});

	it('keeps a question asked after his answer', () => {
		const questions = [askedJeremy, askedJeremyAgain];
		expect(openQuestionsAmong(questions, [jeremyAnswered])).toEqual([askedJeremyAgain]);
	});

	it('lists one question per task, the longest wait first', () => {
		const questions = [askedJeremy, askedJeremyAgain, askedOnCashflow];
		expect(openQuestionsAmong(questions, [])).toEqual([askedOnCashflow, askedJeremyAgain]);
	});
});

describe('the questions on tasks that are still open', () => {
	it('drops a question once its task is done and keeps the rest', () => {
		const doneTaskIds = new Set([podcastTask]);
		const kept = questionsOnOpenTasks([askedJeremy, askedOnCashflow], doneTaskIds);
		expect(kept).toEqual([askedOnCashflow]);
	});

	it('keeps a question on a goal, which is never done', () => {
		const askedOnGoal = { ...askedJeremy, taskId: null, goalId: 'grow-the-audience' };
		const kept = questionsOnOpenTasks([askedOnGoal], new Set([podcastTask]));
		expect(kept).toEqual([askedOnGoal]);
	});
});
