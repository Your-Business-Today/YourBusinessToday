/** Where a contract pack stands, from prepared to signed by both sides (migration 0284). */
export const contractPackStages = ['drafted', 'sent', 'viewed', 'commented', 'signed_by_client', 'countersigned'] as const;

export type ContractPackStage = (typeof contractPackStages)[number];

export const contractPackStageWords: Record<ContractPackStage, string> = {
	drafted: 'Drafted',
	sent: 'Sent',
	viewed: 'Viewed by the client',
	commented: 'Commented on by the client',
	signed_by_client: 'Signed by the client',
	countersigned: 'Countersigned'
};

/** The limits on a pack, mirrored by the checks on migration 0284's columns. */
export const contractPackLimits = {
	mostDocuments: 20,
	mostClauses: 20,
	longestTemplateSlug: 80,
	longestBlankLabel: 160,
	longestBlankValue: 2000
} as const;

/** The section of the organisation's documents a pack's documents are kept in. */
export const contractPackSection = 'Contracts';

/** A pack as it is asked for: whose, which templates, which optional clauses, and the blanks written in. */
export type ContractPackRequest = {
	organisationId: string;
	documentSlugs: string[];
	clauseSlugs: string[];
	writtenValues: Record<string, string>;
};
