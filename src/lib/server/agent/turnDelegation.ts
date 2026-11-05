import { agendaRecordId, subjectKinds, type AgendaItem } from './agendaItem';
import { turnOutcomes, type TurnOutcome } from './turnOutcome';
import type { TurnAnswer } from './turnAnswer';

/** The existing action that records an answer, with what it is given, so its own checks and doctrine still apply. */
export type TurnDelegation = { actionName: string; input: Record<string, unknown> };

export const delegatedActions = {
	postMessage: 'post_message',
	completeTodo: 'complete_todo',
	recordTestResults: 'record_test_results'
} as const;

const testOutcomes: TurnOutcome[] = [turnOutcomes.confirmed, turnOutcomes.failed];

const noSubjectRefusal = 'This item has no goal or task to record the answer on. Nothing was recorded.';
const testOffTaskRefusal = 'A test is recorded on the task the feature was built on, and this item is not on a task.';

/** How the answer is recorded: the action it goes to, null when putting it off is all there is, or a refusal. */
export function turnDelegation(item: AgendaItem, answer: TurnAnswer): TurnDelegation | string | null {
	const { outcome } = answer;
	if (outcome === turnOutcomes.snoozed) return null;
	if (outcome === turnOutcomes.done) {
		return { actionName: delegatedActions.completeTodo, input: { todoId: agendaRecordId(item.key) } };
	}
	if (testOutcomes.includes(outcome)) return testDelegation(item, answer);
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

function testDelegation(item: AgendaItem, answer: TurnAnswer): TurnDelegation | string {
	const { subjectKind, subjectId } = item;
	if (subjectKind !== subjectKinds.task || subjectId === null) return testOffTaskRefusal;
	const fault = answer.fault === null ? {} : { fault: answer.fault };
	const result = { taskId: subjectId, outcome: answer.outcome, proof: answer.text, ...fault };
	return { actionName: delegatedActions.recordTestResults, input: { results: [result] } };
}
