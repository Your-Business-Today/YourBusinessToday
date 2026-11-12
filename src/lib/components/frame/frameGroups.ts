import type { LineIconKind } from '$lib/components/site/lineIcons';
import type { NavigationLink } from '$lib/components/site/siteNavigation';

/** The folders of the side bar, in the order it shows them. The unnamed ones are plain links: the top and the rest. */
export const frameGroupOrder = ['top', 'work', 'sales', 'accounts', 'knowledge', 'more'] as const;

export type FrameGroupKey = (typeof frameGroupOrder)[number];

/** A side bar link, the icon it is drawn with, and the folder it sits in; a link that names none sits at the top. */
export type FrameLink = NavigationLink & { icon: LineIconKind; group?: FrameGroupKey };

/** A side bar link as its folder lists it: the folder is already said by where it sits. */
export type FrameSectionLink = NavigationLink & { icon: LineIconKind };

/** A named folder of the side bar: what it is called and the icon it is drawn with. */
export type FrameFolder = { label: string; icon: LineIconKind };

/** One stretch of the side bar: a named folder that opens and closes, or plain links when it has none. */
export type FrameSection = { key: FrameGroupKey; folder: FrameFolder | null; links: FrameSectionLink[] };

const frameFolders: Record<FrameGroupKey, FrameFolder | null> = {
	top: null,
	work: { label: 'Work', icon: 'briefcase' },
	sales: { label: 'Sales', icon: 'handshake' },
	accounts: { label: 'Accounts', icon: 'poundSterling' },
	knowledge: { label: 'Knowledge', icon: 'bookOpen' },
	more: null
};

const defaultGroup: FrameGroupKey = 'top';

/** The side bar's links gathered into their folders, in the folders' order; an empty folder is left out. */
export function frameSectionsOf(links: FrameLink[]): FrameSection[] {
	return frameGroupOrder
		.map((key) => ({ key, folder: frameFolders[key], links: linksInGroup(links, key) }))
		.filter(({ links: sectionLinks }) => sectionLinks.length > 0);
}

function linksInGroup(links: FrameLink[], key: FrameGroupKey): FrameSectionLink[] {
	return links.filter((link) => (link.group ?? defaultGroup) === key).map(({ href, label, icon }) => ({ href, label, icon }));
}
