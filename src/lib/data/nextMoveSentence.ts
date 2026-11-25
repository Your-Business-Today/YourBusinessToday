import { nextActionReasons, type NextAction, type NextActionReason } from './nextAction';
import type { NameOf } from './turnLabels';

const viewerWord = 'you';

const becauseOf: Record<NextActionReason, string> = {
	ask: 'an ask waits on them',
	build: '',
	answered: 'their ask was answered',
	assigned: 'the task is assigned to them',
	raised: 'they raised it and nobody is assigned'
};

/** The panel's line for who makes the next move on a task, from where the viewer stands. */
export function nextMoveSentence(nextAction: NextAction, nameOf: NameOf, viewerId: string): string {
	if (nextAction.reason === nextActionReasons.build) return 'Next move: Claude builds it. Nothing here waits on a person.';
	if (nextAction.accountIds.length === 0) return 'Next move: nobody is named yet.';
	const names = nextAction.accountIds.map((accountId) => (accountId === viewerId ? viewerWord : nameOf(accountId)));
	return `Next move: ${names.join(' and ')}, as ${becauseOf[nextAction.reason]}.`;
}
