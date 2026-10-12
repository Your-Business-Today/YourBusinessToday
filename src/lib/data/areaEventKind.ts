/** What can happen on the ground a patch covers, as the feed names it. */
export type AreaEventKind =
	| 'sector_claimed'
	| 'sector_searched'
	| 'sighting_recorded'
	| 'sighting_became_lead'
	| 'lead_added_from_register'
	| 'company_arrived'
	| 'company_moved_in'
	| 'company_left'
	| 'status_changed'
	| 'accounts_category_changed'
	| 'accounts_overdue'
	| 'charge_registered'
	| 'holding_company_over_trading'
	| 'observation_recorded';

export const areaEventKinds = {
	sectorClaimed: 'sector_claimed',
	sectorSearched: 'sector_searched',
	sightingRecorded: 'sighting_recorded',
	sightingBecameLead: 'sighting_became_lead',
	leadAddedFromRegister: 'lead_added_from_register',
	companyArrived: 'company_arrived',
	companyMovedIn: 'company_moved_in',
	companyLeft: 'company_left',
	statusChanged: 'status_changed',
	accountsCategoryChanged: 'accounts_category_changed',
	accountsOverdue: 'accounts_overdue',
	chargeRegistered: 'charge_registered',
	holdingCompanyOverTrading: 'holding_company_over_trading',
	observationRecorded: 'observation_recorded'
} as const;

export const areaEventKindOrder: AreaEventKind[] = [
	areaEventKinds.sectorClaimed,
	areaEventKinds.sectorSearched,
	areaEventKinds.sightingRecorded,
	areaEventKinds.sightingBecameLead,
	areaEventKinds.leadAddedFromRegister,
	areaEventKinds.companyArrived,
	areaEventKinds.companyMovedIn,
	areaEventKinds.companyLeft,
	areaEventKinds.statusChanged,
	areaEventKinds.accountsCategoryChanged,
	areaEventKinds.accountsOverdue,
	areaEventKinds.chargeRegistered,
	areaEventKinds.holdingCompanyOverTrading,
	areaEventKinds.observationRecorded
];

/** The short word on the event's pill. */
export const areaEventLabels: Record<AreaEventKind, string> = {
	sector_claimed: 'Claimed',
	sector_searched: 'Searched',
	sighting_recorded: 'Sighted',
	sighting_became_lead: 'Lead',
	lead_added_from_register: 'Lead',
	company_arrived: 'New company',
	company_moved_in: 'Moved in',
	company_left: 'Left',
	status_changed: 'Status',
	accounts_category_changed: 'Accounts',
	accounts_overdue: 'Overdue',
	charge_registered: 'Charge',
	holding_company_over_trading: 'Holding co.',
	observation_recorded: 'Observed'
};

export function parseAreaEventKind(value: unknown): AreaEventKind | null {
	return areaEventKindOrder.find((kind) => kind === value) ?? null;
}
