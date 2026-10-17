import { fail, redirect } from '@sveltejs/kit';
import { formValues, isRefusal } from '$lib/server/portal/portalFormReading';
import { onboardingSignUpLimits } from '$lib/onboarding/onboarding';
import { startOnboarding } from '$lib/server/onboarding/startOnboarding';
import { validateOnboardingSignUp } from '$lib/server/onboarding/validateOnboardingSignUp';
import { connectAtPortal, requireSignUpAccount } from '$lib/server/onboarding/signUpDoor';
import type { Actions, PageServerLoad } from './$types';

const badRequest = 400;
const seeOther = 303;

export const load: PageServerLoad = async ({ locals }) => {
	await requireSignUpAccount(locals);
	return { limits: onboardingSignUpLimits };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const account = await requireSignUpAccount(locals);
		const signUp = validateOnboardingSignUp(formValues(await request.formData()));
		if (isRefusal(signUp)) return fail(badRequest, { message: signUp.refusal });
		const started = await startOnboarding(signUp, account);
		if (isRefusal(started)) return fail(badRequest, { message: started.refusal });
		redirect(seeOther, await connectAtPortal(locals, account, started.clientId));
	}
};
