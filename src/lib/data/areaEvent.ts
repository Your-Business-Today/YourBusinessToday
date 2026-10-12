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

const aColleague = 'A colleague';

export function parseAreaFeedScope(value: unknown): AreaFeedScope {
	if (value === areaFeedScopes.mine) return areaFeedScopes.mine;
	return areaFeedScopes.everything;
}

/** Who did it, or what: a person by name, or the source the event came from. */
export function areaEventActorName(event: AreaEvent): string {
	return event.actorName ?? aColleague;
}

/** "James searched KT1 1: 14 found, 5 already registered". */
export function areaEventSentence(event: AreaEvent): string {
	const who = areaEventActorName(event);
	const sentences: Record<AreaEventKind, string> = {
		[areaEventKinds.sectorClaimed]: `${who} claimed ${event.sector}`,
		[areaEventKinds.sectorSearched]: `${who} searched ${event.sector}: ${event.detail}`,
		[areaEventKinds.sightingRecorded]: `${who} sighted ${event.detail} in ${event.sector}`,
		[areaEventKinds.sightingBecameLead]: `${who} added ${event.detail} as a lead from a sighting in ${event.sector}`,
		[areaEventKinds.leadAddedFromRegister]: `${who} added ${event.detail} as a lead from the register in ${event.sector}`
	};
	return sentences[event.kind];
}
