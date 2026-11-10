import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { trimmedText } from '$lib/data/trimmedText';

const { mostOpeningAngles, longestOpeningAngle } = companyResearchLimits;

export const openingAnglesRefusal =
	`Give openingAngles as a list of at most ${mostOpeningAngles}, each 1 to ${longestOpeningAngle} characters.`;

/** The opening angles as given, each checked against the length the profile keeps, or the sentence saying what fits. */
export function validateOpeningAngles(value: unknown): string[] | string {
	if (value === undefined || value === null) return [];
	if (!Array.isArray(value) || value.length > mostOpeningAngles) return openingAnglesRefusal;
	const angles = value.map(trimmedText);
	const isEveryAngleKept = angles.every((angle) => angle !== '' && angle.length <= longestOpeningAngle);
	if (!isEveryAngleKept) return openingAnglesRefusal;
	return angles;
}
