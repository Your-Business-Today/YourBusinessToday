import { formatBritishDate } from '$lib/data/britishDate';
import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
import type { Premises } from '$lib/server/premises/premisesRecord';
import type { PremisesMatched } from '$lib/server/premises/listPremisesMatching';

const noneListedYet =
	'No premises are listed in this territory yet. The site loads them by itself overnight: food businesses from the Food Standards Agency and trading places from Overture Maps. load_patch_places loads the trading places now.';
const noneMatch = 'No premises in this territory match that: leave out the sector, source, category or newOnly to see more.';

/** The premises one answer lists, a line each, saying how many more fit what was asked for; isNarrowed says whether anything was asked for. */
export function describePremisesList({ premises, matchedCount }: PremisesMatched, isNarrowed: boolean): string {
	if (premises.length === 0) return isNarrowed ? noneMatch : noneListedYet;
	const lines = premises.map(describePremisesLine);
	if (matchedCount > premises.length) lines.push(`… and ${matchedCount - premises.length} more — narrow by sector, source, category or newOnly.`);
	return lines.join('\n');
}

function describePremisesLine(premises: Premises): string {
	return [
		`${premises.businessName} — ${premises.sector}`,
		premises.businessType === '' ? 'type unknown' : premises.businessType,
		premises.address === '' ? 'no address' : premises.address,
		premises.source === 'places_dataset' ? contactOf(premises) : premises.ratingValue === '' ? 'no rating yet' : `rating ${premises.ratingValue}`,
		`from ${premisesSourceLabels[premises.source]}`,
		`first seen ${formatBritishDate(premises.firstSeenAt)}`,
		premises.clientId === null ? 'not on the register' : `on the register (client ${premises.clientId})`,
		premises.sourceUrl,
		`id ${premises.id}`
	].join(' — ');
}

function contactOf(premises: Premises): string {
	const parts = [premises.website, premises.phone].filter((part) => part !== '');
	return parts.length === 0 ? 'no website or phone' : parts.join(' ');
}
