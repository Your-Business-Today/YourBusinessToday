import { agendaKey, agendaKinds, type AgendaItem } from './agendaItem';
import { accountNameLookup } from '$lib/data/accountNames';
import { countOf } from '$lib/data/countOf';
import { isBugTitle } from '$lib/data/developmentKind';
import type { ChaseItem, ChaseList } from '$lib/server/mcp/actions/chaseList';

/** One item per person who owes the viewer something: who, how much, whether a bug is among it, and the oldest. */
export function agendaFromChase(chase: ChaseList): AgendaItem[] {
	const { items, people } = chase;
	const nameOf = accountNameLookup(people);
	const personIds = [...new Set(items.map((item) => item.personId))];
	return personIds.map((personId) => {
		const owed = items.filter((item) => item.personId === personId);
		return chaseItem(personId, nameOf(personId), owed);
	});
}

function chaseItem(personId: string, personName: string, owed: ChaseItem[]): AgendaItem {
	const titles = owed.map(({ subject }) => subject.title);
	const moments = owed.flatMap((item) => item.since ?? []).sort();
	return {
		key: agendaKey('person', personId),
		kind: agendaKinds.chase,
		isBug: titles.some(isBugTitle),
		projectId: null,
		projectName: null,
		subjectKind: null,
		subjectId: null,
		subjectTitle: personName,
		ask: `${countOf(owed.length, 'thing')} wait on ${personName}: ${titles.map((title) => `"${title}"`).join(', ')}`,
		askedById: null,
		since: moments.at(0) ?? null,
		goal: null
	};
}
