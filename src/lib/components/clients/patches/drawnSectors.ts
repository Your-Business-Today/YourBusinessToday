import { initialsOf } from '$lib/data/initialsOf';
import type { DrawnSector } from './createSectorLayer';
import type { PostcodeSector } from '$lib/server/sectors/postcodeSectorRecord';
import type { SectorCoverage } from '$lib/data/sectorCoverage';

/** Pairs each sector with its coverage and the initials of whoever holds it, ready to draw. */
export function drawnSectorsOf(
	sectors: PostcodeSector[],
	coverage: SectorCoverage[],
	accountNames: Record<string, string>
): DrawnSector[] {
	const coverageBySector = new Map(coverage.map((entry) => [entry.sector, entry]));
	return sectors.flatMap((sector) => {
		const entry = coverageBySector.get(sector.sector);
		if (entry === undefined) return [];
		const holder = entry.claimedByAccountId === null ? '' : (accountNames[entry.claimedByAccountId] ?? '');
		return [{ name: sector.sector, sector, coverage: entry, holderInitials: holder === '' ? '' : initialsOf(holder) }];
	});
}
