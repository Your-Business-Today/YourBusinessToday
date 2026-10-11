import { messageLine } from './describeMessages';
import { accountNameLookup } from '$lib/data/accountNames';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';

export const nothingWaiting = 'Nothing waits on you on any project.';

/** Every question waiting on the reader, each under the goal or task it was asked on. */
export function describeWaitingQuestions(
	questions: WaitingQuestion[],
	accounts: Account[],
	viewerId: string
): string {
	if (questions.length === 0) return nothingWaiting;
	const nameOf = accountNameLookup(accounts);
	const blocks = questions.flatMap((question) => {
		const authorName = nameOf(question.authorAccountId);
		return [subjectHeading(question), messageLine({ ...question, authorName }, viewerId), ''];
	});
	return [waitingCount(questions.length), '', ...blocks].join('\n').trimEnd();
}

function waitingCount(count: number): string {
	if (count === 1) return 'One question waits on you.';
	return `${count} questions wait on you.`;
}

function subjectHeading(question: WaitingQuestion): string {
	const kind = question.subjectKind;
	const status = question.taskStatus === null ? '' : `, ${taskStatusLabels[question.taskStatus]}`;
	const where = `${kind} id: ${question.subjectId}${status}`;
	return `On the ${kind} "${question.subjectTitle}" on ${question.projectName} (${where}):`;
}
