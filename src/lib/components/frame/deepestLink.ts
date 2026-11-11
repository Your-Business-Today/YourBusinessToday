import { isAtOrUnder } from './framedPaths';
import type { NavigationLink } from '$lib/components/site/siteNavigation';

/** The link whose section holds the page most closely: Patches, not Clients, for a patch. */
export function deepestLinkAt(links: NavigationLink[], pathname: string): NavigationLink | undefined {
	const holdingLinks = links.filter((link) => isAtOrUnder(pathname, link.href));
	return holdingLinks.sort((first, second) => hrefLengthOf(second) - hrefLengthOf(first))[0];
}

function hrefLengthOf({ href }: NavigationLink): number {
	return href.length;
}
