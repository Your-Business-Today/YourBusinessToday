import { textOf, type Refusal } from '$lib/server/portal/portalFormReading';
import { validateSetUpPerson } from './validateClientSetUp';
import type { ClientContact } from '$lib/server/clients/clientContactRecord';
import { setUpFormFields, type SetUpPerson } from '$lib/onboarding/onboarding';

/** The people ticked on the client's list, in its order, then the new person typed in, if anyone was. */
export function readSetUpPeople(formData: FormData, contacts: ClientContact[]): (SetUpPerson | Refusal)[] {
	const chosenIds = new Set(formData.getAll(setUpFormFields.chosenContact).map(String));
	const chosen = contacts.filter((contact) => chosenIds.has(contact.id));
	const listedPeople = chosen.map((contact) => validateSetUpPerson(contact.name, contact.email));
	return [...listedPeople, ...readNewPerson(formData)];
}

function readNewPerson(formData: FormData): (SetUpPerson | Refusal)[] {
	const name = textOf(formData, setUpFormFields.newPersonName);
	const email = textOf(formData, setUpFormFields.newPersonEmail);
	const isLeftBlank = name === '' && email === '';
	if (isLeftBlank) return [];
	return [validateSetUpPerson(name, email)];
}
