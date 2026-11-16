import { lineKind, mapStage, stationState, type MapStation, type WorkflowMapDraft } from '../workflowMap';
import { noAmendment, type WorkflowMapAmendment } from '../workflowMapAmendment';
import { amendWorkflowMap } from '../amendWorkflowMap';

/** A station with only its key, name and summary filled, as a short map in a test needs. */
export function plainStation(key: string, summary = `The ${key} step.`): MapStation {
	const unplaced = { doneIn: null, isOutput: false, state: stationState.elsewhere, productId: null };
	return { key, name: key, summary, takesIn: [], produces: [], takesInThings: [], producesThings: [], ...unplaced };
}

const amendableLines = () => [
	{ key: 'sales', name: 'Sales', kind: lineKind.role, stations: [plainStation('call'), plainStation('bill-audit-offer')] },
	{ key: 'bill-analyst', name: 'Bill analyst', kind: lineKind.role, stations: [plainStation('check-bills'), plainStation('claim')] },
	{ key: 'finance', name: 'Finance', kind: lineKind.role, stations: [plainStation('share-invoice')] }
];

const amendableHandovers = () => [
	{ fromKey: 'bill-audit-offer', toKey: 'check-bills', handedOver: 'Signed letter of authority', goesWrong: null },
	{ fromKey: 'claim', toKey: 'share-invoice', handedOver: 'Refund paid', goesWrong: null }
];

/** A water retailer's Before map: sales ring and audit the bill, the analyst checks it and claims, finance invoices the share. */
export function amendableMap(): WorkflowMapDraft {
	const arrivals = [{ whatArrives: 'Market data', arrivesFrom: 'the market operator', stationKey: 'call' }];
	return { stage: mapStage.before, lines: amendableLines(), handovers: amendableHandovers(), arrivals };
}

export const noRemovals = { stationKeys: [], lineKeys: [], handovers: [], arrivals: [] };

export function amendment(changes: Partial<WorkflowMapAmendment>): WorkflowMapAmendment {
	return { stage: mapStage.before, ...noAmendment, ...changes, remove: { ...noAmendment.remove, ...changes.remove } };
}

export function stationKeysOf(draft: WorkflowMapDraft): Record<string, string[]> {
	return Object.fromEntries(draft.lines.map((line) => [line.key, line.stations.map((station) => station.key)]));
}

export function amended(changes: Partial<WorkflowMapAmendment>) {
	const result = amendWorkflowMap(amendableMap(), amendment(changes));
	if ('refusal' in result) throw new Error(result.refusal);
	return result;
}

export function refusalOf(changes: Partial<WorkflowMapAmendment>): string {
	const result = amendWorkflowMap(amendableMap(), amendment(changes));
	if ('refusal' in result) return result.refusal;
	throw new Error('The amendment was not refused.');
}
