import { clientEventLabels } from '$lib/data/clientEventLabels';
import { clientStageLabels } from '$lib/data/clientLifecycle';
import { formatBritishDate } from '$lib/data/britishDate';
import { seniorityLabels, warmthLabels } from '$lib/data/contactProfileFields';
import { summariseEventDetail } from '$lib/data/eventDetailSummary';
import type { PersonEvent } from '$lib/server/people/getPersonEventsForClients';
import type { PersonSummary } from '$lib/server/people/getPeople';

export const nobodyOnTheRegister = 'Nobody is on the People register yet. add_person puts someone on it.';

/** The People register as its page shows it: everyone, by name, with their standing and the stages of their companies. */
export function describePeopleList(people: PersonSummary[]): string {
	if (people.length === 0) return nobodyOnTheRegister;
	return people.map(describePersonLine).join('\n');
}

function describePersonLine(person: PersonSummary): string {
	return [
		person.name,
		seniorityLabels[person.seniority],
		warmthLabels[person.warmth],
		person.isDecisionMaker ? 'decision maker' : null,
		describeNextAction(person),
		describeCompanyStages(person),
		`person ${person.id}`
	]
		.filter((part) => part !== null)
		.join(' — ');
}

function describeNextAction(person: PersonSummary): string {
	if (person.nextAction === '') return 'nothing planned';
	if (person.nextActionDue === null) return person.nextAction;
	return `${person.nextAction} by ${formatBritishDate(person.nextActionDue)}`;
}

function describeCompanyStages(person: PersonSummary): string {
	const { companyStages } = person;
	if (companyStages.length === 0) return 'no companies yet';
	return `companies: ${companyStages.map((stage) => clientStageLabels[stage]).join(', ')}`;
}

/** What happened at the companies a person sits on, newest first, as the person's page shows under History. */
export function describePersonHistory(events: PersonEvent[]): string {
	if (events.length === 0) return 'Nothing recorded yet.';
	return events.map(describeEventLine).join('\n');
}

function describeEventLine(event: PersonEvent): string {
	const detail = summariseEventDetail(event.detail);
	const what = detail === '' ? clientEventLabels[event.kind] : `${clientEventLabels[event.kind]} — ${detail}`;
	return `${formatBritishDate(event.createdAt)} — ${event.clientName} — ${what}`;
}
