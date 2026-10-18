import { oauthErrors } from './oauthErrors';
import { validateTextColumn } from './textColumnRules';

export type RegistrationRefusal = { error: string; description: string };

/**
 * Why oauth_clients cannot hold the submission, or null when it can: client_name is text and
 * redirect_uris is text[]. The redirect URI rules themselves stay with readClientRegistration.
 */
export function validateClientRegistration(
	submission: Record<string, unknown>
): RegistrationRefusal | null {
	const nameRefusal = validateClientName(submission.client_name);
	if (nameRefusal !== null) return { error: oauthErrors.invalidClientMetadata, description: nameRefusal };
	const redirectRefusal = validateRedirectUris(submission.redirect_uris);
	if (redirectRefusal !== null) return { error: oauthErrors.invalidRedirectUri, description: redirectRefusal };
	return null;
}

export function validateClientName(clientName: unknown): string | null {
	if (clientName === undefined || clientName === null) return null;
	return validateTextColumn('client_name', clientName);
}

export function validateRedirectUris(redirectUris: unknown): string | null {
	if (!Array.isArray(redirectUris)) return null;
	const refusals = redirectUris.map((redirectUri) => validateTextColumn('redirect URI', redirectUri));
	return refusals.find((refusal) => refusal !== null) ?? null;
}
