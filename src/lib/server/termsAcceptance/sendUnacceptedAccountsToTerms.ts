import { redirect } from '@sveltejs/kit';
import { currentTermsVersion } from '$lib/data/termsVersion';
import { hasAcceptedTerms } from './termsAcceptances';
import { isOpenBeforeAcceptingTerms } from './pathsOpenBeforeAcceptance';
import { acceptancePageFor } from './termsReturnPath';

const seeOther = 303;

/** A signed-in account that has not accepted the terms in force reaches the terms and nothing else: every other page sends it to accept them. */
export async function sendUnacceptedAccountsToTerms(locals: App.Locals, url: URL): Promise<void> {
	if (locals.isAwaitingAccess === true) return;
	if (isOpenBeforeAcceptingTerms(url.pathname)) return;
	const { user } = await locals.safeGetSession();
	if (user === null) return;
	const isAccepted = await hasAcceptedTerms(locals.supabase, {
		accountId: user.id,
		termsVersion: currentTermsVersion
	});
	if (isAccepted) return;
	redirect(seeOther, acceptancePageFor(url));
}
