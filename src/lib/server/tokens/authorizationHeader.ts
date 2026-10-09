export const authorizationSchemes = { bearer: 'bearer', basic: 'basic' } as const;

/** What follows the scheme in the Authorization header, or null when the header carries another scheme or none. */
export function credentialsForScheme(request: Request, scheme: string): string | null {
	const header = request.headers.get('authorization') ?? '';
	const prefix = `${scheme} `;
	const isScheme = header.toLowerCase().startsWith(prefix);
	if (!isScheme) return null;
	return header.slice(prefix.length).trim();
}
