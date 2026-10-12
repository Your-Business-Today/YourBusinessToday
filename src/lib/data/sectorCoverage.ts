/** What the map tints a sector: nobody has been over it, someone holds it, someone has, or that was too long ago. */
export type CoverageState = 'unsearched' | 'claimed' | 'searched' | 'stale';

export const coverageStateOrder: CoverageState[] = ['unsearched', 'claimed', 'searched', 'stale'];

export const coverageStateLabels: Record<CoverageState, string> = {
	unsearched: 'Not searched yet',
	claimed: 'Claimed',
	searched: 'Searched',
	stale: 'Searched over 90 days ago'
};

export const coverageStaleDays = 90;

const millisecondsInADay = 86_400_000;

/** A sector with what a person last did in it: the only things coverage is derived from. */
export type SectorCoverage = {
	sector: string;
	state: CoverageState;
	latestSearchedAt: string | null;
	searchCount: number;
	claimedByAccountId: string | null;
};

export type CoverageCounts = Record<CoverageState, number> & { total: number };

export function coverageStateOf(latestSearchedAt: string | null, claimedByAccountId: string | null, today: Date): CoverageState {
	if (claimedByAccountId !== null) return 'claimed';
	if (latestSearchedAt === null) return 'unsearched';
	const ageInDays = (today.getTime() - new Date(latestSearchedAt).getTime()) / millisecondsInADay;
	return ageInDays > coverageStaleDays ? 'stale' : 'searched';
}

export function countCoverage(coverage: SectorCoverage[]): CoverageCounts {
	const counts: CoverageCounts = { unsearched: 0, claimed: 0, searched: 0, stale: 0, total: coverage.length };
	for (const entry of coverage) counts[entry.state] += 1;
	return counts;
}

/** The sectors most in need of a visit: never searched first, then the longest ago. */
export function byMostNeeded(first: SectorCoverage, second: SectorCoverage): number {
	const firstTime = first.latestSearchedAt === null ? 0 : new Date(first.latestSearchedAt).getTime();
	const secondTime = second.latestSearchedAt === null ? 0 : new Date(second.latestSearchedAt).getTime();
	return firstTime - secondTime;
}
