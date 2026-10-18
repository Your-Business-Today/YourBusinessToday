import { protectedResourcePath } from './oauthSettings';

/** The connector lives on the same site as the portal, so its address is the site's own. */
export function connectorAddressFor(url: URL): string {
	return `${url.origin}${protectedResourcePath}`;
}
