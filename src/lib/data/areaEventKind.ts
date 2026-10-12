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
	| 'observation_recorded'
	| 'premises_opened'
	| 'premises_reinspected'
	| 'premises_closed'
	| 'premises_changed_hands'
	| 'lead_added_from_premises'
	| 'accounts_filed'
	| 'figures_read'
	| 'winding_up_petitioned'
	| 'administration_opened'
	| 'liquidator_appointed'
	| 'place_arrived'
	| 'place_removed';

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
	observationRecorded: 'observation_recorded',
	premisesOpened: 'premises_opened',
	premisesReinspected: 'premises_reinspected',
	premisesClosed: 'premises_closed',
	premisesChangedHands: 'premises_changed_hands',
	leadAddedFromPremises: 'lead_added_from_premises',
	accountsFiled: 'accounts_filed',
	figuresRead: 'figures_read',
	windingUpPetitioned: 'winding_up_petitioned',
	administrationOpened: 'administration_opened',
	liquidatorAppointed: 'liquidator_appointed',
	placeArrived: 'place_arrived',
	placeRemoved: 'place_removed'
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
	areaEventKinds.observationRecorded,
	areaEventKinds.premisesOpened,
	areaEventKinds.premisesReinspected,
	areaEventKinds.premisesClosed,
	areaEventKinds.premisesChangedHands,
	areaEventKinds.leadAddedFromPremises,
	areaEventKinds.accountsFiled,
	areaEventKinds.figuresRead,
	areaEventKinds.windingUpPetitioned,
	areaEventKinds.administrationOpened,
	areaEventKinds.liquidatorAppointed,
	areaEventKinds.placeArrived,
	areaEventKinds.placeRemoved
];

export function parseAreaEventKind(value: unknown): AreaEventKind | null {
	return areaEventKindOrder.find((kind) => kind === value) ?? null;
}
