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
