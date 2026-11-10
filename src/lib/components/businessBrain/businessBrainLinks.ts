import type { BusinessBrainLinkRead } from '$lib/server/businessBrain/readBusinessBrainPageLinks';

/** How a related page stands to this one: which way the link points, and why. */
export function linkDirectionWords(link: BusinessBrainLinkRead): string {
	if (link.isFromThisPage) return `Links to · ${link.linkKind}`;
	return `Linked from · ${link.linkKind}`;
}
