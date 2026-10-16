import { affiliatePersonWithClient } from '$lib/server/clients/affiliatePersonWithClient';
import { createClient } from '$lib/server/clients/createClient';
import { addPerson } from '$lib/server/people/addPerson';
import type { LeadSource } from '$lib/data/leadSources';
import type { OnboardingSignUp } from '$lib/onboarding/onboarding';
import type { SupabaseClient } from '@supabase/supabase-js';

export type SignUpAccount = { accountId: string; emailAddress: string };

const signUpSource: LeadSource = 'sign_up';

/** A new, unowned lead for the business, with the person signing up as its primary contact and its portal administrator. */
export async function addSignUpLead(
	service: SupabaseClient,
	signUp: OnboardingSignUp,
	account: SignUpAccount
): Promise<string> {
	const lead = { name: signUp.businessName, website: '', ownerId: null, source: signUpSource };
	const clientId = await createClient(service, lead, account.accountId);
	const { personId } = await addPerson(service, {
		name: signUp.personName,
		email: account.emailAddress,
		phone: '',
		seniority: '',
		leadSource: signUpSource
	});
	await affiliatePersonWithClient(service, { personId, clientId, role: '', isPrimary: true });
	await linkAccountAsAdministrator(service, clientId, personId, account.accountId);
	return clientId;
}

async function linkAccountAsAdministrator(
	service: SupabaseClient,
	clientId: string,
	personId: string,
	accountId: string
): Promise<void> {
	const { error } = await service
		.from('client_contacts')
		.update({ account_id: accountId, is_portal_administrator: true })
		.eq('client_id', clientId)
		.eq('person_id', personId);
	if (error) throw error;
}
