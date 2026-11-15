import type { PlaceCategoriesMatched, PlaceCategory } from '$lib/server/premises/listPlaceCategories';

const noneListedYet =
	'No trading places are listed in this territory yet. The site loads them from Overture Maps by itself overnight; load_patch_places loads them now.';
const noneMatch =
	'No category of trading place in this territory contains that word. A category is written in the singular, such as real_estate_agent: try a shorter word, or leave it out to see the commonest.';
const noCategoryStated = 'no category stated';

/** The categories one answer lists, a line each starting with the word list_patch_premises takes, saying how many more fit; isNarrowed says whether a word was asked for. */
export function describePlaceCategories({ categories, matchedCount }: PlaceCategoriesMatched, isNarrowed: boolean): string {
	if (categories.length === 0) return isNarrowed ? noneMatch : noneListedYet;
	const lines = categories.map(describeCategoryLine);
	if (matchedCount > categories.length) lines.push(`… and ${matchedCount - categories.length} more categories — give a word, such as agent or salon, to narrow.`);
	return lines.join('\n');
}

function describeCategoryLine({ name, placeCount, withPhoneCount }: PlaceCategory): string {
	const category = name === '' ? noCategoryStated : name;
	return `${category} — ${placeCount} trading place(s) — ${withPhoneCount} with a phone number`;
}
