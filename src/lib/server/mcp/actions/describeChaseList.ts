import { accountNameLookup } from '$lib/data/accountNames';
import { countOf } from '$lib/data/countOf';
import { excerpt } from './describeOwedTasks';
import { formatBritishDate } from '$lib/data/britishDate';
import type { ChaseItem, ChaseList } from './chaseList';

type NameOf = (accountId: string) => string;

export const chaseHeading = '# Who to chase';
export const nobodyToChase =
	'Nobody: no question on your projects waits on anyone else, and nothing you asked for is with someone else.';

/** The people the viewer waits on, most items first, each with the answers and the work awaited from them. */
export function describeChaseList(chase: ChaseList, viewerId: string): string[] {
	const { items, people: accounts } = chase;
	if (items.length === 0) return [chaseHeading, nobodyToChase];
	const nameOf = accountNameLookup(accounts);
	const itemsByPerson = groupByPerson(items);
	const people = [...itemsByPerson.keys()].sort(byMostItems(itemsByPerson));
	const totals = `${countOf(items.length, 'item')} waiting on ${peopleCount(people.length)}.`;
	const sections = people.flatMap((personId) => {
		const personItems = itemsByPerson.get(personId) ?? [];
		return personSection(nameOf(personId), personItems, nameOf, viewerId);
	});
	return [chaseHeading, totals, '', ...sections];
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

function personSection(personName: string, items: ChaseItem[], nameOf: NameOf, viewerId: string): string[] {
	const answers = items.filter((item) => item.reason === 'answer');
	const work = items.filter((item) => item.reason === 'work');
	return [
		`## ${personName} (${items.length})`,
		...listed('Waiting on an answer from them', answers.map((item) => answerLine(item, nameOf, viewerId))),
		...listed('Work you asked for that is with them', work.map(subjectWhere)),
		''
	];
}

function listed(heading: string, lines: string[]): string[] {
	if (lines.length === 0) return [];
	return [`${heading} (${lines.length}):`, ...lines.map((line) => `- ${line}`)];
}

function answerLine(item: ChaseItem, nameOf: NameOf, viewerId: string): string {
	const asker = item.askedById === viewerId ? 'You' : nameOf(item.askedById ?? '');
	const asked = `${asker} asked on ${formatBritishDate(item.since ?? '')}`;
	const question = item.question === null ? '' : `: ${excerpt(item.question)}`;
	return `${subjectWhere(item)}. ${asked}${question}`;
}

function subjectWhere(item: ChaseItem): string {
	const { kind, title, projectName, id } = item.subject;
	return `"${title}" on ${projectName} (${kind} id: ${id})`;
}
