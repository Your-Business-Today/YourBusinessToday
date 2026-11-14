import type { Director } from '$lib/server/companiesHouse/directorRecord';
import type { SignificantControl } from '$lib/server/companiesHouse/significantControlRecord';

/** A director is the same person as a significant-control entry when surname, first forename and month and year of birth all agree. */
export function isSamePerson(director: Director, entry: SignificantControl): boolean {
	const hasBirth = director.birthYear !== 0 && entry.birthYear !== 0;
	if (!hasBirth) return false;
	const isSameName = director.surname === entry.surname && director.forename === entry.forename;
	const isSameBirth = director.birthMonth === entry.birthMonth && director.birthYear === entry.birthYear;
	return isSameName && isSameBirth;
}
