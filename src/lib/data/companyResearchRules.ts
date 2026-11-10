/** What a staff member's Claude found about a company, as it sent it: checked by validateCompanyResearch before anything is written. */
export type CompanyResearchFindings = {
	clientId: string | null;
	name: string;
	website: string;
	sourceUrl: string;
	summary: string;
	industry: string;
	location: string;
	postcode: string;
	headcountBand: string;
	companyNumber: string;
	openingAngles: string[];
	people: ResearchedPersonFinding[];
};

/** A person a public page names at the company, with the page they are named on. */
export type ResearchedPersonFinding = { name: string; role: string; sourceUrl: string };

/** The limits on what research may write to a client, its contacts and their people, stated once. */
export const companyResearchLimits = {
	longestName: 160,
	longestWebsite: 300,
	longestSourceUrl: 500,
	longestSummary: 2000,
	longestIndustry: 120,
	longestLocation: 160,
	mostOpeningAngles: 4,
	longestOpeningAngle: 300,
	mostPeople: 20,
	longestPersonName: 160,
	longestPersonRole: 160
} as const;
