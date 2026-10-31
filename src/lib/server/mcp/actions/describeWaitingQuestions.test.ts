import { describe, expect, it } from 'vitest';
import { describeWaitingQuestions, nothingWaiting } from './describeWaitingQuestions';
import { awaitingKinds, postedViaChannels } from '$lib/data/conversationTurn';
import { taskStatuses } from '$lib/data/taskStatus';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';

const james = 'james';
const jeremy = 'jeremy';
const accounts = [{ id: james, name: 'James', email: 'james@example.com' }];

const questionOnDoneTask: WaitingQuestion = {
	id: 'message',
	goalId: null,
	taskId: 'invoiced-jobs',
	authorAccountId: james,
	body: 'Jeremy, should the invoiced jobs move across?',
	isInternal: false,
	postedVia: postedViaChannels.claude,
	awaiting: { accountId: jeremy, kind: awaitingKinds.person },
	askKind: 'information',
	pickedUpAt: null,
	createdAt: '2026-10-10T09:00:00Z',
	subjectKind: 'task',
	subjectId: 'invoiced-jobs',
	subjectTitle: 'Move the invoiced jobs',
	taskStatus: taskStatuses.done,
	projectId: 'jewel-pfp-portal',
	projectName: 'Jewel PFP Portal'
};

describe('the questions waiting on the reader', () => {
	it('lists a question on a done task with its project, task, asker and question', () => {
		const described = describeWaitingQuestions([questionOnDoneTask], accounts, jeremy);
		expect(described).toContain('One question waits on you.');
		expect(described).toContain('"Move the invoiced jobs" on Jewel PFP Portal');
		expect(described).toContain('task id: invoiced-jobs, Done');
		expect(described).toContain('James (by their Claude)');
		expect(described).toContain('should the invoiced jobs move across?');
		expect(described).toContain('information ask, waiting on the person you are with]');
	});

	it('says so when nothing waits on the reader', () => {
		expect(describeWaitingQuestions([], accounts, jeremy)).toBe(nothingWaiting);
	});
});
