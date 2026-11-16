import { env } from '$env/dynamic/private';

export type BeehiivPublication = { apiKey: string; publicationId: string };

const publicationsAddress = 'https://api.beehiiv.com/v2/publications';
const signedUpFrom = 'yourbusiness.today';

/** The beehiiv publication the site hands sign-ups to, or null while its key is not set. */
export function beehiivPublication(): BeehiivPublication | null {
	const apiKey = env.BEEHIIV_API_KEY ?? '';
	const publicationId = env.BEEHIIV_PUBLICATION_ID ?? '';
	if (apiKey === '' || publicationId === '') return null;
	return { apiKey, publicationId };
}

/** The request that subscribes one address to the publication, with beehiiv's welcome email. */
export function beehiivSubscriptionRequest(
	publication: BeehiivPublication,
	email: string
): Request {
	const address = `${publicationsAddress}/${publication.publicationId}/subscriptions`;
	return new Request(address, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${publication.apiKey}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			email,
			reactivate_existing: false,
			send_welcome_email: true,
			utm_source: signedUpFrom
		})
	});
}
