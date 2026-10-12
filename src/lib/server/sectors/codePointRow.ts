import { postcodeIn, sectorOf } from '$lib/data/postcode';
import { toCoordinates } from '$lib/data/britishNationalGrid';
import type { Coordinates } from '$lib/data/distance';

/** One unit postcode as Code-Point Open places it, by sector. */
export type UnitPostcodePoint = { postcode: string; sector: string } & Coordinates;

const fieldsInARow = 10;
const postcodeField = 0;
const qualityField = 1;
const eastingsField = 2;
const northingsField = 3;
const noPositionQuality = '90';

/** A row of a Code-Point Open area file, or null for a row that is not one or carries no position. */
export function readUnitPostcodePoint(record: string[]): UnitPostcodePoint | null {
	if (record.length !== fieldsInARow || record[qualityField] === noPositionQuality) return null;
	const postcode = postcodeIn(record[postcodeField]);
	const eastings = Number(record[eastingsField]);
	const northings = Number(record[northingsField]);
	if (postcode === '' || Number.isNaN(eastings) || Number.isNaN(northings)) return null;
	const sector = sectorOf(postcode);
	if (sector === '') return null;
	return { postcode, sector, ...toCoordinates({ eastings, northings }) };
}
