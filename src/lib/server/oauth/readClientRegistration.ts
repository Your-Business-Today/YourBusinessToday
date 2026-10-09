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

const defaultClientName = 'An MCP client';
const longestClientName = 200;
const mostRedirectUris = 10;
const loopbackHosts = ['localhost', '127.0.0.1', '[::1]'];

export function readClientRegistration(
	submission: Record<string, unknown>
): ClientRegistrationRequest | null {
	const redirectUris = readRedirectUris(submission.redirect_uris);
	if (redirectUris === null) return null;
	return {
		clientName: parseClientName(submission.client_name),
		redirectUris,
		authenticationMethod: readAuthenticationMethod(submission.token_endpoint_auth_method)
	};
}

export function needsClientSecret(method: ClientAuthenticationMethod): boolean {
	return method !== 'none';
}

function parseClientName(value: unknown): string {
	const name = String(value ?? '').trim();
	if (name === '') return defaultClientName;
	return name.slice(0, longestClientName);
}

/**
 * A method we do not support is answered with one we do, which RFC 7591
 * allows; the client reads the method back from the response.
 */
function readAuthenticationMethod(value: unknown): ClientAuthenticationMethod {
	const requested = supportedClientAuthenticationMethods.find((method) => method === value);
	return requested ?? 'none';
}

function readRedirectUris(value: unknown): string[] | null {
	if (!Array.isArray(value) || value.length === 0) return null;
	const uris = value.map(String).filter(isAcceptableRedirectUri).slice(0, mostRedirectUris);
	if (uris.length === 0) return null;
	return uris;
}

const secureProtocol = 'https:';
const loopbackProtocol = 'http:';

function isAcceptableRedirectUri(uri: string): boolean {
	const parsed = parseUrl(uri);
	if (parsed === null) return false;
	if (parsed.protocol === secureProtocol) return true;
	return parsed.protocol === loopbackProtocol && loopbackHosts.includes(parsed.hostname);
}

function parseUrl(uri: string): URL | null {
	try {
		return new URL(uri);
	} catch {
		return null;
	}
}
