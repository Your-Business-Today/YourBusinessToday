import { agendaKindLabels, type AgendaItem } from './agendaItem';
import { countOf } from '$lib/data/countOf';
import { excerpt } from '$lib/server/mcp/actions/describeOwedTasks';
import { formatBritishDate } from '$lib/data/britishDate';
import { goodAnswers, quietMinutesBeforeOpening } from './goodAnswers';
import { outcomesByKind } from './turnOutcome';
import { waitedFor, wholeDaysSince } from '$lib/data/ageInDays';
import type { Agenda } from './buildAgenda';

type NameOf = (accountId: string) => string;
type TurnReading = { agenda: Agenda; nameOf: NameOf; now: Date };

export const nothingToRaise =
	'Nothing needs this person right now on their first three active projects: no ask, job, promise or to-do waits ' +
	'on them, nothing is ready to build, and everything left waits on someone else, directly or through a task that does. ' +
	'Next, any open to-dos for them in a client portal their Claude reaches, one at a time; if there are none, ' +
	'say so in a line. If they ask how a project is doing, call read_project_state.';

/** One turn of the conversation: an opener when it starts afresh, then the one item to raise now and how to record its answer. */
export function describeTurn({ agenda, nameOf, now }: TurnReading): string[] {
	const { items, record } = agenda;
	const [item] = items;
	if (item === undefined) return [nothingToRaise];
	const isFresh = isFreshConversation(record.lastSpokeAt, now);
	const opener = isFresh ? [openerLine(items, record.lastSpokeAt), ''] : [];
	return [...opener, `Item 1 of ${items.length}.`, '', ...itemLines(item, nameOf, now)];
}

function isFreshConversation(lastSpokeAt: string | null, now: Date): boolean {
	if (lastSpokeAt === null) return true;
	const quietMilliseconds = now.getTime() - Date.parse(lastSpokeAt);
	return quietMilliseconds > quietMinutesBeforeOpening * 60_000;
}

function openerLine(items: AgendaItem[], lastSpokeAt: string | null): string {
	const bugCount = items.filter((item) => item.isBug).length;
	const bugs = bugCount === 0 ? '' : `, ${countOf(bugCount, 'bug')} among them`;
	const total = `${countOf(items.length, 'thing')} need them${bugs}`;
	if (lastSpokeAt === null) return `Open in two lines: ${total}.`;
	const newCount = items.filter((item) => (item.since ?? '') > lastSpokeAt).length;
	return `Open in two lines: since they last spoke on ${formatBritishDate(lastSpokeAt)}, ${countOf(newCount, 'new thing')}; ${total}.`;
}

function itemLines(item: AgendaItem, nameOf: NameOf, now: Date): string[] {
	const where = item.projectName === null ? '' : ` on ${item.projectName}`;
	const subject = item.subjectId === null ? '' : ` (${item.subjectKind} id: ${item.subjectId})`;
	return [
		`## ${agendaKindLabels[item.kind]}${item.isBug ? ', a bug' : ''}: "${item.subjectTitle}"${where}${subject}`,
		`- Item key: ${item.key}`,
		`- Why it matters: ${whyItMatters(item, nameOf, now)}`,
		`- The ask: ${excerpt(item.ask === '' ? item.subjectTitle : item.ask)}`,
		`- A good answer: ${goodAnswers[item.kind]}`,
		`- Record it: answer_turn with itemKey ${item.key} and outcome ${outcomesByKind[item.kind].join(', ')}`
	];
}

const bugReason = 'it is a bug, an existing feature not working, so it comes first';

function whyItMatters(item: AgendaItem, nameOf: NameOf, now: Date): string {
	const { isBug, askedById, since } = item;
	const reasons = [
		isBug ? bugReason : null,
		askedById === null ? null : `${nameOf(askedById)} asked`,
		since === null ? null : `waiting ${waitedFor(wholeDaysSince(since, now))}, since ${formatBritishDate(since)}`
	];
	return reasons.filter((reason) => reason !== null).join(', ');
}
