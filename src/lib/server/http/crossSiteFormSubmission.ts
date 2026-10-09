import { githubWebhookPath } from '$lib/server/deploys/githubWebhookPath';
import { tokenPath } from '$lib/server/oauth/oauthSettings';

const formMediaTypes = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];
const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * SvelteKit's own origin check is switched off in svelte.config.js (it trusts
 * every origin) because it cannot exempt a path: OAuth clients and GitHub's
 * webhook post server-to-server with no Origin header at all. Every other form
 * keeps exactly the protection the framework gave it.
 */
const pathsOpenToOtherOrigins = [tokenPath, githubWebhookPath];

export function isForbiddenCrossSiteForm(request: Request, url: URL): boolean {
	if (pathsOpenToOtherOrigins.includes(url.pathname)) return false;
	if (!mutatingMethods.includes(request.method)) return false;
	if (!hasFormBody(request)) return false;
	return request.headers.get('origin') !== url.origin;
}

function hasFormBody(request: Request): boolean {
	const contentType = request.headers.get('content-type') ?? '';
	const mediaType = contentType.split(';')[0].trim().toLowerCase();
	return formMediaTypes.includes(mediaType);
}
