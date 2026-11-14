import { pullPatchCompanies } from '$lib/server/register/pullPatchCompanies';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { WatchSource } from './watchSource';

const patchCompaniesSourcePrefix = 'patch_companies:';

/** One patch's pull of its companies from Companies House, logged under its own name so each patch resumes where it stopped. */
export function patchCompaniesSource(patch: Patch): WatchSource {
	return {
		name: `${patchCompaniesSourcePrefix}${patch.id}`,
		summary: `asks Companies House for every active company registered in the outcodes of ${patch.name}`,
		run: (supabase, start, progress) => pullPatchCompanies(supabase, patch, start, progress)
	};
}
