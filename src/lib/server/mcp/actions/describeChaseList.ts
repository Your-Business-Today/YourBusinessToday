import { accountNameLookup } from '$lib/data/accountNames';
import { askKinds, defaultAskKind, type AskKind } from '$lib/data/askKind';
import { countOf } from '$lib/data/countOf';
import { excerpt } from './describeOwedTasks';
import { formatBritishDate } from '$lib/data/britishDate';
import type { ChaseItem, ChaseList } from './chaseList';

type NameOf = (accountId: string) => string;
type Section = { heading: string; isIn: (item: ChaseItem) => boolean; line: (item: ChaseItem) => string };

export const chaseHeading = '# Who to chase';
export const nobodyToChase = 'Nobody: no one else on your projects owes an answer, a setup, a test, a task or a promise.';
export const nothingYouAskedFor = 'Nobody: nothing you asked for waits on anyone else.';
const onlyYourAsks = 'Only what you asked for. Leave out onlyWhatIAskedFor to see everything everyone owes.';

/** Everyone who owes something on the viewer's projects, most items first, bugs first, by kind of thing owed. */
export function describeChaseList(chase: ChaseList, viewerId: string): string[] {
	const { items, people: accounts, isOnlyAskedByViewer } = chase;
	const scope = isOnlyAskedByViewer ? [onlyYourAsks] : [];
	if (items.length === 0) return [chaseHeading, ...scope, nobodyLine(isOnlyAskedByViewer)];
	const nameOf = accountNameLookup(accounts);
	const itemsByPerson = groupByPerson(items);
	const people = [...itemsByPerson.keys()].sort(byMostItems(itemsByPerson));
	const totals = `${countOf(items.length, 'item')} waiting on ${peopleCount(people.length)}.`;
	const sectionsFor = sectionsSeenBy(nameOf, viewerId);
	const personSections = people.flatMap((personId) => {
		const personItems = itemsByPerson.get(personId) ?? [];
		return [`## ${nameOf(personId)} (${personItems.length})`, ...sectionsFor.flatMap((section) => listed(section, personItems)), ''];
	});
	return [chaseHeading, ...scope, totals, '', ...personSections];
}

function sectionsSeenBy(nameOf: NameOf, viewerId: string): Section[] {
	const asked = (item: ChaseItem) => answerLine(item, nameOf, viewerId);
	return [
		{ heading: 'Answers to give', isIn: isAskOf(askKinds.information), line: asked },
		{ heading: 'Things to set up', isIn: isAskOf(askKinds.setup), line: asked },
		{ heading: 'Features to test', isIn: isAskOf(askKinds.testing), line: asked },
		{ heading: 'Tasks in their name', isIn: (item) => item.reason === 'work', line: subjectWhere },
		{ heading: 'To-dos they promised', isIn: (item) => item.reason === 'promise', line: promiseLine }
	];
}

function nobodyLine(isOnlyAskedByViewer: boolean): string {
	if (isOnlyAskedByViewer) return nothingYouAskedFor;
	return nobodyToChase;
}

function isAskOf(kind: AskKind) {
	return (item: ChaseItem) => item.reason === 'answer' && (item.askKind ?? defaultAskKind) === kind;
}

function peopleCount(count: number): string {
	if (count === 1) return 'one person';
	return `${count} people`;
}

function groupByPerson(items: ChaseItem[]): Map<string, ChaseItem[]> {
	const itemsByPerson = new Map<string, ChaseItem[]>();
	for (const item of items) itemsByPerson.set(item.personId, [...(itemsByPerson.get(item.personId) ?? []), item]);
	return itemsByPerson;
}

function byMostItems(itemsByPerson: Map<string, ChaseItem[]>) {
	const countFor = (personId: string) => itemsByPerson.get(personId)?.length ?? 0;
	return (left: string, right: string) => countFor(right) - countFor(left);
}

function listed(section: Section, items: ChaseItem[]): string[] {
	const lines = items.filter(section.isIn).map(section.line);
	if (lines.length === 0) return [];
	return [`${section.heading} (${lines.length}):`, ...lines.map((line) => `- ${line}`)];
}

function answerLine(item: ChaseItem, nameOf: NameOf, viewerId: string): string {
	const asker = item.askedById === viewerId ? 'You' : nameOf(item.askedById ?? '');
	const asked = `${asker} asked on ${formatBritishDate(item.since ?? '')}`;
	const question = item.question === null ? '' : `: ${excerpt(item.question)}`;
	return `${subjectWhere(item)}. ${asked}${question}`;
}

function promiseLine(item: ChaseItem): string {
	return `${excerpt(item.question ?? '')}, promised on ${formatBritishDate(item.since ?? '')} for ${subjectWhere(item)}`;
}

function subjectWhere(item: ChaseItem): string {
	const { kind, title, projectName, id } = item.subject;
	return `"${title}" on ${projectName} (${kind} id: ${id})`;
}
