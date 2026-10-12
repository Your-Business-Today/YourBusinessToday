/** What can happen on the ground a patch covers, as the feed names it. */
export type AreaEventKind =
	| 'sector_claimed'
	| 'sector_searched'
	| 'sighting_recorded'
	| 'sighting_became_lead'
	| 'lead_added_from_register';

export const areaEventKinds = {
	sectorClaimed: 'sector_claimed',
	sectorSearched: 'sector_searched',
	sightingRecorded: 'sighting_recorded',
	sightingBecameLead: 'sighting_became_lead',
	leadAddedFromRegister: 'lead_added_from_register'
} as const;

export const areaEventKindOrder: AreaEventKind[] = [
	areaEventKinds.sectorClaimed,
	areaEventKinds.sectorSearched,
	areaEventKinds.sightingRecorded,
	areaEventKinds.sightingBecameLead,
	areaEventKinds.leadAddedFromRegister
];

/** The short word on the event's pill. */
export const areaEventLabels: Record<AreaEventKind, string> = {
	sector_claimed: 'Claimed',
	sector_searched: 'Searched',
	sighting_recorded: 'Sighted',
	sighting_became_lead: 'Lead',
	lead_added_from_register: 'Lead'
};

export function parseAreaEventKind(value: unknown): AreaEventKind | null {
	return areaEventKindOrder.find((kind) => kind === value) ?? null;
}
