import { localDestinationOrDefault } from '$lib/server/auth/localDestination';
import { termsAddresses } from '$lib/data/termsVersion';

/** The query parameter and form field that carry the page a person was going to when the terms stopped them. */
export const returnPathField = 'then';

/** The acceptance page, carrying the page the person asked for so they arrive there once they have accepted. */
export function acceptancePageFor(url: URL): string {
	const requestedPath = `${url.pathname}${url.search}`;
	const query = new URLSearchParams({ [returnPathField]: requestedPath });
	return `${termsAddresses.accept}?${query}`;
}

/** Only a same-site page is a place to go back to; anything else goes to the front page. */
export function readReturnPath(requested: string | null): string {
	return localDestinationOrDefault(requested);
}
