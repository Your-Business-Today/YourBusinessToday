import { fail } from '@sveltejs/kit';
import { noSuchPatchMessage, openPatchForm } from '$lib/server/patches/openPatchForm';
import { claimSector } from './claimSector';
import { describeClaimOutcome, describeHandOverOutcome, describeSearchOutcome } from './sectorOutcomeSentences';
import { handSectorTo } from './handSectorTo';
import { parseSearchSource } from '$lib/data/searchSources';
import { recordSectorSearch, searchOutcomes } from './recordSectorSearch';
import { releaseClaim } from './claimSector';
import { validateSectorSearch, type SectorSearchSeed } from '$lib/data/sectorSearchRules';
import type { StaffFormEvent } from '$lib/server/people/personFormActions';

function readSector(formData: FormData): string {
	return String(formData.get('sector') ?? '').trim().toUpperCase();
}

export function readSectorSearchSeed(formData: FormData): SectorSearchSeed {
	return {
		sector: readSector(formData),
		source: String(formData.get('source') ?? '').trim(),
		foundCount: Number(formData.get('foundCount') ?? ''),
		summary: String(formData.get('summary') ?? '').trim()
	};
}

export const sectorFormActions = {
	markSearched: async (event: StaffFormEvent) => {
		const { locals } = event;
		const { user, formData, patch } = await openPatchForm(event);
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
	claimSector: async (event: StaffFormEvent) => {
		const { locals } = event;
		const { user, formData, patch } = await openPatchForm(event);
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const sector = readSector(formData);
		const outcome = await claimSector(locals.supabase, patch, sector, user.id);
		return { message: await describeClaimOutcome(locals.supabase, outcome, sector) };
	},
	releaseSector: async (event: StaffFormEvent) => {
		const { locals } = event;
		const { formData, patch } = await openPatchForm(event);
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const sector = readSector(formData);
		await releaseClaim(locals.supabase, patch.id, sector);
		return { message: `${sector} is released.` };
	},
	handSectorTo: async (event: StaffFormEvent) => {
		const { locals } = event;
		const { formData, patch } = await openPatchForm(event);
		if (patch === null) return fail(404, { message: noSuchPatchMessage });
		const sector = readSector(formData);
		const outcome = await handSectorTo(locals.supabase, patch, sector, String(formData.get('email') ?? ''));
		return { message: describeHandOverOutcome(outcome, sector) };
	}
};
