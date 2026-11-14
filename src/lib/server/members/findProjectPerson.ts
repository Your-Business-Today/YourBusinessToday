import type { Account } from '$lib/server/accounts/accountRecord';

/** Someone among these people, named by their account id, email or name as list_project_people gives it. */
export function findProjectPerson<Person extends Account>(people: Person[], named: string): Person | null {
	const wanted = named.toLowerCase();
	const matches = (person: Person) =>
		person.id === named || person.email.toLowerCase() === wanted || person.name.toLowerCase() === wanted;
	return people.find(matches) ?? null;
}
