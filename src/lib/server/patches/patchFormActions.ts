import { fail, redirect } from '@sveltejs/kit';
import { createPatch, patchOutcomes, refusalFor } from './createPatch';
import { readPatchSeed, validatePatch, type PatchFields } from '$lib/data/patchRules';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

const patchesPage = '/clients/patches';

export function readPatchFields(formData: FormData): PatchFields {
	return {
		name: String(formData.get('name') ?? ''),
		centrePostcode: String(formData.get('centrePostcode') ?? ''),
		radiusMiles: String(formData.get('radiusMiles') ?? ''),
		sicCodes: String(formData.get('sicCodes') ?? '')
	};
}

export const patchFormActions = {
	createPatch: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const seed = readPatchSeed(readPatchFields(await request.formData()));
		const refusal = validatePatch(seed);
		if (refusal !== null) return fail(400, { message: refusal });
		const outcome = await createPatch(locals.supabase, seed, user.id);
		const notCreated = refusalFor(outcome, seed);
		if (outcome.kind !== patchOutcomes.created) return fail(400, { message: notCreated });
		redirect(303, `${patchesPage}/${outcome.patchId}`);
	}
};
