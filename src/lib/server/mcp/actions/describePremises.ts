import { formatBritishDate } from '$lib/data/britishDate';
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
		premises.ratingValue === '' ? 'no rating yet' : `rating ${premises.ratingValue}`,
		`first seen ${formatBritishDate(premises.firstSeenAt)}`,
		premises.clientId === null ? 'not on the register' : `on the register (client ${premises.clientId})`,
		premises.sourceUrl,
		`id ${premises.id}`
	].join(' — ');
}
