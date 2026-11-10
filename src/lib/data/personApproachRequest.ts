import type { PersonToResearch } from './personResearchRequest';

/** What a staff member says to their own Claude, so it drafts the first approach to the person and saves it on them. */
export function personApproachRequest(person: PersonToResearch): string {
	return (
		`Draft the first approach to ${person.name} (person ${person.id} on the Your Business Today People ` +
		'register): an opening message and a call plan. Read what the register holds on them, their ' +
		'companies and the research with read_person, show me the draft, then save it with save_person_approach.'
	);
}
