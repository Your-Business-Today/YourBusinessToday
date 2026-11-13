/** Someone on one of an organisation's products, as the Tasks page names them. */
export type TeamPerson = { id: string; name: string };

/** Everyone on any of the products, once each, in the order first met. */
export function teamPeopleOf(peopleByProduct: Record<string, TeamPerson[]>): TeamPerson[] {
	const peopleById = new Map(Object.values(peopleByProduct).flat().map((person) => [person.id, person]));
	return [...peopleById.values()].map(({ id, name }) => ({ id, name }));
}
