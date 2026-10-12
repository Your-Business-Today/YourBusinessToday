import type { FoodAuthority } from './foodAuthorityRecord';
import type { SweptAuthority } from '$lib/server/premises/readSweptAuthorities';
import type { WatchStart } from '$lib/server/watch/watchSource';

/** The authorities whose file moved since it was last read, in code order, picking up after the one a cut-off run finished. */
export function authoritiesToSweep(matched: FoodAuthority[], swept: Map<string, SweptAuthority>, start: WatchStart): FoodAuthority[] {
	const resumeAfter = start.wasLastRunFinished ? '' : start.resumeMarker;
	return matched
		.filter((authority) => authority.code > resumeAfter)
		.filter((authority) => hasMoved(authority, swept.get(authority.code) ?? null))
		.sort((first, second) => first.code.localeCompare(second.code));
}

function hasMoved(authority: FoodAuthority, lastSweep: SweptAuthority | null): boolean {
	if (lastSweep === null || lastSweep.sweptAt === null) return true;
	return authority.publishedOn !== lastSweep.publishedOn;
}
