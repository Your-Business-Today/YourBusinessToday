import type { CoverageState } from '$lib/data/sectorCoverage';

/** How a sector is drawn for each state of its coverage. */
export type SectorTone = { colourToken: string; fillOpacity: number; isDashed: boolean };

export const sectorTones: Record<CoverageState, SectorTone> = {
	unsearched: { colourToken: '--color-chalk', fillOpacity: 0.04, isDashed: false },
	claimed: { colourToken: '--color-caution', fillOpacity: 0.25, isDashed: false },
	searched: { colourToken: '--color-go', fillOpacity: 0.3, isDashed: false },
	stale: { colourToken: '--color-go', fillOpacity: 0.12, isDashed: true }
};

export const selectedSectorColourToken = '--color-signal';
export const sectorDrawRadiusMetres = 350;
export const sectorOutlineWeight = 1;
export const selectedSectorOutlineWeight = 3;
export const staleDashPattern = '6 6';
