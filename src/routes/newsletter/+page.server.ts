import { fail } from '@sveltejs/kit';
import { addressRateLimit } from '$lib/server/http/addressRateLimit';
import { readNewsletterSignUp } from '$lib/server/newsletter/readNewsletterSignUp';
import { recordNewsletterSignUp } from '$lib/server/newsletter/newsletterSignUps';
import { forwardSignUpsToNewsletter } from '$lib/server/newsletter/forwardSignUpsToNewsletter';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { companyDetails } from '$lib/data/companyDetails';
import type { Actions } from './$types';

const recordingFailedMessage = `We could not sign you up just now. Please try again, or email ${companyDetails.consultingEmail}.`;
const tenMinutesInMilliseconds = 10 * 60 * 1000;
const signUpsPerAddress = addressRateLimit({
	allowance: 5,
	windowMilliseconds: tenMinutesInMilliseconds
});

export const actions: Actions = {
	signUp: async ({ request, getClientAddress }) => {
		const reading = readNewsletterSignUp(await request.formData());
		if ('isHoneypotFilled' in reading) return { isSignedUp: true };
		if ('problem' in reading) return fail(400, { message: reading.problem });
		const clientAddress = getClientAddress();
		if (!signUpsPerAddress.isAllowedFrom(clientAddress)) return { isSignedUp: true };
		try {
			await recordNewsletterSignUp(supabaseServiceClient(), reading.email);
		} catch {
			return fail(500, { message: recordingFailedMessage });
		}
		await forwardKeepingTheSignUp();
		return { isSignedUp: true };
	}
};

async function forwardKeepingTheSignUp(): Promise<void> {
	try {
		await forwardSignUpsToNewsletter(supabaseServiceClient());
	} catch (error) {
		console.warn('Newsletter sign-up kept but not yet handed to beehiiv:', error);
	}
}
