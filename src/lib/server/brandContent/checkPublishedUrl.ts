import { ContentLimits } from '$lib/brand/content/contentLimits';
import { parsePublicUrl } from '$lib/server/clients/parsePublicUrl';

export type PublishedUrlCheck = { publishedUrl: string } | { problem: string };

const { publishedUrlCharacters } = ContentLimits;

/** The public link to where the piece went out, checked against its column, or why it cannot be kept. */
export function checkPublishedUrl(given: unknown): PublishedUrlCheck {
	if (typeof given !== 'string')
		return {
			problem: 'publishedUrl is the public link to the piece, such as https://…'
		};
	const publishedUrl = given.trim();
	if (publishedUrl.length > publishedUrlCharacters) {
		return {
			problem: `publishedUrl is ${publishedUrl.length} characters; keep it to ${publishedUrlCharacters}`
		};
	}
	if (parsePublicUrl(publishedUrl) === null) {
		return {
			problem: 'publishedUrl must be a public web address, such as https://www.tiktok.com/@brand/video/1'
		};
	}
	return { publishedUrl };
}
