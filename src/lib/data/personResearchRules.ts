/** A position a public page gives the person, with the page it was read on. */
export type FoundRole = { title: string; organisation: string; sourceUrl: string };

/** A public page worth keeping on the person's record, with a short label such as exampleLinkLabel. */
export type FoundLink = { label: string; url: string };

/** The short label a link is given as the example, wherever a link's label is asked for. */
export const exampleLinkLabel = 'Company site';

/** What a staff member's Claude found about a person, as it sent it: checked by validatePersonResearch before anything is written. */
export type PersonResearchFindings = {
	personId: string;
	summary: string;
	roles: FoundRole[];
	links: FoundLink[];
	sources: string[];
};

/** The limits on what person research may write to the person's note, their links and the ledger, stated once. */
export const personResearchLimits = {
	longestSummary: 2000,
	mostRoles: 10,
	longestRoleTitle: 160,
	longestOrganisation: 160,
	mostLinks: 10,
	longestLinkLabel: 80,
	mostSources: 20,
	longestSourceUrl: 500
} as const;
