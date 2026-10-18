export type ClientAuthenticationMethod = 'none' | 'client_secret_post' | 'client_secret_basic';

export type ClientRegistrationRequest = {
	clientName: string;
	redirectUris: string[];
	authenticationMethod: ClientAuthenticationMethod;
};

export const supportedClientAuthenticationMethods: ClientAuthenticationMethod[] = [
	'none',
	'client_secret_post',
	'client_secret_basic'
];

export const longestClientName = 200;

const defaultClientName = 'An MCP client';

/** Reads a registration validateClientRegistration has already let through. */
export function readClientRegistration(submission: Record<string, unknown>): ClientRegistrationRequest {
	return {
		clientName: parseClientName(submission.client_name),
		redirectUris: (submission.redirect_uris as string[]).map(String),
		authenticationMethod: readAuthenticationMethod(submission.token_endpoint_auth_method)
	};
}

export function needsClientSecret(method: ClientAuthenticationMethod): boolean {
	return method !== 'none';
}

function parseClientName(value: unknown): string {
	const name = String(value ?? '').trim();
	if (name === '') return defaultClientName;
	return name;
}

/**
 * A method we do not support is answered with one we do, which RFC 7591
 * allows; the client reads the method back from the response.
 */
function readAuthenticationMethod(value: unknown): ClientAuthenticationMethod {
	const requested = supportedClientAuthenticationMethods.find((method) => method === value);
	return requested ?? 'none';
}
