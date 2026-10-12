import type { Patch } from '$lib/server/patches/patchRecord';
import type { Premises } from './premisesRecord';

export const noSuchPremises = 'No premises with that id is in this patch. Call list_patch_premises to see them.';

/** Why the premises cannot be worked from this patch, or null when it is one of the patch's own. */
export function validatePremisesInPatch(premises: Premises | null, patch: Patch): string | null {
	if (premises === null || !patch.outcodes.includes(premises.outcode)) return noSuchPremises;
	return null;
}
