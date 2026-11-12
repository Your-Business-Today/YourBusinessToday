import type { NavigationLink } from '$lib/components/site/siteNavigation';

/** The folders of the side bar, in the order it shows them. The unnamed ones are plain links: the top and the rest. */
export const frameGroupOrder = ['top', 'work', 'sales', 'accounts', 'knowledge', 'more'] as const;

export type FrameGroupKey = (typeof frameGroupOrder)[number];

/** A side bar link and the folder it sits in; a link that names none sits at the top. */
export type FrameLink = NavigationLink & { group?: FrameGroupKey };

/** One stretch of the side bar: a named folder that opens and closes, or plain links when it has no label. */
export type FrameSection = { key: FrameGroupKey; label: string | null; links: NavigationLink[] };

const frameGroupLabels: Record<FrameGroupKey, string | null> = {
	top: null,
	work: 'Work',
	sales: 'Sales',
	accounts: 'Accounts',
	knowledge: 'Knowledge',
	more: null
};

const defaultGroup: FrameGroupKey = 'top';

/** The side bar's links gathered into their folders, in the folders' order; an empty folder is left out. */
export function frameSectionsOf(links: FrameLink[]): FrameSection[] {
	return frameGroupOrder
		.map((key) => ({ key, label: frameGroupLabels[key], links: linksInGroup(links, key) }))
		.filter(({ links: sectionLinks }) => sectionLinks.length > 0);
}

function linksInGroup(links: FrameLink[], key: FrameGroupKey): NavigationLink[] {
	return links.filter((link) => (link.group ?? defaultGroup) === key).map(({ href, label }) => ({ href, label }));
}
