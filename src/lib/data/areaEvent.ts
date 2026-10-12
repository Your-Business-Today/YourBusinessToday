import { areaEventActorName } from './areaEventActor';
import { areaEventSentences } from './areaEventSentences';
import type { AreaEventKind } from './areaEventKind';

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

/** The event as one sentence, with the person or the source that did it as its subject. */
export function areaEventSentence(event: AreaEvent): string {
	return areaEventSentences[event.kind](areaEventActorName(event), event);
}
