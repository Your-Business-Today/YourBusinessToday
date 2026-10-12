import { fail } from '@sveltejs/kit';
import { addSightingAsLead } from './addSightingAsLead';
import { describeSightingOutcome, recordSighting } from './recordSighting';
import { getPatch } from '$lib/server/patches/getPatch';
import { getSighting } from './listSightings';
import { matchOutcomes, matchSightingToRegister } from './matchSightingToRegister';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { validateCompanyNumber } from '$lib/data/prospectRules';
import { validateSighting } from './validateSighting';
import type { SightingSeed } from '$lib/data/sightingRules';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

const noSuchSightingMessage = 'That sighting could not be found.';

export function readSightingSeed(formData: FormData): SightingSeed {
	const read = (field: string) => String(formData.get(field) ?? '').trim();
	return {
		sector: read('sector').toUpperCase(),
		businessName: read('businessName'),
		address: read('address'),
		postcode: read('postcode'),
		companyNumber: read('companyNumber'),
		website: read('website'),
		sourceUrl: read('sourceUrl'),
		sourceKind: read('sourceKind'),
		whatWasSeen: read('whatWasSeen')
	};
}

export const sightingFormActions = {
	recordSighting: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const patch = await getPatch(locals.supabase, String(formData.get('patchId') ?? ''));
		if (patch === null) return fail(404, { message: 'That patch could not be found.' });
		const seed = readSightingSeed(formData);
		const refusal = validateSighting(seed);
		if (refusal !== null) return fail(400, { message: refusal });
		const outcome = await recordSighting(locals.supabase, seed, patch.id, user.id);
		return { message: describeSightingOutcome(outcome, seed) };
	},
	addSightingAsLead: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const sighting = await getSighting(locals.supabase, String(formData.get('sightingId') ?? ''));
		if (sighting === null) return fail(404, { message: noSuchSightingMessage });
		const outcome = await addSightingAsLead(locals.supabase, sighting, user.id);
		const verb = outcome.wasAlreadyListed ? 'is already on the register' : 'added as a lead';
		return { message: `${sighting.businessName} ${verb}.`, clientId: outcome.clientId };
	},
	matchSighting: async ({ locals, request }: StaffFormEvent) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const sighting = await getSighting(locals.supabase, String(formData.get('sightingId') ?? ''));
		if (sighting === null) return fail(404, { message: noSuchSightingMessage });
		const companyNumber = String(formData.get('companyNumber') ?? '').trim().toUpperCase();
		const notANumber = validateCompanyNumber(companyNumber);
		if (notANumber !== null) return fail(400, { message: notANumber });
		const outcome = await matchSightingToRegister(locals.supabase, sighting.id, companyNumber);
		if (outcome.kind === matchOutcomes.notOnRegister) return fail(400, { message: `${companyNumber} is not on the register in any patch.` });
		return { message: `${sighting.businessName} is matched to ${outcome.registeredName} (${companyNumber}).` };
	}
};
