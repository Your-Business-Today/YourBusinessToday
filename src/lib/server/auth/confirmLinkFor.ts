import { localDestinationOrDefault } from './localDestination';

export type EmailToken = { hashed_token: string; verification_type: string };

const confirmPath = '/auth/confirm';

/**
 * A link to this site's own confirm page, which checks the token on the server and opens the
 * session there. Supabase's own verify link hands the session back in the URL fragment, which
 * a server-rendered callback never sees.
 */
export function confirmLinkFor(origin: string, token: EmailToken, destination: string | null): string {
	const query = new URLSearchParams({
		token_hash: token.hashed_token,
		type: token.verification_type,
		next: localDestinationOrDefault(destination)
	});
	return `${origin}${confirmPath}?${query}`;
}
