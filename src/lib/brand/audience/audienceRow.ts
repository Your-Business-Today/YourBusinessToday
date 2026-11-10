import type { AgeBand, Gender } from './audienceBands';

/** The figures one band of a campaign's audience carries, each in a column of its own (migration 0180). */
export const audienceFigures = ['reach', 'impressions', 'clicks'] as const;

export type AudienceFigure = (typeof audienceFigures)[number];

export type AudienceCounts = Record<AudienceFigure, number> & { spendPence: number };

/** The people of one age band and gender a campaign reached, as the platform's breakdown gave them. */
export type AudienceRow = AudienceCounts & { ageBand: AgeBand; gender: Gender };

/** One day's breakdown of a campaign's audience, checked against its columns, and who recorded it. */
export type AudienceToKeep = {
	organisationId: string;
	campaignId: string;
	observedOn: string;
	accountId: string;
	rows: AudienceRow[];
};

/** What makes a row the one of its day: its age band and its gender. */
export function audienceRowKey(row: Pick<AudienceRow, 'ageBand' | 'gender'>): string {
	return `${row.ageBand}|${row.gender}`;
}
