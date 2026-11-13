import { lineKind, mapStage, stationState, type MapLine, type MapStation, type WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

/** A station of the joinery map: done in a spreadsheet, not an output, unless told otherwise. */
export function joineryStation(key: string, name: string, flows: Pick<MapStation, 'takesIn' | 'produces'>, overrides: Partial<MapStation> = {}): MapStation {
	return {
		key, name, summary: `${name}.`, doneIn: 'Spreadsheet', isOutput: false, state: stationState.elsewhere,
		productId: null, takesInThings: [], producesThings: [], ...flows, ...overrides
	};
}

function estimator(): MapLine {
	const priceJob = joineryStation('price-job', 'Price job', { takesIn: ['Enquiry'], produces: ['Quote'] });
	const sendQuote = joineryStation('send-quote', 'Send quote', { takesIn: ['Quote'], produces: ['Sent quote'] });
	return { key: 'estimator', name: 'Estimator', kind: lineKind.role, stations: [priceJob, sendQuote] };
}

function customer(): MapLine {
	const acceptQuote = joineryStation('accept-quote', 'Accept quote', { takesIn: ['Sent quote'], produces: ['Accepted quote'] });
	return { key: 'customer', name: 'Customer', kind: lineKind.outsideParty, stations: [acceptQuote] };
}

function workshop(): MapLine {
	const makeJoinery = joineryStation('make-joinery', 'Make joinery', { takesIn: ['Accepted quote'], produces: ['Joinery'] }, { isOutput: true });
	const fitJoinery = joineryStation('fit-joinery', 'Fit joinery', { takesIn: ['Joinery'], produces: ['Fitted joinery'] }, { isOutput: true });
	return { key: 'workshop', name: 'Workshop', kind: lineKind.role, stations: [makeJoinery, fitJoinery] };
}

/** A map that passes every test of a complete map: each input has a source, each output a destination, each hand-over a failure note, and every output traces back to the enquiry. */
export function completeJoineryMap(): WorkflowMapDraft {
	const handovers = [
		{ fromKey: 'send-quote', toKey: 'accept-quote', handedOver: 'Sent quote', goesWrong: 'It sits unread for a week.' },
		{ fromKey: 'accept-quote', toKey: 'make-joinery', handedOver: 'Accepted quote', goesWrong: 'It comes back unsigned.' }
	];
	const arrivals = [{ whatArrives: 'Enquiry', arrivesFrom: 'A customer', stationKey: 'price-job' }];
	return { stage: mapStage.before, lines: [estimator(), customer(), workshop()], handovers, arrivals };
}

/** The station of the joinery map with this key, to change in a test. */
export function stationOf(map: WorkflowMapDraft, key: string): MapStation {
	const station = map.lines.flatMap((line) => line.stations).find((candidate) => candidate.key === key);
	if (station === undefined) throw new Error(`No station ${key}`);
	return station;
}
