import { areaEventKinds } from './areaEventKind';
import type { AreaEvent } from './areaEvent';

/** Today's score on the ground: sectors searched, businesses sighted, leads added, companies arrived. */
export type AreaFeedScore = { searchedCount: number; sightedCount: number; leadCount: number; arrivedCount: number };

export function scoreAreaFeedToday(events: AreaEvent[], now: Date = new Date()): AreaFeedScore {
	const today = events.filter((event) => isSameDay(new Date(event.createdAt), now));
	const countOf = (...kinds: string[]) => today.filter((event) => kinds.includes(event.kind)).length;
	return {
		searchedCount: countOf(areaEventKinds.sectorSearched),
		sightedCount: countOf(areaEventKinds.sightingRecorded),
		leadCount: countOf(areaEventKinds.sightingBecameLead, areaEventKinds.leadAddedFromRegister, areaEventKinds.leadAddedFromPremises),
		arrivedCount: countOf(areaEventKinds.companyArrived, areaEventKinds.companyMovedIn, areaEventKinds.companyIncorporated)
	};
}

function isSameDay(left: Date, right: Date): boolean {
	return left.toDateString() === right.toDateString();
}
