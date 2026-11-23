import { fail, redirect } from '@sveltejs/kit';
import { currentTermsVersion, termsAddresses } from '$lib/data/termsVersion';
import { requireUser } from '$lib/server/auth/requireUser';
import { problemWithAcceptance } from '$lib/server/termsAcceptance/readAcceptanceForm';
import { hasAcceptedTerms, recordTermsAcceptance } from '$lib/server/termsAcceptance/termsAcceptances';
import { readReturnPath, returnPathField } from '$lib/server/termsAcceptance/termsReturnPath';
import type { Actions, PageServerLoad } from './$types';

const badRequestStatus = 400;
const seeOther = 303;

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (user === null) redirect(seeOther, termsAddresses.terms);
	const returnPath = readReturnPath(url.searchParams.get(returnPathField));
	const acceptance = { accountId: user.id, termsVersion: currentTermsVersion };
	if (await hasAcceptedTerms(locals.supabase, acceptance)) redirect(seeOther, returnPath);
	return { termsVersion: currentTermsVersion, returnPath };
};

export const actions: Actions = {
	accept: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const formData = await request.formData();
		const problem = problemWithAcceptance(formData);
		if (problem !== null) return fail(badRequestStatus, { message: problem });
		const acceptance = { accountId: user.id, termsVersion: currentTermsVersion };
		await recordTermsAcceptance(locals.supabase, acceptance);
		redirect(seeOther, readReturnPath(String(formData.get(returnPathField) ?? '')));
	}
};
