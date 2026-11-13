import { workflowMapLimits as limits } from '$lib/data/workflowMap/workflowMapLimits';
import { stationState, stationStates } from '$lib/data/workflowMap/workflowMap';
import { isUuid } from '$lib/data/isUuid';
import { fieldsOf, isRefused, readChoice, readOptionalText, readRequiredText } from '$lib/server/companyContext/contextText';
import { readMapKey, readMapWords, readThingSlugs } from './readMapWords';
import type { MapStation, StationState } from '$lib/data/workflowMap/workflowMap';
import type { Refusal } from '$lib/server/portal/portalFormReading';

type StationWords = Pick<MapStation, 'name' | 'summary' | 'doneIn'>;
type StationFlow = Pick<MapStation, 'takesIn' | 'produces' | 'takesInThings' | 'producesThings'>;
type StationStanding = Pick<MapStation, 'isOutput' | 'state' | 'productId'>;

/** One station as the connector reads it, every value checked against its column. */
export function validateMapStation(candidate: unknown, field: string): MapStation | Refusal {
	const fields = fieldsOf(candidate);
	const key = readMapKey(fields.key, `${field} key`);
	if (isRefused(key)) return key;
	const label = `Station "${key}"`;
	const words = readStationWords(fields, label);
	if (isRefused(words)) return words;
	const flow = readStationFlow(fields, label);
	if (isRefused(flow)) return flow;
	const standing = readStationStanding(fields, label);
	if (isRefused(standing)) return standing;
	return { key, ...words, ...flow, ...standing };
}

function readStationWords(fields: Record<string, unknown>, label: string): StationWords | Refusal {
	const name = readRequiredText(fields.name, { field: `${label} name`, limit: limits.nameLength });
	if (isRefused(name)) return name;
	const summary = readRequiredText(fields.summary, { field: `${label} summary`, limit: limits.summaryLength });
	if (isRefused(summary)) return summary;
	const doneIn = readOptionalText(fields.doneIn, { field: `${label} doneIn`, limit: limits.doneInLength });
	if (isRefused(doneIn)) return doneIn;
	return { name, summary, doneIn };
}

function readStationFlow(fields: Record<string, unknown>, label: string): StationFlow | Refusal {
	const takesIn = readMapWords(fields.takesIn, { field: `${label} takesIn`, limit: limits.wordLength });
	if (isRefused(takesIn)) return takesIn;
	const produces = readMapWords(fields.produces, { field: `${label} produces`, limit: limits.wordLength });
	if (isRefused(produces)) return produces;
	const takesInThings = readThingSlugs(fields.takesInThings, `${label} takesInThings`);
	if (isRefused(takesInThings)) return takesInThings;
	const producesThings = readThingSlugs(fields.producesThings, `${label} producesThings`);
	if (isRefused(producesThings)) return producesThings;
	return { takesIn, produces, takesInThings, producesThings };
}

function readStationStanding(fields: Record<string, unknown>, label: string): StationStanding | Refusal {
	const isOutput = fields.isOutput ?? false;
	if (typeof isOutput !== 'boolean') return { refusal: `${label} isOutput must be true or false.` };
	const state = readChoice(fields.state ?? stationState.elsewhere, stationStates, `${label} state`);
	if (isRefused(state)) return state;
	const productId = validateProductId(fields.productId, label, state);
	if (isRefused(productId)) return productId;
	return { isOutput, state, productId };
}

function validateProductId(value: unknown, label: string, state: StationState): string | null | Refusal {
	if (value === undefined || value === null || value === '') return null;
	if (typeof value !== 'string') return { refusal: `${label} productId must be text.` };
	if (!isUuid(value)) return { refusal: `${label} productId must be the id of a product, as list_projects gives it.` };
	if (state !== stationState.elsewhere) return value;
	return { refusal: `${label} is done elsewhere, so it names no product: leave productId out or change its state.` };
}
