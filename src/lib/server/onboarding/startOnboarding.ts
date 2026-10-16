import { addOrganisationMember } from '$lib/server/organisations/addOrganisationMember';
import { getContactForAccount } from '$lib/server/clients/getContactsForClient';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { addSignUpLead, type SignUpAccount } from './addSignUpLead';
import { isOrganisationNameTaken, organisationForClient } from './organisationForClient';
import { onboardingProjectFor } from './onboardingProjectFor';
import type { OnboardingSignUp } from '$lib/onboarding/onboarding';
import type { Refusal } from '$lib/server/portal/portalFormReading';
import type { SupabaseClient } from '@supabase/supabase-js';

export const businessNameTaken: Refusal = {
	refusal:
		'A business of that name is already with us. Get in touch through the contact page and we will set you up.'
};

type SignUpRequest = { service: SupabaseClient; signUp: OnboardingSignUp; account: SignUpAccount };

/**
 * Signing up makes the business a lead with the person as its contact, an organisation for it with the
 * person as its manager, and an Onboarding project under it. A visitor may not write any of these, so they
 * are written with the service key, once the values are checked; signing up again makes nothing twice.
 */
export async function startOnboarding(
	signUp: OnboardingSignUp,
	account: SignUpAccount
): Promise<Refusal | null> {
	const service = supabaseServiceClient();
	const request = { service, signUp, account };
	const standingContact = await getContactForAccount(service, account.accountId);
	if (standingContact === null) return startNewBusiness(request);
	return continueOnboarding(request, standingContact.clientId);
}

async function startNewBusiness(request: SignUpRequest): Promise<Refusal | null> {
	const { service, signUp, account } = request;
	const isNameTaken = await isOrganisationNameTaken(service, signUp.businessName);
	if (isNameTaken) return businessNameTaken;
	const clientId = await addSignUpLead(service, signUp, account);
	return continueOnboarding(request, clientId);
}

async function continueOnboarding(
	request: SignUpRequest,
	clientId: string
): Promise<Refusal | null> {
	const { service, signUp, account } = request;
	const { accountId } = account;
	const organisationId = await organisationForClient(
		service,
		clientId,
		signUp.businessName,
		accountId
	);
	if (organisationId === null) return businessNameTaken;
	const membership = { organisationId, accountId, isManager: true, addedBy: accountId };
	await addOrganisationMember(service, membership);
	await onboardingProjectFor(service, { organisationId, clientId, accountId });
	return null;
}
