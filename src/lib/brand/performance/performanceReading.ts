/** The figures a platform counts on a reading, each kept in a whole-number column of its own (migration 0179). */
export const countedFigures = ['views', 'watchSeconds', 'likes', 'comments', 'shares', 'saves', 'clicks', 'conversions'] as const;

export type CountedFigure = (typeof countedFigures)[number];

export type FigureCounts = Record<CountedFigure, number>;

/** One day's figures for one medium, for a piece of the brand's content, one of its campaigns, or both. */
export type PerformanceReading = FigureCounts & {
	mediumPath: string;
	observedOn: string;
	contentPieceId: string | null;
	campaignId: string | null;
	spendPence: number;
};

/** Readings checked against their columns, for an organisation's brand, and who recorded them. */
export type ReadingsToKeep = {
	organisationId: string;
	accountId: string;
	readings: PerformanceReading[];
};

/** What a medium's readings add up to: the counts, the spend, and the likes, comments, shares and saves together. */
export type MediumPerformance = FigureCounts & {
	mediumPath: string;
	spendPence: number;
	engagements: number;
};

export const engagementFigures: CountedFigure[] = ['likes', 'comments', 'shares', 'saves'];
