import { describe, expect, it } from 'vitest';
import { turnDelegation } from './turnDelegation';
import type { AgendaItem } from './agendaItem';
import type { TurnAnswer } from './turnAnswer';

const item = (fields: Partial<AgendaItem>): AgendaItem => ({
	key: 'message:m1', kind: 'information', isBug: false, projectId: 'ybt', projectName: 'YBT', subjectKind: 'task',
	subjectId: 't1', subjectTitle: 'Export', ask: '', askedById: null, since: null, goal: null, ...fields
});
const answer = (fields: Partial<TurnAnswer>): TurnAnswer => ({
	itemKey: 'message:m1', outcome: 'answered', text: 'Yes', fault: null, untilDay: null, ...fields
});

describe('where an answer is recorded', () => {
	it('posts an answer on the task the ask is on', () => {
		expect(turnDelegation(item({}), answer({}))).toEqual({
			actionName: 'post_message', input: { taskId: 't1', body: 'Yes' }
		});
	});

	it('posts a promise and work started with what they said', () => {
		const promised = turnDelegation(item({ kind: 'task' }), answer({ outcome: 'promised', text: 'Friday' }));
		expect(promised).toEqual({ actionName: 'post_message', input: { taskId: 't1', body: 'Friday', promise: 'Friday' } });
		const started = turnDelegation(item({ kind: 'task' }), answer({ outcome: 'started', text: 'Half done' }));
		expect(started).toEqual({ actionName: 'post_message', input: { taskId: 't1', body: 'Half done', progress: 'started' } });
	});

	it('records a failed test with its fault', () => {
		const failed = turnDelegation(item({ kind: 'testing' }), answer({ outcome: 'failed', text: 'Blank page', fault: 'Export is blank' }));
		const result = { taskId: 't1', outcome: 'failed', proof: 'Blank page', fault: 'Export is blank' };
		expect(failed).toEqual({ actionName: 'record_test_results', input: { results: [result] } });
	});

	it('ticks a to-do by the id in its key, and needs nothing to put an item off', () => {
		const done = turnDelegation(item({ key: 'todo:d1', kind: 'todo' }), answer({ outcome: 'done', text: null }));
		expect(done).toEqual({ actionName: 'complete_todo', input: { todoId: 'd1' } });
		expect(turnDelegation(item({}), answer({ outcome: 'snoozed', text: null }))).toBeNull();
	});

	it('refuses a test on a goal', () => {
		expect(turnDelegation(item({ kind: 'testing', subjectKind: 'goal' }), answer({ outcome: 'confirmed' }))).toContain('task');
	});
});
