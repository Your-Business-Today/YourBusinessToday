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

	it('tells of a message in a chat room as said in the room', () => {
		const sentence = notificationSentence({ subjectKind: 'room', subjectTitle: 'Finance', eventKind: null, actorName: 'Nigel' });
		expect(`${sentence.who}${sentence.what}${sentence.which}`).toBe('Nigel said in the room Finance');
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

	it('tells a person given a task that it is theirs', () => {
		const sentence = notificationSentence({ subjectKind: 'task', subjectTitle: 'Start Up Loan', eventKind: 'task_assigned', actorName: 'Jeremy' });
		expect(`${sentence.who}${sentence.what}${sentence.which}`).toBe('Jeremy gave you the task Start Up Loan');
	});
});
