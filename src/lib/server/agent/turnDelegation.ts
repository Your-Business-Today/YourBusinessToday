import { agendaRecordId, subjectKinds, type AgendaItem } from './agendaItem';
import { turnOutcomes } from './turnOutcome';
import type { TurnAnswer } from './turnAnswer';

/** The existing action that records an answer, with what it is given, so its own checks and doctrine still apply. */
export type TurnDelegation = { actionName: string; input: Record<string, unknown> };

export const delegatedActions = {
	postMessage: 'post_message',
	completeTodo: 'complete_todo'
} as const;

const noSubjectRefusal = 'This item has no goal or task to record the answer on. Nothing was recorded.';

/** How the answer is recorded: the action it goes to, null when putting it off is all there is, or a refusal. */
export function turnDelegation(item: AgendaItem, answer: TurnAnswer): TurnDelegation | string | null {
	const { outcome } = answer;
	if (outcome === turnOutcomes.snoozed) return null;
	if (outcome === turnOutcomes.done) {
		return { actionName: delegatedActions.completeTodo, input: { todoId: agendaRecordId(item.key) } };
	}
	const subject = subjectFields(item);
	if (subject === null) return noSubjectRefusal;
	const input = { ...subject, body: answer.text, ...messageExtras(answer) };
	return { actionName: delegatedActions.postMessage, input };
}

function subjectFields(item: AgendaItem): Record<string, string> | null {
	const { subjectKind, subjectId } = item;
	if (subjectId === null) return null;
	if (subjectKind === subjectKinds.goal) return { goalId: subjectId };
	if (subjectKind === subjectKinds.task) return { taskId: subjectId };
	return null;
}

function messageExtras(answer: TurnAnswer): Record<string, string> {
	const { outcome, text } = answer;
	if (outcome === turnOutcomes.promised) return { promise: text ?? '' };
	if (outcome === turnOutcomes.started) return { progress: outcome };
	if (outcome === turnOutcomes.finished) return { progress: outcome };
	return {};
}
