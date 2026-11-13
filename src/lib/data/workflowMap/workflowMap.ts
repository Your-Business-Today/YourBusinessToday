/** Before is the business as we find it; After is the business with our products in it. */
export const mapStages = ['before', 'after'] as const;
export type MapStage = (typeof mapStages)[number];

export const mapStage = { before: 'before', after: 'after' } as const satisfies Record<MapStage, MapStage>;

/** Whether a station is done in one of our products, planned for one, or still done elsewhere. */
export const stationStates = ['ours', 'planned', 'elsewhere'] as const;
export type StationState = (typeof stationStates)[number];

export const stationState = {
	ours: 'ours',
	planned: 'planned',
	elsewhere: 'elsewhere'
} as const satisfies Record<StationState, StationState>;

/** A task a role does: what it takes in, what it produces, where it is done and the Domain things it touches. */
export type MapStation = {
	key: string;
	name: string;
	summary: string;
	takesIn: string[];
	produces: string[];
	doneIn: string | null;
	isOutput: boolean;
	state: StationState;
	productId: string | null;
	takesInThings: string[];
	producesThings: string[];
};

/** Whether a line is a hat someone wears in the business, a party outside it, or a system the work runs through. */
export const lineKinds = ['role', 'outside_party', 'system'] as const;
export type LineKind = (typeof lineKinds)[number];

export const lineKind = {
	role: 'role',
	outsideParty: 'outside_party',
	system: 'system'
} as const satisfies Record<string, LineKind>;

/** A role, an outside party or a system, with its stations in the order they are done. */
export type MapLine = { key: string; name: string; kind: LineKind; stations: MapStation[] };

/** One station's output arriving at a station on another line, and how it goes wrong today when it does. */
export type MapHandover = { fromKey: string; toKey: string; handedOver: string; goesWrong: string | null };

/** What arrives from outside to start a station's work, and who or what it arrives from: a customer, the first of the month. */
export type MapArrival = { whatArrives: string; arrivesFrom: string; stationKey: string };

export type WorkflowMapDraft = { stage: MapStage; lines: MapLine[]; handovers: MapHandover[]; arrivals: MapArrival[] };

export type WorkflowMapVersion = WorkflowMapDraft & { versionNumber: number; recordedAt: string };
