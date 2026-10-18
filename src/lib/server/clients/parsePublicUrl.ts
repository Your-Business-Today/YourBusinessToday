const acceptedProtocols = ['http:', 'https:'];
const acceptedPorts = ['', '80', '443'];
const privateHostPatterns = [
	/^localhost/i,
	/^127\./,
	/^10\./,
	/^192\.168\./,
	/^172\.(1[6-9]|2\d|3[01])\./,
	/^169\.254\./,
	/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
	/^0\./,
	/^\[/,
	/\.(internal|local)$/i
];

export function parsePublicUrl(candidate: string): URL | null {
	let parsed: URL;
	try {
		parsed = new URL(candidate);
	} catch {
		return null;
	}
	if (!acceptedProtocols.includes(parsed.protocol)) return null;
	if (!acceptedPorts.includes(parsed.port)) return null;
	const isPrivateHost = privateHostPatterns.some((pattern) => pattern.test(parsed.hostname));
	if (isPrivateHost) return null;
	return parsed;
}

export function publicUrlOr(candidate: unknown, fallback: string): string {
	const parsed = parsePublicUrl(String(candidate ?? '').trim());
	if (parsed === null) return fallback;
	return parsed.href;
}

/** Why a web address cannot be kept, or null when it is blank or a public http(s) page. */
export function validatePublicUrl(fieldName: string, candidate: unknown): string | null {
	const address = String(candidate ?? '').trim();
	if (address === '') return null;
	if (parsePublicUrl(address) !== null) return null;
	return `The ${fieldName} must be a public web address, such as https://example.com.`;
}
