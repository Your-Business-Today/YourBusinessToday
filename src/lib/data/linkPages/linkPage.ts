export type LinkPageLinkKind = 'website' | 'email' | 'telephone';

export type LinkPageLink = {
	label: string;
	address: string;
	kind: LinkPageLinkKind;
};

export type LinkPage = {
	path: string;
	title: string;
	introduction: string;
	links: LinkPageLink[];
};
