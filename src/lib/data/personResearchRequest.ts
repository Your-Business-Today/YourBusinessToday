/** The person a staff member wants researched, as the People register holds them. */
export type PersonToResearch = { id: string; name: string };

/** What a staff member says to their own Claude, so it researches the person and saves the findings to the register. */
export function personResearchRequest(person: PersonToResearch): string {
	return (
		`Research ${person.name} (person ${person.id} on the Your Business Today People register). ` +
		'Read what the register holds on them and their companies with read_person, find their public ' +
		'business presence, show me what you find, then save it with save_person_research.'
	);
}
