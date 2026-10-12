import { areaEventActorName } from './areaEventActor';
import { areaEventKinds, type AreaEventKind } from './areaEventKind';

/** One thing that happened in a sector of a patch, as the feed shows it. */
export type AreaEvent = {
	id: string;
	outcode: string;
	sector: string;
	patchId: string | null;
	kind: AreaEventKind;
	companyNumber: string;
	sightingId: string | null;
	clientId: string | null;
	detail: string;
	sourceUrl: string;
	happenedAt: string | null;
	actorAccountId: string | null;
	actorName: string | null;
	createdAt: string;
};

export const areaFeedScopes = { everything: 'everything', mine: 'mine' } as const;

export type AreaFeedScope = (typeof areaFeedScopes)[keyof typeof areaFeedScopes];

export function parseAreaFeedScope(value: unknown): AreaFeedScope {
	if (value === areaFeedScopes.mine) return areaFeedScopes.mine;
	return areaFeedScopes.everything;
}

/** "James searched KT1 1: 14 found, 5 already registered". */
export function areaEventSentence(event: AreaEvent): string {
	const who = areaEventActorName(event);
	const sentences: Record<AreaEventKind, string> = {
		[areaEventKinds.sectorClaimed]: `${who} claimed ${event.sector}`,
		[areaEventKinds.sectorSearched]: `${who} searched ${event.sector}: ${event.detail}`,
		[areaEventKinds.sightingRecorded]: `${who} sighted ${event.detail} in ${event.sector}`,
		[areaEventKinds.sightingBecameLead]: `${who} added ${event.detail} as a lead from a sighting in ${event.sector}`,
		[areaEventKinds.leadAddedFromRegister]: `${who} added ${event.detail} as a lead from the register in ${event.sector}`,
		[areaEventKinds.companyArrived]: `${who} saw ${event.detail} newly registered in ${event.sector}`,
		[areaEventKinds.companyMovedIn]: `${who} saw ${event.detail} move its registered office into ${event.sector}`,
		[areaEventKinds.companyLeft]: `${who} no longer carries ${event.detail} in ${event.sector}`,
		[areaEventKinds.statusChanged]: `${who} saw a status change: ${event.detail}`,
		[areaEventKinds.accountsCategoryChanged]: `${who} saw an accounts change: ${event.detail}`,
		[areaEventKinds.accountsOverdue]: `${who} saw accounts fall overdue: ${event.detail}`,
		[areaEventKinds.chargeRegistered]: `${who} saw a charge registered: ${event.detail}`,
		[areaEventKinds.holdingCompanyOverTrading]: `${who} saw a holding company form: ${event.detail}`,
		[areaEventKinds.observationRecorded]: `${who} noted ${event.detail}`,
		[areaEventKinds.premisesOpened]: `${who} registered ${event.detail} in ${event.sector}`,
		[areaEventKinds.premisesReinspected]: `${who} re-inspected ${event.detail}`,
		[areaEventKinds.premisesClosed]: `${who} no longer lists ${event.detail}`,
		[areaEventKinds.premisesChangedHands]: `${who} saw ${event.detail}`,
		[areaEventKinds.leadAddedFromPremises]: `${who} added ${event.detail} as a lead from the food premises in ${event.sector}`,
		[areaEventKinds.accountsFiled]: `${who} says ${event.detail}`,
		[areaEventKinds.figuresRead]: `${who} read ${event.detail}`
	};
	return sentences[event.kind];
}
