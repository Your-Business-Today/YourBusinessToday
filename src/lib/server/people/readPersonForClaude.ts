import { fail, type ActionFailure } from '@sveltejs/kit';
import { getPerson, type PersonInFull } from './getPerson';
import { getCompaniesForPerson, type PersonCompany } from './getCompaniesForPerson';
import { isAnthropicConfigured } from '$lib/server/anthropic/isAnthropicConfigured';
import type { StaffFormEvent } from './personFormActions';

type PersonForClaude = { person: PersonInFull; companies: PersonCompany[] };
type Refusal = ActionFailure<{ message: string }>;

const claudeUnavailable = 503;
const badRequest = 400;

export function hasFoundPerson(subject: PersonForClaude | Refusal): subject is PersonForClaude {
	return 'person' in subject;
}

export async function readPersonForClaude({
	locals,
	request
}: StaffFormEvent): Promise<PersonForClaude | Refusal> {
	if (!isAnthropicConfigured()) {
		return fail(claudeUnavailable, { message: 'Claude is not configured on this server.' });
	}
	const formData = await request.formData();
	const person = await getPerson(locals.supabase, String(formData.get('personId') ?? ''));
	if (person === null) return fail(badRequest, { message: 'That person could not be found.' });
	const companies = await getCompaniesForPerson(locals.supabase, person.id);
	return { person, companies };
}
