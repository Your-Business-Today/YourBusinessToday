import { mapStage, stationState, type MapStation, type WorkflowMapVersion } from '../workflowMap';

function station(key: string, takesIn: string[], produces: string[]): MapStation {
	const { elsewhere } = stationState;
	const unplaced = { doneIn: null, isOutput: false, state: elsewhere, productId: null, takesInThings: [], producesThings: [] };
	return { key, name: key, summary: '', takesIn, produces, ...unplaced };
}

/** A small After map whose phrases repeat in another casing: a contract stack agreed by the Director and set up by the Administrator. */
export const contractStackMap: WorkflowMapVersion = {
	stage: mapStage.after,
	versionNumber: 2,
	recordedAt: '2026-11-13T08:00:00Z',
	lines: [
		{ key: 'director', name: 'Director', kind: 'role', stations: [station('agree-offer', ['rate card'], ['Signed contract stack'])] },
		{ key: 'administrator', name: 'Administrator', kind: 'role', stations: [station('set-up-client', ['signed contract stack'], ['client record'])] }
	],
	handovers: [{ fromKey: 'agree-offer', toKey: 'set-up-client', handedOver: 'signed contract stack ', goesWrong: null }],
	arrivals: []
};
