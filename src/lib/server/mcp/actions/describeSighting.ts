import { accountNameLookup } from '$lib/data/accountNames';
import { formatBritishDate } from '$lib/data/britishDate';
import { sightingSourceLabels } from '$lib/data/sightingRules';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { Sighting } from '$lib/server/sightings/sightingRecord';

export const noSuchSighting = 'No sighting has that id. Call list_sightings to see them.';

export function describeSightingList(sightings: Sighting[], accounts: Account[]): string {
	if (sightings.length === 0) return 'No sightings yet in this patch: record_sighting records the first.';
	const nameOf = accountNameLookup(accounts);
	return sightings.map((sighting) => describeSightingLine(sighting, nameOf(sighting.seenByAccountId))).join('\n');
}

function describeSightingLine(sighting: Sighting, seenByName: string): string {
	return [
		`${sighting.businessName} — ${sighting.sector}`,
		sighting.address === '' ? 'no address' : sighting.address,
		sighting.companyNumber === '' ? 'no company number yet' : `company ${sighting.companyNumber}`,
		sighting.clientId === null ? 'not on the register' : `on the register (client ${sighting.clientId})`,
		`seen on ${sightingSourceLabels[sighting.sourceKind]} by ${seenByName}, ${formatBritishDate(sighting.seenAt)}`,
		sighting.sourceUrl,
		`id ${sighting.id}`
	].join(' — ');
}
