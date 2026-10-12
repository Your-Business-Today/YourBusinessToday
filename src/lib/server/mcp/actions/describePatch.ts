import { formatBritishDate } from '$lib/data/britishDate';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { PatchWithCentre } from '$lib/server/patches/listPatchesWithCentres';

export const noSuchPatch = 'No patch has that id. Call list_patches to see them.';

export function describePatchList(patches: PatchWithCentre[]): string {
	if (patches.length === 0) return 'No patches yet — create_patch starts one from a postcode and a radius.';
	return patches.map(describePatchLine).join('\n');
}

function describePatchLine(patch: PatchWithCentre): string {
	return [
		`${patch.name} — ${describeReach(patch)}`,
		patch.outcodes.join(' '),
		`worked by ${patch.ownerName}`,
		`id ${patch.id}`
	].join(' — ');
}

export function describePatchInFull(patch: Patch, ownerName: string): string {
	const { sicCodes, outcodes } = patch;
	return [
		`${patch.name} — id ${patch.id}`,
		`Centre ${patch.centrePostcode}, ${describeReach(patch)}`,
		`Outcodes: ${outcodes.join(', ')}`,
		sicCodes.length === 0 ? 'Every SIC code' : `SIC codes: ${sicCodes.join(', ')}`,
		`Worked by ${ownerName}, since ${formatBritishDate(patch.createdAt)}`,
		`Map: /clients/patches/${patch.id}`
	].join('\n');
}

function describeReach(patch: Patch): string {
	const unit = patch.radiusMiles === 1 ? 'mile' : 'miles';
	return `${patch.radiusMiles} ${unit} around ${patch.centrePostcode}`;
}
