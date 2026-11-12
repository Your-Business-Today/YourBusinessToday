import type { ClientStage } from './clientLifecycle';

/** What a record on a sales register counts as for whoever brought it in: still being worked, won, or lost. */
export type SalesOutcome = 'open' | 'won' | 'lost';

export const salesOutcomeOfStage: Record<ClientStage, SalesOutcome> = {
	lead: 'open',
	prospect: 'open',
	client: 'won',
	dormant: 'won',
	lost: 'lost'
};

/** A record on a sales register as the leaderboard counts it: who brought it in and where it stands. */
export type SalesRecord = { ownerId: string | null; stage: ClientStage };

/** Someone on the staff who can bring business in. */
export type Salesperson = { id: string; name: string };

/** One line of the leaderboard: everything a person brought in, and how much of it is open, won and lost. */
export type SalesStanding = {
	personId: string | null;
	name: string;
	broughtIn: number;
	open: number;
	won: number;
	lost: number;
};

export const nobodyNamed = 'Nobody named';

/** Every salesperson's standing, the most won first; records naming nobody on the staff share one line of their own. */
export function salesStandingsOf(records: SalesRecord[], salespeople: Salesperson[]): SalesStanding[] {
	const standings = new Map(salespeople.map((person) => [person.id, emptyStanding(person.id, person.name)]));
	const unnamed = emptyStanding(null, nobodyNamed);
	records.forEach((record) => countInto(standings.get(record.ownerId ?? '') ?? unnamed, record.stage));
	const unnamedLines = unnamed.broughtIn === 0 ? [] : [unnamed];
	return [...standings.values(), ...unnamedLines].sort(mostWonFirst);
}

function emptyStanding(personId: string | null, name: string): SalesStanding {
	return { personId, name, broughtIn: 0, open: 0, won: 0, lost: 0 };
}

function countInto(standing: SalesStanding, stage: ClientStage): void {
	standing.broughtIn += 1;
	standing[salesOutcomeOfStage[stage]] += 1;
}

function mostWonFirst(first: SalesStanding, second: SalesStanding): number {
	const byWon = second.won - first.won;
	if (byWon !== 0) return byWon;
	const byBroughtIn = second.broughtIn - first.broughtIn;
	if (byBroughtIn !== 0) return byBroughtIn;
	return first.name.localeCompare(second.name);
}
