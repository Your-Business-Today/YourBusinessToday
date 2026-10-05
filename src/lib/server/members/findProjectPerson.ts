import type { ProjectPerson } from './projectPersonRecord';

/** Someone on the project, named by their account id, email or name as list_project_people gives it. */
export function findProjectPerson(people: ProjectPerson[], named: string): ProjectPerson | null {
	const wanted = named.toLowerCase();
	const matches = (person: ProjectPerson) =>
		person.id === named || person.email.toLowerCase() === wanted || person.name.toLowerCase() === wanted;
	return people.find(matches) ?? null;
}
