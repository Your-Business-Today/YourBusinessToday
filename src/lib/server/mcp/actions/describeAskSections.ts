import { messageLine } from './describeMessages';
import { subjectHeading } from './describeWaitingQuestions';
import { accountNameLookup } from '$lib/data/accountNames';
import { askKindOrder, defaultAskKind, type AskKind } from '$lib/data/askKind';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';
import type { WaitingQuestions } from './waitingQuestionsFor';

export const askSectionHeadings: Record<AskKind, string> = {
	information: 'Information you need to give',
	setup: 'Things you need to set up',
	testing: 'Things you need to test'
};

/** The kind an ask was posted as; an ask from before kinds existed asks for information. */
export function askKindOf(question: WaitingQuestion): AskKind {
	return question.askKind ?? defaultAskKind;
}

export function asksOfKind(waiting: WaitingQuestions, kind: AskKind): WaitingQuestion[] {
	return waiting.questions.filter((question) => askKindOf(question) === kind);
}

/** Information, setup and testing, each a section of its own across every project, longest waiting first. */
export function askSections(waiting: WaitingQuestions, viewerId: string): string[] {
	const nameOf = accountNameLookup(waiting.askers);
	return askKindOrder.flatMap((kind) => {
		const asks = asksOfKind(waiting, kind);
		if (asks.length === 0) return [];
		const blocks = asks.flatMap((question) => {
			const authorName = nameOf(question.authorAccountId);
			return [subjectHeading(question), messageLine({ ...question, authorName }, viewerId)];
		});
		return [`## ${askSectionHeadings[kind]} (${asks.length})`, ...blocks, ''];
	});
}
