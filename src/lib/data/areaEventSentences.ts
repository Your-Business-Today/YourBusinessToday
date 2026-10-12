import { areaEventKinds, type AreaEventKind } from './areaEventKind';
import type { AreaEvent } from './areaEvent';

type Sentence = (who: string, event: AreaEvent) => string;

/** "James searched KT1 1: 14 found, 5 already registered": one sentence shape per kind, given who did it. */
export const areaEventSentences: Record<AreaEventKind, Sentence> = {
	[areaEventKinds.sectorClaimed]: (who, event) => `${who} claimed ${event.sector}`,
	[areaEventKinds.sectorSearched]: (who, event) => `${who} searched ${event.sector}: ${event.detail}`,
	[areaEventKinds.sightingRecorded]: (who, event) => `${who} sighted ${event.detail} in ${event.sector}`,
	[areaEventKinds.sightingBecameLead]: (who, event) => `${who} added ${event.detail} as a lead from a sighting in ${event.sector}`,
	[areaEventKinds.leadAddedFromRegister]: (who, event) => `${who} added ${event.detail} as a lead from the register in ${event.sector}`,
	[areaEventKinds.companyArrived]: (who, event) => `${who} saw ${event.detail} newly registered in ${event.sector}`,
	[areaEventKinds.companyMovedIn]: (who, event) => `${who} saw ${event.detail} move its registered office into ${event.sector}`,
	[areaEventKinds.companyLeft]: (who, event) => `${who} no longer carries ${event.detail} in ${event.sector}`,
	[areaEventKinds.statusChanged]: (who, event) => `${who} saw a status change: ${event.detail}`,
	[areaEventKinds.accountsCategoryChanged]: (who, event) => `${who} saw an accounts change: ${event.detail}`,
	[areaEventKinds.accountsOverdue]: (who, event) => `${who} saw accounts fall overdue: ${event.detail}`,
	[areaEventKinds.chargeRegistered]: (who, event) => `${who} saw a charge registered: ${event.detail}`,
	[areaEventKinds.holdingCompanyOverTrading]: (who, event) => `${who} saw a holding company form: ${event.detail}`,
	[areaEventKinds.observationRecorded]: (who, event) => `${who} noted ${event.detail}`,
	[areaEventKinds.premisesOpened]: (who, event) => `${who} registered ${event.detail} in ${event.sector}`,
	[areaEventKinds.premisesReinspected]: (who, event) => `${who} re-inspected ${event.detail}`,
	[areaEventKinds.premisesClosed]: (who, event) => `${who} no longer lists ${event.detail}`,
	[areaEventKinds.premisesChangedHands]: (who, event) => `${who} saw ${event.detail}`,
	[areaEventKinds.leadAddedFromPremises]: (who, event) => `${who} added ${event.detail} as a lead from the food premises in ${event.sector}`,
	[areaEventKinds.accountsFiled]: (who, event) => `${who} says ${event.detail}`,
	[areaEventKinds.figuresRead]: (who, event) => `${who} read ${event.detail}`,
	[areaEventKinds.windingUpPetitioned]: (who, event) => `${who} published ${event.detail}`,
	[areaEventKinds.administrationOpened]: (who, event) => `${who} published ${event.detail}`,
	[areaEventKinds.liquidatorAppointed]: (who, event) => `${who} published ${event.detail}`,
	[areaEventKinds.placeArrived]: (who, event) => `${who} lists ${event.detail} in ${event.sector}`,
	[areaEventKinds.placeRemoved]: (who, event) => `${who} removed ${event.detail}`
};
