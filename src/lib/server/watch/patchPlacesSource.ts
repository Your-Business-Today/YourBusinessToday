import { loadOverturePlacesForPatch } from '$lib/server/places/loadOverturePlaces';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { WatchSource } from './watchSource';

const patchPlacesSourcePrefix = 'patch_places:';

/** One territory's load of its trading places from Overture Maps, logged under its own name so each territory says which release it holds. */
export function patchPlacesSource(patch: Patch): WatchSource {
	return {
		name: `${patchPlacesSourcePrefix}${patch.id}`,
		summary: `loads the trading places of ${patch.name} from the newest release of Overture Maps`,
		run: (supabase, start, progress) => loadOverturePlacesForPatch(supabase, patch, start, progress)
	};
}
