import { areaEventKinds, type AreaEventKind } from './areaEventKind';

/** Every kind the feed knows, in the order its chips show them. */
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
	areaEventKinds.placeRemoved,
	areaEventKinds.companyIncorporated,
	areaEventKinds.companyDissolved,
	areaEventKinds.filingMade,
	areaEventKinds.officerChanged,
	areaEventKinds.officeMoved,
	areaEventKinds.proposalToStrikeOff,
	areaEventKinds.strikeOffFinal,
	areaEventKinds.insolvencyOpened,
	areaEventKinds.indicatorChanged
];

export function parseAreaEventKind(value: unknown): AreaEventKind | null {
	return areaEventKindOrder.find((kind) => kind === value) ?? null;
}
