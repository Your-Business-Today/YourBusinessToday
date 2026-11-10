import { ageBandLabels, ageBands, genderLabels, genders } from './audienceBands';
import type { AudienceRow } from './audienceRow';

/** The people of one age band, or of one gender, a campaign reached, and their part of everyone it reached. */
export type AudienceShare = { key: string; label: string; reach: number; clicks: number; shareOfReach: number };

/** The audience by age band, youngest first, leaving out the bands nobody was reached in. */
export function audienceByAgeBand(rows: AudienceRow[]): AudienceShare[] {
	return ageBands.map((band) => shareOf(band, ageBandLabels[band], rows, (row) => row.ageBand === band)).filter(isReached);
}

/** The audience by gender, leaving out a gender nobody was reached in. */
export function audienceByGender(rows: AudienceRow[]): AudienceShare[] {
	return genders.map((gender) => shareOf(gender, genderLabels[gender], rows, (row) => row.gender === gender)).filter(isReached);
}

function shareOf(key: string, label: string, rows: AudienceRow[], isInGroup: (row: AudienceRow) => boolean): AudienceShare {
	const everyone = reachOf(rows);
	const group = rows.filter(isInGroup);
	const reach = reachOf(group);
	const clicks = group.reduce((sum, row) => sum + row.clicks, 0);
	const shareOfReach = everyone === 0 ? 0 : reach / everyone;
	return { key, label, reach, clicks, shareOfReach };
}

function reachOf(rows: AudienceRow[]): number {
	return rows.reduce((sum, row) => sum + row.reach, 0);
}

function isReached(share: AudienceShare): boolean {
	return share.reach > 0 || share.clicks > 0;
}
