import { describe, expect, it } from 'vitest';
import { notificationSentence } from './notificationSentence';

describe('notificationSentence', () => {
	it('tells of a message as who said what on which conversation', () => {
		const sentence = notificationSentence({
			subjectKind: 'task',
			subjectTitle: 'Profit summary',
			eventKind: null,
			actorName: 'Nigel'
		});
		expect(`${sentence.who}${sentence.what}${sentence.which}`).toBe('Nigel said on the task Profit summary');
	});

	it('tells the person who asked for a task that it is finished, crediting the merge when nobody did it', () => {
		const byJames = notificationSentence({
			subjectKind: 'task',
			subjectTitle: 'Profit summary',
			eventKind: 'task_done',
			actorName: 'James'
		});
		expect(`${byJames.who}${byJames.what}${byJames.which}`).toBe(
			'James finished the task you asked for, Profit summary'
		);
		const byMerge = notificationSentence({
			subjectKind: 'task',
			subjectTitle: 'Profit summary',
			eventKind: 'task_done',
			actorName: null
		});
		expect(byMerge.who).toBe('A merged pull request');
	});
});
