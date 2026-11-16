import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import type { FiledEmailGiven } from '$lib/data/filedEmailRules';
import { validateEmailFacts } from './validateEmailFacts';

export { filedEmailRefusals } from './validateEmailFacts';

const noPersonNamed = '';

/** The email as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateFiledEmail(input: Record<string, unknown>): FiledEmailGiven | string {
	const clientId = trimmedText(input.clientId);
	const clientRefusal = validateRecordId('clientId', clientId);
	if (clientRefusal !== null) return clientRefusal;
	const personId = personNamedIn(input);
	if (personId.refusal !== null) return personId.refusal;
	const facts = validateEmailFacts(input);
	if (typeof facts === 'string') return facts;
	return { clientId, personId: personId.id, ...facts };
}

function personNamedIn(input: Record<string, unknown>): { id: string | null; refusal: string | null } {
	const personIdText = trimmedText(input.personId);
	if (personIdText === noPersonNamed) return { id: null, refusal: null };
	return { id: personIdText, refusal: validateRecordId('personId', personIdText) };
}
