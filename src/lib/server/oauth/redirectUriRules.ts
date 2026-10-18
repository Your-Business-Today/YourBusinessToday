export const mostRedirectUris = 10;

const secureProtocol = 'https:';
const loopbackProtocol = 'http:';
const loopbackHosts = ['localhost', '127.0.0.1', '[::1]'];

/** A redirect URI is https on any host, or plain http on a loopback host. */
export function isAcceptableRedirectUri(uri: string): boolean {
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
