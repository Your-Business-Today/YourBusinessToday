const jsonMediaType = 'application/json';
const formMediaType = 'application/x-www-form-urlencoded';
const formPayloadField = 'payload';

/**
 * The event a GitHub delivery carries. GitHub sends it either as a JSON body or,
 * with the webhook's default content type, as a form whose `payload` field holds
 * the JSON; both are read. Null when the body is neither.
 */
export function readGithubWebhookBody(contentType: string | null, body: string): unknown | null {
	const mediaType = mediaTypeOf(contentType);
	if (mediaType === jsonMediaType) return parseJson(body);
	if (mediaType === formMediaType) return parseJson(formPayload(body));
	return null;
}

function mediaTypeOf(contentType: string | null): string {
	return (contentType ?? '').split(';')[0].trim().toLowerCase();
}

function formPayload(body: string): string {
	return new URLSearchParams(body).get(formPayloadField) ?? '';
}

function parseJson(text: string): unknown | null {
	if (text === '') return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}
