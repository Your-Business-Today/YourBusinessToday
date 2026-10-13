import type { DrawnSector } from './createPatchMap';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import type { Building } from '$lib/server/buildings/buildingRecord';
import type { Coordinates } from '$lib/data/distance';

export type PatchMapProperties<Centre extends Coordinates = Coordinates> = {
	patchId: string;
	centre: Centre;
	radiusMiles: number;
	pins: AreaPin[];
	sectors: DrawnSector[];
	selectedKey: string | null;
	selectedSector: string | null;
	selectedBuildingId: string | null;
	onSelect: (key: string) => void;
	onPickSector: (sector: string) => void;
	onPickBuilding: (building: Building) => void;
};
