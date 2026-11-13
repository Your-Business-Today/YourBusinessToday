import type { SalesStanding } from '$lib/data/salesLeaderboard';

const nothingCounted = 'Nobody on the staff has brought anything in on this organisation\'s registers yet.';

/** The leaderboard as lines, the most won first: who, how many they brought in, and how many are open, won and lost. */
export function describeSalesStandings(standings: SalesStanding[]): string {
	if (standings.length === 0) return nothingCounted;
	return standings.map(describeStanding).join('\n');
}

function describeStanding(standing: SalesStanding, index: number): string {
	const counts = `${standing.broughtIn} brought in — ${standing.open} open, ${standing.won} won, ${standing.lost} lost`;
	return `${index + 1}. ${standing.name}: ${counts}`;
}
