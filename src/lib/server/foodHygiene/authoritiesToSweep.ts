import type { FoodAuthority } from './foodAuthorityRecord';
import type { SweptAuthority } from '$lib/server/premises/readSweptAuthorities';
import type { WatchStart } from '$lib/server/watch/watchSource';

/**
 * The authorities to read, in code order, picking up after the one a cut-off run finished: one never read, one whose file moved
 * since it was read, and one last read before the newest patch was made, since that reading was not asked for the patch's outcodes.
 */
export function authoritiesToSweep(matched: FoodAuthority[], swept: Map<string, SweptAuthority>, start: WatchStart, newestPatchMadeAt: string | null): FoodAuthority[] {
	const resumeAfter = start.wasLastRunFinished ? '' : start.resumeMarker;
	return matched
		.filter((authority) => authority.code > resumeAfter)
		.filter((authority) => isDueASweep(authority, swept.get(authority.code) ?? null, newestPatchMadeAt))
		.sort((first, second) => first.code.localeCompare(second.code));
}

function isDueASweep(authority: FoodAuthority, lastSweep: SweptAuthority | null, newestPatchMadeAt: string | null): boolean {
	if (lastSweep === null || lastSweep.sweptAt === null) return true;
	const hasFileMoved = authority.publishedOn !== lastSweep.publishedOn;
	if (hasFileMoved) return true;
	if (newestPatchMadeAt === null) return false;
	const sweptAt = Date.parse(lastSweep.sweptAt);
	const patchMadeAt = Date.parse(newestPatchMadeAt);
	return sweptAt < patchMadeAt;
}
