import { addressRateLimit } from '$lib/server/http/addressRateLimit';

export const tooManyEmailsMessage = 'That was a lot of attempts — try again in a few minutes.';

const tenMinutesInMilliseconds = 10 * 60 * 1000;

/** How many sign-up and reset emails one address may ask the site to send in ten minutes. */
export const emailSendAllowance = addressRateLimit({
	allowance: 5,
	windowMilliseconds: tenMinutesInMilliseconds
});
