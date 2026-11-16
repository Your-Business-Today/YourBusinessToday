import type { LineKind, MapArrival, MapHandover, MapStage, MapStation, WorkflowMapDraft } from './workflowMap';

/** A line to put: a new role, outside party or system, or a new name or kind for one the map holds. Its stations are put one by one. */
export type LinePut = { key: string; name: string; kind: LineKind };

/** A station to put, on the line it belongs to, after the station it follows or else at the end of that line. */
export type StationPut = {
	station: MapStation;
	lineKey: string | null;
	afterKey: string | null;
};

/** A hand-over is named by the two stations it joins. */
export type HandoverEnds = Pick<MapHandover, 'fromKey' | 'toKey'>;

/** An arrival is named by the station it starts and what arrives there. */
export type ArrivalAt = Pick<MapArrival, 'stationKey' | 'whatArrives'>;

/** What an amendment takes off the map, each by its key. */
export type MapRemovals = {
	stationKeys: string[];
	lineKeys: string[];
	handovers: HandoverEnds[];
	arrivals: ArrivalAt[];
};

/** One change to the latest version of a stage: what is put and what is removed; everything it does not name is carried forward. */
export type WorkflowMapAmendment = {
	stage: MapStage;
	lines: LinePut[];
	stations: StationPut[];
	handovers: MapHandover[];
	arrivals: MapArrival[];
	remove: MapRemovals;
};

/** What an amendment did, in words: what it added, replaced, moved and removed, and what went with a removed station. */
export type MapChanges = {
	added: string[];
	replaced: string[];
	moved: string[];
	removed: string[];
	removedWith: string[];
};

export type AmendedWorkflowMap = {
	draft: WorkflowMapDraft;
	changes: MapChanges;
};

export type AmendmentRefusal = { refusal: string };

export const noAmendment: Omit<WorkflowMapAmendment, 'stage'> = {
	lines: [],
	stations: [],
	handovers: [],
	arrivals: [],
	remove: { stationKeys: [], lineKeys: [], handovers: [], arrivals: [] }
};
