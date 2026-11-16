import { lineKind, mapStage, stationState, type LineKind, type MapLine, type MapStation, type StationState, type WorkflowMapVersion } from '../workflowMap';

type Placing = { state?: StationState; doneIn?: string | null; productId?: string | null };

function station(key: string, { state = stationState.elsewhere, doneIn = null, productId = null }: Placing = {}): MapStation {
	const name = key.replaceAll('-', ' ');
	const empty = { takesIn: [], produces: [], takesInThings: [], producesThings: [] };
	return { key, name, summary: `${name}.`, isOutput: false, state, doneIn, productId, ...empty };
}

function line(key: string, name: string, kind: LineKind, stations: MapStation[]): MapLine {
	return { key, name, kind, stations };
}

const callingList = 'Calling list';

/** The id of the one product here that is a project, named in productNames. */
export const claimsProductId = 'product-claims';

export const productNames: Record<string, string> = { [claimsProductId]: 'Refund claims workbench' };

/** A water retailer today: sales build their own list, the analyst reads every bill by hand. */
export const callingListBefore: WorkflowMapVersion = {
	stage: mapStage.before,
	versionNumber: 1,
	recordedAt: '2026-11-16T20:00:00Z',
	lines: [
		line('sales', 'Sales', lineKind.role, [station('build-list', { doneIn: 'Sales spreadsheet' }), station('find-proof'), station('make-call')]),
		line('analyst', 'Bill analyst', lineKind.role, [station('read-bills'), station('confirm-error'), station('track-claim')]),
		line('customer', 'Customer', lineKind.outsideParty, [station('send-bills')])
	],
	handovers: [
		{ fromKey: 'build-list', toKey: 'make-call', handedOver: 'the list', goesWrong: 'The list is out of date.' },
		{ fromKey: 'read-bills', toKey: 'confirm-error', handedOver: 'the likely errors', goesWrong: 'Errors are missed.' }
	],
	arrivals: []
};

/** The same retailer with a planned Calling list, named only where it is done, and a live claims workbench. */
export const callingListAfter: WorkflowMapVersion = {
	stage: mapStage.after,
	versionNumber: 1,
	recordedAt: '2026-11-16T21:00:00Z',
	lines: [
		line('sales', 'Sales', lineKind.role, [station('make-call', { state: stationState.planned, doneIn: callingList }), station('decide-who')]),
		line('analyst', 'Bill analyst', lineKind.role, [
			station('confirm-error', { state: stationState.planned, productId: claimsProductId }),
			station('draft-report', { state: stationState.planned }),
			station('negotiate')
		]),
		line('calling-list', callingList, lineKind.system, [
			station('build-list', { state: stationState.planned, doneIn: callingList }),
			station('find-proof', { state: stationState.planned, doneIn: callingList })
		]),
		line('claims', 'Refund claims workbench', lineKind.system, [station('read-bills', { state: stationState.ours, productId: claimsProductId })]),
		line('customer', 'Customer', lineKind.outsideParty, [station('send-bills')])
	],
	handovers: [{ fromKey: 'build-list', toKey: 'make-call', handedOver: 'the list', goesWrong: null }],
	arrivals: []
};
