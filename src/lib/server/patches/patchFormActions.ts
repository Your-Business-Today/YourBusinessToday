import { fail, redirect } from '@sveltejs/kit';
import { createPatch, patchOutcomes, refusalFor, type CreatePatchOutcome } from './createPatch';
import { readPatchSeed, validatePatch, type PatchFields, type PatchSeed } from '$lib/data/patchRules';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

const patchesPage = '/clients/patches';
const postcodesUnreachable = 'The postcode service could not be reached just now — try again in a moment.';
const serviceUnavailable = 503;

export function readPatchFields(formData: FormData): PatchFields {
	return {
		name: String(formData.get('name') ?? ''),
		centrePostcode: String(formData.get('centrePostcode') ?? ''),
		radiusMiles: String(formData.get('radiusMiles') ?? ''),
		sicCodes: String(formData.get('sicCodes') ?? '')
	};
}

/** The postcode service being down costs the save, never the page. */
async function createPatchOrNull(supabase: App.Locals['supabase'], seed: PatchSeed, ownerId: string): Promise<CreatePatchOutcome | null> {
	try {
		return await createPatch(supabase, seed, ownerId);
	} catch (failure) {
		console.error('Patch creation failed', failure);
		return null;
	}
}

export const patchFormActions = {
	createPatch: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const seed = readPatchSeed(readPatchFields(await request.formData()));
		const refusal = validatePatch(seed);
		if (refusal !== null) return fail(400, { message: refusal });
		const outcome = await createPatchOrNull(locals.supabase, seed, user.id);
		if (outcome === null) return fail(serviceUnavailable, { message: postcodesUnreachable });
		const notCreated = refusalFor(outcome, seed);
		if (outcome.kind !== patchOutcomes.created) return fail(400, { message: notCreated });
		redirect(303, `${patchesPage}/${outcome.patchId}`);
	}
};
