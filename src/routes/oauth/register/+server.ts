import { json } from '@sveltejs/kit';
import { addressRateLimit } from '$lib/server/http/addressRateLimit';
import { registerOauthClient } from '$lib/server/oauth/registerOauthClient';
import type { RequestHandler } from './$types';

const created = 201;
const badRequest = 400;
const tooManyRequests = 429;
const oneHourInMilliseconds = 60 * 60 * 1000;
const registrationsPerAddress = addressRateLimit({
	allowance: 10,
	windowMilliseconds: oneHourInMilliseconds
});

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientAddress = getClientAddress();
	if (!registrationsPerAddress.isAllowedFrom(clientAddress)) {
		return json(
			{ error: 'too_many_registrations', error_description: 'Try again in an hour' },
			{ status: tooManyRequests }
		);
	}
	const submission = await request.json().catch(() => null);
	if (submission === null || typeof submission !== 'object') {
		return json({ error: 'invalid_client_metadata' }, { status: badRequest });
	}
	const registration = await registerOauthClient(submission as Record<string, unknown>);
	if (registration === null) {
		return json(
			{ error: 'invalid_redirect_uri', error_description: 'At least one https redirect URI is required' },
			{ status: badRequest }
		);
	}
	return json(registration, { status: created });
};
