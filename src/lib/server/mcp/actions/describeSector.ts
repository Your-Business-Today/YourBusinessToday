import { accountNameLookup } from '$lib/data/accountNames';
import { coverageStateLabels, type SectorCoverage } from '$lib/data/sectorCoverage';
import { formatBritishDate } from '$lib/data/britishDate';
import { searchSourceLabels } from '$lib/data/searchSources';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { PostcodeSector } from '$lib/server/sectors/postcodeSectorRecord';
import type { RecordedSectorSearch } from '$lib/server/sectors/sectorSearchRecord';
import type { BuildingReading } from '$lib/server/buildings/readSectorBuildings';
import type { SectorReading } from '$lib/server/sectors/readSector';

export const noSuchSector = 'No sector of that name is in this patch: list_patch_sectors names them.';

export function describeSectorList(sectors: PostcodeSector[]): string {
	if (sectors.length === 0) return 'No sectors are loaded for this patch yet: the Code-Point Open loader fills them.';
	return sectors.map((sector) => `${sector.sector} — ${sector.unitPostcodeCount} postcodes`).join('\n');
}

export function describeCoverageList(coverage: SectorCoverage[], accounts: Account[]): string {
	if (coverage.length === 0) return 'Every sector of this patch has been searched within ninety days.';
	const nameOf = accountNameLookup(accounts);
	return coverage.map((entry) => describeCoverageLine(entry, nameOf)).join('\n');
}

function describeCoverageLine(entry: SectorCoverage, nameOf: (accountId: string) => string): string {
	const when = entry.latestSearchedAt === null ? 'never searched' : `last searched ${formatBritishDate(entry.latestSearchedAt)}`;
	const holder = entry.claimedByAccountId === null ? '' : ` — claimed by ${nameOf(entry.claimedByAccountId)}`;
	return `${entry.sector} — ${coverageStateLabels[entry.state]} — ${when}${holder}`;
}

export function describeSectorInFull(reading: SectorReading): string {
	const { sector, coverage, searches, companies } = reading;
	const nameOf = accountNameLookup(reading.accounts);
	return [
		`${sector.sector} — ${sector.unitPostcodeCount} postcodes — ${companies.length} companies registered here`,
		coverage === null ? 'Not a sector of this patch.' : describeCoverageLine(coverage, nameOf),
		'',
		'Searches:',
		searches.length === 0 ? 'None yet.' : searches.map((search) => describeSearchLine(search, nameOf)).join('\n'),
		'',
		'Buildings, the largest first:',
		describeBuildings(reading.buildings)
	].join('\n');
}

function describeBuildings(buildings: BuildingReading[]): string {
	if (buildings.length === 0) return 'None loaded for this sector yet: the buildings loader fills them.';
	const unknown = buildings.filter((entry) => isNothingKnown(entry)).length;
	const lines = buildings.map(describeBuildingLine);
	lines.push(`${unknown} of these have nothing known in or beside them yet.`);
	return lines.join('\n');
}

function isNothingKnown(entry: BuildingReading): boolean {
	const { knownNearby } = entry;
	return knownNearby.length === 0;
}

function describeBuildingLine(entry: BuildingReading): string {
	const { building, knownNearby } = entry;
	const known = knownNearby.length === 0 ? 'nothing known in or beside it' : `in or beside it: ${knownNearby.join(', ')}`;
	const postcode = building.nearestPostcode === '' ? 'no postcode near' : `nearest postcode ${building.nearestPostcode}, ${building.postcodeDistanceMetres ?? 0} m`;
	return `${building.uprnCount} addressable places, ${building.areaSquareMetres} m² — ${known} — ${postcode}`;
}

function describeSearchLine(search: RecordedSectorSearch, nameOf: (accountId: string) => string): string {
	const who = nameOf(search.searchedByAccountId);
	return `${formatBritishDate(search.searchedAt)} — ${who} searched ${searchSourceLabels[search.source]}: ${search.foundCount} found — ${search.summary}`;
}
