export type LegalSection = {
	heading: string;
	paragraphs: string[];
	listItems?: string[];
	links?: LegalLink[];
};

export type LegalLink = {
	label: string;
	href: string;
};

export type LegalDocument = {
	title: string;
	metaDescription: string;
	lastUpdatedOn: string;
	sections: LegalSection[];
};
