import { json } from '@sveltejs/kit';
import { addressRateLimit } from '$lib/server/http/addressRateLimit';
import { registerOauthClient } from '$lib/server/oauth/registerOauthClient';
import {
	validateClientRegistration,
	type RegistrationRefusal
} from '$lib/server/oauth/validateClientRegistration';
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
	const fields = submission as Record<string, unknown>;
	const refusal = validateClientRegistration(fields);
	if (refusal !== null) return registrationRefused(refusal);
	const registration = await registerOauthClient(fields);
	return json(registration, { status: created });
};

function registrationRefused(refusal: RegistrationRefusal): Response {
	return json(
		{ error: refusal.error, error_description: refusal.description },
		{ status: badRequest }
	);
}
