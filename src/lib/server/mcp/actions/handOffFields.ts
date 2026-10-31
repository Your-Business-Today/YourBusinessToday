import { findProjectPerson } from '$lib/server/members/findProjectPerson';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { isHandedToWriter, isNobodyNamed, nobodyWaiting, selfHandOffRefusal } from '$lib/data/batonRule';
import { parseAwaitingKind, type HandOff } from '$lib/data/conversationTurn';
import { askKindOrder, defaultAskKind, parseAskKind, type AskKind } from '$lib/data/askKind';
import { readOptionalText, textField } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { ResolvedSubject } from './resolveSubject';

export const handOffFields = {
	waitingOn: textField(
		'Only when this message asks someone else on the project a question they must answer: ' +
			'their email or account id, as list_project_people gives it. Leave it out for anything ' +
			'else — a work log, an answer, a status — and any question ' +
			`still open on the thread stays open. Say "${nobodyWaiting}" when nothing on the thread ` +
			'is waiting on anyone any more: every open question on it is settled. Never yourself'
	),
	waitingFor: textField(
		'"person" (the default) when only they can answer — their Claude brings it to them — or ' +
			'"claude" when their Claude can answer from the code and the records on its own'
	),
	askKind: textField(
		'With waitingOn only: what the ask wants from them — "information" (the default: an ' +
			'answer or a file only they hold), "setup" (an account, a key, a DNS record or a payment ' +
			'they put in place) or "testing" (confirm a merged feature works: say what to try and ' +
			'what proof counts). Building is never asked of a person'
	)
};

const askKindRefusal = `askKind is one of ${askKindOrder.join(', ')}, and only with waitingOn.`;

export type HandOffChoice =
	| { handOff: HandOff | null; isSettlingThread: boolean; askKind: AskKind }
	| { refusal: string };

/** Who must answer the question the message asks, if it asks one; otherwise nobody. */
export async function chooseHandOff(
	caller: McpCaller,
	input: Record<string, unknown>,
	resolved: ResolvedSubject
): Promise<HandOffChoice> {
	const waitingOn = readOptionalText(input, 'waitingOn');
	const kind = parseAwaitingKind(readOptionalText(input, 'waitingFor') ?? 'person');
	if (kind === null) return { refusal: 'waitingFor is "person" or "claude". Say which.' };
	const askKindText = readOptionalText(input, 'askKind');
	const askKind = askKindText === null ? defaultAskKind : parseAskKind(askKindText);
	const isAskKindWithoutAsk = askKindText !== null && waitingOn === null;
	if (askKind === null || isAskKindWithoutAsk) return { refusal: askKindRefusal };
	if (waitingOn === null) return { handOff: null, isSettlingThread: false, askKind };
	if (isNobodyNamed(waitingOn)) return { handOff: null, isSettlingThread: true, askKind };
	const people = await getPeopleOnProject(caller.supabase, resolved.projectId);
	const person = findProjectPerson(people, waitingOn);
	if (person === null) return { refusal: `${waitingOn} is not on the project. Call list_project_people.` };
	const handOff = { accountId: person.id, kind };
	if (isHandedToWriter(handOff, caller.accountId)) return { refusal: selfHandOffRefusal };
	return { handOff, isSettlingThread: false, askKind };
}
