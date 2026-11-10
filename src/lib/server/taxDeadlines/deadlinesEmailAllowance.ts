import { addressRateLimit } from '$lib/server/http/addressRateLimit';

const tenMinutesInMilliseconds = 10 * 60 * 1000;
const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

/** How many deadline emails one visitor may ask the site to send in ten minutes. */
export const deadlinesEmailsPerVisitor = addressRateLimit({
	allowance: 3,
	windowMilliseconds: tenMinutesInMilliseconds
});

/** How many deadline emails one inbox may be sent in a day, whoever asks, so the form cannot be used to flood it. */
export const deadlinesEmailsPerInbox = addressRateLimit({
	allowance: 3,
	windowMilliseconds: oneDayInMilliseconds
});
