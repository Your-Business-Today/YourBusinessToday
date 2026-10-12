import { fail } from '@sveltejs/kit';
import { claimSector } from './claimSector';
import { describeClaimOutcome, describeHandOverOutcome, describeSearchOutcome } from './sectorOutcomeSentences';
import { getPatch } from '$lib/server/patches/getPatch';
import { handSectorTo } from './handSectorTo';
import { parseSearchSource } from '$lib/data/searchSources';
import { recordSectorSearch, searchOutcomes } from './recordSectorSearch';
import { releaseClaim } from './claimSector';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { validateSectorSearch, type SectorSearchSeed } from '$lib/data/sectorSearchRules';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

const noSuchPatchMessage = 'That patch could not be found.';

export function readSectorSearchSeed(formData: FormData): SectorSearchSeed {
	return {
		sector: String(formData.get('sector') ?? '').trim().toUpperCase(),
		source: String(formData.get('source') ?? '').trim(),
		foundCount: Number(formData.get('foundCount') ?? ''),
		summary: String(formData.get('summary') ?? '').trim()
	};
}

export const sectorFormActions = {
	markSearched: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const patch = await getPatch(locals.supabase, String(formData.get('patchId') ?? ''));
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const seed = readSectorSearchSeed(formData);
		const refusal = validateSectorSearch(seed);
		const source = parseSearchSource(seed.source);
		if (refusal !== null || source === null) return fail(400, { message: refusal });
		const outcome = await recordSectorSearch(locals.supabase, patch, { ...seed, source }, user.id);
		const message = await describeSearchOutcome(locals.supabase, outcome, seed.sector);
		if (outcome.kind !== searchOutcomes.recorded) return fail(400, { message });
		return { message };
	},
	claimSector: async ({ locals, request }: StaffFormEvent) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const patch = await getPatch(locals.supabase, String(formData.get('patchId') ?? ''));
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const sector = String(formData.get('sector') ?? '').trim().toUpperCase();
		const outcome = await claimSector(locals.supabase, patch, sector, user.id);
		return { message: await describeClaimOutcome(locals.supabase, outcome, sector) };
	},
	releaseSector: async ({ locals, request }: StaffFormEvent) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const patch = await getPatch(locals.supabase, String(formData.get('patchId') ?? ''));
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const sector = String(formData.get('sector') ?? '').trim().toUpperCase();
		await releaseClaim(locals.supabase, patch.id, sector);
		return { message: `${sector} is released.` };
	},
	handSectorTo: async ({ locals, request }: StaffFormEvent) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const patch = await getPatch(locals.supabase, String(formData.get('patchId') ?? ''));
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const sector = String(formData.get('sector') ?? '').trim().toUpperCase();
		const outcome = await handSectorTo(locals.supabase, patch, sector, String(formData.get('email') ?? ''));
		return { message: describeHandOverOutcome(outcome, sector) };
	}
};
