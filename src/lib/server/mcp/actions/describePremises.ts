import { formatBritishDate } from '$lib/data/britishDate';
import { premisesSourceLabels } from '$lib/data/foodHygieneRules';
import type { Premises } from '$lib/server/premises/premisesRecord';

export const longestPremisesAnswer = 200;

export function describePremisesList(premises: Premises[]): string {
	if (premises.length === 0) return 'No food premises are listed in this patch yet: the nightly sweep loads them from the Food Standards Agency.';
	const shown = premises.slice(0, longestPremisesAnswer);
	const lines = shown.map(describePremisesLine);
	if (premises.length > shown.length) lines.push(`… and ${premises.length - shown.length} more — narrow by sector or newOnly.`);
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
