import { oauthErrors } from './oauthErrors';
import { longestClientName } from './readClientRegistration';
import { isAcceptableRedirectUri, mostRedirectUris } from './redirectUriRules';
import { validateTextColumn } from './textColumnRules';

export type RegistrationRefusal = { error: string; description: string };

export const redirectUrisRequired = 'At least one https redirect URI is required.';

/** Why the registration cannot be stored as sent, or null when oauth_clients can hold every value of it. */
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
	const textRefusal = validateTextColumn('client_name', clientName);
	if (textRefusal !== null) return textRefusal;
	const isTooLong = String(clientName).trim().length > longestClientName;
	if (isTooLong) return `The client_name is at most ${longestClientName} characters.`;
	return null;
}

export function validateRedirectUris(redirectUris: unknown): string | null {
	if (!Array.isArray(redirectUris) || redirectUris.length === 0) return redirectUrisRequired;
	if (redirectUris.length > mostRedirectUris) return `A client registers at most ${mostRedirectUris} redirect URIs.`;
	const refusals = redirectUris.map(validateRedirectUri);
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function validateRedirectUri(redirectUri: unknown): string | null {
	const textRefusal = validateTextColumn('redirect URI', redirectUri);
	if (textRefusal !== null) return textRefusal;
	const uri = String(redirectUri);
	if (isAcceptableRedirectUri(uri)) return null;
	return `The redirect URI ${uri} must be https, or plain http on a loopback host.`;
}
