import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

/** The names of the people on a project whose accounts are listed, in the project's order. */
export function namesOfPeople(people: ProjectPerson[], accountIds: string[]): string[] {
	return people.filter((person) => accountIds.includes(person.id)).map((person) => person.name);
}
