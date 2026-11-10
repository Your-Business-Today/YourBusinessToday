import { clientSetUpLimits, type SetUpPerson } from '$lib/onboarding/onboarding';
import { isEmailShaped } from '$lib/data/emailShape';
import { isRefusal, tooLong, type Refusal } from '$lib/server/portal/portalFormReading';

export const nobodyToSetUp: Refusal = {
	refusal: 'Name at least one person to set the client up with, each with an email address.'
};

const tooManyPeople: Refusal = {
	refusal: `Set a client up with at most ${clientSetUpLimits.mostPeople} people; invite the rest from the portal.`
};

/** One person as typed or chosen, trimmed, or why they cannot be set up as given. */
export function validateSetUpPerson(name: string, email: string): SetUpPerson | Refusal {
	const trimmedName = name.trim();
	const address = email.trim().toLowerCase();
	if (trimmedName === '') return { refusal: 'Give each person’s name.' };
	if (trimmedName.length > clientSetUpLimits.nameLength)
		return tooLong('A name', clientSetUpLimits.nameLength);
	if (address.length > clientSetUpLimits.emailLength)
		return tooLong('An email address', clientSetUpLimits.emailLength);
	if (!isEmailShaped(address))
		return { refusal: `Give ${trimmedName} an email address the invitation can go to.` };
	return { name: trimmedName, email: address };
}

/** The first people, each checked and none twice, or why the set-up cannot go ahead with them. */
export function validateSetUpPeople(readings: (SetUpPerson | Refusal)[]): SetUpPerson[] | Refusal {
	if (readings.length === 0) return nobodyToSetUp;
	if (readings.length > clientSetUpLimits.mostPeople) return tooManyPeople;
	const refusal = readings.find(isRefusal);
	if (refusal !== undefined) return refusal;
	const people = readings as SetUpPerson[];
	const addresses = new Set(people.map((person) => person.email));
	if (addresses.size < people.length) return { refusal: 'Name each person once.' };
	return people;
}
