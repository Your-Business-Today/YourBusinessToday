import { radiusOrder, type RadiusMiles } from './mapRadii';
import { isSicCode, readSicCodeList } from './sicCodes';
import { postcodeIn } from './postcode';

/** What a patch is made of, as typed: checked by validatePatch before anything is saved. */
export type PatchSeed = { name: string; centrePostcode: string; radiusMiles: number; sicCodes: string[] };

/** The four fields as they arrive from a form or a connector call. */
export type PatchFields = { name: string; centrePostcode: string; radiusMiles: string; sicCodes: string };

export const longestPatchName = 80;

export const patchNeedsName = 'A patch needs a name.';
export const patchNeedsPostcode = 'A patch needs a centre postcode, such as KT1 1EU.';
export const patchRadiusRefusal = `A patch radius is ${radiusOrder.join(', ')} miles and nothing else.`;

export function readPatchSeed(fields: PatchFields): PatchSeed {
	return {
		name: fields.name.trim(),
		centrePostcode: postcodeIn(fields.centrePostcode),
		radiusMiles: Number(fields.radiusMiles),
		sicCodes: readSicCodeList(fields.sicCodes)
	};
}

/** Why the patch cannot be saved as it stands, or null when every value fits its column. */
export function validatePatch(seed: PatchSeed): string | null {
	const { name, centrePostcode, radiusMiles, sicCodes } = seed;
	if (name === '') return patchNeedsName;
	if (name.length > longestPatchName) return `The patch name is at most ${longestPatchName} characters.`;
	if (centrePostcode === '') return patchNeedsPostcode;
	if (!isPatchRadius(radiusMiles)) return patchRadiusRefusal;
	const notACode = sicCodes.find((code) => !isSicCode(code));
	if (notACode !== undefined) return `${notACode} is not a SIC code: a SIC code is five digits.`;
	return null;
}

export function isPatchRadius(radius: number): radius is RadiusMiles {
	return radiusOrder.some((candidate) => candidate === radius);
}
